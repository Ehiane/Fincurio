using Fincurio.Core.Exceptions;
using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Transaction;
using Fincurio.Core.Models.Entities;
using Microsoft.Extensions.Logging;

namespace Fincurio.Core.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMerchantService _merchantService;
    private readonly ILogger<TransactionService> _logger;

    public TransactionService(
        ITransactionRepository transactionRepository,
        ICategoryRepository categoryRepository,
        IMerchantService merchantService,
        ILogger<TransactionService> logger)
    {
        _transactionRepository = transactionRepository;
        _categoryRepository = categoryRepository;
        _merchantService = merchantService;
        _logger = logger;
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
        _logger.LogInformation("Querying transactions for user {UserId} | StartDate={StartDate}, EndDate={EndDate}, CategoryId={CategoryId}, Type={Type}, Page={Page}, PageSize={PageSize}",
            userId, startDate, endDate, categoryId, type, page, pageSize);

        var transactions = await _transactionRepository.GetByUserIdAsync(
            userId, startDate, endDate, categoryId, type, page, pageSize);

        var totalCount = await _transactionRepository.GetCountAsync(
            userId, startDate, endDate, categoryId, type);

        _logger.LogInformation("Found {TotalCount} transactions, returning page {Page} with {Count} items for user {UserId}",
            totalCount, page, transactions.Count, userId);

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
        _logger.LogInformation("Fetching transaction {TransactionId} for user {UserId}", id, userId);

        var transaction = await _transactionRepository.GetByIdAsync(id, userId);
        if (transaction == null)
        {
            _logger.LogWarning("Transaction {TransactionId} not found for user {UserId}", id, userId);
            throw new NotFoundException("Transaction not found");
        }

        _logger.LogDebug("Transaction {TransactionId} found: Merchant={Merchant}, Amount={Amount}, Type={Type}",
            id, transaction.Merchant, transaction.Amount, transaction.Type);
        return MapToDto(transaction);
    }

    public async Task<TransactionDto> CreateAsync(Guid userId, CreateTransactionDto request)
    {
        _logger.LogInformation("Creating transaction for user {UserId} | Merchant={Merchant}, Amount={Amount}, Type={Type}, CategoryId={CategoryId}, Date={Date}, Time={Time}",
            userId, request.Merchant, request.Amount, request.Type, request.CategoryId, request.Date, request.Time);

        // Validate category exists
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
        if (category == null)
        {
            _logger.LogWarning("Transaction creation failed - invalid category {CategoryId} for user {UserId}", request.CategoryId, userId);
            throw new ValidationException("Invalid category");
        }

        // Auto-save merchant (creates if doesn't exist, returns existing if it does)
        await _merchantService.GetOrCreateAsync(userId, request.Merchant);
        _logger.LogDebug("Merchant '{Merchant}' resolved for user {UserId}", request.Merchant, userId);

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
        _logger.LogInformation("Transaction created: {TransactionId} | Merchant={Merchant}, Amount={Amount}, Type={Type} for user {UserId}",
            created.Id, created.Merchant, created.Amount, created.Type, userId);
        return MapToDto(created);
    }

    public async Task<TransactionDto> UpdateAsync(Guid id, Guid userId, CreateTransactionDto request)
    {
        _logger.LogInformation("Updating transaction {TransactionId} for user {UserId} | Merchant={Merchant}, Amount={Amount}, Type={Type}, CategoryId={CategoryId}, Date={Date}, Time={Time}",
            id, userId, request.Merchant, request.Amount, request.Type, request.CategoryId, request.Date, request.Time);

        var transaction = await _transactionRepository.GetByIdAsync(id, userId);
        if (transaction == null)
        {
            _logger.LogWarning("Transaction update failed - {TransactionId} not found for user {UserId}", id, userId);
            throw new NotFoundException("Transaction not found");
        }

        // Validate category exists
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
        if (category == null)
        {
            _logger.LogWarning("Transaction update failed - invalid category {CategoryId}", request.CategoryId);
            throw new ValidationException("Invalid category");
        }

        // Auto-save merchant (creates if doesn't exist, returns existing if it does)
        await _merchantService.GetOrCreateAsync(userId, request.Merchant);

        _logger.LogDebug("Updating transaction {TransactionId}: Old[Merchant={OldMerchant}, Amount={OldAmount}] -> New[Merchant={NewMerchant}, Amount={NewAmount}]",
            id, transaction.Merchant, transaction.Amount, request.Merchant, request.Amount);

        transaction.CategoryId = request.CategoryId;
        transaction.Date = request.Date;
        transaction.Time = request.Time;
        transaction.Merchant = request.Merchant;
        transaction.Amount = request.Amount;
        transaction.Type = request.Type;
        transaction.Notes = request.Notes;

        await _transactionRepository.UpdateAsync(transaction);

        _logger.LogInformation("Transaction {TransactionId} updated successfully for user {UserId}", id, userId);
        return await GetByIdAsync(id, userId);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        _logger.LogInformation("Deleting transaction {TransactionId} for user {UserId}", id, userId);

        var transaction = await _transactionRepository.GetByIdAsync(id, userId);
        if (transaction == null)
        {
            _logger.LogWarning("Transaction delete failed - {TransactionId} not found for user {UserId}", id, userId);
            throw new NotFoundException("Transaction not found");
        }

        _logger.LogDebug("Deleting transaction {TransactionId}: Merchant={Merchant}, Amount={Amount}, Type={Type}",
            id, transaction.Merchant, transaction.Amount, transaction.Type);

        await _transactionRepository.DeleteAsync(transaction);
        _logger.LogInformation("Transaction {TransactionId} deleted successfully for user {UserId}", id, userId);
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
