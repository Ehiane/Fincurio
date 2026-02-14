using Fincurio.Core.Models.DTOs.Income;

namespace Fincurio.Core.Interfaces.Services;

public interface IIncomeService
{
    Task<IncomeProfileDto?> GetByUserIdAsync(Guid userId);
    Task<IncomeProfileDto> CreateOrUpdateAsync(Guid userId, CreateIncomeProfileDto request);
}
