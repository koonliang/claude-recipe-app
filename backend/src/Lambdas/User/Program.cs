using Amazon.Lambda.AspNetCoreServer;
using BuildingBlocks.Observability;
using Infrastructure.Persistence;
using Core.Application.Configuration;
using DotNetEnv;

// Load .env file for local development
Env.Load();

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

builder.Services.AddScoped<IUserService, UserService>();

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

app.MapGet("/users", (IUserService userService) => 
{
    return Results.Ok(userService.GetUsers());
});

app.MapGet("/users/{id:guid}", (Guid id, IUserService userService) => 
{
    var user = userService.GetUser(id);
    return user is not null ? Results.Ok(user) : Results.NotFound();
});

app.Run();

public interface IUserService
{
    IEnumerable<User> GetUsers();
    User? GetUser(Guid id);
}

public class UserService : IUserService
{
    private readonly List<User> _users = new()
    {
        new User { Id = Guid.NewGuid(), Email = "test@example.com", Name = "Test User" },
        new User { Id = Guid.NewGuid(), Email = "admin@example.com", Name = "Admin User" }
    };

    public IEnumerable<User> GetUsers()
    {
        return _users;
    }

    public User? GetUser(Guid id)
    {
        return _users.FirstOrDefault(u => u.Id == id);
    }
}

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}