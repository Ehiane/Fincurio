using Fincurio.Core.Models.Entities;

namespace Fincurio.Core.Interfaces.Repositories;

public interface ITransactionRepository
{
    Task<Transaction?> GetByIdAsync(Guid id, Guid userId);
    Task<List<Transaction>> GetByUserIdAsync(
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        Guid? categoryId = null,
        string? type = null,
        int page = 1,
        int pageSize = 50);
    Task<int> GetCountAsync(
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        Guid? categoryId = null,
        string? type = null);
    Task<Transaction> CreateAsync(Transaction transaction);
    Task UpdateAsync(Transaction transaction);
    Task DeleteAsync(Transaction transaction);
    Task<List<Transaction>> GetRecentAsync(Guid userId, int count = 5);
    Task<decimal> GetBalanceAsync(Guid userId);
    Task<List<Transaction>> GetByMonthAsync(Guid userId, int year, int month);
    Task<List<Transaction>> GetByDateRangeAsync(Guid userId, DateTime startDate, DateTime endDate);
}
