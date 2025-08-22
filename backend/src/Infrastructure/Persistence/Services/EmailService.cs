using Core.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Persistence.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetToken)
    {
        // For demo purposes, just log the reset token
        // In production, integrate with AWS SES, SendGrid, or another email service
        _logger.LogInformation("Password reset requested for {Email}. Reset token: {ResetToken}", email, resetToken);
        
        // Simulate async email sending
        await Task.Delay(100);
        
        _logger.LogInformation("Password reset email sent to {Email}", email);
    }
}