using Fincurio.Core.Exceptions;
using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Goal;
using Fincurio.Core.Models.Entities;
using Microsoft.Extensions.Logging;

namespace Fincurio.Core.Services;

public class GoalService : IGoalService
{
    private readonly IGoalRepository _goalRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly ILogger<GoalService> _logger;

    public GoalService(
        IGoalRepository goalRepository,
        ITransactionRepository transactionRepository,
        ICategoryRepository categoryRepository,
        ILogger<GoalService> logger)
    {
        _goalRepository = goalRepository;
        _transactionRepository = transactionRepository;
        _categoryRepository = categoryRepository;
        _logger = logger;
    }

    public async Task<GoalListResponseDto> GetGoalsAsync(Guid userId)
    {
        _logger.LogInformation("Fetching goals for user {UserId}", userId);

        var goals = await _goalRepository.GetByUserIdAsync(userId);
        var goalDtos = new List<GoalDto>();

        foreach (var goal in goals)
        {
            goalDtos.Add(await MapToDtoWithProgress(goal, userId));
        }

        var summary = new GoalSummaryDto
        {
            TotalGoals = goalDtos.Count,
            ActiveBudgetGoals = goalDtos.Count(g => g.Type == "budget"),
            ActiveSavingsGoals = goalDtos.Count(g => g.Type == "savings"),
            OnTrackCount = goalDtos.Count(g => g.IsOnTrack),
            OffTrackCount = goalDtos.Count(g => !g.IsOnTrack)
        };

        _logger.LogInformation("Returned {Count} goals for user {UserId} ({OnTrack} on track, {OffTrack} off track)",
            goalDtos.Count, userId, summary.OnTrackCount, summary.OffTrackCount);

        return new GoalListResponseDto
        {
            Goals = goalDtos,
            Summary = summary
        };
    }

    public async Task<GoalDto> GetByIdAsync(Guid id, Guid userId)
    {
        _logger.LogInformation("Fetching goal {GoalId} for user {UserId}", id, userId);

        var goal = await _goalRepository.GetByIdAsync(id, userId);
        if (goal == null)
        {
            _logger.LogWarning("Goal {GoalId} not found for user {UserId}", id, userId);
            throw new NotFoundException("Goal not found");
        }

        return await MapToDtoWithProgress(goal, userId);
    }

    public async Task<GoalDto> CreateAsync(Guid userId, CreateGoalDto request)
    {
        _logger.LogInformation("Creating {Type} goal '{Name}' for user {UserId} | Target={TargetAmount}",
            request.Type, request.Name, userId, request.TargetAmount);

        // Validate based on goal type
        if (request.Type == "budget")
        {
            if (!request.CategoryId.HasValue)
                throw new ValidationException("CategoryId is required for budget goals");
            if (string.IsNullOrEmpty(request.Period))
                throw new ValidationException("Period is required for budget goals");

            var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value);
            if (category == null)
                throw new ValidationException("Invalid category");
        }
        else if (request.Type == "savings")
        {
            // Savings goals don't use category, but can optionally have a period (recurring) or deadline (one-time)
            request.CategoryId = null;
            // If period is set, clear deadline (recurring mode); if deadline is set, clear period (one-time mode)
            if (!string.IsNullOrEmpty(request.Period))
                request.Deadline = null;
            else
                request.Period = null;
        }

        var goal = new Goal
        {
            UserId = userId,
            Name = request.Name,
            Type = request.Type,
            TargetAmount = request.TargetAmount,
            CategoryId = request.Type == "budget" ? request.CategoryId : null,
            Period = (request.Type == "budget" || request.Type == "savings") ? request.Period : null,
            Deadline = request.Type == "savings" && request.Deadline.HasValue
                ? DateTime.SpecifyKind(request.Deadline.Value, DateTimeKind.Utc)
                : null,
            // PlannedContribution only meaningful for one-time savings goals
            PlannedContribution = request.Type == "savings" && string.IsNullOrEmpty(request.Period)
                ? request.PlannedContribution
                : null,
            StartDate = request.StartDate.HasValue
                ? DateTime.SpecifyKind(request.StartDate.Value.Date, DateTimeKind.Utc)
                : DateTime.UtcNow.Date,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _goalRepository.CreateAsync(goal);
        _logger.LogInformation("Goal created: {GoalId} | Type={Type}, Name={Name} for user {UserId}",
            created.Id, created.Type, created.Name, userId);

        return await MapToDtoWithProgress(created, userId);
    }

