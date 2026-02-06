namespace Fincurio.Core.Models.Entities;

public class User
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? FinancialIntention { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public UserPreference? Preferences { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
