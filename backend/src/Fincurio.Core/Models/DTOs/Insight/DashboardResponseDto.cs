using Fincurio.Core.Models.DTOs.Transaction;

namespace Fincurio.Core.Models.DTOs.Insight;

public class DashboardResponseDto
{
    public decimal CurrentBalance { get; set; }
    public decimal BalanceChange { get; set; }
    public List<TransactionDto> RecentTransactions { get; set; } = new();
    public List<MonthlyFlowDto> MonthlyFlow { get; set; } = new();
}

public class MonthlyFlowDto
{
    public string Date { get; set; } = null!;
    public decimal Income { get; set; }
    public decimal Spending { get; set; }
}
