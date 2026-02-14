using System.Text.Json;
using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.Income;
using Fincurio.Core.Models.Entities;
using Microsoft.Extensions.Logging;

namespace Fincurio.Core.Services;

public class IncomeService : IIncomeService
{
    private readonly IIncomeProfileRepository _repository;
    private readonly ILogger<IncomeService> _logger;

    private static readonly Dictionary<string, int> PayFrequencyMultipliers = new(StringComparer.OrdinalIgnoreCase)
    {
        { "weekly", 52 },
        { "bi-weekly", 26 },
        { "semi-monthly", 24 },
        { "monthly", 12 }
    };

    // 2025 US Federal Tax Brackets (Single Filer)
    private static readonly (decimal threshold, decimal rate)[] FederalBrackets =
    {
        (11925m, 0.10m),
        (48475m, 0.12m),
        (103350m, 0.22m),
        (197300m, 0.24m),
        (250525m, 0.32m),
        (626350m, 0.35m),
        (decimal.MaxValue, 0.37m)
    };

    // Simplified state tax rates
    private static readonly Dictionary<string, decimal> StateTaxRates = new(StringComparer.OrdinalIgnoreCase)
    {
        { "AL", 0.050m }, { "AK", 0.000m }, { "AZ", 0.025m }, { "AR", 0.044m },
        { "CA", 0.093m }, { "CO", 0.044m }, { "CT", 0.050m }, { "DE", 0.066m },
        { "FL", 0.000m }, { "GA", 0.055m }, { "HI", 0.075m }, { "ID", 0.058m },
        { "IL", 0.0495m }, { "IN", 0.0305m }, { "IA", 0.044m }, { "KS", 0.057m },
        { "KY", 0.040m }, { "LA", 0.0425m }, { "ME", 0.0715m }, { "MD", 0.0575m },
        { "MA", 0.050m }, { "MI", 0.0425m }, { "MN", 0.0985m }, { "MS", 0.050m },
        { "MO", 0.048m }, { "MT", 0.059m }, { "NE", 0.0564m }, { "NV", 0.000m },
        { "NH", 0.000m }, { "NJ", 0.1075m }, { "NM", 0.059m }, { "NY", 0.109m },
        { "NC", 0.045m }, { "ND", 0.0195m }, { "OH", 0.035m }, { "OK", 0.0475m },
        { "OR", 0.099m }, { "PA", 0.0307m }, { "RI", 0.0599m }, { "SC", 0.064m },
        { "SD", 0.000m }, { "TN", 0.000m }, { "TX", 0.000m }, { "UT", 0.0465m },
        { "VT", 0.0875m }, { "VA", 0.0575m }, { "WA", 0.000m }, { "WV", 0.052m },
        { "WI", 0.0765m }, { "WY", 0.000m }, { "DC", 0.1075m }
    };

    public IncomeService(IIncomeProfileRepository repository, ILogger<IncomeService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IncomeProfileDto?> GetByUserIdAsync(Guid userId)
    {
        var profile = await _repository.GetByUserIdAsync(userId);
        return profile != null ? MapToDto(profile) : null;
    }

    public async Task<IncomeProfileDto> CreateOrUpdateAsync(Guid userId, CreateIncomeProfileDto request)
    {
        _logger.LogInformation("Creating/updating income profile for user {UserId}", userId);

        var multiplier = GetPayFrequencyMultiplier(request.PayFrequency);
        var grossAnnual = CalculateGrossAnnual(request);
        var federalTax = CalculateFederalTax(grossAnnual);
        var stateTax = CalculateStateTax(grossAnnual, request.StateTaxCode);

        // Calculate annual deductions from user inputs
        var retirementAnnual = grossAnnual * (request.RetirementPercent / 100m);
        var healthAnnual = request.HealthInsurancePerPaycheck * multiplier;
        var otherItems = request.OtherDeductions ?? new List<OtherDeductionItem>();
        var otherAnnual = otherItems.Sum(d => d.AmountPerPaycheck) * multiplier;

        var netAnnual = grossAnnual - federalTax - stateTax - retirementAnnual - healthAnnual - otherAnnual;

        var profile = new IncomeProfile
        {
            UserId = userId,
            EmploymentType = request.EmploymentType,
            EarningMethod = request.EarningMethod,
            PayFrequency = request.PayFrequency,
            AnnualSalary = request.AnnualSalary,
            HourlyRate = request.HourlyRate,
            HoursPerWeek = request.HoursPerWeek,
            StateTaxCode = request.StateTaxCode,
            EstimatedFederalTax = federalTax,
            EstimatedStateTax = stateTax,
            HealthInsurancePerPaycheck = request.HealthInsurancePerPaycheck,
            RetirementPercent = request.RetirementPercent,
            OtherDeductionsJson = otherItems.Count > 0
                ? JsonSerializer.Serialize(otherItems, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase })
                : null,
            HealthInsurance = healthAnnual,
            RetirementContribution = retirementAnnual,
            OtherDeductions = otherAnnual,
            GrossAnnualIncome = grossAnnual,
            NetAnnualIncome = netAnnual,
        };

        var saved = await _repository.CreateOrUpdateAsync(profile);
        _logger.LogInformation("Income profile saved for user {UserId}: Gross={Gross}, Net={Net}", userId, grossAnnual, netAnnual);

        return MapToDto(saved);
    }

