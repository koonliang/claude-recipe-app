using Core.Application.Abstractions;
using Core.Application.DTOs;

namespace Core.Application.Queries.User;

public record GetUserProfileQuery(Guid UserId) : IQuery<UserDto>;