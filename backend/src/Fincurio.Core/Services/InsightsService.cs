using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Insight;
using Fincurio.Core.Models.DTOs.Transaction;
using System.Globalization;

namespace Fincurio.Core.Services;

public class InsightsService : IInsightsService
{
    private readonly ITransactionRepository _transactionRepository;

    public InsightsService(ITransactionRepository transactionRepository)
    {
        _transactionRepository = transactionRepository;
    }

    public async Task<DashboardResponseDto> GetDashboardAsync(Guid userId)
    {
        var balance = await _transactionRepository.GetBalanceAsync(userId);
        var recentTransactions = await _transactionRepository.GetRecentAsync(userId, 5);

        // Calculate balance change (current month vs previous month)
        var currentMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var previousMonth = currentMonth.AddMonths(-1);

        var currentMonthBalance = await GetMonthBalance(userId, currentMonth.Year, currentMonth.Month);
        var previousMonthBalance = await GetMonthBalance(userId, previousMonth.Year, previousMonth.Month);

        var balanceChange = previousMonthBalance != 0
            ? ((currentMonthBalance - previousMonthBalance) / Math.Abs(previousMonthBalance)) * 100
            : 0;

        // Get monthly flow data (last 30 days, grouped by week)
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30).Date;
        var transactions = await _transactionRepository.GetByDateRangeAsync(userId, thirtyDaysAgo, DateTime.UtcNow.Date);

        var monthlyFlow = new List<MonthlyFlowDto>();
        var currentDate = thirtyDaysAgo;

        while (currentDate <= DateTime.UtcNow.Date)
        {
            var weekEnd = currentDate.AddDays(6);
            var weekTransactions = transactions.Where(t => t.Date >= currentDate && t.Date <= weekEnd).ToList();

            monthlyFlow.Add(new MonthlyFlowDto
            {
                Date = currentDate.ToString("MMM dd", CultureInfo.InvariantCulture),
                Income = weekTransactions.Where(t => t.Type == "income").Sum(t => t.Amount),
                Spending = weekTransactions.Where(t => t.Type == "expense").Sum(t => t.Amount)
            });

            currentDate = weekEnd.AddDays(1);
        }

        return new DashboardResponseDto
        {
            CurrentBalance = balance,
            BalanceChange = (decimal)balanceChange,
            RecentTransactions = recentTransactions.Select(t => new TransactionDto
            {
                Id = t.Id,
                Date = t.Date,
                Time = t.Time,
                Merchant = t.Merchant,
                Category = new CategoryDto
                {
                    Id = t.Category.Id,
                    Name = t.Category.Name,
                    DisplayName = t.Category.DisplayName,
                    Icon = t.Category.Icon ?? "",
                    Color = t.Category.Color ?? ""
                },
                Amount = t.Amount,
                Type = t.Type,
                Notes = t.Notes
            }).ToList(),
            MonthlyFlow = monthlyFlow
        };
    }

    public async Task<MonthlyInsightResponseDto> GetMonthlyInsightsAsync(Guid userId, int year, int month)
    {
        var transactions = await _transactionRepository.GetByMonthAsync(userId, year, month);

        var totalIncome = transactions.Where(t => t.Type == "income").Sum(t => t.Amount);
        var totalExpenses = transactions.Where(t => t.Type == "expense").Sum(t => t.Amount);

        // Get previous month for comparison
        var startDate = new DateTime(year, month, 1);
        var previousMonth = startDate.AddMonths(-1);
        var previousMonthBalance = await GetMonthBalance(userId, previousMonth.Year, previousMonth.Month);
        var currentMonthBalance = totalIncome - totalExpenses;

        var changeFromPreviousMonth = previousMonthBalance != 0
            ? ((currentMonthBalance - previousMonthBalance) / Math.Abs(previousMonthBalance)) * 100
            : 0;

        // Group by category
        var categoryBreakdown = transactions
            .Where(t => t.Type == "expense")
            .GroupBy(t => t.Category)
            .Select(g => new CategoryBreakdownDto
            {
                Category = new CategoryDto
                {
                    Id = g.Key.Id,
                    Name = g.Key.Name,
                    DisplayName = g.Key.DisplayName,
                    Icon = g.Key.Icon ?? "",
                    Color = g.Key.Color ?? ""
                },
                Amount = g.Sum(t => t.Amount),
                TransactionCount = g.Count(),
                PercentOfTotal = totalExpenses > 0 ? (g.Sum(t => t.Amount) / totalExpenses) * 100 : 0
            })
            .OrderByDescending(c => c.Amount)
            .ToList();

        return new MonthlyInsightResponseDto
        {
            Period = new PeriodDto
            {
                Year = year,
                Month = month,
                DisplayName = new DateTime(year, month, 1).ToString("MMMM yyyy", CultureInfo.InvariantCulture)
            },
            Summary = new SummaryDto
            {
                TotalIncome = totalIncome,
                TotalExpenses = totalExpenses,
                NetBalance = totalIncome - totalExpenses,
                ChangeFromPreviousMonth = (decimal)changeFromPreviousMonth
            },
            CategoryBreakdown = categoryBreakdown
        };
    }

    private async Task<decimal> GetMonthBalance(Guid userId, int year, int month)
    {
        var transactions = await _transactionRepository.GetByMonthAsync(userId, year, month);

        var income = transactions.Where(t => t.Type == "income").Sum(t => t.Amount);
        var expenses = transactions.Where(t => t.Type == "expense").Sum(t => t.Amount);

        return income - expenses;
    }
}