    private static int GetPayFrequencyMultiplier(string payFrequency)
    {
        return PayFrequencyMultipliers.TryGetValue(payFrequency, out var m) ? m : 12;
    }

    private static decimal CalculateGrossAnnual(CreateIncomeProfileDto request)
    {
        if (request.EarningMethod.Equals("hourly", StringComparison.OrdinalIgnoreCase))
        {
            var rate = request.HourlyRate ?? 0;
            var hours = request.HoursPerWeek ?? 40;
            return rate * hours * 52;
        }
        return request.AnnualSalary ?? 0;
    }

    private static decimal CalculateFederalTax(decimal grossAnnual)
    {
        if (grossAnnual <= 0) return 0;

        // Standard deduction for 2025
        var taxableIncome = Math.Max(0, grossAnnual - 15700m);
        decimal tax = 0;
        decimal previousThreshold = 0;

        foreach (var (threshold, rate) in FederalBrackets)
        {
            if (taxableIncome <= previousThreshold) break;

            var taxable = Math.Min(taxableIncome, threshold) - previousThreshold;
            tax += taxable * rate;
            previousThreshold = threshold;
        }

        return Math.Round(tax, 2);
    }

    private static decimal CalculateStateTax(decimal grossAnnual, string? stateTaxCode)
    {
        if (string.IsNullOrEmpty(stateTaxCode) || grossAnnual <= 0) return 0;
        if (StateTaxRates.TryGetValue(stateTaxCode, out var rate))
        {
            return Math.Round(grossAnnual * rate, 2);
        }
        return 0;
    }

    private static IncomeProfileDto MapToDto(IncomeProfile profile)
    {
        var otherItems = new List<OtherDeductionItem>();
        if (!string.IsNullOrEmpty(profile.OtherDeductionsJson))
        {
            try
            {
                otherItems = JsonSerializer.Deserialize<List<OtherDeductionItem>>(
                    profile.OtherDeductionsJson,
                    new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }
                ) ?? new List<OtherDeductionItem>();
            }
            catch
            {
                // Fallback if JSON is malformed
            }
        }

        return new IncomeProfileDto
        {
            EmploymentType = profile.EmploymentType,
            EarningMethod = profile.EarningMethod,
            PayFrequency = profile.PayFrequency,
            AnnualSalary = profile.AnnualSalary,
            HourlyRate = profile.HourlyRate,
            HoursPerWeek = profile.HoursPerWeek,
            StateTaxCode = profile.StateTaxCode,
            EstimatedFederalTax = profile.EstimatedFederalTax,
            EstimatedStateTax = profile.EstimatedStateTax,
            HealthInsurancePerPaycheck = profile.HealthInsurancePerPaycheck,
            RetirementPercent = profile.RetirementPercent,
            OtherDeductionItems = otherItems,
            HealthInsurance = profile.HealthInsurance,
            RetirementContribution = profile.RetirementContribution,
            TotalOtherDeductions = profile.OtherDeductions,
            GrossAnnualIncome = profile.GrossAnnualIncome,
            NetAnnualIncome = profile.NetAnnualIncome,
        };
    }
}
