using Core.Application.Abstractions;
using Core.Application.DTOs;

namespace Core.Application.Commands.Auth;

public record LoginCommand(string Email, string Password) : ICommand<AuthenticationResult>;