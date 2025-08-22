using Core.Domain.ValueObjects;

namespace Core.Domain.Entities;

public class User : Entity
{
    public string Name { get; private set; } = string.Empty;
    public Email Email { get; private set; } = null!;
    public string PasswordHash { get; private set; } = string.Empty;
    public DateTime? EmailVerifiedAt { get; private set; }
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetExpiry { get; private set; }

    public List<Recipe> Recipes { get; private set; } = new();
    public List<UserRecipeFavorite> Favorites { get; private set; } = new();

    private User() : base() { }

    public User(string name, Email email, string passwordHash) : base()
    {
        Name = name;
        Email = email;
        PasswordHash = passwordHash;
    }

    public void UpdateName(string name)
    {
        Name = name;
        SetUpdatedAt();
    }

    public void UpdatePassword(string passwordHash)
    {
        PasswordHash = passwordHash;
        PasswordResetToken = null;
        PasswordResetExpiry = null;
        SetUpdatedAt();
    }

    public void SetPasswordResetToken(string token, DateTime expiry)
    {
        PasswordResetToken = token;
        PasswordResetExpiry = expiry;
        SetUpdatedAt();
    }

    public void VerifyEmail()
    {
        EmailVerifiedAt = DateTime.UtcNow;
        SetUpdatedAt();
    }

    public bool IsPasswordResetTokenValid(string token)
    {
        return PasswordResetToken == token &&
               PasswordResetExpiry.HasValue &&
               PasswordResetExpiry.Value > DateTime.UtcNow;
    }
}