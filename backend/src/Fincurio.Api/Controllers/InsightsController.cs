using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Insight;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fincurio.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InsightsController : ControllerBase
{
    private readonly IInsightsService _insightsService;

    public InsightsController(IInsightsService insightsService)
    {
        _insightsService = insightsService;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst("userId")?.Value ?? throw new UnauthorizedAccessException());
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardResponseDto>> GetDashboard()
    {
        var userId = GetUserId();
        var dashboard = await _insightsService.GetDashboardAsync(userId);
        return Ok(dashboard);
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<MonthlyInsightResponseDto>> GetMonthlyInsights(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        var userId = GetUserId();
        var insights = await _insightsService.GetMonthlyInsightsAsync(userId, year, month);
        return Ok(insights);
    }
}
