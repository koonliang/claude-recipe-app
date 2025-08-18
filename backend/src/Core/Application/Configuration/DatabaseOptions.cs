using System.ComponentModel.DataAnnotations;

namespace Core.Application.Configuration;

public class DatabaseOptions
{
    public const string SectionName = "Database";

    public string ConnectionString { get; set; } = string.Empty;

    [Range(1, 300)]
    public int CommandTimeout { get; set; } = 30;

    public bool EnableRetryOnFailure { get; set; } = true;

    public int MaxRetryCount { get; set; } = 3;

    public bool UseInMemoryFallback { get; set; } = true;

    public string Provider { get; set; } = "auto"; // auto, mysql, inmemory
}