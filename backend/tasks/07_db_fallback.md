# Database Fallback Implementation - IN PROGRESS

**Problem**: Lambda functions fail to start when MySQL is unavailable, preventing Swagger access for local development

---

## 📋 Implementation Checklist

### ✅ Core Requirements

- [ ] **In-Memory Database Fallback**
  - Add Microsoft.EntityFrameworkCore.InMemory package
  - Implement automatic fallback when MySQL unavailable
  - Maintain MySQL as primary database for production
  - Graceful connection testing and fallback logic

- [ ] **Enhanced Database Configuration**  
  - Modify DatabaseConfiguration.cs with fallback logic
  - Add connection testing before MySQL configuration
  - Implement logging for database selection decisions
  - Support environment-driven database type selection

- [ ] **Configuration Options**
  - Add UseInMemoryFallback configuration option
  - Support DATABASE_TYPE environment variable
  - Maintain backward compatibility with existing configuration
  - Add development vs production database strategies

- [ ] **Local Development Experience**
  - Enable Swagger access without MySQL dependency
  - Faster startup times for local development
  - Automatic fallback with clear status logging
  - No configuration changes required for basic development

### 🎨 Database Fallback Architecture

- [ ] **Provider Selection Strategy**
  - Primary: MySQL (production and explicit configuration)
  - Fallback: In-Memory (development and MySQL unavailable)
  - Environment-driven selection (DATABASE_TYPE variable)
  - Configuration-driven override (UseInMemoryFallback setting)

- [ ] **Connection Testing Logic**
  - Test MySQL connectivity before configuration
  - Timeout-based connection validation
  - Graceful handling of connection failures
  - Detailed logging of connection attempts and results

- [ ] **Database Provider Configuration**  
  - MySQL: Pomelo.EntityFrameworkCore.MySql with connection string
  - In-Memory: Microsoft.EntityFrameworkCore.InMemory with unique database name
  - Shared DbContext configuration across providers
  - Provider-specific optimizations and settings

### 🔧 Technical Implementation

- [ ] **Enhanced DatabaseConfiguration.cs**
  ```csharp
  public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
  {
      var useInMemoryFallback = configuration.GetValue<bool>("Database:UseInMemoryFallback", true);
      var databaseType = Environment.GetEnvironmentVariable("DATABASE_TYPE") ?? "auto";
      
      if (databaseType.Equals("inmemory", StringComparison.OrdinalIgnoreCase))
      {
          return services.AddInMemoryDatabase();
      }
      
      if (databaseType.Equals("mysql", StringComparison.OrdinalIgnoreCase))
      {
          return services.AddMySqlDatabase(configuration);
      }
      
      // Auto mode: try MySQL, fallback to in-memory if enabled
      if (useInMemoryFallback && !CanConnectToMySql(configuration))
      {
          return services.AddInMemoryDatabase();
      }
      
      return services.AddMySqlDatabase(configuration);
  }
  ```

- [ ] **MySQL Connection Testing**
  ```csharp
  private static bool CanConnectToMySql(IConfiguration configuration)
  {
      try
      {
          var connectionString = GetConnectionString(configuration);
          using var connection = new MySqlConnection(connectionString);
          connection.Open();
          return true;
      }
      catch
      {
          return false;
      }
  }
  ```

- [ ] **In-Memory Database Configuration**
  ```csharp
  private static IServiceCollection AddInMemoryDatabase(this IServiceCollection services)
  {
      services.AddDbContext<RecipeAppDbContext>(options =>
      {
          options.UseInMemoryDatabase($"RecipeApp_{Guid.NewGuid()}");
          options.EnableSensitiveDataLogging();
      });
      
      return services;
  }
  ```

- [ ] **Package Dependencies**
  ```xml
  <!-- Infrastructure.Persistence.csproj -->
  <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="8.0.1" />
  <PackageReference Include="MySqlConnector" Version="2.3.5" />
  ```

### 📁 File Structure

```
src/
├── Infrastructure/Persistence/
│   ├── DatabaseConfiguration.cs ⚠️ (needs enhancement)
│   ├── RecipeAppDbContext.cs ✅ (ready for providers)
│   └── Infrastructure.Persistence.csproj ⚠️ (needs InMemory package)
├── Lambdas/
│   ├── Recipe/
│   │   ├── Program.cs ✅ (uses AddDatabase)
│   │   └── appsettings.json ⚠️ (add fallback config)
│   ├── User/
│   │   ├── Program.cs ✅ (uses AddDatabase)
│   │   └── appsettings.json ⚠️ (add fallback config)
```

### 🧪 Testing Requirements

- [ ] **Fallback Scenario Testing**
  - MySQL unavailable → In-memory database used
  - MySQL available → MySQL database used
  - Explicit DATABASE_TYPE=inmemory → In-memory used
  - Explicit DATABASE_TYPE=mysql → MySQL used (fails if unavailable)

