using Fincurio.Core.Models.DTOs.Transaction;

namespace Fincurio.Core.Models.DTOs.Insight;

public class MonthlyInsightResponseDto
{
    public PeriodDto Period { get; set; } = null!;
    public SummaryDto Summary { get; set; } = null!;
    public List<CategoryBreakdownDto> CategoryBreakdown { get; set; } = new();
}

public class PeriodDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public required string DisplayName { get; set; }
}

public class SummaryDto
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetBalance { get; set; }
    public decimal ChangeFromPreviousMonth { get; set; }
}

public class CategoryBreakdownDto
{
    public CategoryDto Category { get; set; } = null!;
    public decimal Amount { get; set; }
    public int TransactionCount { get; set; }
    public decimal PercentOfTotal { get; set; }
}
