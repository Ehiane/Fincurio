using Fincurio.Core.Exceptions;
using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Models.DTOs.User;
using Fincurio.Core.Models.Entities;
using Microsoft.Extensions.Logging;

namespace Fincurio.Core.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository userRepository, ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId)
    {
        _logger.LogInformation("Fetching profile for user {UserId}", userId);

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("Profile fetch failed - user {UserId} not found", userId);
            throw new NotFoundException("User not found");
        }

        _logger.LogDebug("Profile fetched for user {UserId} ({Email}), EmailVerified={IsVerified}",
            userId, user.Email, user.IsEmailVerified);

        return new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            ProfileImageUrl = user.ProfileImageUrl,
            FinancialIntention = user.FinancialIntention,
            IsEmailVerified = user.IsEmailVerified,
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
        _logger.LogInformation("Updating profile for user {UserId} | FirstName={FirstName}, LastName={LastName}, FinancialIntention={FinancialIntention}",
            userId, request.FirstName, request.LastName, request.FinancialIntention);

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("Profile update failed - user {UserId} not found", userId);
            throw new NotFoundException("User not found");
        }

        if (!string.IsNullOrEmpty(request.FirstName))
            user.FirstName = request.FirstName;

        if (!string.IsNullOrEmpty(request.LastName))
            user.LastName = request.LastName;

        if (request.FinancialIntention != null)
            user.FinancialIntention = request.FinancialIntention;

        await _userRepository.UpdateAsync(user);
        _logger.LogInformation("Profile updated successfully for user {UserId}", userId);

        return await GetProfileAsync(userId);
    }

    public async Task UpdatePreferencesAsync(Guid userId, UpdatePreferencesDto request)
    {
        _logger.LogInformation("Updating preferences for user {UserId} | Currency={Currency}, Timezone={Timezone}, Budget={Budget}",
            userId, request.Currency, request.Timezone, request.MonthlyBudgetGoal);

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("Preferences update failed - user {UserId} not found", userId);
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
        _logger.LogInformation("Preferences updated successfully for user {UserId} | Currency={Currency}, Timezone={Timezone}",
            userId, preferences.Currency, preferences.Timezone);
    }
}
