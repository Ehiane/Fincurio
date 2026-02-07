using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Models.Entities;
using Fincurio.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Fincurio.Data.Repositories;

public class MerchantRepository : IMerchantRepository
{
    private readonly FincurioDbContext _context;

    public MerchantRepository(FincurioDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Merchant>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Merchants
            .Where(m => m.UserId == userId)
            .OrderBy(m => m.Name)
            .ToListAsync();
    }

    public async Task<Merchant?> GetByIdAsync(Guid id)
    {
        return await _context.Merchants.FindAsync(id);
    }

    public async Task<Merchant?> GetByNameAsync(Guid userId, string name)
    {
        return await _context.Merchants
            .FirstOrDefaultAsync(m => m.UserId == userId && m.Name.ToLower() == name.ToLower());
    }

    public async Task<Merchant> CreateAsync(Merchant merchant)
    {
        merchant.CreatedAt = DateTime.UtcNow;
        _context.Merchants.Add(merchant);
        await _context.SaveChangesAsync();
        return merchant;
    }

    public async Task DeleteAsync(Guid id)
    {
        var merchant = await GetByIdAsync(id);
        if (merchant != null)
        {
            _context.Merchants.Remove(merchant);
            await _context.SaveChangesAsync();
        }
    }
}
