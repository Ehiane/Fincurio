using System.Security.Claims;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Income;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fincurio.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class IncomeController : ControllerBase
{
    private readonly IIncomeService _incomeService;
    private readonly ILogger<IncomeController> _logger;

    public IncomeController(IIncomeService incomeService, ILogger<IncomeController> logger)
    {
        _incomeService = incomeService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
    }

    [HttpGet]
    public async Task<ActionResult<IncomeProfileDto>> GetIncomeProfile()
    {
        var userId = GetUserId();
        var profile = await _incomeService.GetByUserIdAsync(userId);
        if (profile == null)
            return NotFound(new { message = "Income profile not found" });
        return Ok(profile);
    }

    [HttpPost]
    public async Task<ActionResult<IncomeProfileDto>> CreateOrUpdateIncomeProfile([FromBody] CreateIncomeProfileDto request)
    {
        var userId = GetUserId();
        _logger.LogInformation("Creating/updating income profile for user {UserId}", userId);
        var profile = await _incomeService.CreateOrUpdateAsync(userId, request);
        return Ok(profile);
    }
}
