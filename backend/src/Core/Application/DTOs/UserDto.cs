namespace Core.Application.DTOs;

public class UserDto : BaseDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}