using Core.Application.Abstractions;
using Core.Application.DTOs;

namespace Core.Application.Commands.Recipe;

public record CreateRecipeCommand(
    string Title,
    string Description,
    string Category,
    string? Photo,
    List<CreateIngredientDto> Ingredients,
    List<CreateStepDto> Steps,
    Guid UserId) : ICommand<RecipeDto>;