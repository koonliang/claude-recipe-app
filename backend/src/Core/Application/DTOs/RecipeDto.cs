namespace Core.Application.DTOs;

public class RecipeDto : BaseDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public List<IngredientDto> Ingredients { get; set; } = new();
    public List<StepDto> Steps { get; set; } = new();
    public bool IsFavorite { get; set; }
    public Guid CreatedByUserId { get; set; }
}