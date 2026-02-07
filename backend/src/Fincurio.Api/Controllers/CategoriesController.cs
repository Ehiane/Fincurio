using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Category;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fincurio.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
    }

    [HttpGet]
    public async Task<ActionResult<CategoryListResponseDto>> GetCategories()
    {
        var userId = GetUserId();
        _logger.LogInformation("Fetching categories for user {UserId}", userId);
        var categories = await _categoryService.GetAllAsync(userId);
        _logger.LogInformation("Returned {Count} categories for user {UserId}", categories.Count, userId);
        return Ok(new CategoryListResponseDto { Categories = categories });
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryDto request)
    {
        var userId = GetUserId();
        _logger.LogInformation("Creating category for user {UserId} | Name={Name}, DisplayName={DisplayName}, Type={Type}",
            userId, request.Name, request.DisplayName, request.Type);
        var category = await _categoryService.CreateAsync(userId, request);
        _logger.LogInformation("Category created: {CategoryId} for user {UserId}", category.Id, userId);
        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCategory(Guid id)
    {
        var userId = GetUserId();
        _logger.LogInformation("Deleting category {CategoryId} for user {UserId}", id, userId);
        await _categoryService.DeleteAsync(userId, id);
        _logger.LogInformation("Category {CategoryId} deleted successfully for user {UserId}", id, userId);
        return NoContent();
    }
}
