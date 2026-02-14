using Fincurio.Core.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fincurio.Data.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("transactions");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasColumnName("id");

        builder.Property(t => t.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(t => t.CategoryId)
            .HasColumnName("category_id")
            .IsRequired();

        builder.Property(t => t.Date)
            .HasColumnName("date")
            .HasColumnType("date")
            .IsRequired();

        builder.Property(t => t.Time)
            .HasColumnName("time")
            .HasColumnType("time");

        builder.Property(t => t.Merchant)
            .HasColumnName("merchant")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(t => t.Amount)
            .HasColumnName("amount")
            .HasColumnType("decimal(12,2)")
            .IsRequired();

        builder.Property(t => t.Type)
            .HasColumnName("type")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(t => t.Notes)
            .HasColumnName("notes");

        builder.Property(t => t.GoalId)
            .HasColumnName("goal_id");

        builder.Property(t => t.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(t => t.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Indexes
        builder.HasIndex(t => t.UserId)
            .HasDatabaseName("idx_transactions_user_id");

        builder.HasIndex(t => t.Date)
            .HasDatabaseName("idx_transactions_date");

        builder.HasIndex(t => new { t.UserId, t.Date })
            .HasDatabaseName("idx_transactions_user_date");

        builder.HasIndex(t => t.CategoryId)
            .HasDatabaseName("idx_transactions_category");

        // Goal relationship (optional — for savings goals)
        builder.HasOne(t => t.Goal)
            .WithMany(g => g.Transactions)
            .HasForeignKey(t => t.GoalId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasIndex(t => t.GoalId)
            .HasDatabaseName("idx_transactions_goal");

        // Relationships configured in UserConfiguration and CategoryConfiguration
    }
}
