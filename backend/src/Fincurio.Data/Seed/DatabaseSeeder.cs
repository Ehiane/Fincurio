using Fincurio.Core.Models.Entities;
using Fincurio.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Fincurio.Data.Seed;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(FincurioDbContext context)
    {
        // Check if categories already exist
        if (await context.Categories.AnyAsync())
        {
            return; // Database has been seeded
        }

        var categories = new List<Category>
        {
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Tech",
                DisplayName = "Tech",
                Type = "expense",
                Icon = "laptop_mac",
                Color = "#E6501B",
                SortOrder = 1,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Groceries",
                DisplayName = "Nourishment",
                Type = "expense",
                Icon = "restaurant",
                Color = "#280905",
                SortOrder = 2,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Salary",
                DisplayName = "Salary",
                Type = "income",
                Icon = "payments",
                Color = "#10B981",
                SortOrder = 3,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Dining",
                DisplayName = "Dining",
                Type = "expense",
                Icon = "local_cafe",
                Color = "#F59E0B",
                SortOrder = 4,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Subscription",
                DisplayName = "Subscription",
                Type = "expense",
                Icon = "music_note",
                Color = "#8B5CF6",
                SortOrder = 5,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Transport",
                DisplayName = "Transport",
                Type = "expense",
                Icon = "commute",
                Color = "#3B82F6",
                SortOrder = 6,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Shelter",
                DisplayName = "Shelter",
                Type = "expense",
                Icon = "home",
                Color = "#6B7280",
                SortOrder = 7,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Wellness",
                DisplayName = "Wellness",
                Type = "expense",
                Icon = "spa",
                Color = "#EC4899",
                SortOrder = 8,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                Name = "Culture",
                DisplayName = "Culture",
                Type = "expense",
                Icon = "theater_comedy",
                Color = "#14B8A6",
                SortOrder = 9,
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();
    }
}
