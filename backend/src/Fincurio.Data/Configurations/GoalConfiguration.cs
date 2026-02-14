using Fincurio.Core.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fincurio.Data.Configurations;

public class GoalConfiguration : IEntityTypeConfiguration<Goal>
{
    public void Configure(EntityTypeBuilder<Goal> builder)
    {
        builder.ToTable("goals");

        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasColumnName("id");

        builder.Property(g => g.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(g => g.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(g => g.Type)
            .HasColumnName("type")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(g => g.TargetAmount)
            .HasColumnName("target_amount")
            .HasColumnType("decimal(12,2)")
            .IsRequired();

        builder.Property(g => g.CategoryId)
            .HasColumnName("category_id");

        builder.Property(g => g.Period)
            .HasColumnName("period")
            .HasMaxLength(20);

        builder.Property(g => g.Deadline)
            .HasColumnName("deadline");

        builder.Property(g => g.StartDate)
            .HasColumnName("start_date")
            .HasColumnType("date")
            .IsRequired();

        builder.Property(g => g.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(g => g.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(g => g.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Indexes
        builder.HasIndex(g => g.UserId)
            .HasDatabaseName("idx_goals_user_id");

        builder.HasIndex(g => new { g.UserId, g.Type })
            .HasDatabaseName("idx_goals_user_type");

        builder.HasIndex(g => new { g.UserId, g.CategoryId })
            .HasDatabaseName("idx_goals_user_category");

        // Relationships
        builder.HasOne(g => g.User)
            .WithMany()
            .HasForeignKey(g => g.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(g => g.Category)
            .WithMany()
            .HasForeignKey(g => g.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
