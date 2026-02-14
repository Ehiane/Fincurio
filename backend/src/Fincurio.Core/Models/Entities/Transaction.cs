namespace Fincurio.Core.Models.Entities;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CategoryId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan? Time { get; set; }
    public required string Merchant { get; set; }
    public decimal Amount { get; set; }
    public required string Type { get; set; } // "income" or "expense"
    public string? Notes { get; set; }
    public Guid? GoalId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public Goal? Goal { get; set; }
}
