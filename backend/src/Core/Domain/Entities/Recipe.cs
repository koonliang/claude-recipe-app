namespace Core.Domain.Entities;

public class Recipe : Entity
{
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public string? PhotoUrl { get; private set; }
    public Guid UserId { get; private set; }

    public User User { get; private set; } = null!;
    public List<Ingredient> Ingredients { get; private set; } = new();
    public List<Step> Steps { get; private set; } = new();
    public List<UserRecipeFavorite> Favorites { get; private set; } = new();

    private Recipe() : base() { }

    public Recipe(string title, string description, string category, Guid userId, string? photoUrl = null) : base()
    {
        Title = title;
        Description = description;
        Category = category;
        UserId = userId;
        PhotoUrl = photoUrl;
    }

    public void UpdateBasicInfo(string title, string description, string category, string? photoUrl = null)
    {
        Title = title;
        Description = description;
        Category = category;
        PhotoUrl = photoUrl;
        SetUpdatedAt();
    }

    public void AddIngredient(string name, string quantity, string unit)
    {
        var ingredient = new Ingredient(name, quantity, unit, Id);
        Ingredients.Add(ingredient);
        SetUpdatedAt();
    }

    public void UpdateIngredients(List<Ingredient> newIngredients)
    {
        Ingredients.Clear();
        foreach (var ingredient in newIngredients)
        {
            ingredient.SetRecipeId(Id);
            Ingredients.Add(ingredient);
        }
        SetUpdatedAt();
    }

    public void AddStep(int stepNumber, string instructionText)
    {
        var step = new Step(stepNumber, instructionText, Id);
        Steps.Add(step);
        SetUpdatedAt();
    }

    public void UpdateSteps(List<Step> newSteps)
    {
        Steps.Clear();
        foreach (var step in newSteps)
        {
            step.SetRecipeId(Id);
            Steps.Add(step);
        }
        SetUpdatedAt();
    }

    public bool IsOwnedBy(Guid userId)
    {
        return UserId == userId;
    }
}