using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Core.Application.Configuration;
using Authorizer.Services;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

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

        // Skip shared configuration validation - Function only needs JWT settings
        // configuration.ValidateConfigurationOnStartup();

        var services = new ServiceCollection();
        ConfigureServices(services, configuration);
        
        _serviceProvider = services.BuildServiceProvider();
        _logger = _serviceProvider.GetRequiredService<ILogger<Function>>();
    }

    private static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton(configuration);
        services.AddLogging(builder => builder.AddConsole());
        
        // Skip shared configuration options - only add JWT configuration
        // services.AddConfigurationOptions(configuration);
        
        services.AddScoped<ITokenValidator, TokenValidator>();
        
        // Add JWT options
        services.AddSingleton(provider => 
        {
            var config = provider.GetRequiredService<IConfiguration>();
            return config.GetSection("Jwt").Get<JwtOptions>() ?? throw new InvalidOperationException("JWT configuration is missing");
        });
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
            
            if (isValid)
            {
                var principal = tokenValidator.GetPrincipal(token);
                var userId = principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "unknown";
                var email = principal?.FindFirst(ClaimTypes.Email)?.Value ?? "";
                
                var policy = GeneratePolicy(userId, "Allow", request.MethodArn, new Dictionary<string, object>
                {
                    { "userId", userId },
                    { "email", email }
                });
                
                _logger.LogInformation("Authorization granted for user: {UserId}", userId);
                return policy;
            }
            else
            {
                _logger.LogInformation("Authorization denied - invalid token");
                return GeneratePolicy("anonymous", "Deny", request.MethodArn);
            }
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

    private static APIGatewayCustomAuthorizerResponse GeneratePolicy(string principalId, string effect, string resource, Dictionary<string, object>? context = null)
    {
        var response = new APIGatewayCustomAuthorizerResponse
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

        // Add context if provided
        if (context != null)
        {
            response.Context = new APIGatewayCustomAuthorizerContextOutput();
            foreach (var kvp in context)
            {
                response.Context.Add(kvp.Key, kvp.Value);
            }
        }

        return response;
    }
}

