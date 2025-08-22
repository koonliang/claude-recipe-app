using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.Commands.Auth;
using Core.Application.DTOs;
using Core.Application.Interfaces;
using Core.Domain.Entities;
using Core.Domain.ValueObjects;

namespace Core.Application.Handlers.Auth;

public class SignupCommandHandler : ICommandHandler<SignupCommand, AuthenticationResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;
    private readonly IJwtTokenService _jwtTokenService;

    public SignupCommandHandler(
        IUserRepository userRepository,
        IPasswordService passwordService,
        IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthenticationResult>> Handle(SignupCommand request, CancellationToken cancellationToken)
    {
        // Validate email format
        var emailResult = Email.Create(request.Email);
        if (emailResult.IsFailure)
            return Result.Failure<AuthenticationResult>(emailResult.Error);

        // Check if user already exists
        if (await _userRepository.ExistsAsync(emailResult.Value, cancellationToken))
            return Result.Failure<AuthenticationResult>("Email already exists");

        // Validate password
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
            return Result.Failure<AuthenticationResult>("Password must be at least 8 characters long");

        // Hash password
        var passwordHash = _passwordService.HashPassword(request.Password);

        // Create user
        var user = new User(request.Name.Trim(), emailResult.Value, passwordHash);

        // Save user
        await _userRepository.AddAsync(user, cancellationToken);

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