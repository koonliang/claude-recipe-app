using BuildingBlocks.Common;
using FluentAssertions;
using Xunit;

namespace BuildingBlocks.Common.Tests;

public class ResultTests
{
    [Fact]
    public void Success_ShouldCreateSuccessResult()
    {
        var result = Result.Success();

        result.IsSuccess.Should().BeTrue();
        result.IsFailure.Should().BeFalse();
        result.Error.Should().BeEmpty();
    }

    [Fact]
    public void Failure_ShouldCreateFailureResult()
    {
        const string error = "Something went wrong";
        var result = Result.Failure(error);

        result.IsSuccess.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(error);
    }

    [Fact]
    public void Success_WithValue_ShouldCreateSuccessResult()
    {
        const string value = "test";
        var result = Result.Success(value);

        result.IsSuccess.Should().BeTrue();
        result.IsFailure.Should().BeFalse();
        result.Error.Should().BeEmpty();
        result.Value.Should().Be(value);
    }

    [Fact]
    public void Failure_WithValue_ShouldCreateFailureResult()
    {
        const string error = "Something went wrong";
        var result = Result.Failure<string>(error);

        result.IsSuccess.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(error);
        result.Value.Should().BeNull();
    }
}