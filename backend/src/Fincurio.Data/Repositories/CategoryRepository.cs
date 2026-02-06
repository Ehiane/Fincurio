using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Models.Entities;
using Fincurio.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Fincurio.Data.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly FincurioDbContext _context;

    public CategoryRepository(FincurioDbContext context)
    {
        _context = context;
    }

    public async Task<List<Category>> GetAllAsync()
    {
        return await _context.Categories
            .OrderBy(c => c.SortOrder)
            .ToListAsync();
    }

    public async Task<Category?> GetByIdAsync(Guid id)
    {
        return await _context.Categories.FindAsync(id);
    }
}
