using Fincurio.Core.Models.DTOs.Insight;

namespace Fincurio.Core.Interfaces.Services;

public interface IInsightsService
{
    Task<DashboardResponseDto> GetDashboardAsync(Guid userId);
    Task<MonthlyInsightResponseDto> GetMonthlyInsightsAsync(Guid userId, int year, int month);
}
