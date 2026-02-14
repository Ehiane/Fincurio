using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Models.Entities;
using Fincurio.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Fincurio.Data.Repositories;

public class IncomeProfileRepository : IIncomeProfileRepository
{
    private readonly FincurioDbContext _context;

    public IncomeProfileRepository(FincurioDbContext context)
    {
        _context = context;
    }

    public async Task<IncomeProfile?> GetByUserIdAsync(Guid userId)
    {
        return await _context.IncomeProfiles
            .FirstOrDefaultAsync(ip => ip.UserId == userId);
    }

    public async Task<IncomeProfile> CreateOrUpdateAsync(IncomeProfile incomeProfile)
    {
        var existing = await _context.IncomeProfiles
            .FirstOrDefaultAsync(ip => ip.UserId == incomeProfile.UserId);

        if (existing == null)
        {
            incomeProfile.CreatedAt = DateTime.UtcNow;
            incomeProfile.UpdatedAt = DateTime.UtcNow;
            _context.IncomeProfiles.Add(incomeProfile);
        }
        else
        {
            existing.EmploymentType = incomeProfile.EmploymentType;
            existing.EarningMethod = incomeProfile.EarningMethod;
            existing.PayFrequency = incomeProfile.PayFrequency;
            existing.AnnualSalary = incomeProfile.AnnualSalary;
            existing.HourlyRate = incomeProfile.HourlyRate;
            existing.HoursPerWeek = incomeProfile.HoursPerWeek;
            existing.StateTaxCode = incomeProfile.StateTaxCode;
            existing.EstimatedFederalTax = incomeProfile.EstimatedFederalTax;
            existing.EstimatedStateTax = incomeProfile.EstimatedStateTax;
            existing.HealthInsurancePerPaycheck = incomeProfile.HealthInsurancePerPaycheck;
            existing.RetirementPercent = incomeProfile.RetirementPercent;
            existing.OtherDeductionsJson = incomeProfile.OtherDeductionsJson;
            existing.HealthInsurance = incomeProfile.HealthInsurance;
            existing.RetirementContribution = incomeProfile.RetirementContribution;
            existing.OtherDeductions = incomeProfile.OtherDeductions;
            existing.GrossAnnualIncome = incomeProfile.GrossAnnualIncome;
            existing.NetAnnualIncome = incomeProfile.NetAnnualIncome;
            existing.UpdatedAt = DateTime.UtcNow;

            _context.IncomeProfiles.Update(existing);
            incomeProfile = existing;
        }

        await _context.SaveChangesAsync();
        return incomeProfile;
    }
}