    public async Task<GoalDto> UpdateAsync(Guid id, Guid userId, CreateGoalDto request)
    {
        _logger.LogInformation("Updating goal {GoalId} for user {UserId}", id, userId);

        var goal = await _goalRepository.GetByIdAsync(id, userId);
        if (goal == null)
        {
            _logger.LogWarning("Goal update failed - {GoalId} not found for user {UserId}", id, userId);
            throw new NotFoundException("Goal not found");
        }

        // Validate based on goal type
        if (request.Type == "budget")
        {
            if (!request.CategoryId.HasValue)
                throw new ValidationException("CategoryId is required for budget goals");
            if (string.IsNullOrEmpty(request.Period))
                throw new ValidationException("Period is required for budget goals");

            var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value);
            if (category == null)
                throw new ValidationException("Invalid category");
        }

        goal.Name = request.Name;
        goal.Type = request.Type;
        goal.TargetAmount = request.TargetAmount;
        goal.CategoryId = request.Type == "budget" ? request.CategoryId : null;
        // Savings goals can have period (recurring) or deadline (one-time)
        if (request.Type == "savings" && !string.IsNullOrEmpty(request.Period))
        {
            goal.Period = request.Period;
            goal.Deadline = null;
        }
        else if (request.Type == "savings")
        {
            goal.Period = null;
            goal.Deadline = request.Deadline.HasValue
                ? DateTime.SpecifyKind(request.Deadline.Value, DateTimeKind.Utc)
                : null;
        }
        else
        {
            goal.Period = request.Period;
            goal.Deadline = null;
        }
        goal.StartDate = request.StartDate.HasValue
            ? DateTime.SpecifyKind(request.StartDate.Value.Date, DateTimeKind.Utc)
            : goal.StartDate;
        // PlannedContribution only meaningful for one-time savings goals
        goal.PlannedContribution = goal.Type == "savings" && string.IsNullOrEmpty(goal.Period)
            ? request.PlannedContribution
            : null;

        await _goalRepository.UpdateAsync(goal);
        _logger.LogInformation("Goal {GoalId} updated successfully for user {UserId}", id, userId);

        // Reload with includes
        return await GetByIdAsync(id, userId);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        _logger.LogInformation("Deleting goal {GoalId} for user {UserId}", id, userId);

        var goal = await _goalRepository.GetByIdAsync(id, userId);
        if (goal == null)
        {
            _logger.LogWarning("Goal delete failed - {GoalId} not found for user {UserId}", id, userId);
            throw new NotFoundException("Goal not found");
        }

