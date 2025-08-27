using Amazon.Lambda.AspNetCoreServer;
using BuildingBlocks.Observability;
using Core.Application.Configuration;
using Authorizer.Services;
using DotNetEnv;

// Load .env file for local development
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add environment variables to configuration
builder.Configuration.AddEnvironmentVariables();

// Skip shared configuration validation - Authorizer only needs JWT settings
// builder.Configuration.ValidateConfigurationOnStartup();

builder.Host.UseSerilogLogging();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Skip shared configuration options - only add JWT configuration
// builder.Services.AddConfigurationOptions(builder.Configuration);

// Add JWT options
builder.Services.AddSingleton<JwtOptions>(provider => 
{
    var config = provider.GetRequiredService<IConfiguration>();
    return config.GetSection("Jwt").Get<JwtOptions>() ?? throw new InvalidOperationException("JWT configuration is missing");
});

builder.Services.AddScoped<ITokenValidator, TokenValidator>();

// For local development without Lambda hosting

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.MapControllers();

app.Run();

