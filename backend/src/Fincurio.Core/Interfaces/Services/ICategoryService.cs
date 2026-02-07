using Fincurio.Core.Models.DTOs.Category;

namespace Fincurio.Core.Interfaces.Services;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync(Guid? userId = null);
    Task<CategoryDto> CreateAsync(Guid userId, CreateCategoryDto dto);
    Task DeleteAsync(Guid userId, Guid categoryId);
}
