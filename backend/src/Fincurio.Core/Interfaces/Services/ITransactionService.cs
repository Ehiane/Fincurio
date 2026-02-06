using Fincurio.Core.Models.DTOs.Transaction;

namespace Fincurio.Core.Interfaces.Services;

public interface ITransactionService
{
    Task<TransactionListResponseDto> GetTransactionsAsync(
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        Guid? categoryId = null,
        string? type = null,
        int page = 1,
        int pageSize = 50);
    Task<TransactionDto> GetByIdAsync(Guid id, Guid userId);
    Task<TransactionDto> CreateAsync(Guid userId, CreateTransactionDto request);
    Task<TransactionDto> UpdateAsync(Guid id, Guid userId, CreateTransactionDto request);
    Task DeleteAsync(Guid id, Guid userId);
}
