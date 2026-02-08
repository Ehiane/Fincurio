using Fincurio.Core.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;

namespace Fincurio.Core.Services;

public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly string _apiKey;
    private readonly string _fromEmail;
    private readonly string _frontendUrl;

    public EmailService(HttpClient httpClient, IConfiguration configuration, ILogger<EmailService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        _apiKey = _configuration["Resend:ApiKey"] ?? throw new InvalidOperationException("Resend API key not configured");
        _fromEmail = _configuration["Resend:FromEmail"] ?? "noreply@fincurio.com";
        _frontendUrl = _configuration["Frontend:Url"] ?? "http://localhost:3000";

        _httpClient.BaseAddress = new Uri("https://api.resend.com");
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

        _logger.LogDebug("EmailService initialized | From={FromEmail}, FrontendUrl={FrontendUrl}", _fromEmail, _frontendUrl);
    }

    public async Task SendVerificationEmailAsync(string email, string firstName, string verificationToken)
    {
        _logger.LogInformation("Sending verification email to {Email}", email);

        var verificationUrl = $"{_frontendUrl}/verify-email?token={verificationToken}";

        var emailRequest = new
        {
            from = _fromEmail,
            to = new[] { email },
            subject = "Verify Your Fincurio Account",
            html = GenerateVerificationEmailHtml(firstName, verificationUrl)
        };

        var response = await _httpClient.PostAsJsonAsync("/emails", emailRequest);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("Failed to send verification email to {Email} | Status={StatusCode}, Error={Error}",
                email, response.StatusCode, error);
            throw new InvalidOperationException($"Failed to send verification email: {error}");
        }

        _logger.LogInformation("Verification email sent successfully to {Email}", email);
    }

    public async Task SendPasswordResetEmailAsync(string email, string firstName, string resetToken)
    {
        _logger.LogInformation("Sending password reset email to {Email}", email);

        var resetUrl = $"{_frontendUrl}/reset-password?token={resetToken}";

        var emailRequest = new
        {
            from = _fromEmail,
            to = new[] { email },
            subject = "Reset Your Fincurio Password",
            html = GeneratePasswordResetEmailHtml(firstName, resetUrl)
        };

        var response = await _httpClient.PostAsJsonAsync("/emails", emailRequest);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("Failed to send password reset email to {Email} | Status={StatusCode}, Error={Error}",
                email, response.StatusCode, error);
            throw new InvalidOperationException($"Failed to send password reset email: {error}");
        }

        _logger.LogInformation("Password reset email sent successfully to {Email}", email);
    }

    private string GenerateVerificationEmailHtml(string firstName, string verificationUrl)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <link href=""https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Work+Sans:wght@300;400;500;600&display=swap"" rel=""stylesheet"">
