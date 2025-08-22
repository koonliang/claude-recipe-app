namespace Core.Application.DTOs;

public class AuthenticationResult
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}