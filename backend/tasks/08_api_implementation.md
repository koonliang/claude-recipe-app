# Backend API Implementation - Step 8

## Overview

This document outlines the implementation of REST API endpoints for the MyRecipeBox application, providing authentication services and recipe management functionality. The implementation follows Clean Architecture principles with CQRS patterns using MediatR.

## Authentication Endpoints

### POST /auth/signup
**Description**: Register a new user account

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com", 
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "full_name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

**Validation Rules**:
- Name: Required, 2-100 characters
- Email: Required, valid email format, unique
- Password: Required, minimum 8 characters, must contain uppercase, lowercase, number, special character

**Error Responses**:
- 400 Bad Request: Validation errors
- 409 Conflict: Email already exists

### POST /auth/login
**Description**: Authenticate user and return JWT token

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "full_name": "John Doe", 
    "email": "john.doe@example.com"
  }
}
```

**Error Responses**:
- 400 Bad Request: Missing email or password
- 401 Unauthorized: Invalid credentials

### POST /auth/forgot-password
**Description**: Request password reset email

**Request Body**:
```json
{
  "email": "john.doe@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset email sent if account exists"
}
```

**Notes**: 
- Always returns 200 to prevent email enumeration
- Generates secure reset token with expiration
- Sends email with reset link

### POST /auth/reset-password
**Description**: Reset password using token from email

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset successful"
}
```

**Error Responses**:
- 400 Bad Request: Invalid or expired token
- 400 Bad Request: Password validation failed

## Recipe Management Endpoints

### GET /recipes
**Description**: Retrieve list of recipes with optional filtering

**Query Parameters**:
- `category` (optional): Filter by recipe category
- `search` (optional): Search in title and description
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Headers**:
- `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "recipes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Chocolate Chip Cookies",
      "description": "Classic homemade chocolate chip cookies",
      "category": "Dessert",
      "photo_url": "https://example.com/images/cookies.jpg",
      "ingredients": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "name": "All-purpose flour",
          "quantity": "2",
          "unit": "cups"
        }
      ],
      "steps": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440003", 
          "step_number": 1,
          "instruction_text": "Preheat oven to 375°F"
        }
      ],
      "is_favorite": false,
      "created_at": "2024-01-15T10:30:00Z",
      "createdByUserId": "550e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### POST /recipes
**Description**: Create a new recipe

**Headers**:
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade chocolate chip cookies",
  "category": "Dessert",
  "photo": "base64-encoded-image-data",
  "ingredients": [
    {
      "name": "All-purpose flour",
      "quantity": "2", 
      "unit": "cups"
    },
    {
      "name": "Chocolate chips",
      "quantity": "1",
      "unit": "cup"
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "instruction_text": "Preheat oven to 375°F"
    },
    {
      "step_number": 2,
      "instruction_text": "Mix dry ingredients in a bowl"
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade chocolate chip cookies",
  "category": "Dessert", 
  "photo_url": "https://example.com/images/cookies.jpg",
  "ingredients": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "All-purpose flour",
      "quantity": "2",
      "unit": "cups"
    }
  ],
  "steps": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "step_number": 1, 
      "instruction_text": "Preheat oven to 375°F"
    }
  ],
  "is_favorite": false,
  "created_at": "2024-01-15T10:30:00Z",
  "createdByUserId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Validation Rules**:
- Title: Required, 1-200 characters
- Description: Optional, max 1000 characters
- Category: Required, from predefined list
- Photo: Optional, max 5MB, JPG/PNG only
- Ingredients: At least 1 required
- Steps: At least 1 required

### GET /recipes/:id
**Description**: Retrieve detailed recipe information

**Headers**:
- `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade chocolate chip cookies",
  "category": "Dessert",
  "photo_url": "https://example.com/images/cookies.jpg", 
  "ingredients": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "All-purpose flour",
      "quantity": "2",
      "unit": "cups"
    }
  ],
  "steps": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "step_number": 1,
      "instruction_text": "Preheat oven to 375°F"
    }
  ],
  "is_favorite": true,
  "created_at": "2024-01-15T10:30:00Z",
  "createdByUserId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses**:
- 404 Not Found: Recipe not found
- 403 Forbidden: Not recipe owner

### PUT /recipes/:id
**Description**: Update existing recipe

**Headers**:
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

**Request Body**: Same as POST /recipes (partial updates allowed)

**Response** (200 OK): Updated recipe object

**Error Responses**:
- 404 Not Found: Recipe not found
- 403 Forbidden: Not recipe owner

### DELETE /recipes/:id
**Description**: Delete a recipe

**Headers**:
- `Authorization: Bearer {jwt_token}`

**Response** (204 No Content)

**Error Responses**:
- 404 Not Found: Recipe not found
- 403 Forbidden: Not recipe owner

### POST /recipes/:id/favorite
**Description**: Mark recipe as favorite

**Headers**:
- `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "message": "Recipe marked as favorite"
}
```

### DELETE /recipes/:id/favorite
**Description**: Remove favorite status from recipe

**Headers**:
- `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "message": "Recipe removed from favorites"
}
```

## Implementation Architecture

### Domain Layer

