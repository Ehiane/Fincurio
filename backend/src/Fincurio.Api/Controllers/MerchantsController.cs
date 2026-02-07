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

    public MerchantsController(IMerchantService merchantService)
    {
        _merchantService = merchantService;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst("userId")?.Value ?? throw new UnauthorizedAccessException());
    }

    [HttpGet]
    public async Task<ActionResult<MerchantListResponseDto>> GetMerchants()
    {
        var userId = GetUserId();
        var merchants = await _merchantService.GetMerchantsAsync(userId);
        return Ok(merchants);
    }

    [HttpPost]
    public async Task<ActionResult<MerchantDto>> CreateMerchant([FromBody] CreateMerchantDto request)
    {
        var userId = GetUserId();
        var merchant = await _merchantService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetMerchants), new { id = merchant.Id }, merchant);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMerchant(Guid id)
    {
        var userId = GetUserId();
        await _merchantService.DeleteAsync(userId, id);
        return NoContent();
    }
}
