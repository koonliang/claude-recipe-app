namespace Core.Domain.Entities;

public class Ingredient : Entity
{
    public string Name { get; private set; } = string.Empty;
    public string Quantity { get; private set; } = string.Empty;
    public string Unit { get; private set; } = string.Empty;
    public Guid RecipeId { get; private set; }

    public Recipe Recipe { get; private set; } = null!;

    private Ingredient() : base() { }

    public Ingredient(string name, string quantity, string unit, Guid recipeId) : base()
    {
        Name = name;
        Quantity = quantity;
        Unit = unit;
        RecipeId = recipeId;
    }

    public void Update(string name, string quantity, string unit)
    {
        Name = name;
        Quantity = quantity;
        Unit = unit;
        SetUpdatedAt();
    }

    public void SetRecipeId(Guid recipeId)
    {
        RecipeId = recipeId;
    }
}