using Fincurio.Core.Exceptions;
using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.User;
using Fincurio.Core.Models.Entities;

namespace Fincurio.Core.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found");
        }

        return new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            ProfileImageUrl = user.ProfileImageUrl,
            FinancialIntention = user.FinancialIntention,
            Preferences = user.Preferences != null ? new UserPreferencesDto
            {
                Currency = user.Preferences.Currency,
                Timezone = user.Preferences.Timezone,
                MonthlyBudgetGoal = user.Preferences.MonthlyBudgetGoal
            } : null,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found");
        }

        if (!string.IsNullOrEmpty(request.FirstName))
            user.FirstName = request.FirstName;

        if (!string.IsNullOrEmpty(request.LastName))
            user.LastName = request.LastName;

        if (request.FinancialIntention != null)
            user.FinancialIntention = request.FinancialIntention;

        await _userRepository.UpdateAsync(user);

        return await GetProfileAsync(userId);
    }

    public async Task UpdatePreferencesAsync(Guid userId, UpdatePreferencesDto request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found");
        }

        var preferences = user.Preferences ?? new UserPreference
        {
            UserId = userId,
            Currency = "USD",
            Timezone = "UTC",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (!string.IsNullOrEmpty(request.Currency))
            preferences.Currency = request.Currency;

        if (!string.IsNullOrEmpty(request.Timezone))
            preferences.Timezone = request.Timezone;

        if (request.MonthlyBudgetGoal.HasValue)
            preferences.MonthlyBudgetGoal = request.MonthlyBudgetGoal;

        await _userRepository.CreateOrUpdatePreferencesAsync(preferences);
    }
}
