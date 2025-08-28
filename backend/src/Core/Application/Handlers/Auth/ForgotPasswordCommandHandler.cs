using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.Commands.Auth;
using Core.Application.Interfaces;
using Core.Domain.ValueObjects;
using System.Security.Cryptography;

namespace Core.Application.Handlers.Auth;

public class ForgotPasswordCommandHandler : ICommandHandler<ForgotPasswordCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;

    public ForgotPasswordCommandHandler(
        IUserRepository userRepository,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _emailService = emailService;
    }

    public async Task<Result> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        // Validate email format
        var emailResult = Email.Create(request.Email);
        if (emailResult.IsFailure)
            return Result.Success(); // Don't reveal invalid email format for security

        // Get user by email
        var user = await _userRepository.GetByEmailAsync(emailResult.Value, cancellationToken);
        if (user == null)
            return Result.Success(); // Don't reveal if email doesn't exist for security

        // Generate reset token (cryptographically secure random string)
        var resetToken = GenerateSecureToken();
        var expiry = DateTime.UtcNow.AddHours(1); // Token expires in 1 hour

        // Set reset token
        user.SetPasswordResetToken(resetToken, expiry);
        await _userRepository.UpdateAsync(user, cancellationToken);

        // Send reset email
        await _emailService.SendPasswordResetEmailAsync(user.Email.Value, resetToken);

        return Result.Success();
    }

    private static string GenerateSecureToken()
    {
        // Generate 32 bytes of cryptographically secure random data
        var tokenBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenBytes);
        }
        // Convert to URL-safe base64 string
        return Convert.ToBase64String(tokenBytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }
}