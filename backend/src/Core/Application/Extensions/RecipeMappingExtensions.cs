using Core.Application.DTOs;
using Core.Domain.Entities;

namespace Core.Application.Extensions;

public static class RecipeMappingExtensions
{
    public static RecipeDto ToDto(this Recipe recipe, bool isFavorite = false)
    {
        return new RecipeDto
        {
            Id = recipe.Id,
            Title = recipe.Title,
            Description = recipe.Description,
            Category = recipe.Category,
            PhotoUrl = recipe.PhotoUrl,
            Ingredients = recipe.Ingredients.Select(i => new IngredientDto
            {
                Id = i.Id,
                Name = i.Name,
                Quantity = i.Quantity,
                Unit = i.Unit,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            }).ToList(),
            Steps = recipe.Steps.Select(s => new StepDto
            {
                Id = s.Id,
                StepNumber = s.StepNumber,
                InstructionText = s.InstructionText,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            }).OrderBy(s => s.StepNumber).ToList(),
            IsFavorite = isFavorite,
            CreatedByUserId = recipe.UserId,
            CreatedAt = recipe.CreatedAt,
            UpdatedAt = recipe.UpdatedAt
        };
    }
}