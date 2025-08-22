using Core.Application.Abstractions;

namespace Core.Application.Commands.Recipe;

public record ToggleFavoriteCommand(Guid RecipeId, bool IsFavorite, Guid UserId) : ICommand;