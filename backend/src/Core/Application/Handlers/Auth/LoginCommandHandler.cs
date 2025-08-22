using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.Commands.Auth;
using Core.Application.DTOs;
using Core.Application.Interfaces;
using Core.Domain.ValueObjects;

namespace Core.Application.Handlers.Auth;

public class LoginCommandHandler : ICommandHandler<LoginCommand, AuthenticationResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;
    private readonly IJwtTokenService _jwtTokenService;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IPasswordService passwordService,
        IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthenticationResult>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // Validate email format
        var emailResult = Email.Create(request.Email);
        if (emailResult.IsFailure)
            return Result.Failure<AuthenticationResult>("Invalid email format");

        // Get user by email
        var user = await _userRepository.GetByEmailAsync(emailResult.Value, cancellationToken);
        if (user == null)
            return Result.Failure<AuthenticationResult>("Invalid email or password");

        // Verify password
        if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
            return Result.Failure<AuthenticationResult>("Invalid email or password");

        // Generate JWT token
        var token = _jwtTokenService.GenerateToken(user);

        // Create response
        var response = new AuthenticationResult
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                FullName = user.Name,
                Email = user.Email.Value,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            }
        };

        return Result.Success(response);
    }
}