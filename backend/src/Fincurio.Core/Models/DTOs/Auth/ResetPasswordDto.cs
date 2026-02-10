using System.ComponentModel.DataAnnotations;

namespace Fincurio.Core.Models.DTOs.Auth;

public class ResetPasswordRequestDto
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?~`]).{8,}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one digit, and one special character")]
    public string NewPassword { get; set; } = string.Empty;
}

public class ResetPasswordResponseDto
{
    public string Message { get; set; } = string.Empty;
}
