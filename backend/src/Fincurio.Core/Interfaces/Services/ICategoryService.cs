using Fincurio.Core.Models.DTOs.Transaction;

namespace Fincurio.Core.Interfaces.Services;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync();
}