#### Entities
```csharp
// Core.Domain.Entities.User
public class User : Entity
{
    public string Name { get; private set; }
    public Email Email { get; private set; }
    public string PasswordHash { get; private set; }
    public DateTime? EmailVerifiedAt { get; private set; }
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetExpiry { get; private set; }
}

// Core.Domain.Entities.Recipe
public class Recipe : Entity
{
    public string Title { get; private set; }
    public string Description { get; private set; }
    public string Category { get; private set; }
    public string? PhotoUrl { get; private set; }
    public Guid UserId { get; private set; }
    public User User { get; private set; }
    public List<Ingredient> Ingredients { get; private set; }
    public List<Step> Steps { get; private set; }
    public List<UserRecipeFavorite> Favorites { get; private set; }
}

// Core.Domain.Entities.Ingredient
public class Ingredient : Entity
{
    public string Name { get; private set; }
    public string Quantity { get; private set; }
    public string Unit { get; private set; }
    public Guid RecipeId { get; private set; }
    public Recipe Recipe { get; private set; }
}

// Core.Domain.Entities.Step
public class Step : Entity
{
    public int StepNumber { get; private set; }
    public string InstructionText { get; private set; }
    public Guid RecipeId { get; private set; }
    public Recipe Recipe { get; private set; }
}

// Core.Domain.Entities.UserRecipeFavorite
public class UserRecipeFavorite : Entity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; }
    public Guid RecipeId { get; private set; }
    public Recipe Recipe { get; private set; }
}
```

#### Value Objects
```csharp
// Core.Domain.ValueObjects.Email
public class Email : ValueObject
{
    public string Value { get; private set; }
    
    private Email(string value)
    {
        Value = value;
    }
    
    public static Result<Email> Create(string email)
    {
        // Email validation logic
    }
}
```

### Application Layer

#### Commands
```csharp
// Authentication Commands
public record SignupCommand(string Name, string Email, string Password) : ICommand<AuthenticationResult>;
public record LoginCommand(string Email, string Password) : ICommand<AuthenticationResult>;
public record ForgotPasswordCommand(string Email) : ICommand;
public record ResetPasswordCommand(string Token, string NewPassword) : ICommand;

// Recipe Commands  
public record CreateRecipeCommand(string Title, string Description, string Category, 
    string? Photo, List<CreateIngredientDto> Ingredients, List<CreateStepDto> Steps) : ICommand<RecipeDto>;
public record UpdateRecipeCommand(Guid Id, string Title, string Description, string Category,
    string? Photo, List<UpdateIngredientDto> Ingredients, List<UpdateStepDto> Steps) : ICommand<RecipeDto>;
public record DeleteRecipeCommand(Guid Id) : ICommand;
public record ToggleFavoriteCommand(Guid RecipeId, bool IsFavorite) : ICommand;
```

#### Queries
```csharp
public record GetRecipesQuery(string? Category, string? Search, int Page, int Limit) : IQuery<PagedResult<RecipeDto>>;
public record GetRecipeByIdQuery(Guid Id) : IQuery<RecipeDto>;
```

#### DTOs
```csharp
public class UserDto : BaseDto
{
    public string FullName { get; set; }
    public string Email { get; set; }
}

public class RecipeDto : BaseDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Category { get; set; }
    public string? PhotoUrl { get; set; }
    public List<IngredientDto> Ingredients { get; set; }
    public List<StepDto> Steps { get; set; }
    public bool IsFavorite { get; set; }
    public Guid CreatedByUserId { get; set; }
}

public class IngredientDto : BaseDto
{
    public string Name { get; set; }
    public string Quantity { get; set; }
    public string Unit { get; set; }
}

public class StepDto : BaseDto
{
    public int StepNumber { get; set; }
    public string InstructionText { get; set; }
}

public class AuthenticationResult
{
    public string Token { get; set; }
    public UserDto User { get; set; }
}
```

### Infrastructure Layer

#### Database Context Updates
```csharp
public class RecipeAppDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<Ingredient> Ingredients { get; set; }
    public DbSet<Step> Steps { get; set; }
    public DbSet<UserRecipeFavorite> UserRecipeFavorites { get; set; }
}
```

#### Services
```csharp
public interface IJwtTokenService
{
    string GenerateToken(User user);
    ClaimsPrincipal? ValidateToken(string token);
}

public interface IPasswordService  
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string email, string resetToken);
}

public interface IImageStorageService
{
    Task<string> UploadImageAsync(string base64Image, string fileName);
    Task DeleteImageAsync(string imageUrl);
}
```

### Lambda Functions

#### User Lambda (Authentication)
- Controllers: AuthController
- Endpoints: /auth/signup, /auth/login, /auth/forgot-password, /auth/reset-password
- Middleware: Error handling, CORS, request logging

#### Recipe Lambda (Recipe Management)  
- Controllers: RecipesController
- Endpoints: /recipes, /recipes/:id, /recipes/:id/favorite
- Middleware: JWT authentication, error handling, CORS, request logging

## Security Considerations

1. **Password Security**: Use bcrypt for password hashing
2. **JWT Security**: Use strong secret key, appropriate expiration times
3. **Input Validation**: Comprehensive validation for all inputs
4. **Authorization**: Users can only access/modify their own recipes
5. **Image Upload**: Validate file types and sizes, scan for malware
6. **Rate Limiting**: Implement rate limiting for authentication endpoints
7. **CORS**: Configure appropriate CORS policies

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      }
    ]
  }
}
```

### HTTP Status Codes
- 200 OK: Successful GET, PUT operations
- 201 Created: Successful POST operations
- 204 No Content: Successful DELETE operations
- 400 Bad Request: Validation errors, malformed requests
- 401 Unauthorized: Authentication required or failed
- 403 Forbidden: Access denied (user not owner)
- 404 Not Found: Resource not found
- 409 Conflict: Resource already exists (email signup)
- 422 Unprocessable Entity: Business logic validation failed
- 500 Internal Server Error: Unexpected server errors

## Testing Strategy

1. **Unit Tests**: Test all command/query handlers, domain logic
2. **Integration Tests**: Test API endpoints with real database
3. **Authentication Tests**: Test JWT generation, validation, expiration
4. **Authorization Tests**: Ensure users can only access their data
5. **Validation Tests**: Test all input validation scenarios
6. **Error Handling Tests**: Test error responses and edge cases