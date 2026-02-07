using Fincurio.Core.Exceptions;
using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Transaction;
using Fincurio.Core.Models.Entities;

namespace Fincurio.Core.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMerchantService _merchantService;

    public TransactionService(
        ITransactionRepository transactionRepository,
        ICategoryRepository categoryRepository,
        IMerchantService merchantService)
    {
        _transactionRepository = transactionRepository;
        _categoryRepository = categoryRepository;
        _merchantService = merchantService;
    }

    public async Task<TransactionListResponseDto> GetTransactionsAsync(
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        Guid? categoryId = null,
        string? type = null,
        int page = 1,
        int pageSize = 50)
    {
        var transactions = await _transactionRepository.GetByUserIdAsync(
            userId, startDate, endDate, categoryId, type, page, pageSize);

        var totalCount = await _transactionRepository.GetCountAsync(
            userId, startDate, endDate, categoryId, type);

        return new TransactionListResponseDto
        {
            Transactions = transactions.Select(MapToDto).ToList(),
            Pagination = new PaginationDto
            {
                CurrentPage = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                TotalItems = totalCount
            }
        };
    }

    public async Task<TransactionDto> GetByIdAsync(Guid id, Guid userId)
    {
        var transaction = await _transactionRepository.GetByIdAsync(id, userId);
        if (transaction == null)
        {
            throw new NotFoundException("Transaction not found");
        }

        return MapToDto(transaction);
    }

    public async Task<TransactionDto> CreateAsync(Guid userId, CreateTransactionDto request)
    {
        // Validate category exists
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
        if (category == null)
        {
            throw new ValidationException("Invalid category");
        }

        // Auto-save merchant (creates if doesn't exist, returns existing if it does)
        await _merchantService.GetOrCreateAsync(userId, request.Merchant);

        var transaction = new Transaction
        {
            UserId = userId,
            CategoryId = request.CategoryId,
            Date = request.Date,
            Time = request.Time,
            Merchant = request.Merchant,
            Amount = request.Amount,
            Type = request.Type,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _transactionRepository.CreateAsync(transaction);
        return MapToDto(created);
    }

    public async Task<TransactionDto> UpdateAsync(Guid id, Guid userId, CreateTransactionDto request)
    {
        var transaction = await _transactionRepository.GetByIdAsync(id, userId);
        if (transaction == null)
        {
            throw new NotFoundException("Transaction not found");
        }

        // Validate category exists
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
        if (category == null)
        {
            throw new ValidationException("Invalid category");
        }

        // Auto-save merchant (creates if doesn't exist, returns existing if it does)
        await _merchantService.GetOrCreateAsync(userId, request.Merchant);

        transaction.CategoryId = request.CategoryId;
        transaction.Date = request.Date;
        transaction.Time = request.Time;
        transaction.Merchant = request.Merchant;
        transaction.Amount = request.Amount;
        transaction.Type = request.Type;
        transaction.Notes = request.Notes;

        await _transactionRepository.UpdateAsync(transaction);

        return await GetByIdAsync(id, userId);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var transaction = await _transactionRepository.GetByIdAsync(id, userId);
        if (transaction == null)
        {
            throw new NotFoundException("Transaction not found");
        }

        await _transactionRepository.DeleteAsync(transaction);
    }

    private static TransactionDto MapToDto(Transaction transaction)
    {
        return new TransactionDto
        {
            Id = transaction.Id,
            Date = transaction.Date,
            Time = transaction.Time,
            Merchant = transaction.Merchant,
            Category = new CategoryDto
            {
                Id = transaction.Category.Id,
                Name = transaction.Category.Name,
                DisplayName = transaction.Category.DisplayName,
                Icon = transaction.Category.Icon ?? "",
                Color = transaction.Category.Color ?? ""
            },
            Amount = transaction.Amount,
            Type = transaction.Type,
            Notes = transaction.Notes
        };
    }
}
