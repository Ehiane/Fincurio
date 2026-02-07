using Fincurio.Core.Exceptions;
using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Merchant;
using Fincurio.Core.Models.Entities;
using Microsoft.Extensions.Logging;

namespace Fincurio.Core.Services;

public class MerchantService : IMerchantService
{
    private readonly IMerchantRepository _merchantRepository;
    private readonly ILogger<MerchantService> _logger;

    public MerchantService(IMerchantRepository merchantRepository, ILogger<MerchantService> logger)
    {
        _merchantRepository = merchantRepository;
        _logger = logger;
    }

    public async Task<MerchantListResponseDto> GetMerchantsAsync(Guid userId)
    {
        _logger.LogInformation("Fetching merchants for user {UserId}", userId);

        var merchants = await _merchantRepository.GetByUserIdAsync(userId);

        var merchantList = merchants.Select(m => new MerchantDto
        {
            Id = m.Id,
            Name = m.Name
        }).ToList();

        _logger.LogInformation("Returned {Count} merchants for user {UserId}", merchantList.Count, userId);

        return new MerchantListResponseDto
        {
            Merchants = merchantList
        };
    }

    public async Task<MerchantDto> CreateAsync(Guid userId, CreateMerchantDto dto)
    {
        _logger.LogInformation("Creating merchant for user {UserId} | Name={Name}", userId, dto.Name);

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            _logger.LogWarning("Merchant creation failed - empty name for user {UserId}", userId);
            throw new ValidationException("Merchant name is required");
        }

        // Check if merchant already exists (case-insensitive)
        var existing = await _merchantRepository.GetByNameAsync(userId, dto.Name);
        if (existing != null)
        {
            _logger.LogWarning("Merchant creation failed - '{Name}' already exists for user {UserId}", dto.Name, userId);
            throw new ValidationException("Merchant with this name already exists");
        }

        var merchant = new Merchant
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = dto.Name.Trim()
        };

        var created = await _merchantRepository.CreateAsync(merchant);
        _logger.LogInformation("Merchant created: {MerchantId} ({Name}) for user {UserId}", created.Id, created.Name, userId);

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
            _logger.LogWarning("GetOrCreate merchant failed - empty name for user {UserId}", userId);
            throw new ValidationException("Merchant name is required");
        }

        // Check if merchant exists (case-insensitive)
        var existing = await _merchantRepository.GetByNameAsync(userId, name);
        if (existing != null)
        {
            _logger.LogDebug("Merchant '{Name}' already exists ({MerchantId}) for user {UserId}", name, existing.Id, userId);
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
        _logger.LogInformation("Auto-created merchant: {MerchantId} ({Name}) for user {UserId}", created.Id, created.Name, userId);

        return new MerchantDto
        {
            Id = created.Id,
            Name = created.Name
        };
    }

    public async Task DeleteAsync(Guid userId, Guid merchantId)
    {
        _logger.LogInformation("Deleting merchant {MerchantId} for user {UserId}", merchantId, userId);

        var merchant = await _merchantRepository.GetByIdAsync(merchantId);

        if (merchant == null)
        {
            _logger.LogWarning("Merchant deletion failed - {MerchantId} not found", merchantId);
            throw new NotFoundException("Merchant not found");
        }

        if (merchant.UserId != userId)
        {
            _logger.LogWarning("Merchant deletion failed - user {UserId} does not own merchant {MerchantId} (owner: {OwnerId})",
                userId, merchantId, merchant.UserId);
            throw new UnauthorizedException("You do not have permission to delete this merchant");
        }

        await _merchantRepository.DeleteAsync(merchantId);
        _logger.LogInformation("Merchant {MerchantId} ({Name}) deleted for user {UserId}", merchantId, merchant.Name, userId);
    }
}
