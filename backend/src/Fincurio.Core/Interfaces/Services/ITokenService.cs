using System.Security.Claims;

namespace Fincurio.Core.Interfaces.Services;

public interface ITokenService
{
    string GenerateAccessToken(Guid userId, string email);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token);
}