- [ ] **Configuration Testing**
  - UseInMemoryFallback=true → Fallback enabled
  - UseInMemoryFallback=false → No fallback, fail on MySQL unavailable
  - Default configuration → Fallback enabled in development
  - Production configuration → Fallback disabled

- [ ] **Swagger Access Testing**
  - Recipe Lambda starts successfully without MySQL
  - User Lambda starts successfully without MySQL
  - Swagger UI accessible at /swagger endpoints
  - API endpoints functional with in-memory data

### 🎯 Acceptance Criteria

**Given** MySQL is not available on local machine  
**When** Recipe Lambda starts with default configuration  
**Then** it uses in-memory database and Swagger is accessible

**Given** MySQL is available and configured  
**When** Lambda starts in production mode  
**Then** it uses MySQL database as configured

**Given** DATABASE_TYPE=inmemory environment variable is set  
**When** Lambda starts  
**Then** it uses in-memory database regardless of MySQL availability

**Given** UseInMemoryFallback=false in configuration  
**When** MySQL is unavailable  
**Then** Lambda startup fails with clear error message

**Given** in-memory database is being used  
**When** checking application logs  
**Then** clear warning indicates fallback database is active

---

## 🚀 Implementation Status

### ⚠️ **IN PROGRESS** - Implementation Required

1. **⏳ Phase 1**: Add Microsoft.EntityFrameworkCore.InMemory package
2. **⏳ Phase 2**: Enhance DatabaseConfiguration.cs with fallback logic  
3. **⏳ Phase 3**: Add configuration options for database selection
4. **⏳ Phase 4**: Test fallback functionality across Lambda projects
5. **⏳ Phase 5**: Document usage and troubleshooting

---

## 📊 Current State Analysis

### ❌ **Current Limitations**

**DatabaseConfiguration.cs Issues**:
- **Strict MySQL Requirement**: Throws exception if connection string missing
- **No Connection Testing**: Assumes MySQL is always available
- **No Fallback Logic**: Single provider configuration only
- **Development Friction**: Requires MySQL setup for Swagger access
- **Startup Failures**: Application won't start without valid MySQL connection

**Configuration Rigidity**:
- **Required Connection String**: Must provide valid MySQL connection string
- **No Provider Options**: Only MySQL provider supported
- **Environment Inflexibility**: Same database requirements across all environments
- **Development Barriers**: Local development requires full MySQL setup

### 🔧 **Implementation Plan**

**Enhanced DatabaseConfiguration.cs**:
```csharp
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
            options.LogTo(message => logger.LogDebug("EF Core: {Message}", message));
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
        using var factory = LoggerFactory.Create(builder => builder.AddConsole());
        return factory.CreateLogger("DatabaseConfiguration");
    }
}
```

**Enhanced appsettings.json**:
```json
{
  "Database": {
    "ConnectionString": "Server=localhost;Database=RecipeApp;User=root;Password=password;",
    "CommandTimeout": 30,
    "EnableRetryOnFailure": true,
    "MaxRetryCount": 3,
    "UseInMemoryFallback": true
  }
}
```

**Environment Variables**:
```bash
# Force in-memory database
DATABASE_TYPE=inmemory

# Force MySQL database (fail if unavailable)
DATABASE_TYPE=mysql

# Auto mode with fallback (default)
DATABASE_TYPE=auto

# Disable fallback completely
DATABASE__USEINMEMORYFALLBACK=false
```

---

## 🔍 Detailed Implementation

### Package Dependencies Update

**Infrastructure.Persistence.csproj**:
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.1" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.1" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="8.0.1" />
    <PackageReference Include="Pomelo.EntityFrameworkCore.MySql" Version="8.0.0" />
    <PackageReference Include="MySqlConnector" Version="2.3.5" />
    <PackageReference Include="Microsoft.Extensions.Configuration.Abstractions" Version="8.0.0" />
    <PackageReference Include="Microsoft.Extensions.DependencyInjection.Abstractions" Version="8.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\BuildingBlocks\Common\BuildingBlocks.Common.csproj" />
    <ProjectReference Include="..\..\Core\Domain\Core.Domain.csproj" />
    <ProjectReference Include="..\..\Core\Application\Core.Application.csproj" />
  </ItemGroup>
</Project>
```

### Configuration Options

**DatabaseOptions.cs Enhancement**:
```csharp
using System.ComponentModel.DataAnnotations;

namespace Core.Application.Configuration;

public class DatabaseOptions
{
    public const string SectionName = "Database";

    [Required]
    public string ConnectionString { get; set; } = string.Empty;

    public int CommandTimeout { get; set; } = 30;

    public bool EnableRetryOnFailure { get; set; } = true;

