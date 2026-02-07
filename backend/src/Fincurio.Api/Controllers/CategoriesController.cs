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

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
    }

    [HttpGet]
    public async Task<ActionResult<CategoryListResponseDto>> GetCategories()
    {
        var userId = GetUserId();
        var categories = await _categoryService.GetAllAsync(userId);
        return Ok(new CategoryListResponseDto { Categories = categories });
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryDto request)
    {
        var userId = GetUserId();
        var category = await _categoryService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCategory(Guid id)
    {
        var userId = GetUserId();
        await _categoryService.DeleteAsync(userId, id);
        return NoContent();
    }
}
