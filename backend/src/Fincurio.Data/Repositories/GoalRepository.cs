using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Models.Entities;
using Fincurio.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Fincurio.Data.Repositories;

public class GoalRepository : IGoalRepository
{
    private readonly FincurioDbContext _context;

    public GoalRepository(FincurioDbContext context)
    {
        _context = context;
    }

    public async Task<Goal?> GetByIdAsync(Guid id, Guid userId)
    {
        return await _context.Goals
            .Include(g => g.Category)
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
    }

    public async Task<List<Goal>> GetByUserIdAsync(Guid userId, bool activeOnly = true)
    {
        var query = _context.Goals
            .Include(g => g.Category)
            .Where(g => g.UserId == userId);

        if (activeOnly)
            query = query.Where(g => g.IsActive);

        return await query
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    public async Task<Goal> CreateAsync(Goal goal)
    {
        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(goal.Id, goal.UserId))!;
    }

    public async Task UpdateAsync(Goal goal)
    {
        _context.Goals.Update(goal);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Goal goal)
    {
        _context.Goals.Remove(goal);
        await _context.SaveChangesAsync();
    }
}
