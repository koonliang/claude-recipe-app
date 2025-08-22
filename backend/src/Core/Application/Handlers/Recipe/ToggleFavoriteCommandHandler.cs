using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.Commands.Recipe;
using Core.Application.Interfaces;

namespace Core.Application.Handlers.Recipe;

public class ToggleFavoriteCommandHandler : ICommandHandler<ToggleFavoriteCommand>
{
    private readonly IRecipeRepository _recipeRepository;

    public ToggleFavoriteCommandHandler(IRecipeRepository recipeRepository)
    {
        _recipeRepository = recipeRepository;
    }

    public async Task<Result> Handle(ToggleFavoriteCommand request, CancellationToken cancellationToken)
    {
        // Check if recipe exists
        var recipe = await _recipeRepository.GetByIdAsync(request.RecipeId, cancellationToken);
        if (recipe == null)
            return Result.Failure("Recipe not found");

        // Check current favorite status
        var isFavorite = await _recipeRepository.IsRecipeFavoriteAsync(request.RecipeId, request.UserId, cancellationToken);

        if (request.IsFavorite && !isFavorite)
        {
            // Add to favorites
            await _recipeRepository.AddFavoriteAsync(request.RecipeId, request.UserId, cancellationToken);
        }
        else if (!request.IsFavorite && isFavorite)
        {
            // Remove from favorites
            await _recipeRepository.RemoveFavoriteAsync(request.RecipeId, request.UserId, cancellationToken);
        }

        return Result.Success();
    }
}