using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.DTOs;
using Core.Application.Extensions;
using Core.Application.Interfaces;
using Core.Application.Queries.Recipe;

namespace Core.Application.Handlers.Recipe;

public class GetRecipeByIdQueryHandler : IQueryHandler<GetRecipeByIdQuery, RecipeDto>
{
    private readonly IRecipeRepository _recipeRepository;

    public GetRecipeByIdQueryHandler(IRecipeRepository recipeRepository)
    {
        _recipeRepository = recipeRepository;
    }

    public async Task<Result<RecipeDto>> Handle(GetRecipeByIdQuery request, CancellationToken cancellationToken)
    {
        // Get recipe
        var recipe = await _recipeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (recipe == null)
            return Result.Failure<RecipeDto>("Recipe not found");

        // Check if recipe is favorite
        var isFavorite = await _recipeRepository.IsRecipeFavoriteAsync(recipe.Id, request.UserId, cancellationToken);

        // Return DTO
        return Result.Success(recipe.ToDto(isFavorite));
    }
}