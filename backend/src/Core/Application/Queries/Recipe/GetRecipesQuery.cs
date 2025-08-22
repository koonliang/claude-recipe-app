using Core.Application.Abstractions;
using Core.Application.DTOs;

namespace Core.Application.Queries.Recipe;

public record GetRecipesQuery(
    string? Category,
    string? Search,
    int Page,
    int Limit,
    Guid UserId) : IQuery<PagedResult<RecipeDto>>;