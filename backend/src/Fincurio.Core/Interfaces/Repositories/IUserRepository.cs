using Fincurio.Core.Models.Entities;

namespace Fincurio.Core.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task UpdateAsync(User user);
    Task<bool> EmailExistsAsync(string email);
    Task CreateOrUpdatePreferencesAsync(UserPreference preferences);
}
