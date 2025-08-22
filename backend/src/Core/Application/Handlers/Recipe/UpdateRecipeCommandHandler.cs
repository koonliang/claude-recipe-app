using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.Commands.Recipe;
using Core.Application.DTOs;
using Core.Application.Extensions;
using Core.Application.Interfaces;
using Core.Domain.Entities;

namespace Core.Application.Handlers.Recipe;

public class UpdateRecipeCommandHandler : ICommandHandler<UpdateRecipeCommand, RecipeDto>
{
    private readonly IRecipeRepository _recipeRepository;
    private readonly IImageStorageService _imageStorageService;

    public UpdateRecipeCommandHandler(
        IRecipeRepository recipeRepository,
        IImageStorageService imageStorageService)
    {
        _recipeRepository = recipeRepository;
        _imageStorageService = imageStorageService;
    }

    public async Task<Result<RecipeDto>> Handle(UpdateRecipeCommand request, CancellationToken cancellationToken)
    {
        // Get existing recipe
        var recipe = await _recipeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (recipe == null)
            return Result.Failure<RecipeDto>("Recipe not found");

        // Check ownership
        if (!recipe.IsOwnedBy(request.UserId))
            return Result.Failure<RecipeDto>("Access denied");

        // Validate required fields
        if (string.IsNullOrWhiteSpace(request.Title))
            return Result.Failure<RecipeDto>("Title is required");

        if (string.IsNullOrWhiteSpace(request.Category))
            return Result.Failure<RecipeDto>("Category is required");

        if (!request.Ingredients.Any())
            return Result.Failure<RecipeDto>("At least one ingredient is required");

        if (!request.Steps.Any())
            return Result.Failure<RecipeDto>("At least one step is required");

        // Handle image upload
        string? photoUrl = recipe.PhotoUrl;
        if (!string.IsNullOrWhiteSpace(request.Photo))
        {
            // Delete old image if exists
            if (!string.IsNullOrWhiteSpace(recipe.PhotoUrl))
            {
                await _imageStorageService.DeleteImageAsync(recipe.PhotoUrl);
            }

            // Upload new image
            var fileName = $"recipe_{recipe.Id:N}";
            photoUrl = await _imageStorageService.UploadImageAsync(request.Photo, fileName);
        }

        // Update basic info
        recipe.UpdateBasicInfo(
            request.Title.Trim(),
            request.Description?.Trim() ?? string.Empty,
            request.Category.Trim(),
            photoUrl);

        // Update ingredients
        var newIngredients = request.Ingredients.Select(dto => 
            new Ingredient(dto.Name.Trim(), dto.Quantity.Trim(), dto.Unit.Trim(), recipe.Id)
        ).ToList();
        recipe.UpdateIngredients(newIngredients);

        // Update steps
        var newSteps = request.Steps.OrderBy(s => s.StepNumber)
            .Select(dto => new Step(dto.StepNumber, dto.InstructionText.Trim(), recipe.Id))
            .ToList();
        recipe.UpdateSteps(newSteps);

        // Save changes
        await _recipeRepository.UpdateAsync(recipe, cancellationToken);

        // Check if recipe is favorite
        var isFavorite = await _recipeRepository.IsRecipeFavoriteAsync(recipe.Id, request.UserId, cancellationToken);

        // Return DTO
        return Result.Success(recipe.ToDto(isFavorite));
    }
}