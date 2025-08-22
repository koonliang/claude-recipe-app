using Core.Application.DTOs;
using Core.Domain.Entities;

namespace Core.Application.Interfaces;

public interface IRecipeRepository
{
    Task<Recipe?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedResult<Recipe>> GetRecipesAsync(string? category, string? search, int page, int limit, Guid? userId = null, CancellationToken cancellationToken = default);
    Task AddAsync(Recipe recipe, CancellationToken cancellationToken = default);
    Task UpdateAsync(Recipe recipe, CancellationToken cancellationToken = default);
    Task DeleteAsync(Recipe recipe, CancellationToken cancellationToken = default);
    Task<bool> IsRecipeFavoriteAsync(Guid recipeId, Guid userId, CancellationToken cancellationToken = default);
    Task AddFavoriteAsync(Guid recipeId, Guid userId, CancellationToken cancellationToken = default);
    Task RemoveFavoriteAsync(Guid recipeId, Guid userId, CancellationToken cancellationToken = default);
}