namespace Fincurio.Core.Models.Entities;

public class Goal
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public required string Name { get; set; }
    public required string Type { get; set; } // "budget" or "savings"
    public decimal TargetAmount { get; set; }
    public Guid? CategoryId { get; set; } // Required for budget goals
    public string? Period { get; set; } // "monthly" or "yearly" — budget only
    public DateTime? Deadline { get; set; } // Savings only
    public decimal? PlannedContribution { get; set; } // One-time savings only: planned periodic contribution
    public DateTime StartDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Category? Category { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
