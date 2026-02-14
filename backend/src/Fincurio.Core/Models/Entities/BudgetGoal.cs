namespace Fincurio.Core.Models.Entities;

public class BudgetGoal
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public decimal MonthlyBudgetTarget { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
}
