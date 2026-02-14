using Fincurio.Core.Models.Entities;

namespace Fincurio.Core.Interfaces.Repositories;

public interface IGoalRepository
{
    Task<Goal?> GetByIdAsync(Guid id, Guid userId);
    Task<List<Goal>> GetByUserIdAsync(Guid userId, bool activeOnly = true);
    Task<Goal> CreateAsync(Goal goal);
    Task UpdateAsync(Goal goal);
    Task DeleteAsync(Goal goal);
}
