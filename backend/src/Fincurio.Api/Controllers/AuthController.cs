using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Fincurio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        _logger.LogInformation("Registration attempt for email: {Email}", request.Email);
        var response = await _authService.RegisterAsync(request);
        _logger.LogInformation("Registration successful for user {UserId} ({Email})", response.UserId, response.Email);
        return CreatedAtAction(nameof(Register), new { id = response.UserId }, response);
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);
        var response = await _authService.LoginAsync(request);
        _logger.LogInformation("Login successful for user {UserId} ({Email})", response.UserId, response.Email);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> Refresh([FromBody] RefreshTokenRequestDto request)
    {
        _logger.LogInformation("Token refresh requested");
        var response = await _authService.RefreshTokenAsync(request.RefreshToken);
        _logger.LogInformation("Token refresh successful for user {UserId}", response.UserId);
        return Ok(response);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        _logger.LogInformation("Logout requested for user {UserId}", userId);
        await _authService.LogoutAsync(userId);
        _logger.LogInformation("Logout successful for user {UserId}", userId);
        return Ok(new { message = "Successfully logged out" });
    }

    [HttpPost("verify-email")]
    public async Task<ActionResult<VerifyEmailResponseDto>> VerifyEmail([FromQuery] string token)
    {
        _logger.LogInformation("Email verification attempted with token: {TokenPrefix}...", token[..Math.Min(8, token.Length)]);
        var response = await _authService.VerifyEmailAsync(token);
        _logger.LogInformation("Email verification result: {Success} - {Message}", response.Success, response.Message);
        return Ok(response);
    }

    [HttpPost("resend-verification")]
    public async Task<ActionResult<ResendVerificationResponseDto>> ResendVerification([FromBody] ResendVerificationRequestDto request)
    {
        _logger.LogInformation("Resend verification email requested for: {Email}", request.Email);
        var response = await _authService.ResendVerificationEmailAsync(request.Email);
        _logger.LogInformation("Resend verification result for {Email}: {Message}", request.Email, response.Message);
        return Ok(response);
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<ForgotPasswordResponseDto>> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        _logger.LogInformation("Forgot password requested for: {Email}", request.Email);
        var response = await _authService.ForgotPasswordAsync(request.Email);
        _logger.LogInformation("Forgot password processed for: {Email}", request.Email);
        return Ok(response);
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<ResetPasswordResponseDto>> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        _logger.LogInformation("Password reset attempted with token: {TokenPrefix}...", request.Token[..Math.Min(8, request.Token.Length)]);
        var response = await _authService.ResetPasswordAsync(request);
        _logger.LogInformation("Password reset successful");
        return Ok(response);
    }
}