</head>
<body style=""margin:0;padding:0;background-color:#f3efe9;font-family:'Work Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"">
    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#f3efe9;padding:48px 24px;"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" width=""560"" cellpadding=""0"" cellspacing=""0"" style=""max-width:560px;width:100%;"">
                    <!-- Header -->
                    <tr>
                        <td style=""background:linear-gradient(135deg, #280905 0%, #3d1510 50%, #E6501B 100%);border-radius:20px 20px 0 0;padding:40px 48px;text-align:center;"">
                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin:0 auto;"">
                                <tr>
                                    <td style=""vertical-align:middle;padding-right:12px;"">
                                        <div style=""width:32px;height:32px;border-radius:50%;background:radial-gradient(circle at 50% 60%, #E6501B 30%, #280905 100%);box-shadow:0 0 12px rgba(230,80,27,0.5);""></div>
                                    </td>
                                    <td style=""vertical-align:middle;font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:500;color:#f3efe9;letter-spacing:1px;"">Fincurio</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style=""background:#ffffff;padding:48px;"">
                            <h1 style=""font-family:'Playfair Display',Georgia,serif;color:#280905;font-size:26px;font-weight:500;margin:0 0 8px 0;line-height:1.3;"">Welcome{(string.IsNullOrEmpty(firstName) ? "" : $", {firstName}")}.</h1>
                            <div style=""width:40px;height:2px;background:#E6501B;margin:16px 0 24px 0;""></div>
                            <p style=""color:#6b6460;font-size:15px;line-height:1.7;margin:0 0 20px 0;font-weight:300;"">Thank you for creating your account. We're excited to help you build a more intentional relationship with your finances.</p>
                            <p style=""color:#6b6460;font-size:15px;line-height:1.7;margin:0 0 32px 0;font-weight:300;"">To get started, please verify your email address:</p>
                            <!-- CTA Button -->
                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin:0 auto 32px auto;"">
                                <tr>
                                    <td style=""background:#280905;border-radius:100px;text-align:center;"">
                                        <a href=""{verificationUrl}"" style=""display:inline-block;padding:16px 40px;color:#f3efe9;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.5px;"">Verify Email Address</a>
                                    </td>
                                </tr>
                            </table>
                            <!-- Divider -->
                            <div style=""border-top:1px solid #e8e3db;margin:32px 0;""></div>
                            <p style=""color:#9a9490;font-size:12px;line-height:1.6;margin:0 0 8px 0;"">Or copy and paste this link into your browser:</p>
                            <p style=""color:#E6501B;font-size:12px;word-break:break-all;line-height:1.6;margin:0 0 24px 0;"">{verificationUrl}</p>
                            <p style=""color:#9a9490;font-size:12px;margin:0;font-style:italic;"">This link will expire in 24 hours.</p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style=""background:#280905;border-radius:0 0 20px 20px;padding:32px 48px;text-align:center;"">
                            <p style=""color:#f3efe9;font-size:12px;margin:0 0 8px 0;opacity:0.6;line-height:1.6;"">If you didn't create a Fincurio account, you can safely ignore this email.</p>
                            <p style=""color:#f3efe9;font-size:11px;margin:0;opacity:0.4;font-family:'Playfair Display',Georgia,serif;font-style:italic;"">&copy; {DateTime.Now.Year} Fincurio &middot; Your Money, Understood.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    private string GeneratePasswordResetEmailHtml(string firstName, string resetUrl)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <link href=""https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Work+Sans:wght@300;400;500;600&display=swap"" rel=""stylesheet"">
</head>
<body style=""margin:0;padding:0;background-color:#f3efe9;font-family:'Work Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"">
    <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#f3efe9;padding:48px 24px;"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" width=""560"" cellpadding=""0"" cellspacing=""0"" style=""max-width:560px;width:100%;"">
                    <!-- Header -->
                    <tr>
                        <td style=""background:linear-gradient(135deg, #280905 0%, #3d1510 50%, #E6501B 100%);border-radius:20px 20px 0 0;padding:40px 48px;text-align:center;"">
                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin:0 auto;"">
                                <tr>
                                    <td style=""vertical-align:middle;padding-right:12px;"">
                                        <div style=""width:32px;height:32px;border-radius:50%;background:radial-gradient(circle at 50% 60%, #E6501B 30%, #280905 100%);box-shadow:0 0 12px rgba(230,80,27,0.5);""></div>
                                    </td>
                                    <td style=""vertical-align:middle;font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:500;color:#f3efe9;letter-spacing:1px;"">Fincurio</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style=""background:#ffffff;padding:48px;"">
                            <h1 style=""font-family:'Playfair Display',Georgia,serif;color:#280905;font-size:26px;font-weight:500;margin:0 0 8px 0;line-height:1.3;"">Reset Your Password</h1>
                            <div style=""width:40px;height:2px;background:#E6501B;margin:16px 0 24px 0;""></div>
                            <p style=""color:#6b6460;font-size:15px;line-height:1.7;margin:0 0 20px 0;font-weight:300;"">Hi{(string.IsNullOrEmpty(firstName) ? "" : $" {firstName}")}, we received a request to reset your Fincurio password.</p>
                            <p style=""color:#6b6460;font-size:15px;line-height:1.7;margin:0 0 32px 0;font-weight:300;"">Click the button below to create a new password:</p>
                            <!-- CTA Button -->
                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin:0 auto 32px auto;"">
                                <tr>
                                    <td style=""background:#280905;border-radius:100px;text-align:center;"">
                                        <a href=""{resetUrl}"" style=""display:inline-block;padding:16px 40px;color:#f3efe9;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.5px;"">Reset Password</a>
                                    </td>
                                </tr>
                            </table>
                            <!-- Security Notice -->
                            <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""margin:0 0 32px 0;"">
                                <tr>
                                    <td style=""background:#f3efe9;border-left:3px solid #E6501B;border-radius:0 8px 8px 0;padding:16px 20px;"">
                                        <p style=""margin:0 0 4px 0;color:#280905;font-size:13px;font-weight:600;"">Security Notice</p>
                                        <p style=""margin:0;color:#6b6460;font-size:12px;line-height:1.6;"">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email — your password will remain unchanged.</p>
                                    </td>
                                </tr>
                            </table>
                            <!-- Divider -->
                            <div style=""border-top:1px solid #e8e3db;margin:32px 0;""></div>
                            <p style=""color:#9a9490;font-size:12px;line-height:1.6;margin:0 0 8px 0;"">Or copy and paste this link into your browser:</p>
                            <p style=""color:#E6501B;font-size:12px;word-break:break-all;line-height:1.6;margin:0;"">{resetUrl}</p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style=""background:#280905;border-radius:0 0 20px 20px;padding:32px 48px;text-align:center;"">
                            <p style=""color:#f3efe9;font-size:12px;margin:0 0 8px 0;opacity:0.6;line-height:1.6;"">Need help? Reach us at support@fincurio.com</p>
                            <p style=""color:#f3efe9;font-size:11px;margin:0;opacity:0.4;font-family:'Playfair Display',Georgia,serif;font-style:italic;"">&copy; {DateTime.Now.Year} Fincurio &middot; Your Money, Understood.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }
}
