using Core.Application.Commands.Recipe;
using Core.Application.DTOs;
using Core.Application.Queries.Recipe;
using MediatR;
using Microsoft.AspNetCore.Mvc;

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
        // User ID is now provided by the backend-web gateway from the Authorizer Lambda
        var userIdHeader = Request.Headers["X-User-Id"].FirstOrDefault();
        if (string.IsNullOrEmpty(userIdHeader))
        {
            throw new UnauthorizedAccessException("User ID not provided by authorizer");
        }
        
        return Guid.TryParse(userIdHeader, out var userId) ? userId : throw new UnauthorizedAccessException("Invalid user ID format");
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
                return Forbid();
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
                return Forbid();
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