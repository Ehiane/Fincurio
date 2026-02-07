namespace Fincurio.Core.Models.Entities;

public class Category
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; } // Null for global/seeded categories
    public required string Name { get; set; }
    public required string DisplayName { get; set; }
    public required string Type { get; set; } // "income" or "expense"
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public User? User { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
