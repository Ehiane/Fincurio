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

    [HttpGet]
    public async Task<ActionResult<CategoryListResponseDto>> GetCategories()
    {
        var categories = await _categoryService.GetAllAsync();
        return Ok(new CategoryListResponseDto { Categories = categories });
    }
}
