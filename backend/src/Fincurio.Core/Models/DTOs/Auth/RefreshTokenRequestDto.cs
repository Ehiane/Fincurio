using System.ComponentModel.DataAnnotations;

namespace Fincurio.Core.Models.DTOs.Auth;

public class RefreshTokenRequestDto
{
    [Required]
    public required string RefreshToken { get; set; }
}
