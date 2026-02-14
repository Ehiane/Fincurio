using Fincurio.Core.Models.DTOs.Goal;

namespace Fincurio.Core.Interfaces.Services;

public interface IGoalService
{
    Task<GoalListResponseDto> GetGoalsAsync(Guid userId);
    Task<GoalDto> GetByIdAsync(Guid id, Guid userId);
    Task<GoalDto> CreateAsync(Guid userId, CreateGoalDto request);
    Task<GoalDto> UpdateAsync(Guid id, Guid userId, CreateGoalDto request);
    Task DeleteAsync(Guid id, Guid userId);
}
