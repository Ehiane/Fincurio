namespace Fincurio.Core.Models.DTOs.Transaction;

public class TransactionDto
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan? Time { get; set; }
    public required string Merchant { get; set; }
    public CategoryDto Category { get; set; } = null!;
    public decimal Amount { get; set; }
    public required string Type { get; set; }
    public string? Notes { get; set; }
    public Guid? GoalId { get; set; }
    public string? GoalName { get; set; }
}

public class CategoryDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string DisplayName { get; set; }
    public required string Icon { get; set; }
    public required string Color { get; set; }
}
