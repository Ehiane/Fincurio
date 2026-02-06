using Fincurio.Core.Models.Entities;

namespace Fincurio.Core.Interfaces.Repositories;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync();
    Task<Category?> GetByIdAsync(Guid id);
}
