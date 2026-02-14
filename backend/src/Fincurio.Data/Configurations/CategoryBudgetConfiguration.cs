using Fincurio.Core.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fincurio.Data.Configurations;

public class CategoryBudgetConfiguration : IEntityTypeConfiguration<CategoryBudget>
{
    public void Configure(EntityTypeBuilder<CategoryBudget> builder)
    {
        builder.ToTable("category_budgets");

        builder.HasKey(cb => cb.Id);
        builder.Property(cb => cb.Id).HasColumnName("id");

        builder.Property(cb => cb.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(cb => cb.CategoryId)
            .HasColumnName("category_id")
            .IsRequired();

        builder.Property(cb => cb.MonthlyLimit)
            .HasColumnName("monthly_limit")
            .HasColumnType("decimal(12,2)");

        builder.Property(cb => cb.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(cb => cb.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        builder.HasIndex(cb => new { cb.UserId, cb.CategoryId })
            .IsUnique()
            .HasDatabaseName("idx_category_budgets_user_category");
    }
}
