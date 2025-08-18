using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Core.Application.Configuration;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace Authorizer;

public class Function
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<Function> _logger;

    public Function()
    {
        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        // Validate configuration on startup
        try
        {
            configuration.ValidateConfigurationOnStartup();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Configuration validation failed: {ex.Message}");
            throw;
        }

        var services = new ServiceCollection();
        ConfigureServices(services, configuration);
        
        _serviceProvider = services.BuildServiceProvider();
        _logger = _serviceProvider.GetRequiredService<ILogger<Function>>();
    }

    private static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton(configuration);
        services.AddLogging(builder => builder.AddConsole());
        
        // Add configuration options with validation
        services.AddConfigurationOptions(configuration);
        
        services.AddScoped<ITokenValidator, TokenValidator>();
    }

    public APIGatewayCustomAuthorizerResponse FunctionHandler(APIGatewayCustomAuthorizerRequest request, ILambdaContext context)
    {
        _logger.LogInformation("Processing authorization request for method: {Method}, resource: {Resource}", 
            request.HttpMethod, request.MethodArn);

        try
        {
            var tokenValidator = _serviceProvider.GetRequiredService<ITokenValidator>();
            var token = ExtractToken(request);
            
            var isValid = tokenValidator.ValidateToken(token);
            var principalId = isValid ? "user123" : "anonymous";
            
            var policy = GeneratePolicy(principalId, isValid ? "Allow" : "Deny", request.MethodArn);
            
            _logger.LogInformation("Authorization {Result} for token", isValid ? "granted" : "denied");
            
            return policy;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing authorization request");
            return GeneratePolicy("anonymous", "Deny", request.MethodArn);
        }
    }

    private static string ExtractToken(APIGatewayCustomAuthorizerRequest request)
    {
        if (request.Headers?.TryGetValue("Authorization", out var authHeader) == true)
        {
            return authHeader.StartsWith("Bearer ") ? authHeader[7..] : authHeader;
        }
        
        return request.AuthorizationToken ?? string.Empty;
    }

    private static APIGatewayCustomAuthorizerResponse GeneratePolicy(string principalId, string effect, string resource)
    {
        return new APIGatewayCustomAuthorizerResponse
        {
            PrincipalID = principalId,
            PolicyDocument = new APIGatewayCustomAuthorizerPolicy
            {
                Version = "2012-10-17",
                Statement = new List<APIGatewayCustomAuthorizerPolicy.IAMPolicyStatement>
                {
                    new()
                    {
                        Action = new HashSet<string> { "execute-api:Invoke" },
                        Effect = effect,
                        Resource = new HashSet<string> { resource }
                    }
                }
            }
        };
    }
}

public interface ITokenValidator
{
    bool ValidateToken(string token);
}

public class TokenValidator : ITokenValidator
{
    private readonly ILogger<TokenValidator> _logger;

    public TokenValidator(ILogger<TokenValidator> logger)
    {
        _logger = logger;
    }

    public bool ValidateToken(string token)
    {
        _logger.LogInformation("Validating token");
        
        if (string.IsNullOrEmpty(token))
        {
            _logger.LogWarning("Token is null or empty");
            return false;
        }

        return token == "valid-token";
    }
}