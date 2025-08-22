using Core.Application.DTOs;
using Core.Application.Interfaces;
using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class RecipeRepository : IRecipeRepository
{
    private readonly RecipeAppDbContext _context;

    public RecipeRepository(RecipeAppDbContext context)
    {
        _context = context;
    }

    public async Task<Recipe?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Recipes
            .Include(r => r.Ingredients)
            .Include(r => r.Steps)
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<PagedResult<Recipe>> GetRecipesAsync(
        string? category, 
        string? search, 
        int page, 
        int limit, 
        Guid? userId = null, 
        CancellationToken cancellationToken = default)
    {
        var query = _context.Recipes
            .Include(r => r.Ingredients)
            .Include(r => r.Steps)
            .Include(r => r.User)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(r => r.Category.ToLower() == category.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.ToLower();
            query = query.Where(r => 
                r.Title.ToLower().Contains(searchTerm) ||
                r.Description.ToLower().Contains(searchTerm));
        }

        // Get total count
        var total = await query.CountAsync(cancellationToken);

        // Apply pagination
        var recipes = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return new PagedResult<Recipe>
        {
            Items = recipes,
            Pagination = new PaginationInfo
            {
                Page = page,
                Limit = limit,
                Total = total,
                TotalPages = (int)Math.Ceiling((double)total / limit)
            }
        };
    }

    public async Task AddAsync(Recipe recipe, CancellationToken cancellationToken = default)
    {
        await _context.Recipes.AddAsync(recipe, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Recipe recipe, CancellationToken cancellationToken = default)
    {
        _context.Recipes.Update(recipe);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Recipe recipe, CancellationToken cancellationToken = default)
    {
        _context.Recipes.Remove(recipe);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> IsRecipeFavoriteAsync(Guid recipeId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.UserRecipeFavorites
            .AnyAsync(f => f.RecipeId == recipeId && f.UserId == userId, cancellationToken);
    }

    public async Task AddFavoriteAsync(Guid recipeId, Guid userId, CancellationToken cancellationToken = default)
    {
        var favorite = new UserRecipeFavorite(userId, recipeId);
        await _context.UserRecipeFavorites.AddAsync(favorite, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveFavoriteAsync(Guid recipeId, Guid userId, CancellationToken cancellationToken = default)
    {
        var favorite = await _context.UserRecipeFavorites
            .FirstOrDefaultAsync(f => f.RecipeId == recipeId && f.UserId == userId, cancellationToken);
        
        if (favorite != null)
        {
            _context.UserRecipeFavorites.Remove(favorite);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}