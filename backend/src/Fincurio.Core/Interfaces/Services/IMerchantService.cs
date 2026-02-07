using Fincurio.Core.Models.DTOs.Merchant;

namespace Fincurio.Core.Interfaces.Services;

public interface IMerchantService
{
    Task<MerchantListResponseDto> GetMerchantsAsync(Guid userId);
    Task<MerchantDto> CreateAsync(Guid userId, CreateMerchantDto dto);
    Task<MerchantDto> GetOrCreateAsync(Guid userId, string name);
    Task DeleteAsync(Guid userId, Guid merchantId);
}
