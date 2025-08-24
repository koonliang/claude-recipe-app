using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.DTOs;
using Core.Application.Extensions;
using Core.Application.Interfaces;
using Core.Application.Queries.Recipe;
using Microsoft.Extensions.Logging;

namespace Core.Application.Handlers.Recipe;

public class GetRecipesQueryHandler : IQueryHandler<GetRecipesQuery, PagedResult<RecipeDto>>
{
    private readonly IRecipeRepository _recipeRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<GetRecipesQueryHandler> _logger;

    public GetRecipesQueryHandler(
        IRecipeRepository recipeRepository,
        IUserRepository userRepository,
        ILogger<GetRecipesQueryHandler> logger)
    {
        _recipeRepository = recipeRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<Result<PagedResult<RecipeDto>>> Handle(GetRecipesQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("GetRecipesQuery started - UserId: {UserId}, Category: {Category}, Search: {Search}, Page: {Page}, Limit: {Limit}", 
            request.UserId, request.Category, request.Search, request.Page, request.Limit);

        // First, check if there are any recipes in the database at all
        var totalRecipesInDb = await _recipeRepository.GetTotalRecipeCountAsync(cancellationToken);
        _logger.LogInformation("Total recipes in database: {TotalCount}", totalRecipesInDb);

        // If no recipes exist, return empty result
        if (totalRecipesInDb == 0)
        {
            _logger.LogWarning("No recipes found in database");
            var emptyResult = new PagedResult<RecipeDto>
            {
                Items = new List<RecipeDto>(),
                Pagination = new PaginationInfo { Page = 1, Limit = 20, Total = 0, TotalPages = 0 }
            };
            return Result.Success(emptyResult);
        }

        // Validate pagination parameters
        var page = Math.Max(1, request.Page);
        var limit = Math.Min(100, Math.Max(1, request.Limit));

        _logger.LogDebug("Calling GetRecipesAsync with validated parameters - Page: {Page}, Limit: {Limit}", page, limit);

        // Get recipes with filters
        var result = await _recipeRepository.GetRecipesAsync(
            request.Category,
            request.Search,
            page,
            limit,
            request.UserId,
            cancellationToken);

        _logger.LogInformation("GetRecipesAsync completed - Found {Count} recipes after filters, Total: {Total}", 
            result.Items.Count, result.Pagination.Total);

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

        _logger.LogInformation("GetRecipesQuery completed successfully - Returning {Count} recipe DTOs", recipeDtos.Count);
        return Result.Success(pagedResult);
    }
}