using Fincurio.Core.Exceptions;
using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Auth;
using Fincurio.Core.Models.Entities;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;

namespace Fincurio.Core.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _tokenRepository;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository tokenRepository,
        ITokenService tokenService,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _tokenRepository = tokenRepository;
        _tokenService = tokenService;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            throw new ValidationException("Email is already registered");
        }

        // Generate email verification token
        var verificationToken = GenerateSecureToken();

        // Create user
        var user = new User
        {
            Email = request.Email,
            PasswordHash = PasswordHasher.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            EmailVerificationToken = verificationToken,
            EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24),
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(user);

        // Send verification email (don't block registration)
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendVerificationEmailAsync(user.Email, user.FirstName ?? "", verificationToken);
            }
            catch
            {
                // Log error but don't fail registration
            }
        });

        // Create default preferences
        var preferences = new UserPreference
        {
            UserId = user.Id,
            Currency = "USD",
            Timezone = "UTC",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        user.Preferences = preferences;

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Save refresh token
        var expirationDays = int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"]!);
        await _tokenRepository.CreateAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(expirationDays),
            CreatedAt = DateTime.UtcNow
        });

        return new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"]!) * 60
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedException("Account is inactive");
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Save refresh token
        var expirationDays = int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"]!);
        await _tokenRepository.CreateAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(expirationDays),
            CreatedAt = DateTime.UtcNow
        });

        return new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"]!) * 60
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var token = await _tokenRepository.GetByTokenAsync(refreshToken);
        if (token == null || !token.IsActive)
        {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        var user = token.User;

        // Revoke old token
        await _tokenRepository.RevokeAsync(token);

        // Generate new tokens
        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        // Save new refresh token
        var expirationDays = int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"]!);
        await _tokenRepository.CreateAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(expirationDays),
            CreatedAt = DateTime.UtcNow
        });

        return new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            AccessToken = accessToken,
            RefreshToken = newRefreshToken,
            ExpiresIn = int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"]!) * 60
        };
    }

    public async Task LogoutAsync(Guid userId)
    {
        await _tokenRepository.RevokeAllUserTokensAsync(userId);
    }

    public async Task<VerifyEmailResponseDto> VerifyEmailAsync(string token)
    {
        var user = await _userRepository.GetByEmailVerificationTokenAsync(token);

        if (user == null || user.EmailVerificationToken != token)
        {
            return new VerifyEmailResponseDto
            {
                Success = false,
                Message = "Invalid verification token"
            };
        }

        if (user.EmailVerificationTokenExpiry < DateTime.UtcNow)
        {
            return new VerifyEmailResponseDto
            {
                Success = false,
                Message = "Verification token has expired. Please request a new one."
            };
        }

        if (user.IsEmailVerified)
        {
            return new VerifyEmailResponseDto
            {
                Success = true,
                Message = "Email is already verified"
            };
        }

        // Verify email
        user.IsEmailVerified = true;
        user.EmailVerificationToken = null;
        user.EmailVerificationTokenExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        return new VerifyEmailResponseDto
        {
            Success = true,
            Message = "Email verified successfully"
        };
    }

    public async Task<ResendVerificationResponseDto> ResendVerificationEmailAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);

        if (user == null)
        {
            throw new NotFoundException("No account found with this email address");
        }

        if (user.IsEmailVerified)
        {
            return new ResendVerificationResponseDto
            {
                Message = "Email is already verified"
            };
        }

        // Generate new verification token
        var verificationToken = GenerateSecureToken();
        user.EmailVerificationToken = verificationToken;
        user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        // Send verification email
        await _emailService.SendVerificationEmailAsync(user.Email, user.FirstName ?? "", verificationToken);

        return new ResendVerificationResponseDto
        {
            Message = "Verification email sent successfully"
        };
    }

    public async Task<ForgotPasswordResponseDto> ForgotPasswordAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);

        // Always return success to prevent email enumeration
        if (user == null)
        {
            return new ForgotPasswordResponseDto
            {
                Message = "If an account exists with this email, you will receive a password reset link shortly."
            };
        }

        // Generate password reset token
        var resetToken = GenerateSecureToken();
        user.PasswordResetToken = resetToken;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        // Send password reset email
        await _emailService.SendPasswordResetEmailAsync(user.Email, user.FirstName ?? "", resetToken);

        return new ForgotPasswordResponseDto
        {
            Message = "If an account exists with this email, you will receive a password reset link shortly."
        };
    }

    public async Task<ResetPasswordResponseDto> ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        // Find user by reset token
        var user = await _userRepository.GetByPasswordResetTokenAsync(request.Token);

        if (user == null || user.PasswordResetToken != request.Token)
        {
            throw new ValidationException("Invalid or expired reset token");
        }

        if (user.PasswordResetTokenExpiry < DateTime.UtcNow)
        {
            throw new ValidationException("Reset token has expired. Please request a new one.");
        }

        // Validate new password
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            throw new ValidationException("Password must be at least 6 characters long");
        }

        // Hash new password
        user.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;

        // Update user
        await _userRepository.UpdateAsync(user);

        // Revoke all existing tokens for security
        await _tokenRepository.RevokeAllUserTokensAsync(user.Id);

        return new ResetPasswordResponseDto
        {
            Message = "Password reset successfully. Please log in with your new password."
        };
    }

    private static string GenerateSecureToken()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }
}
