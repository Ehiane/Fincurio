using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Models.Entities;
using Fincurio.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Fincurio.Data.Repositories;

public class BudgetGoalRepository : IBudgetGoalRepository
{
    private readonly FincurioDbContext _context;

    public BudgetGoalRepository(FincurioDbContext context)
    {
        _context = context;
    }

    public async Task<BudgetGoal?> GetByUserIdAsync(Guid userId)
    {
        return await _context.BudgetGoals
            .FirstOrDefaultAsync(bg => bg.UserId == userId);
    }

    public async Task<BudgetGoal> CreateOrUpdateAsync(BudgetGoal budgetGoal)
    {
        var existing = await _context.BudgetGoals
            .FirstOrDefaultAsync(bg => bg.UserId == budgetGoal.UserId);

        if (existing == null)
        {
            budgetGoal.CreatedAt = DateTime.UtcNow;
            budgetGoal.UpdatedAt = DateTime.UtcNow;
            _context.BudgetGoals.Add(budgetGoal);
        }
        else
        {
            existing.MonthlyBudgetTarget = budgetGoal.MonthlyBudgetTarget;
            existing.UpdatedAt = DateTime.UtcNow;
            _context.BudgetGoals.Update(existing);
            budgetGoal = existing;
        }

        await _context.SaveChangesAsync();
        return budgetGoal;
    }
}
