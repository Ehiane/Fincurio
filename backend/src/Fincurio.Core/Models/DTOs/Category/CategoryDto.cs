namespace Fincurio.Core.Models.DTOs.Category;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string? CategoryGroup { get; set; }
    public bool IsCustom { get; set; } // True if user-created, false if global/seeded
}

public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Type { get; set; } = "expense"; // "income" or "expense"
    public string Icon { get; set; } = "shopping_bag";
    public string Color { get; set; } = "#E6501B";
    public string? CategoryGroup { get; set; }
}
