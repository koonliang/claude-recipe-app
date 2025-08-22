using Microsoft.EntityFrameworkCore;
using Core.Domain.Entities;
using Core.Domain.ValueObjects;

namespace Infrastructure.Persistence;

public class RecipeAppDbContext : DbContext
{
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Recipe> Recipes { get; set; } = null!;
    public DbSet<Ingredient> Ingredients { get; set; } = null!;
    public DbSet<Step> Steps { get; set; } = null!;
    public DbSet<UserRecipeFavorite> UserRecipeFavorites { get; set; } = null!;

    public RecipeAppDbContext(DbContextOptions<RecipeAppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User entity configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(256);
            entity.Property(e => e.PasswordResetToken).HasMaxLength(128);
            entity.Property(e => e.CreatedAt).IsRequired();
            
            // Email value object configuration
            entity.OwnsOne(e => e.Email, email =>
            {
                email.Property(e => e.Value)
                    .HasColumnName("Email")
                    .IsRequired()
                    .HasMaxLength(254);
                    
                email.HasIndex(e => e.Value).IsUnique();
            });

            // Relationships
            entity.HasMany(e => e.Recipes)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Favorites)
                .WithOne(f => f.User)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Recipe entity configuration
        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PhotoUrl).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();

            // Relationships
            entity.HasOne(e => e.User)
                .WithMany(u => u.Recipes)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Ingredients)
                .WithOne(i => i.Recipe)
                .HasForeignKey(i => i.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Steps)
                .WithOne(s => s.Recipe)
                .HasForeignKey(s => s.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Favorites)
                .WithOne(f => f.Recipe)
                .HasForeignKey(f => f.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Ingredient entity configuration
        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Quantity).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Unit).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CreatedAt).IsRequired();

            // Relationships
            entity.HasOne(e => e.Recipe)
                .WithMany(r => r.Ingredients)
                .HasForeignKey(e => e.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Step entity configuration
        modelBuilder.Entity<Step>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StepNumber).IsRequired();
            entity.Property(e => e.InstructionText).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).IsRequired();

            // Relationships
            entity.HasOne(e => e.Recipe)
                .WithMany(r => r.Steps)
                .HasForeignKey(e => e.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);

            // Index for ordering steps
            entity.HasIndex(e => new { e.RecipeId, e.StepNumber }).IsUnique();
        });

        // UserRecipeFavorite entity configuration
        modelBuilder.Entity<UserRecipeFavorite>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).IsRequired();

            // Relationships
            entity.HasOne(e => e.User)
                .WithMany(u => u.Favorites)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Recipe)
                .WithMany(r => r.Favorites)
                .HasForeignKey(e => e.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint to prevent duplicate favorites
            entity.HasIndex(e => new { e.UserId, e.RecipeId }).IsUnique();
        });
    }
}