using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.DTOs;
using Core.Application.Extensions;
using Core.Application.Interfaces;
using Core.Application.Queries.Recipe;

namespace Core.Application.Handlers.Recipe;

public class GetRecipesQueryHandler : IQueryHandler<GetRecipesQuery, PagedResult<RecipeDto>>
{
    private readonly IRecipeRepository _recipeRepository;

    public GetRecipesQueryHandler(IRecipeRepository recipeRepository)
    {
        _recipeRepository = recipeRepository;
    }

    public async Task<Result<PagedResult<RecipeDto>>> Handle(GetRecipesQuery request, CancellationToken cancellationToken)
    {
        // Validate pagination parameters
        var page = Math.Max(1, request.Page);
        var limit = Math.Min(100, Math.Max(1, request.Limit));

        // Get recipes
        var result = await _recipeRepository.GetRecipesAsync(
            request.Category,
            request.Search,
            page,
            limit,
            request.UserId,
            cancellationToken);

        // Convert to DTOs
        var recipeDtos = new List<RecipeDto>();
        foreach (var recipe in result.Items)
        {
            var isFavorite = await _recipeRepository.IsRecipeFavoriteAsync(recipe.Id, request.UserId, cancellationToken);
            recipeDtos.Add(recipe.ToDto(isFavorite));
        }

        var pagedResult = new PagedResult<RecipeDto>
        {
            Items = recipeDtos,
            Pagination = result.Pagination
        };

        return Result.Success(pagedResult);
    }
}