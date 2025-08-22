namespace Core.Domain.Entities;

public class Step : Entity
{
    public int StepNumber { get; private set; }
    public string InstructionText { get; private set; } = string.Empty;
    public Guid RecipeId { get; private set; }

    public Recipe Recipe { get; private set; } = null!;

    private Step() : base() { }

    public Step(int stepNumber, string instructionText, Guid recipeId) : base()
    {
        StepNumber = stepNumber;
        InstructionText = instructionText;
        RecipeId = recipeId;
    }

    public void Update(int stepNumber, string instructionText)
    {
        StepNumber = stepNumber;
        InstructionText = instructionText;
        SetUpdatedAt();
    }

    public void SetRecipeId(Guid recipeId)
    {
        RecipeId = recipeId;
    }
}