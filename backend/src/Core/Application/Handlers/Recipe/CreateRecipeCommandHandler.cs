using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.Commands.Recipe;
using Core.Application.DTOs;
using Core.Application.Extensions;
using Core.Application.Interfaces;
using Core.Domain.Entities;

namespace Core.Application.Handlers.Recipe;

public class CreateRecipeCommandHandler : ICommandHandler<CreateRecipeCommand, RecipeDto>
{
    private readonly IRecipeRepository _recipeRepository;
    private readonly IImageStorageService _imageStorageService;

    public CreateRecipeCommandHandler(
        IRecipeRepository recipeRepository,
        IImageStorageService imageStorageService)
    {
        _recipeRepository = recipeRepository;
        _imageStorageService = imageStorageService;
    }

    public async Task<Result<RecipeDto>> Handle(CreateRecipeCommand request, CancellationToken cancellationToken)
    {
        Console.WriteLine("In Handle");
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
        string? photoUrl = null;
        if (!string.IsNullOrWhiteSpace(request.Photo))
        {
            var fileName = $"recipe_{Guid.NewGuid():N}";
            photoUrl = await _imageStorageService.UploadImageAsync(request.Photo, fileName);
        }

        // Create recipe entity
        var recipe = new Core.Domain.Entities.Recipe(
            request.Title.Trim(),
            request.Description?.Trim() ?? string.Empty,
            request.Category.Trim(),
            request.UserId,
            photoUrl);

        // Add ingredients
        foreach (var ingredientDto in request.Ingredients)
        {
            recipe.AddIngredient(
                ingredientDto.Name.Trim(),
                ingredientDto.Quantity.Trim(),
                ingredientDto.Unit.Trim());
        }

        // Add steps
        foreach (var stepDto in request.Steps.OrderBy(s => s.StepNumber))
        {
            recipe.AddStep(stepDto.StepNumber, stepDto.InstructionText.Trim());
        }
        Console.WriteLine("B4 saving recipe");
        // Save recipe
        await _recipeRepository.AddAsync(recipe, cancellationToken);
        Console.WriteLine("After saving recipe");

        // Return DTO
        return Result.Success(recipe.ToDto());
    }
}