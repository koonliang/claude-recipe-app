using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public class RecipeAppDbContext : DbContext
{
    public RecipeAppDbContext(DbContextOptions<RecipeAppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}