using Fincurio.Core.Models.Entities;

namespace Fincurio.Core.Interfaces.Repositories;

public interface IIncomeProfileRepository
{
    Task<IncomeProfile?> GetByUserIdAsync(Guid userId);
    Task<IncomeProfile> CreateOrUpdateAsync(IncomeProfile incomeProfile);
}
