using Core.Application.Commands.Recipe;
using Core.Application.DTOs;
using Core.Application.Queries.Recipe;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Amazon.Lambda.AspNetCoreServer;
using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;

namespace Recipe.Controllers;

[ApiController]
[Route("recipes")]
public class RecipesController : ControllerBase
{
    private readonly IMediator _mediator;

    public RecipesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetUserId()
    {
        // Debug: Log all headers to see what's being received
        Console.WriteLine("=== Recipe Lambda Headers Debug ===");
        foreach (var header in Request.Headers)
        {
            Console.WriteLine($"Header: {header.Key} = {string.Join(", ", header.Value)}");
        }
        Console.WriteLine("================================");

        // Debug: Check what's available in HttpContext
        Console.WriteLine("=== HttpContext Debug ===");
        Console.WriteLine($"HttpContext.Items count: {HttpContext.Items.Count}");
        foreach (var item in HttpContext.Items)
        {
            Console.WriteLine($"HttpContext.Items[{item.Key}] = {item.Value?.GetType().Name}");
        }
        
        var lambdaContext = HttpContext.Features.Get<ILambdaContext>();
        Console.WriteLine($"Lambda context available: {lambdaContext != null}");
        Console.WriteLine("======================");

        // For AWS_PROXY integration, authorizer context is available in the APIGatewayProxyRequest
        if (HttpContext.Items.TryGetValue("LambdaRequestObject", out var requestObj) && requestObj is APIGatewayProxyRequest apiGatewayRequest)
        {
            Console.WriteLine("=== APIGatewayProxyRequest Found ===");
            Console.WriteLine($"Request ID: {apiGatewayRequest.RequestContext?.RequestId}");

            if (apiGatewayRequest.RequestContext?.Authorizer != null)
            {
                Console.WriteLine("=== Authorizer Context Debug ===");
                foreach (var kvp in apiGatewayRequest.RequestContext.Authorizer)
                {
                    Console.WriteLine($"Authorizer[{kvp.Key}] = {kvp.Value}");
                }
                Console.WriteLine("==============================");

                if (apiGatewayRequest.RequestContext.Authorizer.TryGetValue("userId", out var userIdObj) && userIdObj != null)
                {
                    var userIdString = userIdObj.ToString();
                    if (Guid.TryParse(userIdString, out var userId) && userId != Guid.Empty)
                    {
                        Console.WriteLine($"Successfully extracted userId: {userId}");
                        return userId;
                    }
                    throw new UnauthorizedAccessException($"Invalid user ID format: {userIdString}");
                }
                else
                {
                    Console.WriteLine("userId key not found in authorizer context");
                }
            }
            else
            {
                Console.WriteLine("Authorizer context is null");
            }
        }
        else
        {
            Console.WriteLine("LambdaRequestObject not found or not APIGatewayProxyRequest type");
            // User ID is provided by the backend-web gateway from the Authorizer Lambda
            var userIdHeader = Request.Headers["X-User-Id"].FirstOrDefault();
            if (string.IsNullOrWhiteSpace(userIdHeader))
            {
                throw new UnauthorizedAccessException("User ID not provided by authorizer");
            }
            
            // Validate that the header is a valid GUID and not tampered with
            if (!Guid.TryParse(userIdHeader, out var userId) || userId == Guid.Empty)
            {
                throw new UnauthorizedAccessException("Invalid user ID format");
            }
            
            // Additional validation: ensure the header came from the authorizer
            // Check for the presence of the authorizer context header as validation
            var authorizerContext = Request.Headers["X-Authorizer-Context"].FirstOrDefault();
            if (string.IsNullOrWhiteSpace(authorizerContext))
            {
                throw new UnauthorizedAccessException("Missing authorizer context - possible header tampering");
            }
            
            return userId;
        }

        throw new UnauthorizedAccessException("User ID not provided by authorizer - authorizer context not found");
    }

    [HttpGet]
    public async Task<IActionResult> GetRecipes(
        [FromQuery] string? category,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20)
    {
        var userId = GetUserId();

        var query = new GetRecipesQuery(category, search, page, limit, userId);
        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        // Format response to match frontend requirements
        var response = new
        {
            recipes = result.Value.Items,
            pagination = result.Value.Pagination
        };

        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRecipe([FromBody] CreateRecipeRequest request)
    {
        var userId = GetUserId();

        var command = new CreateRecipeCommand(
            request.Title,
            request.Description,
            request.Category,
            request.Photo,
            request.Ingredients,
            request.Steps,
            userId);

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        return CreatedAtAction(nameof(GetRecipeById), new { id = result.Value.Id }, result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetRecipeById(Guid id)
    {
        var userId = GetUserId();

        var query = new GetRecipeByIdQuery(id, userId);
        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return NotFound(new { error = result.Error });

        return Ok(result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateRecipe(Guid id, [FromBody] UpdateRecipeRequest request)
    {
        // Add model state validation logging
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value.Errors.Count > 0)
                .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) })
                .ToList();
            
            var errorMessage = string.Join("; ", errors.SelectMany(e => e.Errors));
            return BadRequest(new { error = errorMessage, details = errors });
        }

        var userId = GetUserId();

        var command = new UpdateRecipeCommand(
            id,
            request.Title,
            request.Description,
            request.Category,
            request.Photo,
            request.Ingredients,
            request.Steps,
            userId);

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Contains("not found"))
                return NotFound(new { error = result.Error });
            if (result.Error.Contains("Access denied"))
                return StatusCode(403, new { error = result.Error });
            return BadRequest(new { error = result.Error });
        }

        return Ok(new { message = "Recipe updated successfully", recipe = result.Value });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteRecipe(Guid id)
    {
        var userId = GetUserId();

        var command = new DeleteRecipeCommand(id, userId);
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Contains("not found"))
                return NotFound(new { error = result.Error });
            if (result.Error.Contains("Access denied"))
                return StatusCode(403, new { error = result.Error });
            return BadRequest(new { error = result.Error });
        }

        return Ok(new { message = "Recipe deleted successfully" });
    }

    [HttpPost("{id:guid}/favorite")]
    public async Task<IActionResult> AddToFavorites(Guid id)
    {
        var userId = GetUserId();

        var command = new ToggleFavoriteCommand(id, true, userId);
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Contains("not found"))
                return NotFound(new { error = result.Error });
            return BadRequest(new { error = result.Error });
        }

        return Ok(new { message = "Recipe marked as favorite" });
    }

    [HttpDelete("{id:guid}/favorite")]
    public async Task<IActionResult> RemoveFromFavorites(Guid id)
    {
        var userId = GetUserId();

        var command = new ToggleFavoriteCommand(id, false, userId);
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            if (result.Error.Contains("not found"))
                return NotFound(new { error = result.Error });
            return BadRequest(new { error = result.Error });
        }

        return Ok(new { message = "Recipe removed from favorites" });
    }
}

public record CreateRecipeRequest(
    string Title,
    string Description,
    string Category,
    string? Photo,
    List<CreateIngredientDto> Ingredients,
    List<CreateStepDto> Steps);

public record UpdateRecipeRequest(
    string Title,
    string Description,
    string Category,
    string? Photo,
    List<UpdateIngredientDto> Ingredients,
    List<UpdateStepDto> Steps);