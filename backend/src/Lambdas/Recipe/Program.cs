using Amazon.Lambda.AspNetCoreServer;
using BuildingBlocks.Observability;
using Infrastructure.Persistence;
using Core.Application.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add environment variables to configuration
builder.Configuration.AddEnvironmentVariables();

// Validate configuration on startup
try
{
    builder.Configuration.ValidateConfigurationOnStartup();
}
catch (Exception ex)
{
    Console.WriteLine($"Configuration validation failed: {ex.Message}");
    throw;
}

builder.Host.UseSerilogLogging();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add configuration options with validation
builder.Services.AddConfigurationOptions(builder.Configuration);

builder.Services.AddDatabase(builder.Configuration);

builder.Services.AddScoped<IRecipeService, RecipeService>();

builder.Services.AddAWSLambdaHosting(LambdaEventSource.RestApi);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/recipes", (IRecipeService recipeService) => 
{
    return Results.Ok(recipeService.GetRecipes());
});

app.Run();

public interface IRecipeService
{
    IEnumerable<Recipe> GetRecipes();
}

public class RecipeService : IRecipeService
{
    public IEnumerable<Recipe> GetRecipes()
    {
        return new List<Recipe>
        {
            new Recipe { Id = Guid.NewGuid(), Name = "Sample Recipe", Description = "A sample recipe" }
        };
    }
}

public class Recipe
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}