using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.DTOs;
using Core.Application.Interfaces;
using Core.Application.Queries.User;

namespace Core.Application.Handlers.User;

public class GetUserProfileQueryHandler : IQueryHandler<GetUserProfileQuery, UserDto>
{
    private readonly IUserRepository _userRepository;

    public GetUserProfileQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<UserDto>> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            return Result.Failure<UserDto>("User not found");

        var userDto = new UserDto
        {
            Id = user.Id,
            FullName = user.Name,
            Email = user.Email.Value
        };

        return Result.Success(userDto);
    }
}