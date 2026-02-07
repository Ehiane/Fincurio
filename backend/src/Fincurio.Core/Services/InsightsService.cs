using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Insight;
using Fincurio.Core.Models.DTOs.Transaction;
using Microsoft.Extensions.Logging;
using System.Globalization;

namespace Fincurio.Core.Services;

public class InsightsService : IInsightsService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly ILogger<InsightsService> _logger;

    public InsightsService(ITransactionRepository transactionRepository, ILogger<InsightsService> logger)
    {
        _transactionRepository = transactionRepository;
        _logger = logger;
    }

    public async Task<DashboardResponseDto> GetDashboardAsync(Guid userId)
    {
        _logger.LogInformation("Building dashboard for user {UserId}", userId);

        var balance = await _transactionRepository.GetBalanceAsync(userId);
        _logger.LogDebug("Current balance for user {UserId}: {Balance}", userId, balance);

        var recentTransactions = await _transactionRepository.GetRecentAsync(userId, 5);
        _logger.LogDebug("Fetched {Count} recent transactions for user {UserId}", recentTransactions.Count, userId);

        // Calculate balance change (current month vs previous month)
        var currentMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var previousMonth = currentMonth.AddMonths(-1);

        var currentMonthBalance = await GetMonthBalance(userId, currentMonth.Year, currentMonth.Month);
        var previousMonthBalance = await GetMonthBalance(userId, previousMonth.Year, previousMonth.Month);

        var balanceChange = previousMonthBalance != 0
            ? ((currentMonthBalance - previousMonthBalance) / Math.Abs(previousMonthBalance)) * 100
            : 0;

        _logger.LogDebug("Balance change for user {UserId}: {Change}% (current: {Current}, previous: {Previous})",
            userId, balanceChange, currentMonthBalance, previousMonthBalance);

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

        _logger.LogInformation("Dashboard built for user {UserId} | Balance={Balance}, RecentTx={RecentCount}, FlowWeeks={FlowWeeks}",
            userId, balance, recentTransactions.Count, monthlyFlow.Count);

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
        _logger.LogInformation("Calculating monthly insights for user {UserId} | Year={Year}, Month={Month}", userId, year, month);

        var transactions = await _transactionRepository.GetByMonthAsync(userId, year, month);
        _logger.LogDebug("Found {Count} transactions for {Year}-{Month} for user {UserId}", transactions.Count, year, month, userId);

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

        _logger.LogInformation("Monthly insights for user {UserId} ({Year}-{Month}) | Income={Income}, Expenses={Expenses}, Net={Net}, Categories={CategoryCount}",
            userId, year, month, totalIncome, totalExpenses, totalIncome - totalExpenses, categoryBreakdown.Count);

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

    public async Task<MoneyFlowResponseDto> GetMoneyFlowAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null)
    {
        _logger.LogInformation("Fetching money flow for user {UserId} | StartDate={StartDate}, EndDate={EndDate}",
            userId, startDate, endDate);

        // Get ALL transactions to find the earliest/latest dates for the user
        var allTransactions = await _transactionRepository.GetByUserIdAsync(userId, pageSize: int.MaxValue);

        if (allTransactions.Count == 0)
        {
            _logger.LogInformation("No transactions found for user {UserId}, returning empty money flow", userId);
            return new MoneyFlowResponseDto
            {
                EarliestDate = null,
                LatestDate = null,
                FilterStart = DateTime.UtcNow.Date,
                FilterEnd = DateTime.UtcNow.Date,
                Grouping = "daily",
                DataPoints = new List<MonthlyFlowDto>()
            };
        }

        var earliestDate = allTransactions.Min(t => t.Date).Date;
        var latestDate = allTransactions.Max(t => t.Date).Date;

        // Apply filters or default to full range
        var filterStart = (startDate ?? earliestDate).Date;
        var filterEnd = (endDate ?? latestDate).Date;

        // Clamp to valid range
        if (filterStart < earliestDate) filterStart = earliestDate;
        if (filterEnd > latestDate) filterEnd = latestDate;
        if (filterStart > filterEnd) filterStart = filterEnd;

        _logger.LogDebug("Money flow date range for user {UserId}: {Start} to {End} (earliest: {Earliest}, latest: {Latest})",
            userId, filterStart, filterEnd, earliestDate, latestDate);

        // Get transactions in the filtered range
        var transactions = await _transactionRepository.GetByDateRangeAsync(userId, filterStart, filterEnd);

        // Determine grouping based on range span
        var totalDays = (filterEnd - filterStart).TotalDays;
        string grouping;
        if (totalDays <= 60)
            grouping = "daily";
        else if (totalDays <= 365)
            grouping = "weekly";
        else
            grouping = "monthly";

        _logger.LogDebug("Money flow grouping for user {UserId}: {Grouping} ({Days} days span, {TxCount} transactions)",
            userId, grouping, totalDays, transactions.Count);

        var dataPoints = new List<MonthlyFlowDto>();

        if (grouping == "daily")
        {
            var currentDate = filterStart;
            while (currentDate <= filterEnd)
            {
                var dayTransactions = transactions.Where(t => t.Date.Date == currentDate).ToList();
                dataPoints.Add(new MonthlyFlowDto
                {
                    Date = currentDate.ToString("MMM dd", CultureInfo.InvariantCulture),
                    Income = dayTransactions.Where(t => t.Type == "income").Sum(t => t.Amount),
                    Spending = dayTransactions.Where(t => t.Type == "expense").Sum(t => t.Amount)
                });
                currentDate = currentDate.AddDays(1);
            }
        }
        else if (grouping == "weekly")
        {
            var currentDate = filterStart;
            while (currentDate <= filterEnd)
            {
                var weekEnd = currentDate.AddDays(6);
                if (weekEnd > filterEnd) weekEnd = filterEnd;

                var weekTransactions = transactions.Where(t => t.Date.Date >= currentDate && t.Date.Date <= weekEnd).ToList();
                dataPoints.Add(new MonthlyFlowDto
                {
                    Date = currentDate.ToString("MMM dd", CultureInfo.InvariantCulture),
                    Income = weekTransactions.Where(t => t.Type == "income").Sum(t => t.Amount),
                    Spending = weekTransactions.Where(t => t.Type == "expense").Sum(t => t.Amount)
                });
                currentDate = weekEnd.AddDays(1);
            }
        }
        else // monthly
        {
            var currentDate = new DateTime(filterStart.Year, filterStart.Month, 1);
            while (currentDate <= filterEnd)
            {
                var monthEnd = currentDate.AddMonths(1).AddDays(-1);
                var monthTransactions = transactions.Where(t => t.Date.Date >= currentDate && t.Date.Date <= monthEnd).ToList();
                dataPoints.Add(new MonthlyFlowDto
                {
                    Date = currentDate.ToString("MMM yyyy", CultureInfo.InvariantCulture),
                    Income = monthTransactions.Where(t => t.Type == "income").Sum(t => t.Amount),
                    Spending = monthTransactions.Where(t => t.Type == "expense").Sum(t => t.Amount)
                });
                currentDate = currentDate.AddMonths(1);
            }
        }

        _logger.LogInformation("Money flow built for user {UserId} | Grouping={Grouping}, DataPoints={Count}, Range={Start}-{End}",
            userId, grouping, dataPoints.Count, filterStart.ToString("yyyy-MM-dd"), filterEnd.ToString("yyyy-MM-dd"));

        return new MoneyFlowResponseDto
        {
            EarliestDate = earliestDate,
            LatestDate = latestDate,
            FilterStart = filterStart,
            FilterEnd = filterEnd,
            Grouping = grouping,
            DataPoints = dataPoints
        };
    }
}
