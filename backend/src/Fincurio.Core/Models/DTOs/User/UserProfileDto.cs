using Fincurio.Core.Models.DTOs.Income;

namespace Fincurio.Core.Models.DTOs.User;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? FinancialIntention { get; set; }
    public bool IsEmailVerified { get; set; }
    public bool HasCompletedOnboarding { get; set; }
    public string? LastSeenAnnouncementId { get; set; }
    public UserPreferencesDto? Preferences { get; set; }
    public IncomeProfileDto? IncomeProfile { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserPreferencesDto
{
    public string Currency { get; set; } = "USD";
    public string Timezone { get; set; } = "UTC";
    public decimal? MonthlyBudgetGoal { get; set; }
}
