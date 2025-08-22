using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.Commands.Auth;
using Core.Application.Interfaces;

namespace Core.Application.Handlers.Auth;

public class ResetPasswordCommandHandler : ICommandHandler<ResetPasswordCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;

    public ResetPasswordCommandHandler(
        IUserRepository userRepository,
        IPasswordService passwordService)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
    }

    public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        // Validate password
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
            return Result.Failure("Password must be at least 8 characters long");

        // Get user by reset token
        var user = await _userRepository.GetByPasswordResetTokenAsync(request.Token, cancellationToken);
        if (user == null)
            return Result.Failure("Invalid or expired reset token");

        // Validate token
        if (!user.IsPasswordResetTokenValid(request.Token))
            return Result.Failure("Invalid or expired reset token");

        // Hash new password
        var passwordHash = _passwordService.HashPassword(request.NewPassword);

        // Update password
        user.UpdatePassword(passwordHash);
        await _userRepository.UpdateAsync(user, cancellationToken);

        return Result.Success();
    }
}