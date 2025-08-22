using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.Commands.Recipe;
using Core.Application.Interfaces;

namespace Core.Application.Handlers.Recipe;

public class DeleteRecipeCommandHandler : ICommandHandler<DeleteRecipeCommand>
{
    private readonly IRecipeRepository _recipeRepository;
    private readonly IImageStorageService _imageStorageService;

    public DeleteRecipeCommandHandler(
        IRecipeRepository recipeRepository,
        IImageStorageService imageStorageService)
    {
        _recipeRepository = recipeRepository;
        _imageStorageService = imageStorageService;
    }

    public async Task<Result> Handle(DeleteRecipeCommand request, CancellationToken cancellationToken)
    {
        // Get recipe
        var recipe = await _recipeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (recipe == null)
            return Result.Failure("Recipe not found");

        // Check ownership
        if (!recipe.IsOwnedBy(request.UserId))
            return Result.Failure("Access denied");

        // Delete image if exists
        if (!string.IsNullOrWhiteSpace(recipe.PhotoUrl))
        {
            await _imageStorageService.DeleteImageAsync(recipe.PhotoUrl);
        }

        // Delete recipe
        await _recipeRepository.DeleteAsync(recipe, cancellationToken);

        return Result.Success();
    }
}