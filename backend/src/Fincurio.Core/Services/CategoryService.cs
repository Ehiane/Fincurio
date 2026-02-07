using Fincurio.Core.Exceptions;
using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Category;
using Fincurio.Core.Models.Entities;

namespace Fincurio.Core.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<List<CategoryDto>> GetAllAsync(Guid? userId = null)
    {
        var categories = userId.HasValue
            ? await _categoryRepository.GetByUserIdAsync(userId.Value)
            : await _categoryRepository.GetAllAsync();

        return categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            DisplayName = c.DisplayName,
            Icon = c.Icon ?? "",
            Color = c.Color ?? "",
            IsCustom = c.UserId.HasValue
        }).ToList();
    }

    public async Task<CategoryDto> CreateAsync(Guid userId, CreateCategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.DisplayName))
        {
            throw new ValidationException("Category name and display name are required");
        }

        var category = new Category
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = dto.Name.Trim(),
            DisplayName = dto.DisplayName.Trim(),
            Type = dto.Type,
            Icon = dto.Icon,
            Color = dto.Color,
            SortOrder = 1000 // User categories appear after global ones
        };

        var created = await _categoryRepository.CreateAsync(category);

        return new CategoryDto
        {
            Id = created.Id,
            Name = created.Name,
            DisplayName = created.DisplayName,
            Icon = created.Icon ?? "",
            Color = created.Color ?? "",
            IsCustom = true
        };
    }

    public async Task DeleteAsync(Guid userId, Guid categoryId)
    {
        var category = await _categoryRepository.GetByIdAsync(categoryId);

        if (category == null)
        {
            throw new NotFoundException("Category not found");
        }

        // Only allow deleting user-created categories
        if (!category.UserId.HasValue)
        {
            throw new ValidationException("Cannot delete global categories");
        }

        if (category.UserId != userId)
        {
            throw new UnauthorizedException("You do not have permission to delete this category");
        }

        await _categoryRepository.DeleteAsync(categoryId);
    }
}
