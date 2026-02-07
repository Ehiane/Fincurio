namespace Fincurio.Core.Interfaces.Services;

public interface IEmailService
{
    Task SendVerificationEmailAsync(string email, string firstName, string verificationToken);
    Task SendPasswordResetEmailAsync(string email, string firstName, string resetToken);
}
