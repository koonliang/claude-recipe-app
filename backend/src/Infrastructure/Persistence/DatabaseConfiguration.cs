using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Core.Application.Configuration;
using MySqlConnector;

namespace Infrastructure.Persistence;

public static class DatabaseConfiguration
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var logger = CreateLogger();
        var useInMemoryFallback = configuration.GetValue<bool>("Database:UseInMemoryFallback", true);
        var databaseType = Environment.GetEnvironmentVariable("DATABASE_TYPE")?.ToLowerInvariant() ?? "auto";
        
        logger.LogInformation("Database configuration starting with type: {DatabaseType}, fallback enabled: {FallbackEnabled}", 
            databaseType, useInMemoryFallback);

        return databaseType switch
        {
            "inmemory" => services.AddInMemoryDatabase(logger),
            "mysql" => services.AddMySqlDatabase(configuration, logger),
            "auto" => services.AddDatabaseWithFallback(configuration, useInMemoryFallback, logger),
            _ => throw new InvalidOperationException($"Unsupported database type: {databaseType}")
        };
    }

    private static IServiceCollection AddDatabaseWithFallback(
        this IServiceCollection services, 
        IConfiguration configuration, 
        bool useInMemoryFallback, 
        ILogger logger)
    {
        if (useInMemoryFallback && !CanConnectToMySql(configuration, logger))
        {
            logger.LogWarning("MySQL connection failed, falling back to in-memory database for development");
            return services.AddInMemoryDatabase(logger);
        }

        return services.AddMySqlDatabase(configuration, logger);
    }

    private static IServiceCollection AddMySqlDatabase(
        this IServiceCollection services, 
        IConfiguration configuration, 
        ILogger logger)
    {
        var connectionString = GetConnectionString(configuration);
        
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("MySQL connection string is required when using MySQL provider");
        }

        logger.LogInformation("Configuring MySQL database provider");

        services.AddDbContext<RecipeAppDbContext>(options =>
        {
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), mysqlOptions =>
            {
                var databaseOptions = configuration.GetSection(DatabaseOptions.SectionName);
                var commandTimeout = databaseOptions.GetValue<int?>("CommandTimeout") ?? 30;
                mysqlOptions.CommandTimeout(commandTimeout);
                
                var enableRetryOnFailure = databaseOptions.GetValue<bool>("EnableRetryOnFailure");
                var maxRetryCount = databaseOptions.GetValue<int>("MaxRetryCount");
                
                if (enableRetryOnFailure)
                {
                    mysqlOptions.EnableRetryOnFailure(maxRetryCount > 0 ? maxRetryCount : 3);
                }
            });
        });

        return services;
    }

    private static IServiceCollection AddInMemoryDatabase(this IServiceCollection services, ILogger logger)
    {
        var databaseName = $"RecipeApp_{Guid.NewGuid():N}";
        
        logger.LogWarning("Using in-memory database '{DatabaseName}' - data will not persist", databaseName);

        services.AddDbContext<RecipeAppDbContext>(options =>
        {
            options.UseInMemoryDatabase(databaseName);
            options.EnableSensitiveDataLogging();
        });

        return services;
    }

    private static bool CanConnectToMySql(IConfiguration configuration, ILogger logger)
    {
        try
        {
            var connectionString = GetConnectionString(configuration);
            
            if (string.IsNullOrEmpty(connectionString))
            {
                logger.LogInformation("No MySQL connection string configured, will use fallback");
                return false;
            }

            logger.LogDebug("Testing MySQL connection...");
            
            using var connection = new MySqlConnection(connectionString);
            using var cancellation = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            
            connection.Open();
            logger.LogInformation("MySQL connection test successful");
            return true;
        }
        catch (Exception ex)
        {
            logger.LogInformation("MySQL connection test failed: {Error}", ex.Message);
            return false;
        }
    }

    private static string? GetConnectionString(IConfiguration configuration)
    {
        // Try new Database configuration section first
        var databaseOptions = configuration.GetSection(DatabaseOptions.SectionName);
        var connectionString = databaseOptions.GetValue<string>("ConnectionString");
        
        // Fall back to legacy ConnectionStrings section
        if (string.IsNullOrEmpty(connectionString))
        {
            connectionString = configuration.GetConnectionString("DefaultConnection");
        }
        
        // Override with environment variable if present
        var envConnectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING");
        if (!string.IsNullOrEmpty(envConnectionString))
        {
            connectionString = envConnectionString;
        }

        return connectionString;
    }

    private static ILogger CreateLogger()
    {
        // Simple console logger for database configuration
        return new SimpleConsoleLogger();
    }

    private class SimpleConsoleLogger : ILogger
    {
        public IDisposable BeginScope<TState>(TState state) => null!;
        public bool IsEnabled(LogLevel logLevel) => logLevel >= LogLevel.Information;
        
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            if (!IsEnabled(logLevel)) return;
            
            var message = formatter(state, exception);
            var timestamp = DateTime.Now.ToString("HH:mm:ss");
            var level = logLevel.ToString().ToUpperInvariant();
            
            Console.WriteLine($"[{timestamp} {level}] DatabaseConfiguration: {message}");
            
            if (exception != null)
            {
                Console.WriteLine($"Exception: {exception}");
            }
        }
    }
}