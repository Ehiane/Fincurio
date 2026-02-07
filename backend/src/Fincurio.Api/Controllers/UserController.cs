using System.Security.Claims;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fincurio.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UserController> _logger;

    public UserController(IUserService userService, ILogger<UserController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
    }

    [HttpGet("profile")]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var userId = GetUserId();
        _logger.LogInformation("Fetching profile for user {UserId}", userId);
        var profile = await _userService.GetProfileAsync(userId);
        _logger.LogInformation("Profile fetched for user {UserId} ({Email})", userId, profile.Email);
        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateProfileDto request)
    {
        var userId = GetUserId();
        _logger.LogInformation("Updating profile for user {UserId} | FirstName={FirstName}, LastName={LastName}",
            userId, request.FirstName, request.LastName);
        var profile = await _userService.UpdateProfileAsync(userId, request);
        _logger.LogInformation("Profile updated successfully for user {UserId}", userId);
        return Ok(profile);
    }

    [HttpPut("preferences")]
    public async Task<ActionResult> UpdatePreferences([FromBody] UpdatePreferencesDto request)
    {
        var userId = GetUserId();
        _logger.LogInformation("Updating preferences for user {UserId} | Currency={Currency}, Timezone={Timezone}, Budget={Budget}",
            userId, request.Currency, request.Timezone, request.MonthlyBudgetGoal);
        await _userService.UpdatePreferencesAsync(userId, request);
        _logger.LogInformation("Preferences updated successfully for user {UserId}", userId);
        return Ok(new { message = "Preferences updated successfully" });
    }
}
