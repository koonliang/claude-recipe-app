using System.Security.Claims;
using Core.Domain.Entities;

namespace Core.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
    ClaimsPrincipal? ValidateToken(string token);
}