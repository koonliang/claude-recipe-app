using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.DTOs;
using Core.Application.Extensions;
using Core.Application.Interfaces;
using Core.Application.Queries.Recipe;
using Microsoft.Extensions.Logging;

namespace Core.Application.Handlers.Recipe;

public class GetRecipeByIdQueryHandler : IQueryHandler<GetRecipeByIdQuery, RecipeDto>
{
    private readonly IRecipeRepository _recipeRepository;
    private readonly ILogger<GetRecipeByIdQueryHandler> _logger;

    public GetRecipeByIdQueryHandler(
        IRecipeRepository recipeRepository,
        ILogger<GetRecipeByIdQueryHandler> logger)
    {
        _recipeRepository = recipeRepository;
        _logger = logger;
    }

    public async Task<Result<RecipeDto>> Handle(GetRecipeByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("GetRecipeByIdQuery started - RecipeId: {RecipeId}, UserId: {UserId}", 
            request.Id, request.UserId);

        try
        {
            // First check if recipe exists at all in database
            var recipeExists = await _recipeRepository.RecipeExistsAsync(request.Id, cancellationToken);
            if (!recipeExists)
            {
                _logger.LogWarning("Recipe not found in database - RecipeId: {RecipeId}", request.Id);
                return Result.Failure<RecipeDto>("Recipe not found");
            }

            _logger.LogDebug("Recipe exists, calling GetByIdAsync - RecipeId: {RecipeId}", request.Id);

            // Get recipe
            var recipe = await _recipeRepository.GetByIdAsync(request.Id, cancellationToken);
            if (recipe == null)
            {
                _logger.LogError("Recipe exists but GetByIdAsync returned null - RecipeId: {RecipeId}", request.Id);
                return Result.Failure<RecipeDto>("Recipe not found");
            }

            _logger.LogInformation("Recipe retrieved successfully - RecipeId: {RecipeId}, Title: {Title}", 
                recipe.Id, recipe.Title);

            // Check if recipe is favorite
            var isFavorite = await _recipeRepository.IsRecipeFavoriteAsync(recipe.Id, request.UserId, cancellationToken);
            _logger.LogDebug("Favorite status checked - RecipeId: {RecipeId}, IsFavorite: {IsFavorite}", 
                recipe.Id, isFavorite);

            // Return DTO
            var recipeDto = recipe.ToDto(isFavorite);
            _logger.LogInformation("GetRecipeByIdQuery completed successfully - RecipeId: {RecipeId}", request.Id);
            return Result.Success(recipeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred in GetRecipeByIdQuery - RecipeId: {RecipeId}", request.Id);
            return Result.Failure<RecipeDto>("An error occurred while retrieving the recipe");
        }
    }
}