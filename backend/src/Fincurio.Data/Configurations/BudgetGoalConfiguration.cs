using Fincurio.Core.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fincurio.Data.Configurations;

public class BudgetGoalConfiguration : IEntityTypeConfiguration<BudgetGoal>
{
    public void Configure(EntityTypeBuilder<BudgetGoal> builder)
    {
        builder.ToTable("budget_goals");

        builder.HasKey(bg => bg.Id);
        builder.Property(bg => bg.Id).HasColumnName("id");

        builder.Property(bg => bg.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.HasIndex(bg => bg.UserId)
            .IsUnique()
            .HasDatabaseName("idx_budget_goals_user_id");

        builder.Property(bg => bg.MonthlyBudgetTarget)
            .HasColumnName("monthly_budget_target")
            .HasColumnType("decimal(12,2)");

        builder.Property(bg => bg.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(bg => bg.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Relationship configured in UserConfiguration
    }
}
