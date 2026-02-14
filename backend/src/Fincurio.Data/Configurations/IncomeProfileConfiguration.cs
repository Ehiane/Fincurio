using Fincurio.Core.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fincurio.Data.Configurations;

public class IncomeProfileConfiguration : IEntityTypeConfiguration<IncomeProfile>
{
    public void Configure(EntityTypeBuilder<IncomeProfile> builder)
    {
        builder.ToTable("income_profiles");

        builder.HasKey(ip => ip.Id);
        builder.Property(ip => ip.Id).HasColumnName("id");

        builder.Property(ip => ip.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.HasIndex(ip => ip.UserId)
            .IsUnique()
            .HasDatabaseName("idx_income_profiles_user_id");

        // Employment info
        builder.Property(ip => ip.EmploymentType)
            .HasColumnName("employment_type")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(ip => ip.EarningMethod)
            .HasColumnName("earning_method")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(ip => ip.PayFrequency)
            .HasColumnName("pay_frequency")
            .HasMaxLength(50)
            .IsRequired();

        // Gross income inputs
        builder.Property(ip => ip.AnnualSalary)
            .HasColumnName("annual_salary")
            .HasColumnType("decimal(12,2)");

        builder.Property(ip => ip.HourlyRate)
            .HasColumnName("hourly_rate")
            .HasColumnType("decimal(8,2)");

        builder.Property(ip => ip.HoursPerWeek)
            .HasColumnName("hours_per_week")
            .HasColumnType("decimal(5,2)");

        // Tax
        builder.Property(ip => ip.StateTaxCode)
            .HasColumnName("state_tax_code")
            .HasMaxLength(10);

        builder.Property(ip => ip.EstimatedFederalTax)
            .HasColumnName("estimated_federal_tax")
            .HasColumnType("decimal(12,2)");

        builder.Property(ip => ip.EstimatedStateTax)
            .HasColumnName("estimated_state_tax")
            .HasColumnType("decimal(12,2)");

        // User-input deduction fields (v2)
        builder.Property(ip => ip.HealthInsurancePerPaycheck)
            .HasColumnName("health_insurance_per_paycheck")
            .HasColumnType("decimal(10,2)");

        builder.Property(ip => ip.RetirementPercent)
            .HasColumnName("retirement_percent")
            .HasColumnType("decimal(5,2)");

        builder.Property(ip => ip.OtherDeductionsJson)
            .HasColumnName("other_deductions_json")
            .HasColumnType("jsonb");

        // Computed annual deductions
        builder.Property(ip => ip.HealthInsurance)
            .HasColumnName("health_insurance")
            .HasColumnType("decimal(12,2)");

        builder.Property(ip => ip.RetirementContribution)
            .HasColumnName("retirement_contribution")
            .HasColumnType("decimal(12,2)");

        builder.Property(ip => ip.OtherDeductions)
            .HasColumnName("other_deductions")
            .HasColumnType("decimal(12,2)");

        // Computed totals
        builder.Property(ip => ip.GrossAnnualIncome)
            .HasColumnName("gross_annual_income")
            .HasColumnType("decimal(12,2)");

        builder.Property(ip => ip.NetAnnualIncome)
            .HasColumnName("net_annual_income")
            .HasColumnType("decimal(12,2)");

        builder.Property(ip => ip.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(ip => ip.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Relationship configured in UserConfiguration
    }
}
