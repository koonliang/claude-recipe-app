using Core.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace Core.Domain.Tests;

public class EntityTests
{
    private class TestEntity : Entity
    {
        public TestEntity() : base() { }
        public TestEntity(Guid id) : base(id) { }
        public string Name { get; set; } = string.Empty;
    }

    [Fact]
    public void Constructor_ShouldGenerateId_WhenNoIdProvided()
    {
        var entity = new TestEntity();

        entity.Id.Should().NotBe(Guid.Empty);
        entity.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Constructor_ShouldUseProvidedId_WhenIdProvided()
    {
        var id = Guid.NewGuid();
        var entity = new TestEntity(id);

        entity.Id.Should().Be(id);
        entity.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Equals_ShouldReturnTrue_WhenEntitiesHaveSameId()
    {
        var id = Guid.NewGuid();
        var entity1 = new TestEntity(id);
        var entity2 = new TestEntity(id);

        entity1.Equals(entity2).Should().BeTrue();
    }

    [Fact]
    public void Equals_ShouldReturnFalse_WhenEntitiesHaveDifferentIds()
    {
        var entity1 = new TestEntity();
        var entity2 = new TestEntity();

        entity1.Equals(entity2).Should().BeFalse();
    }

    [Fact]
    public void GetHashCode_ShouldBeEqual_WhenEntitiesHaveSameId()
    {
        var id = Guid.NewGuid();
        var entity1 = new TestEntity(id);
        var entity2 = new TestEntity(id);

        entity1.GetHashCode().Should().Be(entity2.GetHashCode());
    }
}