        await _goalRepository.DeleteAsync(goal);
        _logger.LogInformation("Goal {GoalId} deleted successfully for user {UserId}", id, userId);
    }

    private async Task<GoalDto> MapToDtoWithProgress(Goal goal, Guid userId)
    {
        decimal currentAmount = 0;
        bool isOnTrack = true;
        string? periodLabel = null;

        if (goal.Type == "budget")
        {
            var (periodStart, periodEnd) = GetPeriodRange(goal.Period);
            periodLabel = goal.Period switch
            {
                "daily" => DateTime.UtcNow.ToString("MMM d, yyyy"),
                "weekly" => $"Week of {periodStart:MMM d}",
                "yearly" => DateTime.UtcNow.Year.ToString(),
                _ => DateTime.UtcNow.ToString("MMMM yyyy"),
            };

            var transactions = await _transactionRepository.GetByDateRangeAsync(userId, periodStart, periodEnd);
            currentAmount = transactions
                .Where(t => t.Type == "expense" && t.CategoryId == goal.CategoryId)
                .Sum(t => t.Amount);

            isOnTrack = currentAmount <= goal.TargetAmount;
        }
        else if (goal.Type == "savings")
        {
            // Savings progress is ONLY based on explicitly linked contributions
            if (!string.IsNullOrEmpty(goal.Period))
            {
                // Recurring savings — measure linked contributions for the current period only
                var (periodStart, periodEnd) = GetPeriodRange(goal.Period);
                periodLabel = goal.Period switch
                {
                    "daily" => DateTime.UtcNow.ToString("MMM d, yyyy"),
                    "weekly" => $"Week of {periodStart:MMM d}",
                    "yearly" => DateTime.UtcNow.Year.ToString(),
                    _ => DateTime.UtcNow.ToString("MMMM yyyy"),
                };

                var transactions = await _transactionRepository.GetByDateRangeAsync(userId, periodStart, periodEnd);
                var linked = transactions.Where(t => t.GoalId == goal.Id).ToList();
                currentAmount = linked.Where(t => t.Type == "contribution").Sum(t => t.Amount);

                isOnTrack = currentAmount >= goal.TargetAmount;
            }
            else
            {
                // One-time savings — cumulative linked contributions from start date
                var transactions = await _transactionRepository.GetByDateRangeAsync(userId, goal.StartDate, DateTime.UtcNow);
                var linked = transactions.Where(t => t.GoalId == goal.Id).ToList();
                currentAmount = linked.Where(t => t.Type == "contribution").Sum(t => t.Amount);

                if (goal.Deadline.HasValue && goal.Deadline.Value > goal.StartDate)
                {
                    var totalDays = (goal.Deadline.Value - goal.StartDate).TotalDays;
                    var elapsedDays = (DateTime.UtcNow - goal.StartDate).TotalDays;
                    var expectedProgress = (elapsedDays / totalDays) * (double)goal.TargetAmount;
                    isOnTrack = (double)currentAmount >= expectedProgress;
                }

                periodLabel = goal.Deadline.HasValue
                    ? $"By {goal.Deadline.Value:MMM d, yyyy}"
                    : "Open-ended";
            }
        }

        var remaining = Math.Max(0, goal.TargetAmount - currentAmount);
        var percentComplete = goal.TargetAmount > 0
            ? Math.Min(100, Math.Round((double)currentAmount / (double)goal.TargetAmount * 100, 1))
            : 0;

        // Compute period plan vs actual for savings goals
        decimal? periodActualAmount = null;
        decimal? periodPlannedAmount = null;

        if (goal.Type == "savings")
        {
            if (!string.IsNullOrEmpty(goal.Period))
            {
                // Recurring savings: period actual = currentAmount (already period-scoped above),
                // period planned = targetAmount (the per-period savings target)
                periodActualAmount = currentAmount;
                periodPlannedAmount = goal.TargetAmount;
            }
            else if (goal.PlannedContribution.HasValue && goal.PlannedContribution.Value > 0)
            {
                // One-time savings with a monthly contribution plan:
                // period actual = this calendar month's linked contributions
                var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var monthEnd = monthStart.AddMonths(1).AddDays(-1);
                var monthTxns = await _transactionRepository.GetByDateRangeAsync(userId, monthStart, monthEnd);
                var linkedMonth = monthTxns.Where(t => t.GoalId == goal.Id).ToList();
                periodActualAmount = linkedMonth.Where(t => t.Type == "contribution").Sum(t => t.Amount);
                periodPlannedAmount = goal.PlannedContribution.Value;
            }
        }

        return new GoalDto
        {
            Id = goal.Id,
            Name = goal.Name,
            Type = goal.Type,
            TargetAmount = goal.TargetAmount,
            CategoryId = goal.CategoryId,
            Category = goal.Category != null ? new GoalCategoryDto
            {
                Id = goal.Category.Id,
                Name = goal.Category.Name,
                DisplayName = goal.Category.DisplayName,
                Icon = goal.Category.Icon ?? "",
                Color = goal.Category.Color ?? ""
            } : null,
            Period = goal.Period,
            Deadline = goal.Deadline,
            StartDate = goal.StartDate,
            IsActive = goal.IsActive,
            CurrentAmount = currentAmount,
            RemainingAmount = remaining,
            PercentComplete = percentComplete,
            IsOnTrack = isOnTrack,
            PeriodLabel = periodLabel,
            PlannedContribution = goal.PlannedContribution,
            PeriodActualAmount = periodActualAmount,
            PeriodPlannedAmount = periodPlannedAmount
        };
    }

    private static (DateTime Start, DateTime End) GetPeriodRange(string? period)
    {
        var now = DateTime.UtcNow;
        return period switch
        {
            "daily" => (now.Date, now.Date),
            "weekly" => (now.Date.AddDays(-(int)now.DayOfWeek), now.Date.AddDays(6 - (int)now.DayOfWeek)),
            "yearly" => (new DateTime(now.Year, 1, 1), new DateTime(now.Year, 12, 31)),
            _ => (new DateTime(now.Year, now.Month, 1),
                  new DateTime(now.Year, now.Month, DateTime.DaysInMonth(now.Year, now.Month)))
        };
    }

    private async Task<bool> HasLinkedTransactionsAsync(Guid goalId, Guid userId)
    {
        return await _transactionRepository.HasLinkedToGoalAsync(goalId, userId);
    }
}
