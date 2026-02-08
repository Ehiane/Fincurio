using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Insight;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace Fincurio.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InsightsController : ControllerBase
{
    private readonly IInsightsService _insightsService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<InsightsController> _logger;

    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    public InsightsController(IInsightsService insightsService, IMemoryCache cache, ILogger<InsightsController> logger)
    {
        _insightsService = insightsService;
        _cache = cache;
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
        var cacheKey = $"dashboard:{userId}";

        if (_cache.TryGetValue(cacheKey, out DashboardResponseDto? cached) && cached != null)
        {
            _logger.LogDebug("Dashboard cache hit for user {UserId}", userId);
            return Ok(cached);
        }

        _logger.LogInformation("Fetching dashboard data for user {UserId}", userId);
        var dashboard = await _insightsService.GetDashboardAsync(userId);
        _cache.Set(cacheKey, dashboard, CacheDuration);
        return Ok(dashboard);
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<MonthlyInsightResponseDto>> GetMonthlyInsights(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        var userId = GetUserId();
        var cacheKey = $"monthly:{userId}:{year}:{month}";

        if (_cache.TryGetValue(cacheKey, out MonthlyInsightResponseDto? cached) && cached != null)
        {
            _logger.LogDebug("Monthly insights cache hit for user {UserId} ({Year}-{Month})", userId, year, month);
            return Ok(cached);
        }

        _logger.LogInformation("Fetching monthly insights for user {UserId} | Year={Year}, Month={Month}", userId, year, month);
        var insights = await _insightsService.GetMonthlyInsightsAsync(userId, year, month);
        _cache.Set(cacheKey, insights, CacheDuration);
        return Ok(insights);
    }

    [HttpGet("money-flow")]
    public async Task<ActionResult<MoneyFlowResponseDto>> GetMoneyFlow(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? grouping = null)
    {
        var userId = GetUserId();
        var cacheKey = $"moneyflow:{userId}:{startDate?.ToString("yyyyMMdd")}:{endDate?.ToString("yyyyMMdd")}:{grouping}";

        if (_cache.TryGetValue(cacheKey, out MoneyFlowResponseDto? cached) && cached != null)
        {
            _logger.LogDebug("Money flow cache hit for user {UserId}", userId);
            return Ok(cached);
        }

        _logger.LogInformation("Fetching money flow for user {UserId} | StartDate={StartDate}, EndDate={EndDate}, Grouping={Grouping}", userId, startDate, endDate, grouping);
        var flow = await _insightsService.GetMoneyFlowAsync(userId, startDate, endDate, grouping);
        _cache.Set(cacheKey, flow, CacheDuration);
        return Ok(flow);
    }
}
