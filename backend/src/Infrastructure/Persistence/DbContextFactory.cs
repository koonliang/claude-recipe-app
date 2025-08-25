using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Persistence;

public class RecipeAppDbContextFactory : IDesignTimeDbContextFactory<RecipeAppDbContext>
{
    public RecipeAppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<RecipeAppDbContext>();
        
        // Use a default connection string for migrations - use a safe default that doesn't require real connection
        var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING") 
            ?? "Server=localhost;Database=RecipeApp_Dev;Uid=admin;Pwd=pass1234;";
            
        // Use a static server version for migrations to avoid connection attempts
        optionsBuilder.UseMySql(connectionString, ServerVersion.Parse("8.0.36-mysql"));

        return new RecipeAppDbContext(optionsBuilder.Options);
    }
}