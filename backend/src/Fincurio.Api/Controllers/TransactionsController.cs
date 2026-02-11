using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Transaction;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace Fincurio.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<TransactionsController> _logger;

    public TransactionsController(ITransactionService transactionService, IMemoryCache cache, ILogger<TransactionsController> logger)
    {
        _transactionService = transactionService;
        _cache = cache;
        _logger = logger;
    }

    private void InvalidateInsightsCache(Guid userId)
    {
        _cache.Remove($"dashboard:{userId}");
        _cache.Remove($"monthly:{userId}:{DateTime.UtcNow.Year}:{DateTime.UtcNow.Month}");
        // Money flow cache keys include date params, so we can't easily remove all.
        // The 5-minute TTL will handle those.
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
    }

    [HttpGet]
    public async Task<ActionResult<TransactionListResponseDto>> GetTransactions(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] Guid? categoryId,
        [FromQuery] string? type,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var userId = GetUserId();
        _logger.LogInformation("Fetching transactions for user {UserId} | Page={Page}, PageSize={PageSize}, StartDate={StartDate}, EndDate={EndDate}, CategoryId={CategoryId}, Type={Type}",
            userId, page, pageSize, startDate, endDate, categoryId, type);
        var response = await _transactionService.GetTransactionsAsync(
            userId, startDate, endDate, categoryId, type, page, pageSize);
        _logger.LogInformation("Returned {Count} transactions (page {Page}/{TotalPages}) for user {UserId}",
            response.Transactions.Count, response.Pagination.CurrentPage, response.Pagination.TotalPages, userId);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetTransaction(Guid id)
    {
        var userId = GetUserId();
        _logger.LogInformation("Fetching transaction {TransactionId} for user {UserId}", id, userId);
        var transaction = await _transactionService.GetByIdAsync(id, userId);
        _logger.LogInformation("Returned transaction {TransactionId} | Merchant={Merchant}, Amount={Amount}, Type={Type}",
            id, transaction.Merchant, transaction.Amount, transaction.Type);
        return Ok(transaction);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> CreateTransaction([FromBody] CreateTransactionDto request)
    {
        var userId = GetUserId();
        _logger.LogInformation("Creating transaction for user {UserId} | Merchant={Merchant}, Amount={Amount}, Type={Type}, CategoryId={CategoryId}, Date={Date}",
            userId, request.Merchant, request.Amount, request.Type, request.CategoryId, request.Date);
        var transaction = await _transactionService.CreateAsync(userId, request);
        InvalidateInsightsCache(userId);
        _logger.LogInformation("Transaction created successfully: {TransactionId} for user {UserId}", transaction.Id, userId);
        return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionDto>> UpdateTransaction(Guid id, [FromBody] CreateTransactionDto request)
    {
        var userId = GetUserId();
        _logger.LogInformation("Updating transaction {TransactionId} for user {UserId} | Merchant={Merchant}, Amount={Amount}, Type={Type}, CategoryId={CategoryId}, Date={Date}",
            id, userId, request.Merchant, request.Amount, request.Type, request.CategoryId, request.Date);
        var transaction = await _transactionService.UpdateAsync(id, userId, request);
        InvalidateInsightsCache(userId);
        _logger.LogInformation("Transaction {TransactionId} updated successfully for user {UserId}", id, userId);
        return Ok(transaction);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTransaction(Guid id)
    {
        var userId = GetUserId();
        _logger.LogInformation("Deleting transaction {TransactionId} for user {UserId}", id, userId);
        await _transactionService.DeleteAsync(id, userId);
        InvalidateInsightsCache(userId);
        _logger.LogInformation("Transaction {TransactionId} deleted successfully for user {UserId}", id, userId);
        return NoContent();
    }
}
