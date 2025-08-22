using Core.Application.Abstractions;
using Core.Application.DTOs;

namespace Core.Application.Queries.Recipe;

public record GetRecipeByIdQuery(Guid Id, Guid UserId) : IQuery<RecipeDto>;