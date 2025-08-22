namespace Core.Domain.Entities;

public class UserRecipeFavorite : Entity
{
    public Guid UserId { get; private set; }
    public Guid RecipeId { get; private set; }

    public User User { get; private set; } = null!;
    public Recipe Recipe { get; private set; } = null!;

    private UserRecipeFavorite() : base() { }

    public UserRecipeFavorite(Guid userId, Guid recipeId) : base()
    {
        UserId = userId;
        RecipeId = recipeId;
    }
}