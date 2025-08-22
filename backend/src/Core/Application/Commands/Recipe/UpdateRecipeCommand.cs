using Core.Application.Abstractions;
using Core.Application.DTOs;

namespace Core.Application.Commands.Recipe;

public record UpdateRecipeCommand(
    Guid Id,
    string Title,
    string Description,
    string Category,
    string? Photo,
    List<UpdateIngredientDto> Ingredients,
    List<UpdateStepDto> Steps,
    Guid UserId) : ICommand<RecipeDto>;