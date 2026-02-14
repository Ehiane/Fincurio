using Fincurio.Core.Exceptions;
using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Category;
using Fincurio.Core.Models.Entities;
using Microsoft.Extensions.Logging;

namespace Fincurio.Core.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(ICategoryRepository categoryRepository, ILogger<CategoryService> logger)
    {
        _categoryRepository = categoryRepository;
        _logger = logger;
    }

    public async Task<List<CategoryDto>> GetAllAsync(Guid? userId = null)
    {
        _logger.LogInformation("Fetching categories for user {UserId}", userId?.ToString() ?? "global");

        var categories = userId.HasValue
            ? await _categoryRepository.GetByUserIdAsync(userId.Value)
            : await _categoryRepository.GetAllAsync();

        _logger.LogInformation("Returned {Count} categories for user {UserId}", categories.Count, userId?.ToString() ?? "global");

        return categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            DisplayName = c.DisplayName,
            Icon = c.Icon ?? "",
            Color = c.Color ?? "",
            CategoryGroup = c.CategoryGroup,
            IsCustom = c.UserId.HasValue
        }).ToList();
    }

    public async Task<CategoryDto> CreateAsync(Guid userId, CreateCategoryDto dto)
    {
        _logger.LogInformation("Creating category for user {UserId} | Name={Name}, DisplayName={DisplayName}, Type={Type}",
            userId, dto.Name, dto.DisplayName, dto.Type);

        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.DisplayName))
        {
            _logger.LogWarning("Category creation failed - name or display name is empty for user {UserId}", userId);
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
            CategoryGroup = dto.CategoryGroup,
            SortOrder = 1000 // User categories appear after global ones
        };

        var created = await _categoryRepository.CreateAsync(category);
        _logger.LogInformation("Category created: {CategoryId} ({Name}) for user {UserId}", created.Id, created.Name, userId);

        return new CategoryDto
        {
            Id = created.Id,
            Name = created.Name,
            DisplayName = created.DisplayName,
            Icon = created.Icon ?? "",
            Color = created.Color ?? "",
            CategoryGroup = created.CategoryGroup,
            IsCustom = true
        };
    }

    public async Task DeleteAsync(Guid userId, Guid categoryId)
    {
        _logger.LogInformation("Deleting category {CategoryId} for user {UserId}", categoryId, userId);

        var category = await _categoryRepository.GetByIdAsync(categoryId);

        if (category == null)
        {
            _logger.LogWarning("Category deletion failed - {CategoryId} not found", categoryId);
            throw new NotFoundException("Category not found");
        }

        // Only allow deleting user-created categories
        if (!category.UserId.HasValue)
        {
            _logger.LogWarning("Category deletion failed - {CategoryId} is a global category", categoryId);
            throw new ValidationException("Cannot delete global categories");
        }

        if (category.UserId != userId)
        {
            _logger.LogWarning("Category deletion failed - user {UserId} does not own category {CategoryId} (owner: {OwnerId})",
                userId, categoryId, category.UserId);
            throw new UnauthorizedException("You do not have permission to delete this category");
        }

        await _categoryRepository.DeleteAsync(categoryId);
        _logger.LogInformation("Category {CategoryId} ({Name}) deleted for user {UserId}", categoryId, category.Name, userId);
    }
}
