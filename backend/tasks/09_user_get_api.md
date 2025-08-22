# Task 9: Implement GET User API for Backend User Lambda

## Overview
Implement a GET API endpoint to retrieve user profile information in the user lambda, following the existing CQRS pattern and architectural conventions.

## Requirements
- Add GET `/auth/profile` endpoint to retrieve authenticated user's profile
- Follow existing CQRS pattern with Query and QueryHandler
- Require JWT authentication
- Return user profile data (ID, FullName, Email)
- Handle authentication and authorization properly

## Implementation Steps

### 1. Create GetUserProfileQuery
**File**: `backend/src/Core/Application/Queries/User/GetUserProfileQuery.cs`
- Define query record with UserId parameter
- Follow same pattern as existing Recipe queries
- Implement IQuery interface returning UserDto

### 2. Create GetUserProfileQueryHandler
**File**: `backend/src/Core/Application/Handlers/User/GetUserProfileQueryHandler.cs`
- Implement IQueryHandler<GetUserProfileQuery, UserDto>
- Use IUserRepository to fetch user by ID
- Map User entity to UserDto using existing patterns
- Handle user not found scenarios with appropriate Result pattern

### 3. Update AuthController
**File**: `backend/src/Lambdas/User/Controllers/AuthController.cs`
- Add GET `/auth/profile` endpoint
- Add `[Authorize]` attribute for authentication
- Extract user ID from JWT claims (ClaimTypes.NameIdentifier or "sub")
- Use MediatR to send GetUserProfileQuery
- Return appropriate HTTP responses (200, 401, 404)

### 4. Add Required Dependencies
- Import Microsoft.AspNetCore.Authorization namespace
- Import System.Security.Claims for claim extraction
- Ensure JWT authentication is properly configured

## API Specification

### Endpoint Details
- **Method**: GET
- **Route**: `/auth/profile`
- **Authorization**: Required (JWT Bearer token)
- **Headers**: Authorization: Bearer {jwt_token}

### Response Format
**Success (200)**:
```json
{
  "id": "guid",
  "fullName": "string",
  "email": "string"
}
```

**Unauthorized (401)**:
```json
{
  "error": "Unauthorized"
}
```

**User Not Found (404)**:
```json
{
  "error": "User not found"
}
```

## Testing Checklist
- [ ] Test endpoint with valid JWT token
- [ ] Test with invalid/expired JWT token
- [ ] Test with missing Authorization header
- [ ] Test with non-existent user ID
- [ ] Verify response format matches UserDto structure
- [ ] Test claims extraction works correctly

## Dependencies
- Existing UserDto class
- IUserRepository interface
- JWT authentication middleware
- MediatR for CQRS pattern
- Authorization middleware

## Notes
- Follow existing architectural patterns from Recipe lambda
- Maintain consistency with error handling patterns
- Ensure user can only access their own profile
- Use existing Result pattern for error handling