using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Category;

namespace Fincurio.Core.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        var categories = await _categoryRepository.GetAllAsync();

        return categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            DisplayName = c.DisplayName,
            Icon = c.Icon ?? "",
            Color = c.Color ?? ""
        }).ToList();
    }
}
