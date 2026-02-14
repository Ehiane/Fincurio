using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Models.Entities;
using Fincurio.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Fincurio.Data.Repositories;

public class UserRepository : IUserRepository
{
    private readonly FincurioDbContext _context;

    public UserRepository(FincurioDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
            .Include(u => u.Preferences)
            .Include(u => u.IncomeProfile)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.Preferences)
            .Include(u => u.IncomeProfile)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByEmailVerificationTokenAsync(string token)
    {
        return await _context.Users
            .Include(u => u.Preferences)
            .Include(u => u.IncomeProfile)
            .FirstOrDefaultAsync(u => u.EmailVerificationToken == token);
    }

    public async Task<User?> GetByPasswordResetTokenAsync(string token)
    {
        return await _context.Users
            .Include(u => u.Preferences)
            .Include(u => u.IncomeProfile)
            .FirstOrDefaultAsync(u => u.PasswordResetToken == token);
    }

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email == email);
    }

    public async Task CreateOrUpdatePreferencesAsync(UserPreference preferences)
    {
        var existing = await _context.UserPreferences
            .FirstOrDefaultAsync(p => p.UserId == preferences.UserId);

        if (existing == null)
        {
            _context.UserPreferences.Add(preferences);
        }
        else
        {
            existing.Currency = preferences.Currency;
            existing.Timezone = preferences.Timezone;
            existing.MonthlyBudgetGoal = preferences.MonthlyBudgetGoal;
            _context.UserPreferences.Update(existing);
        }

        await _context.SaveChangesAsync();
    }
}
