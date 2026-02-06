using Fincurio.Core.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fincurio.Data.Configurations;

public class UserPreferenceConfiguration : IEntityTypeConfiguration<UserPreference>
{
    public void Configure(EntityTypeBuilder<UserPreference> builder)
    {
        builder.ToTable("user_preferences");

        builder.HasKey(up => up.Id);
        builder.Property(up => up.Id).HasColumnName("id");

        builder.Property(up => up.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.HasIndex(up => up.UserId)
            .IsUnique()
            .HasDatabaseName("idx_user_preferences_user_id");

        builder.Property(up => up.Currency)
            .HasColumnName("currency")
            .HasMaxLength(3)
            .HasDefaultValue("USD");

        builder.Property(up => up.Timezone)
            .HasColumnName("timezone")
            .HasMaxLength(50)
            .HasDefaultValue("UTC");

        builder.Property(up => up.MonthlyBudgetGoal)
            .HasColumnName("monthly_budget_goal")
            .HasColumnType("decimal(12,2)");

        builder.Property(up => up.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(up => up.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Relationship configured in UserConfiguration
    }
}
