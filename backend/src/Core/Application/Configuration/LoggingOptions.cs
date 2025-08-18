using System.ComponentModel.DataAnnotations;

namespace Core.Application.Configuration;

public class LoggingOptions
{
    public const string SectionName = "Logging";

    public LogLevelOptions LogLevel { get; set; } = new();

    public class LogLevelOptions
    {
        public string Default { get; set; } = "Information";
        public string Microsoft { get; set; } = "Warning";
        public string System { get; set; } = "Warning";
        public string AspNetCore { get; set; } = "Warning";
    }
}