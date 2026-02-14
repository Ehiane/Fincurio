namespace Fincurio.Core.Models.DTOs.Goal;

public class GoalListResponseDto
{
    public List<GoalDto> Goals { get; set; } = new();
    public GoalSummaryDto Summary { get; set; } = new();
}

public class GoalSummaryDto
{
    public int TotalGoals { get; set; }
    public int ActiveBudgetGoals { get; set; }
    public int ActiveSavingsGoals { get; set; }
    public int OnTrackCount { get; set; }
    public int OffTrackCount { get; set; }
}
