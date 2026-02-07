using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Merchant;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fincurio.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MerchantsController : ControllerBase
{
    private readonly IMerchantService _merchantService;
    private readonly ILogger<MerchantsController> _logger;

    public MerchantsController(IMerchantService merchantService, ILogger<MerchantsController> logger)
    {
        _merchantService = merchantService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
    }

    [HttpGet]
    public async Task<ActionResult<MerchantListResponseDto>> GetMerchants()
    {
        var userId = GetUserId();
        _logger.LogInformation("Fetching merchants for user {UserId}", userId);
        var merchants = await _merchantService.GetMerchantsAsync(userId);
        _logger.LogInformation("Returned {Count} merchants for user {UserId}", merchants.Merchants.Count, userId);
        return Ok(merchants);
    }

    [HttpPost]
    public async Task<ActionResult<MerchantDto>> CreateMerchant([FromBody] CreateMerchantDto request)
    {
        var userId = GetUserId();
        _logger.LogInformation("Creating merchant for user {UserId} | Name={Name}", userId, request.Name);
        var merchant = await _merchantService.CreateAsync(userId, request);
        _logger.LogInformation("Merchant created: {MerchantId} ({Name}) for user {UserId}", merchant.Id, merchant.Name, userId);
        return CreatedAtAction(nameof(GetMerchants), new { id = merchant.Id }, merchant);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMerchant(Guid id)
    {
        var userId = GetUserId();
        _logger.LogInformation("Deleting merchant {MerchantId} for user {UserId}", id, userId);
        await _merchantService.DeleteAsync(userId, id);
        _logger.LogInformation("Merchant {MerchantId} deleted successfully for user {UserId}", id, userId);
        return NoContent();
    }
}
