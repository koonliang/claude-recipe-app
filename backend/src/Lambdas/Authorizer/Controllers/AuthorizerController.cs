using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using Authorizer.Services;

namespace Authorizer.Controllers;

[ApiController]
[Route("")]
public class AuthorizerController : ControllerBase
{
    private readonly ILogger<AuthorizerController> _logger;
    private readonly ITokenValidator _tokenValidator;

    public AuthorizerController(ILogger<AuthorizerController> logger, ITokenValidator tokenValidator)
    {
        _logger = logger;
        _tokenValidator = tokenValidator;
    }

    [HttpPost("authorize")]
    public IActionResult Authorize([FromBody] AuthorizationRequest request)
    {
        _logger.LogInformation("HTTP authorization request for method: {Method}, resource: {Resource}", 
            request.HttpMethod, request.MethodArn);

        try
        {
            var isValid = _tokenValidator.ValidateToken(request.AuthorizationToken);
            
            if (isValid)
            {
                var principal = _tokenValidator.GetPrincipal(request.AuthorizationToken);
                var userId = principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "unknown";
                var email = principal?.FindFirst(ClaimTypes.Email)?.Value ?? "";
                
                var response = new AuthorizationResponse
                {
                    PrincipalId = userId,
                    PolicyDocument = new PolicyDocument
                    {
                        Version = "2012-10-17",
                        Statement = new List<PolicyStatement>
                        {
                            new()
                            {
                                Effect = "Allow",
                                Action = new[] { "execute-api:Invoke" },
                                Resource = new[] { request.MethodArn }
                            }
                        }
                    },
                    Context = new Dictionary<string, object>
                    {
                        { "userId", userId },
                        { "email", email }
                    }
                };
                
                _logger.LogInformation("HTTP authorization granted for user: {UserId}", userId);
                return Ok(response);
            }
            else
            {
                _logger.LogInformation("HTTP authorization denied - invalid token");
                var response = new AuthorizationResponse
                {
                    PrincipalId = "anonymous",
                    PolicyDocument = new PolicyDocument
                    {
                        Version = "2012-10-17",
                        Statement = new List<PolicyStatement>
                        {
                            new()
                            {
                                Effect = "Deny",
                                Action = new[] { "execute-api:Invoke" },
                                Resource = new[] { request.MethodArn }
                            }
                        }
                    },
                    Context = new Dictionary<string, object>()
                };
                
                return Ok(response);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing HTTP authorization request");
            return StatusCode(500, new { error = "Authorization service error" });
        }
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            service = "Authorizer Lambda"
        });
    }
}

public record AuthorizationRequest(
    string AuthorizationToken,
    string MethodArn,
    string HttpMethod,
    Dictionary<string, string>? Headers = null);

public record AuthorizationResponse
{
    public string PrincipalId { get; set; } = "";
    public PolicyDocument PolicyDocument { get; set; } = new();
    public Dictionary<string, object> Context { get; set; } = new();
}

public record PolicyDocument
{
    public string Version { get; set; } = "2012-10-17";
    public List<PolicyStatement> Statement { get; set; } = new();
}

public record PolicyStatement
{
    public string Effect { get; set; } = "";
    public string[] Action { get; set; } = Array.Empty<string>();
    public string[] Resource { get; set; } = Array.Empty<string>();
}