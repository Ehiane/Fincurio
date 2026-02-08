using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Models.Entities;
using Fincurio.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Fincurio.Data.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly FincurioDbContext _context;

    public TransactionRepository(FincurioDbContext context)
    {
        _context = context;
    }

    public async Task<Transaction?> GetByIdAsync(Guid id, Guid userId)
    {
        return await _context.Transactions
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
    }

    public async Task<List<Transaction>> GetByUserIdAsync(
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        Guid? categoryId = null,
        string? type = null,
        int page = 1,
        int pageSize = 50)
    {
        var query = _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(t => t.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(t => t.Date <= endDate.Value);

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);

        if (!string.IsNullOrEmpty(type))
            query = query.Where(t => t.Type == type);

        return await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Time)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetCountAsync(
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        Guid? categoryId = null,
        string? type = null)
    {
        var query = _context.Transactions.Where(t => t.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(t => t.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(t => t.Date <= endDate.Value);

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);

        if (!string.IsNullOrEmpty(type))
            query = query.Where(t => t.Type == type);

        return await query.CountAsync();
    }

    public async Task<Transaction> CreateAsync(Transaction transaction)
    {
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        // Reload with category
        return (await GetByIdAsync(transaction.Id, transaction.UserId))!;
    }

    public async Task UpdateAsync(Transaction transaction)
    {
        _context.Transactions.Update(transaction);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Transaction transaction)
    {
        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Transaction>> GetRecentAsync(Guid userId, int count = 5)
    {
        return await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Time)
            .Take(count)
            .ToListAsync();
    }

    public async Task<decimal> GetBalanceAsync(Guid userId)
    {
        var income = await _context.Transactions
            .Where(t => t.UserId == userId && t.Type == "income")
            .SumAsync(t => t.Amount);

        var expenses = await _context.Transactions
            .Where(t => t.UserId == userId && t.Type == "expense")
            .SumAsync(t => t.Amount);

        return income - expenses;
    }

    public async Task<List<Transaction>> GetByMonthAsync(Guid userId, int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        return await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.Date >= startDate && t.Date <= endDate)
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Time)
            .ToListAsync();
    }

    public async Task<List<Transaction>> GetByDateRangeAsync(Guid userId, DateTime startDate, DateTime endDate)
    {
        return await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.Date >= startDate && t.Date <= endDate)
            .OrderBy(t => t.Date)
            .ThenBy(t => t.Time)
            .ToListAsync();
    }

    public async Task<(DateTime? Earliest, DateTime? Latest)> GetDateRangeAsync(Guid userId)
    {
        var dates = await _context.Transactions
            .Where(t => t.UserId == userId)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Earliest = (DateTime?)g.Min(t => t.Date),
                Latest = (DateTime?)g.Max(t => t.Date)
            })
            .FirstOrDefaultAsync();

        return (dates?.Earliest, dates?.Latest);
    }
}
