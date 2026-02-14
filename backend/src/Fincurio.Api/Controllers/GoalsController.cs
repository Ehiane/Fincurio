using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Goal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace Fincurio.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GoalsController : ControllerBase
{
    private readonly IGoalService _goalService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<GoalsController> _logger;

    public GoalsController(IGoalService goalService, IMemoryCache cache, ILogger<GoalsController> logger)
    {
        _goalService = goalService;
        _cache = cache;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
    }

    private void InvalidateGoalsCache(Guid userId)
    {
        _cache.Remove($"goals:{userId}");
    }

    [HttpGet]
    public async Task<ActionResult<GoalListResponseDto>> GetGoals()
    {
        var userId = GetUserId();
        _logger.LogInformation("Fetching goals for user {UserId}", userId);
        var response = await _goalService.GetGoalsAsync(userId);
        _logger.LogInformation("Returned {Count} goals for user {UserId}", response.Goals.Count, userId);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GoalDto>> GetGoal(Guid id)
    {
        var userId = GetUserId();
        _logger.LogInformation("Fetching goal {GoalId} for user {UserId}", id, userId);
        var goal = await _goalService.GetByIdAsync(id, userId);
        return Ok(goal);
    }

    [HttpPost]
    public async Task<ActionResult<GoalDto>> CreateGoal([FromBody] CreateGoalDto request)
    {
        var userId = GetUserId();
        _logger.LogInformation("Creating goal for user {UserId} | Name={Name}, Type={Type}, Target={Target}",
            userId, request.Name, request.Type, request.TargetAmount);
        var goal = await _goalService.CreateAsync(userId, request);
        InvalidateGoalsCache(userId);
        _logger.LogInformation("Goal created successfully: {GoalId} for user {UserId}", goal.Id, userId);
        return CreatedAtAction(nameof(GetGoal), new { id = goal.Id }, goal);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<GoalDto>> UpdateGoal(Guid id, [FromBody] CreateGoalDto request)
    {
        var userId = GetUserId();
        _logger.LogInformation("Updating goal {GoalId} for user {UserId}", id, userId);
        var goal = await _goalService.UpdateAsync(id, userId, request);
        InvalidateGoalsCache(userId);
        _logger.LogInformation("Goal {GoalId} updated successfully for user {UserId}", id, userId);
        return Ok(goal);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteGoal(Guid id)
    {
        var userId = GetUserId();
        _logger.LogInformation("Deleting goal {GoalId} for user {UserId}", id, userId);
        await _goalService.DeleteAsync(id, userId);
        InvalidateGoalsCache(userId);
        _logger.LogInformation("Goal {GoalId} deleted successfully for user {UserId}", id, userId);
        return NoContent();
    }
}
