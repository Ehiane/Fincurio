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
    private readonly ILogger<InsightsController> _logger;

    public InsightsController(IInsightsService insightsService, ILogger<InsightsController> logger)
    {
        _insightsService = insightsService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardResponseDto>> GetDashboard()
    {
        var userId = GetUserId();
        _logger.LogInformation("Fetching dashboard data for user {UserId}", userId);
        var dashboard = await _insightsService.GetDashboardAsync(userId);
        _logger.LogInformation("Dashboard fetched for user {UserId} | Balance={Balance}, RecentTxCount={RecentCount}",
            userId, dashboard.CurrentBalance, dashboard.RecentTransactions.Count);
        return Ok(dashboard);
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<MonthlyInsightResponseDto>> GetMonthlyInsights(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        var userId = GetUserId();
        _logger.LogInformation("Fetching monthly insights for user {UserId} | Year={Year}, Month={Month}", userId, year, month);
        var insights = await _insightsService.GetMonthlyInsightsAsync(userId, year, month);
        _logger.LogInformation("Monthly insights fetched for user {UserId} | Income={Income}, Expenses={Expenses}, Categories={CategoryCount}",
            userId, insights.Summary.TotalIncome, insights.Summary.TotalExpenses, insights.CategoryBreakdown.Count);
        return Ok(insights);
    }

    [HttpGet("money-flow")]
    public async Task<ActionResult<MoneyFlowResponseDto>> GetMoneyFlow(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? grouping = null)
    {
        var userId = GetUserId();
        _logger.LogInformation("Fetching money flow for user {UserId} | StartDate={StartDate}, EndDate={EndDate}, Grouping={Grouping}", userId, startDate, endDate, grouping);
        var flow = await _insightsService.GetMoneyFlowAsync(userId, startDate, endDate, grouping);
        _logger.LogInformation("Money flow fetched for user {UserId} | Grouping={Grouping}, DataPoints={Count}",
            userId, flow.Grouping, flow.DataPoints.Count);
        return Ok(flow);
    }
}
