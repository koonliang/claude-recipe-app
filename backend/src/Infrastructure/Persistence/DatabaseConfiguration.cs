using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Core.Application.Configuration;
using Microsoft.Extensions.Options;

namespace Infrastructure.Persistence;

public static class DatabaseConfiguration
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        // Try to get connection string from new Database configuration section first
        var databaseOptions = configuration.GetSection(DatabaseOptions.SectionName);
        var connectionString = databaseOptions.GetValue<string>("ConnectionString");
        
        // Fall back to legacy ConnectionStrings section if new format not found
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

        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("Database connection string is not configured. Please set either Database:ConnectionString, ConnectionStrings:DefaultConnection, or CONNECTION_STRING environment variable.");
        }

        services.AddDbContext<RecipeAppDbContext>(options =>
        {
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), mysqlOptions =>
            {
                // Get command timeout from configuration
                var commandTimeout = databaseOptions.GetValue<int?>("CommandTimeout") ?? 30;
                mysqlOptions.CommandTimeout(commandTimeout);
                
                // Enable retry on failure if configured
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
}