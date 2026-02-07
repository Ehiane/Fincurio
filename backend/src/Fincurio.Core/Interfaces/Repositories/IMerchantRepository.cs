using Fincurio.Core.Models.Entities;

namespace Fincurio.Core.Interfaces.Repositories;

public interface IMerchantRepository
{
    Task<IEnumerable<Merchant>> GetByUserIdAsync(Guid userId);
    Task<Merchant?> GetByIdAsync(Guid id);
    Task<Merchant?> GetByNameAsync(Guid userId, string name);
    Task<Merchant> CreateAsync(Merchant merchant);
    Task DeleteAsync(Guid id);
}
