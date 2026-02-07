using Fincurio.Core.Models.DTOs.Auth;

namespace Fincurio.Core.Interfaces.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(Guid userId);
    Task<VerifyEmailResponseDto> VerifyEmailAsync(string token);
    Task<ResendVerificationResponseDto> ResendVerificationEmailAsync(string email);
    Task<ForgotPasswordResponseDto> ForgotPasswordAsync(string email);
    Task<ResetPasswordResponseDto> ResetPasswordAsync(ResetPasswordRequestDto request);
}
