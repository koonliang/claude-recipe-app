using System.ComponentModel.DataAnnotations;

namespace Core.Application.Configuration;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required]
    [MinLength(32)]
    public string SecretKey { get; set; } = string.Empty;

    [Required]
    public string Issuer { get; set; } = string.Empty;

    [Required]
    public string Audience { get; set; } = string.Empty;

    [Range(1, 43200)] // 1 minute to 30 days
    public int ExpirationMinutes { get; set; } = 60;

    [Range(1, 525600)] // 1 minute to 1 year
    public int RefreshTokenExpirationMinutes { get; set; } = 10080; // 7 days
}