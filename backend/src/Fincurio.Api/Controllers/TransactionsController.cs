using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Transaction;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fincurio.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst("userId")?.Value ?? throw new UnauthorizedAccessException());
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
        var response = await _transactionService.GetTransactionsAsync(
            userId, startDate, endDate, categoryId, type, page, pageSize);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetTransaction(Guid id)
    {
        var userId = GetUserId();
        var transaction = await _transactionService.GetByIdAsync(id, userId);
        return Ok(transaction);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> CreateTransaction([FromBody] CreateTransactionDto request)
    {
        var userId = GetUserId();
        var transaction = await _transactionService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionDto>> UpdateTransaction(Guid id, [FromBody] CreateTransactionDto request)
    {
        var userId = GetUserId();
        var transaction = await _transactionService.UpdateAsync(id, userId, request);
        return Ok(transaction);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTransaction(Guid id)
    {
        var userId = GetUserId();
        await _transactionService.DeleteAsync(id, userId);
        return NoContent();
    }
}
