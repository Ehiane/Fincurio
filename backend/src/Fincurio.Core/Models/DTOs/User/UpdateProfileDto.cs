using System.ComponentModel.DataAnnotations;

namespace Fincurio.Core.Models.DTOs.User;

public class UpdateProfileDto
{
    [MinLength(2)]
    public string? FirstName { get; set; }

    [MinLength(2)]
    public string? LastName { get; set; }

    public string? FinancialIntention { get; set; }
}

public class UpdatePreferencesDto
{
    [StringLength(3, MinimumLength = 3)]
    public string? Currency { get; set; }

    public string? Timezone { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? MonthlyBudgetGoal { get; set; }
}
