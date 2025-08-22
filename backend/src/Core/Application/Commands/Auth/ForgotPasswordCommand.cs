using Core.Application.Abstractions;

namespace Core.Application.Commands.Auth;

public record ForgotPasswordCommand(string Email) : ICommand;