    public int MaxRetryCount { get; set; } = 3;

    public bool UseInMemoryFallback { get; set; } = true;

    public string Provider { get; set; } = "auto"; // auto, mysql, inmemory
}
```

### Development vs Production Configuration

**Development (appsettings.Development.json)**:
```json
{
  "Database": {
    "UseInMemoryFallback": true,
    "Provider": "auto"
  },
  "Logging": {
    "LogLevel": {
      "DatabaseConfiguration": "Debug"
    }
  }
}
```

**Production (appsettings.Production.json)**:
```json
{
  "Database": {
    "UseInMemoryFallback": false,
    "Provider": "mysql"
  }
}
```

---

## 🔗 Related Components

- **Configuration**: Uses configuration setup from 01_config.md
- **Lambda Hosting**: Enables Swagger access from 02_hosting.md and 06_swagger.md
- **Dependency Injection**: Integrates with DI setup from 04_dep_inject.md
- **Logging**: Uses logging infrastructure from 05_logging.md
- **Entity Framework**: Builds on EF Core from requirements.md step 7

---

## 💡 Benefits

### Development Experience
- **Immediate Swagger Access**: No MySQL setup required for API documentation
- **Faster Startup**: In-memory database eliminates connection delays
- **Offline Development**: Work without database infrastructure
- **Simplified Setup**: Reduced local development dependencies

### Production Safety
- **Explicit Configuration**: Production requires intentional database configuration
- **Connection Validation**: MySQL connections tested before use
- **Fallback Warnings**: Clear logging when fallback database is used
- **Environment Control**: Environment variables override configuration

### Operational Benefits
- **Graceful Degradation**: Applications start even with database issues
- **Clear Diagnostics**: Detailed logging of database selection process
- **Flexible Deployment**: Support multiple deployment scenarios
- **Testing Support**: In-memory database perfect for integration tests

---

## 🚦 Usage Examples

### Local Development (Default)
```bash
# No configuration needed - automatic fallback
cd backend/src/Lambdas/Recipe
dotnet run
# → Uses in-memory database if MySQL unavailable
# → Swagger accessible at http://localhost:5000/swagger
```

### Force In-Memory Database
```bash
export DATABASE_TYPE=inmemory
dotnet run
# → Always uses in-memory database
```

### Force MySQL Database
```bash
export DATABASE_TYPE=mysql
dotnet run
# → Uses MySQL or fails if unavailable
```

### Production Deployment
```bash
export DATABASE_TYPE=mysql
export CONNECTION_STRING="Server=prod-db;Database=RecipeApp_Prod;User=app_user;Password=prod_password;"
export DATABASE__USEINMEMORYFALLBACK=false
# → Production-safe configuration
```

---

## 🔧 Troubleshooting

### Swagger Still Not Accessible
1. **Check Environment**: Ensure `ASPNETCORE_ENVIRONMENT=Development`
2. **Check Database Logs**: Look for database fallback messages
3. **Check Configuration**: Verify `UseInMemoryFallback=true`
4. **Check Ports**: Ensure no port conflicts (default 5000/5001)

### Unexpected Database Provider
1. **Check DATABASE_TYPE**: Environment variable overrides configuration
2. **Check Connection String**: Empty connection string triggers fallback
3. **Check Logs**: Database selection logged at startup
4. **Check Configuration**: UseInMemoryFallback setting affects behavior

### Production Issues
1. **Disable Fallback**: Set `UseInMemoryFallback=false` in production
2. **Validate Connection**: Test MySQL connection string before deployment
3. **Monitor Logs**: Watch for unexpected fallback usage
4. **Health Checks**: Implement database health checks

---

## 🔧 Future Enhancements

### Advanced Database Features
- **Multiple Database Support**: PostgreSQL, SQL Server providers
- **Connection Pooling**: Advanced connection pool configuration
- **Read Replicas**: Read/write database separation
- **Database Migrations**: Automatic migration management

### Monitoring and Observability
- **Health Checks**: Database connectivity health endpoints
- **Metrics**: Database performance and usage metrics
- **Alerting**: Notifications when fallback database is used
- **Tracing**: Database operation tracing and profiling

### Development Tools
- **Database Seeding**: Automatic test data seeding for in-memory database
- **Schema Validation**: Ensure in-memory schema matches MySQL schema
- **Migration Testing**: Test migrations against both providers
- **Performance Comparison**: Compare in-memory vs MySQL performance

---

**Dependencies**: Configuration Setup (01_config.md), Lambda Hosting (02_hosting.md), Dependency Injection (04_dep_inject.md), Logging (05_logging.md), Swagger (06_swagger.md)  
**Estimated Effort**: 3-4 hours  
**Status**: ⚠️ **IN PROGRESS**  
**Assignee**: Claude Code  
**Created**: 2025-08-18