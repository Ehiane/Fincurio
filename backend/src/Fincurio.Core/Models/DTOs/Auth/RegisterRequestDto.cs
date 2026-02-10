using System.ComponentModel.DataAnnotations;

namespace Fincurio.Core.Models.DTOs.Auth;

public class RegisterRequestDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?~`]).{8,}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one digit, and one special character")]
    public required string Password { get; set; }

    [Required]
    [MinLength(2)]
    public required string FirstName { get; set; }

    [Required]
    [MinLength(2)]
    public required string LastName { get; set; }
}
