using Fincurio.Core.Models.Entities;

namespace Fincurio.Core.Interfaces.Repositories;

public interface IBudgetGoalRepository
{
    Task<BudgetGoal?> GetByUserIdAsync(Guid userId);
    Task<BudgetGoal> CreateOrUpdateAsync(BudgetGoal budgetGoal);
}
