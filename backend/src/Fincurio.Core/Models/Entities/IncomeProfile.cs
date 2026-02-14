namespace Fincurio.Core.Models.Entities;

public class IncomeProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    // Employment info
    public string EmploymentType { get; set; } = string.Empty;    // full-time, part-time, intern
    public string EarningMethod { get; set; } = string.Empty;     // salaried, hourly
    public string PayFrequency { get; set; } = string.Empty;      // weekly, bi-weekly, semi-monthly, monthly

    // Gross income inputs
    public decimal? AnnualSalary { get; set; }
    public decimal? HourlyRate { get; set; }
    public decimal? HoursPerWeek { get; set; }

    // Tax
    public string? StateTaxCode { get; set; }
    public decimal EstimatedFederalTax { get; set; }
    public decimal EstimatedStateTax { get; set; }
    public decimal SocialSecurityTax { get; set; }
    public decimal MedicareTax { get; set; }

    // User-input deduction fields (new v2 format)
    public decimal HealthInsurancePerPaycheck { get; set; }       // per-paycheck dollar amount
    public decimal RetirementPercent { get; set; }                 // percentage e.g. 15.0
    public string? OtherDeductionsJson { get; set; }              // JSON array of {name, amountPerPaycheck}

    // Computed annual deductions (derived from user inputs)
    public decimal HealthInsurance { get; set; }
    public decimal RetirementContribution { get; set; }
    public decimal OtherDeductions { get; set; }

    // Computed totals
    public decimal GrossAnnualIncome { get; set; }
    public decimal NetAnnualIncome { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
}
