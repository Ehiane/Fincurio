using Fincurio.Core.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fincurio.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("id");

        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired();

        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("idx_users_email");

        builder.Property(u => u.PasswordHash)
            .HasColumnName("password_hash")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(u => u.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(100);

        builder.Property(u => u.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(100);

        builder.Property(u => u.ProfileImageUrl)
            .HasColumnName("profile_image_url");

        builder.Property(u => u.FinancialIntention)
            .HasColumnName("financial_intention");

        builder.Property(u => u.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(u => u.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        builder.Property(u => u.LastLoginAt)
            .HasColumnName("last_login_at");

        builder.Property(u => u.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        builder.Property(u => u.HasCompletedOnboarding)
            .HasColumnName("has_completed_onboarding")
            .HasDefaultValue(false);

        // Email verification
        builder.Property(u => u.IsEmailVerified)
            .HasColumnName("is_email_verified")
            .HasDefaultValue(false);

        builder.Property(u => u.EmailVerificationToken)
            .HasColumnName("email_verification_token");

        builder.Property(u => u.EmailVerificationTokenExpiry)
            .HasColumnName("email_verification_token_expiry");

        // Password reset
        builder.Property(u => u.PasswordResetToken)
            .HasColumnName("password_reset_token");

        builder.Property(u => u.PasswordResetTokenExpiry)
            .HasColumnName("password_reset_token_expiry");

        // Relationships
        builder.HasMany(u => u.Transactions)
            .WithOne(t => t.User)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(u => u.Preferences)
            .WithOne(p => p.User)
            .HasForeignKey<UserPreference>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(u => u.RefreshTokens)
            .WithOne(rt => rt.User)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(u => u.IncomeProfile)
            .WithOne(ip => ip.User)
            .HasForeignKey<IncomeProfile>(ip => ip.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(u => u.BudgetGoal)
            .WithOne(bg => bg.User)
            .HasForeignKey<BudgetGoal>(bg => bg.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
