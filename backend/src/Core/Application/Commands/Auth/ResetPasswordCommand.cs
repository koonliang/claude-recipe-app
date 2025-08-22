using Core.Application.Abstractions;

namespace Core.Application.Commands.Auth;

public record ResetPasswordCommand(string Token, string NewPassword) : ICommand;