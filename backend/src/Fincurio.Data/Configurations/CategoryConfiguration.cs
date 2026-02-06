using Fincurio.Core.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fincurio.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id");

        builder.Property(c => c.Name)
            .HasColumnName("name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(c => c.DisplayName)
            .HasColumnName("display_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(c => c.Type)
            .HasColumnName("type")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(c => c.Icon)
            .HasColumnName("icon")
            .HasMaxLength(50);

        builder.Property(c => c.Color)
            .HasColumnName("color")
            .HasMaxLength(7);

        builder.Property(c => c.SortOrder)
            .HasColumnName("sort_order")
            .HasDefaultValue(0);

        builder.Property(c => c.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        // Relationships
        builder.HasMany(c => c.Transactions)
            .WithOne(t => t.Category)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
