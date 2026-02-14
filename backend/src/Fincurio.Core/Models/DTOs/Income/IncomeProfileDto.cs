namespace Fincurio.Core.Models.DTOs.Income;

public class IncomeProfileDto
{
    // Employment info
    public string EmploymentType { get; set; } = string.Empty;
    public string EarningMethod { get; set; } = string.Empty;
    public string PayFrequency { get; set; } = string.Empty;

    // Gross income inputs
    public decimal? AnnualSalary { get; set; }
    public decimal? HourlyRate { get; set; }
    public decimal? HoursPerWeek { get; set; }

    // Tax
    public string? StateTaxCode { get; set; }
    public decimal EstimatedFederalTax { get; set; }
    public decimal EstimatedStateTax { get; set; }

    // User-input deduction fields (v2)
    public decimal HealthInsurancePerPaycheck { get; set; }
    public decimal RetirementPercent { get; set; }
    public List<OtherDeductionItem> OtherDeductionItems { get; set; } = new();

    // Computed annual deductions
    public decimal HealthInsurance { get; set; }
    public decimal RetirementContribution { get; set; }
    public decimal TotalOtherDeductions { get; set; }

    // Computed totals
    public decimal GrossAnnualIncome { get; set; }
    public decimal NetAnnualIncome { get; set; }
}
