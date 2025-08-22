using System.Text.RegularExpressions;
using BuildingBlocks.Common;

namespace Core.Domain.ValueObjects;

public class Email : ValueObject
{
    private static readonly Regex EmailRegex = new(
        @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public string Value { get; private set; }

    private Email(string value)
    {
        Value = value;
    }

    public static Result<Email> Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<Email>("Email is required");

        email = email.Trim().ToLowerInvariant();

        if (email.Length > 254)
            return Result.Failure<Email>("Email is too long");

        if (!EmailRegex.IsMatch(email))
            return Result.Failure<Email>("Email format is invalid");

        return Result.Success(new Email(email));
    }

    public static implicit operator string(Email email) => email.Value;

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}