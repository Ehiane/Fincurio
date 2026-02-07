namespace Fincurio.Core.Models.DTOs.Auth;

public class ResetPasswordRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class ResetPasswordResponseDto
{
    public string Message { get; set; } = string.Empty;
}
