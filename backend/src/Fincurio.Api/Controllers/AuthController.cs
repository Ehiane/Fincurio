using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fincurio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        var response = await _authService.RegisterAsync(request);
        return CreatedAtAction(nameof(Register), new { id = response.UserId }, response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var response = await _authService.LoginAsync(request);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> Refresh([FromBody] RefreshTokenRequestDto request)
    {
        var response = await _authService.RefreshTokenAsync(request.RefreshToken);
        return Ok(response);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
        await _authService.LogoutAsync(userId);
        return Ok(new { message = "Successfully logged out" });
    }

    [HttpPost("verify-email")]
    public async Task<ActionResult<VerifyEmailResponseDto>> VerifyEmail([FromQuery] string token)
    {
        var response = await _authService.VerifyEmailAsync(token);
        return Ok(response);
    }

    [HttpPost("resend-verification")]
    public async Task<ActionResult<ResendVerificationResponseDto>> ResendVerification([FromBody] ResendVerificationRequestDto request)
    {
        var response = await _authService.ResendVerificationEmailAsync(request.Email);
        return Ok(response);
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<ForgotPasswordResponseDto>> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        var response = await _authService.ForgotPasswordAsync(request.Email);
        return Ok(response);
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<ResetPasswordResponseDto>> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        var response = await _authService.ResetPasswordAsync(request);
        return Ok(response);
    }
}
