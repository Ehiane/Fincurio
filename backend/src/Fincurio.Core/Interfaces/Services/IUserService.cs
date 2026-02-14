using Fincurio.Core.Models.DTOs.User;

namespace Fincurio.Core.Interfaces.Services;

public interface IUserService
{
    Task<UserProfileDto> GetProfileAsync(Guid userId);
    Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto request);
    Task UpdatePreferencesAsync(Guid userId, UpdatePreferencesDto request);
    Task CompleteOnboardingAsync(Guid userId);
}
