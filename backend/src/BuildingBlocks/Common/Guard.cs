using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;

namespace BuildingBlocks.Common;

public static class Guard
{
    public static void Against([DoesNotReturnIf(true)] bool condition, string message, [CallerArgumentExpression("condition")] string? paramName = null)
    {
        if (condition)
            throw new ArgumentException(message, paramName);
    }

    public static void AgainstNull([NotNull] object? value, [CallerArgumentExpression("value")] string? paramName = null)
    {
        if (value is null)
            throw new ArgumentNullException(paramName);
    }

    public static void AgainstNullOrEmpty([NotNull] string? value, [CallerArgumentExpression("value")] string? paramName = null)
    {
        if (string.IsNullOrEmpty(value))
            throw new ArgumentException("Value cannot be null or empty.", paramName);
    }

    public static void AgainstNullOrWhiteSpace([NotNull] string? value, [CallerArgumentExpression("value")] string? paramName = null)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Value cannot be null or whitespace.", paramName);
    }
}