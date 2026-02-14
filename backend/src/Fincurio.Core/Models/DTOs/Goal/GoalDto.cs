namespace Fincurio.Core.Models.DTOs.Goal;

public class GoalDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Type { get; set; }
    public decimal TargetAmount { get; set; }
    public Guid? CategoryId { get; set; }
    public GoalCategoryDto? Category { get; set; }
    public string? Period { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime StartDate { get; set; }
    public bool IsActive { get; set; }

    // Computed progress
    public decimal CurrentAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public double PercentComplete { get; set; }
    public bool IsOnTrack { get; set; }
    public string? PeriodLabel { get; set; }
}

public class GoalCategoryDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string DisplayName { get; set; }
    public required string Icon { get; set; }
    public required string Color { get; set; }
}
