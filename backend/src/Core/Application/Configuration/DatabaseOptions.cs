using System.ComponentModel.DataAnnotations;

namespace Core.Application.Configuration;

public class DatabaseOptions
{
    public const string SectionName = "Database";

    [Required]
    public string ConnectionString { get; set; } = string.Empty;

    [Range(1, 300)]
    public int CommandTimeout { get; set; } = 30;

    public bool EnableRetryOnFailure { get; set; } = true;

    public int MaxRetryCount { get; set; } = 3;
}