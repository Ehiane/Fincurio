using Fincurio.Core.Models.DTOs.Category;

namespace Fincurio.Core.Interfaces.Services;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync();
}
