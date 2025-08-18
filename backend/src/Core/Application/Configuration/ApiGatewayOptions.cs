using System.ComponentModel.DataAnnotations;

namespace Core.Application.Configuration;

public class ApiGatewayOptions
{
    public const string SectionName = "ApiGateway";

    [Required]
    public string BaseUrl { get; set; } = string.Empty;

    public string ApiVersion { get; set; } = "v1";

    public bool EnableCors { get; set; } = true;

    public string[] AllowedOrigins { get; set; } = Array.Empty<string>();

    [Range(1, 3600)]
    public int TimeoutSeconds { get; set; } = 30;
}