using System.ComponentModel.DataAnnotations;

namespace Fincurio.Core.Models.DTOs.Income;

public class CreateIncomeProfileDto
{
    [Required]
    public string EmploymentType { get; set; } = string.Empty;

    [Required]
    public string EarningMethod { get; set; } = string.Empty;

    [Required]
    public string PayFrequency { get; set; } = string.Empty;

    public decimal? AnnualSalary { get; set; }
    public decimal? HourlyRate { get; set; }
    public decimal? HoursPerWeek { get; set; }

    public string? StateTaxCode { get; set; }

    /// <summary>Per-paycheck health insurance premium in dollars</summary>
    public decimal HealthInsurancePerPaycheck { get; set; }

    /// <summary>Retirement contribution as a percentage (0-100)</summary>
    [Range(0, 100)]
    public decimal RetirementPercent { get; set; }

    /// <summary>Key-value list of other per-paycheck deductions</summary>
    public List<OtherDeductionItem>? OtherDeductions { get; set; }
}
