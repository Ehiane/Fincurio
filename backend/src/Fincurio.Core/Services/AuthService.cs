using Fincurio.Core.Exceptions;
using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Auth;
using Fincurio.Core.Models.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;

namespace Fincurio.Core.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _tokenRepository;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository tokenRepository,
        ITokenService tokenService,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _tokenRepository = tokenRepository;
        _tokenService = tokenService;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        _logger.LogInformation("Starting registration for email: {Email}", request.Email);

        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            _logger.LogWarning("Registration failed - email already exists: {Email}", request.Email);
            throw new ValidationException("Email is already registered");
        }

        // Generate email verification token
        var verificationToken = GenerateSecureToken();
        _logger.LogDebug("Generated verification token for {Email}", request.Email);

        // Create user with default preferences (saved together to avoid
        // multi-statement batch issues with Supabase connection pooler)
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
            UpdatedAt = DateTime.UtcNow,
            Preferences = new UserPreference
            {
                Currency = "USD",
                Timezone = "UTC",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        await _userRepository.CreateAsync(user);
        _logger.LogInformation("User created successfully: {UserId} ({Email})", user.Id, user.Email);

        // Send verification email (don't block registration)
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendVerificationEmailAsync(user.Email, user.FirstName ?? "", verificationToken);
                _logger.LogInformation("Verification email sent to {Email}", user.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send verification email to {Email}", user.Email);
            }
        });

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
        _logger.LogDebug("Refresh token created for user {UserId}, expires in {Days} days", user.Id, expirationDays);

        _logger.LogInformation("Registration completed successfully for user {UserId} ({Email})", user.Id, user.Email);

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
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);

        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Login failed - invalid credentials for email: {Email}", request.Email);
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Login failed - inactive account for user {UserId} ({Email})", user.Id, user.Email);
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

        _logger.LogInformation("Login successful for user {UserId} ({Email})", user.Id, user.Email);

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
        _logger.LogInformation("Token refresh requested");

        var token = await _tokenRepository.GetByTokenAsync(refreshToken);
        if (token == null || !token.IsActive)
        {
            _logger.LogWarning("Token refresh failed - invalid or expired token");
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        var user = token.User;
        _logger.LogDebug("Token refresh for user {UserId} ({Email})", user.Id, user.Email);

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

        _logger.LogInformation("Token refresh successful for user {UserId}", user.Id);

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
        _logger.LogInformation("Logging out user {UserId} - revoking all refresh tokens", userId);
        await _tokenRepository.RevokeAllUserTokensAsync(userId);
        _logger.LogInformation("All refresh tokens revoked for user {UserId}", userId);
    }

    public async Task<VerifyEmailResponseDto> VerifyEmailAsync(string token)
    {
        _logger.LogInformation("Email verification attempt with token: {TokenPrefix}...", token[..Math.Min(8, token.Length)]);

        var user = await _userRepository.GetByEmailVerificationTokenAsync(token);

        if (user == null || user.EmailVerificationToken != token)
        {
            _logger.LogWarning("Email verification failed - invalid token");
            return new VerifyEmailResponseDto
            {
                Success = false,
                Message = "Invalid verification token"
            };
        }

        if (user.EmailVerificationTokenExpiry < DateTime.UtcNow)
        {
            _logger.LogWarning("Email verification failed - expired token for user {UserId} ({Email})", user.Id, user.Email);
            return new VerifyEmailResponseDto
            {
                Success = false,
                Message = "Verification token has expired. Please request a new one."
            };
        }

        if (user.IsEmailVerified)
        {
            _logger.LogInformation("Email already verified for user {UserId} ({Email})", user.Id, user.Email);
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
        _logger.LogInformation("Email verified successfully for user {UserId} ({Email})", user.Id, user.Email);

        return new VerifyEmailResponseDto
        {
            Success = true,
            Message = "Email verified successfully"
        };
    }

    public async Task<ResendVerificationResponseDto> ResendVerificationEmailAsync(string email)
    {
        _logger.LogInformation("Resend verification email requested for: {Email}", email);

        var user = await _userRepository.GetByEmailAsync(email);

        if (user == null)
        {
            _logger.LogWarning("Resend verification failed - no account found for email: {Email}", email);
            throw new NotFoundException("No account found with this email address");
        }

        if (user.IsEmailVerified)
        {
            _logger.LogInformation("Resend skipped - email already verified for {Email}", email);
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
        _logger.LogInformation("Verification email resent to {Email} for user {UserId}", email, user.Id);

        return new ResendVerificationResponseDto
        {
            Message = "Verification email sent successfully"
        };
    }

    public async Task<ForgotPasswordResponseDto> ForgotPasswordAsync(string email)
    {
        _logger.LogInformation("Forgot password requested for: {Email}", email);

        var user = await _userRepository.GetByEmailAsync(email);

        // Always return success to prevent email enumeration
        if (user == null)
        {
            _logger.LogDebug("Forgot password - no account found for {Email} (returning generic response)", email);
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
        _logger.LogInformation("Password reset email sent to {Email} for user {UserId}", email, user.Id);

        return new ForgotPasswordResponseDto
        {
            Message = "If an account exists with this email, you will receive a password reset link shortly."
        };
    }

    public async Task<ResetPasswordResponseDto> ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        _logger.LogInformation("Password reset attempt");

        // Find user by reset token
        var user = await _userRepository.GetByPasswordResetTokenAsync(request.Token);

        if (user == null || user.PasswordResetToken != request.Token)
        {
            _logger.LogWarning("Password reset failed - invalid token");
            throw new ValidationException("Invalid or expired reset token");
        }

        if (user.PasswordResetTokenExpiry < DateTime.UtcNow)
        {
            _logger.LogWarning("Password reset failed - expired token for user {UserId}", user.Id);
            throw new ValidationException("Reset token has expired. Please request a new one.");
        }

        // Validate new password
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            _logger.LogWarning("Password reset failed - password too short for user {UserId}", user.Id);
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

        _logger.LogInformation("Password reset successful for user {UserId} ({Email}) - all tokens revoked", user.Id, user.Email);

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
