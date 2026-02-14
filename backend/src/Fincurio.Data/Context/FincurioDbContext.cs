using Fincurio.Core.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Fincurio.Data.Context;

public class FincurioDbContext : DbContext
{
    public FincurioDbContext(DbContextOptions<FincurioDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<UserPreference> UserPreferences { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Merchant> Merchants { get; set; }
    public DbSet<IncomeProfile> IncomeProfiles { get; set; }
    public DbSet<BudgetGoal> BudgetGoals { get; set; }
    public DbSet<CategoryBudget> CategoryBudgets { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from the assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FincurioDbContext).Assembly);
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            var hasCreatedAt = entry.Metadata.FindProperty("CreatedAt") != null;
            var hasUpdatedAt = entry.Metadata.FindProperty("UpdatedAt") != null;

            if (entry.State == EntityState.Added)
            {
                if (hasCreatedAt &&
                    (entry.Property("CreatedAt").CurrentValue == null ||
                    (DateTime)entry.Property("CreatedAt").CurrentValue == default))
                {
                    entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
                }

                if (hasUpdatedAt)
                {
                    entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
                }
            }
            else if (entry.State == EntityState.Modified)
            {
                if (hasUpdatedAt)
                {
                    entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
                }
            }
        }
    }
}
