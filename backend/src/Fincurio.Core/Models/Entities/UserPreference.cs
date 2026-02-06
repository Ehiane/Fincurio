namespace Fincurio.Core.Models.Entities;

public class UserPreference
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Currency { get; set; } = "USD";
    public string Timezone { get; set; } = "UTC";
    public decimal? MonthlyBudgetGoal { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
}
