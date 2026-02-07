using Fincurio.Core.Exceptions;
using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Merchant;
using Fincurio.Core.Models.Entities;

namespace Fincurio.Core.Services;

public class MerchantService : IMerchantService
{
    private readonly IMerchantRepository _merchantRepository;

    public MerchantService(IMerchantRepository merchantRepository)
    {
        _merchantRepository = merchantRepository;
    }

    public async Task<MerchantListResponseDto> GetMerchantsAsync(Guid userId)
    {
        var merchants = await _merchantRepository.GetByUserIdAsync(userId);

        return new MerchantListResponseDto
        {
            Merchants = merchants.Select(m => new MerchantDto
            {
                Id = m.Id,
                Name = m.Name
            }).ToList()
        };
    }

    public async Task<MerchantDto> CreateAsync(Guid userId, CreateMerchantDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ValidationException("Merchant name is required");
        }

        // Check if merchant already exists (case-insensitive)
        var existing = await _merchantRepository.GetByNameAsync(userId, dto.Name);
        if (existing != null)
        {
            throw new ValidationException("Merchant with this name already exists");
        }

        var merchant = new Merchant
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = dto.Name.Trim()
        };

        var created = await _merchantRepository.CreateAsync(merchant);

        return new MerchantDto
        {
            Id = created.Id,
            Name = created.Name
        };
    }

    public async Task<MerchantDto> GetOrCreateAsync(Guid userId, string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException("Merchant name is required");
        }

        // Check if merchant exists (case-insensitive)
        var existing = await _merchantRepository.GetByNameAsync(userId, name);
        if (existing != null)
        {
            return new MerchantDto
            {
                Id = existing.Id,
                Name = existing.Name
            };
        }

        // Create new merchant
        var merchant = new Merchant
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name.Trim()
        };

        var created = await _merchantRepository.CreateAsync(merchant);

        return new MerchantDto
        {
            Id = created.Id,
            Name = created.Name
        };
    }

    public async Task DeleteAsync(Guid userId, Guid merchantId)
    {
        var merchant = await _merchantRepository.GetByIdAsync(merchantId);

        if (merchant == null)
        {
            throw new NotFoundException("Merchant not found");
        }

        if (merchant.UserId != userId)
        {
            throw new UnauthorizedException("You do not have permission to delete this merchant");
        }

        await _merchantRepository.DeleteAsync(merchantId);
    }
}
