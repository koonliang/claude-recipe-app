using Amazon.Lambda.AspNetCoreServer;
using BuildingBlocks.Observability;
using Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilogLogging();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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