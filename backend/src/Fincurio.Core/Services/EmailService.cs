using Fincurio.Core.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;

namespace Fincurio.Core.Services;

public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly string _apiKey;
    private readonly string _fromEmail;
    private readonly string _frontendUrl;

    public EmailService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _apiKey = _configuration["Resend:ApiKey"] ?? throw new InvalidOperationException("Resend API key not configured");
        _fromEmail = _configuration["Resend:FromEmail"] ?? "noreply@fincurio.com";
        _frontendUrl = _configuration["Frontend:Url"] ?? "http://localhost:3000";

        _httpClient.BaseAddress = new Uri("https://api.resend.com");
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
    }

    public async Task SendVerificationEmailAsync(string email, string firstName, string verificationToken)
    {
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
            throw new InvalidOperationException($"Failed to send verification email: {error}");
        }
    }

    public async Task SendPasswordResetEmailAsync(string email, string firstName, string resetToken)
    {
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
            throw new InvalidOperationException($"Failed to send password reset email: {error}");
        }
    }

    private string GenerateVerificationEmailHtml(string firstName, string verificationUrl)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #faf8f5;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(40, 9, 5, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #280905 0%, #E6501B 100%);
            padding: 40px;
            text-align: center;
        }}
        .logo {{
            color: #faf8f5;
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-weight: 600;
            margin: 0;
        }}
        .content {{
            padding: 40px;
        }}
        h1 {{
            font-family: 'Playfair Display', serif;
            color: #280905;
            font-size: 28px;
            margin: 0 0 16px 0;
        }}
        p {{
            color: #6b6460;
            line-height: 1.6;
            margin: 0 0 24px 0;
        }}
        .button {{
            display: inline-block;
            background: #E6501B;
            color: #ffffff !important;
            padding: 16px 32px;
            border-radius: 100px;
            text-decoration: none;
            font-weight: 600;
            margin: 24px 0;
        }}
        .footer {{
            background: #f0ede8;
            padding: 24px;
            text-align: center;
            color: #6b6460;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <p class=""logo"">Fincurio</p>
        </div>
        <div class=""content"">
            <h1>Welcome to Fincurio{(string.IsNullOrEmpty(firstName) ? "" : $", {firstName}")}</h1>
            <p>Thank you for creating your account. We're excited to help you reflect on your financial journey.</p>
            <p>To get started, please verify your email address by clicking the button below:</p>
            <a href=""{verificationUrl}"" class=""button"">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style=""color: #E6501B; word-break: break-all;"">{verificationUrl}</p>
            <p style=""margin-top: 32px; font-size: 14px;"">This link will expire in 24 hours.</p>
        </div>
        <div class=""footer"">
            <p>If you didn't create a Fincurio account, you can safely ignore this email.</p>
            <p style=""margin-top: 8px;"">&copy; 2024 Fincurio. Money, Reflected.</p>
        </div>
    </div>
</body>
</html>";
    }

    private string GeneratePasswordResetEmailHtml(string firstName, string resetUrl)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #faf8f5;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(40, 9, 5, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #280905 0%, #E6501B 100%);
            padding: 40px;
            text-align: center;
        }}
        .logo {{
            color: #faf8f5;
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-weight: 600;
            margin: 0;
        }}
        .content {{
            padding: 40px;
        }}
        h1 {{
            font-family: 'Playfair Display', serif;
            color: #280905;
            font-size: 28px;
            margin: 0 0 16px 0;
        }}
        p {{
            color: #6b6460;
            line-height: 1.6;
            margin: 0 0 24px 0;
        }}
        .button {{
            display: inline-block;
            background: #E6501B;
            color: #ffffff !important;
            padding: 16px 32px;
            border-radius: 100px;
            text-decoration: none;
            font-weight: 600;
            margin: 24px 0;
        }}
        .footer {{
            background: #f0ede8;
            padding: 24px;
            text-align: center;
            color: #6b6460;
            font-size: 14px;
        }}
        .warning {{
            background: #fff3cd;
            border-left: 4px solid #E6501B;
            padding: 16px;
            margin: 24px 0;
            border-radius: 8px;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <p class=""logo"">Fincurio</p>
        </div>
        <div class=""content"">
            <h1>Reset Your Password</h1>
            <p>Hi{(string.IsNullOrEmpty(firstName) ? "" : $" {firstName}")},</p>
            <p>We received a request to reset your Fincurio password. Click the button below to create a new password:</p>
            <a href=""{resetUrl}"" class=""button"">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style=""color: #E6501B; word-break: break-all;"">{resetUrl}</p>
            <div class=""warning"">
                <p style=""margin: 0; color: #280905; font-weight: 600;"">⚠️ Security Notice</p>
                <p style=""margin: 8px 0 0 0; font-size: 14px;"">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
        </div>
        <div class=""footer"">
            <p>Need help? Contact us at support@fincurio.com</p>
            <p style=""margin-top: 8px;"">&copy; 2024 Fincurio. Money, Reflected.</p>
        </div>
    </div>
</body>
</html>";
    }
}
