using BuildingBlocks.Common;
using Core.Application.Abstractions;
using Core.Application.Commands.Recipe;
using Core.Application.DTOs;
using Core.Application.Extensions;
using Core.Application.Interfaces;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Core.Application.Handlers.Recipe;

public class UpdateRecipeCommandHandler : ICommandHandler<UpdateRecipeCommand, RecipeDto>
{
    private readonly IRecipeRepository _recipeRepository;
    private readonly IImageStorageService _imageStorageService;
    private readonly ILogger<UpdateRecipeCommandHandler> _logger;

    public UpdateRecipeCommandHandler(
        IRecipeRepository recipeRepository,
        IImageStorageService imageStorageService,
        ILogger<UpdateRecipeCommandHandler> logger)
    {
        _recipeRepository = recipeRepository;
        _imageStorageService = imageStorageService;
        _logger = logger;
    }

    public async Task<Result<RecipeDto>> Handle(UpdateRecipeCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("UpdateRecipeCommand received - RecipeId: {RecipeId}, UserId: {UserId}, Title: '{Title}', Category: '{Category}', IngredientsCount: {IngredientsCount}, StepsCount: {StepsCount}", 
            request.Id, request.UserId, request.Title, request.Category, request.Ingredients?.Count ?? 0, request.Steps?.Count ?? 0);

        // Get existing recipe
        var recipe = await _recipeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (recipe == null)
        {
            _logger.LogWarning("Recipe not found for update - RecipeId: {RecipeId}", request.Id);
            return Result.Failure<RecipeDto>("Recipe not found");
        }

        // Check ownership
        if (!recipe.IsOwnedBy(request.UserId))
        {
            _logger.LogWarning("Access denied for recipe update - RecipeId: {RecipeId}, UserId: {UserId}, OwnerId: {OwnerId}", 
                request.Id, request.UserId, recipe.UserId);
            return Result.Failure<RecipeDto>("Access denied");
        }

        // Validate required fields
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            _logger.LogWarning("Validation failed: Title is required - RecipeId: {RecipeId}", request.Id);
            return Result.Failure<RecipeDto>("Title is required");
        }

        if (string.IsNullOrWhiteSpace(request.Category))
        {
            _logger.LogWarning("Validation failed: Category is required - RecipeId: {RecipeId}", request.Id);
            return Result.Failure<RecipeDto>("Category is required");
        }

        if (request.Ingredients == null || !request.Ingredients.Any())
        {
            _logger.LogWarning("Validation failed: At least one ingredient is required - RecipeId: {RecipeId}, IngredientsCount: {Count}", 
                request.Id, request.Ingredients?.Count ?? 0);
            return Result.Failure<RecipeDto>("At least one ingredient is required");
        }

        if (request.Steps == null || !request.Steps.Any())
        {
            _logger.LogWarning("Validation failed: At least one step is required - RecipeId: {RecipeId}, StepsCount: {Count}", 
                request.Id, request.Steps?.Count ?? 0);
            return Result.Failure<RecipeDto>("At least one step is required");
        }

        // Validate ingredients have required fields
        var invalidIngredients = request.Ingredients.Where(i => string.IsNullOrWhiteSpace(i.Name) || string.IsNullOrWhiteSpace(i.Quantity) || string.IsNullOrWhiteSpace(i.Unit)).ToList();
        if (invalidIngredients.Any())
        {
            _logger.LogWarning("Validation failed: Invalid ingredients found - RecipeId: {RecipeId}, InvalidCount: {Count}", 
                request.Id, invalidIngredients.Count);
            return Result.Failure<RecipeDto>("All ingredients must have name, quantity, and unit");
        }

        // Validate steps have required fields and auto-assign step numbers if needed
        for (int i = 0; i < request.Steps.Count; i++)
        {
            var step = request.Steps[i];
            if (string.IsNullOrWhiteSpace(step.InstructionText))
            {
                _logger.LogWarning("Validation failed: Step {Index} has empty instruction text - RecipeId: {RecipeId}", 
                    i + 1, request.Id);
                return Result.Failure<RecipeDto>("All steps must have instruction text");
            }
            
            // Auto-assign step number if not set or invalid
            if (step.StepNumber <= 0)
            {
                _logger.LogDebug("Auto-assigning step number {StepNumber} to step at index {Index} - RecipeId: {RecipeId}", 
                    i + 1, i, request.Id);
                step.StepNumber = i + 1;
            }
        }

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

        _logger.LogDebug("Starting recipe update process - RecipeId: {RecipeId}, IngredientsCount: {IngredientsCount}, StepsCount: {StepsCount}", 
            recipe.Id, newIngredients.Count, newSteps.Count);

        // Save changes
        try
        {
            await _recipeRepository.UpdateAsync(recipe, cancellationToken);
            _logger.LogInformation("Recipe successfully updated - RecipeId: {RecipeId}", recipe.Id);
        }
        catch (Exception ex) when (ex.GetType().Name == "DbUpdateConcurrencyException")
        {
            _logger.LogWarning("Concurrency conflict during recipe update - RecipeId: {RecipeId}", recipe.Id);
            return Result.Failure<RecipeDto>("Recipe was modified by another user. Please refresh and try again.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update recipe in repository - RecipeId: {RecipeId}", recipe.Id);
            return Result.Failure<RecipeDto>($"Failed to update recipe: {ex.Message}");
        }

        // Check if recipe is favorite
        var isFavorite = await _recipeRepository.IsRecipeFavoriteAsync(recipe.Id, request.UserId, cancellationToken);

        // Return DTO
        _logger.LogInformation("Recipe update completed successfully - RecipeId: {RecipeId}, IsFavorite: {IsFavorite}", 
            recipe.Id, isFavorite);
        return Result.Success(recipe.ToDto(isFavorite));
    }
}