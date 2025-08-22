using Core.Application.Abstractions;

namespace Core.Application.Commands.Recipe;

public record DeleteRecipeCommand(Guid Id, Guid UserId) : ICommand;