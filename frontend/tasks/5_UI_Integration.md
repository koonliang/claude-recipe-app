# UI Integration with Backend APIs - TODO

**Requirements**: Section 5 from requirements.md - API Endpoints (UI Integration)

---

## 📋 Implementation Checklist

### ✅ Authentication Service Integration

#### User API Endpoints Integration
- [ ] **POST /auth/signup**
  - Request payload: `{ name: string, email: string, password: string }`
  - Handle success response with user data and JWT token
  - Store JWT token securely using expo-secure-store
  - Navigate to home screen on successful signup
  - Handle validation errors (email format, password strength)
  - Handle API errors (email already exists, server errors)

- [ ] **POST /auth/login** 
  - Request payload: `{ email: string, password: string }`
  - Handle success response with user data and JWT token
  - Store JWT token securely using expo-secure-store
  - Navigate to home screen on successful login
  - Handle incorrect credentials error
  - Handle network and server errors

- [ ] **POST /auth/forgot-password**
  - Request payload: `{ email: string }`
  - Handle success response (confirmation message)
  - Show user-friendly feedback for email sent
  - Handle errors (email not found, server errors)
  - Validate email format before submission

- [ ] **POST /auth/reset-password**
  - Request payload: `{ token: string, newPassword: string }`
  - Extract token from deep link URL parameters
  - Handle success response and navigate to login
  - Handle invalid/expired token errors
  - Validate new password strength

- [ ] **GET /auth/profile**
  - Add Authorization header with JWT token
  - Handle user profile data response
  - Handle unauthorized errors (token expired/invalid)
  - Implement token refresh logic if needed

### ✅ Recipe Service Integration

#### Recipe API Endpoints Integration
- [ ] **GET /recipes**
  - Query parameters: `?category={category}&search={search}&page={page}&limit={limit}`
  - Implement pagination with page/limit parameters (default: page=1, limit=20)
  - Handle category filtering from UI dropdown
  - Handle search query from search bar input
  - Add Authorization header for authenticated requests
  - Parse response and update recipe list state
  - Handle empty results with appropriate UI state
  - Implement pull-to-refresh functionality
  - Handle network and server errors

- [ ] **POST /recipes**
  - Request payload: `CreateRecipeRequest` schema
  - Payload structure:
    ```json
    {
      "title": "string",
      "description": "string", 
      "category": "string",
      "photo": "string",
      "ingredients": [
        {
          "name": "string",
          "quantity": "string",
          "unit": "string"
        }
      ],
      "steps": [
        {
          "stepNumber": "integer",
          "instructionText": "string"
        }
      ]
    }
    ```
  - Add Authorization header with JWT token
  - Handle image upload/encoding for photo field
  - Validate required fields before submission
  - Show loading state during recipe creation
  - Handle success and navigate back to recipe list
  - Handle validation errors and server errors

- [ ] **GET /recipes/{id}**
  - Path parameter: UUID format recipe ID
  - Add Authorization header with JWT token
  - Handle recipe detail response
  - Handle not found errors (404)
  - Handle unauthorized errors
  - Update recipe detail state for UI display

- [ ] **PUT /recipes/{id}**
  - Path parameter: UUID format recipe ID
  - Request payload: `UpdateRecipeRequest` schema
  - Payload structure includes optional ID fields for existing ingredients/steps
  - Add Authorization header with JWT token
  - Handle partial updates (only changed fields)
  - Show loading state during update
  - Handle success and update local state
  - Handle validation and server errors
  - Handle not found errors (recipe deleted by another user)

- [ ] **DELETE /recipes/{id}**
  - Path parameter: UUID format recipe ID
  - Add Authorization header with JWT token
  - Show confirmation dialog before deletion
  - Handle success response and update local state
  - Handle not found errors gracefully
  - Handle unauthorized errors
  - Navigate back to recipe list after successful deletion

- [ ] **POST /recipes/{id}/favorite**
  - Path parameter: UUID format recipe ID
  - Add Authorization header with JWT token
  - Handle success response and update UI state
  - Handle not found errors
  - Handle unauthorized errors
  - Update favorite status in local recipe state

- [ ] **DELETE /recipes/{id}/favorite**
  - Path parameter: UUID format recipe ID
  - Add Authorization header with JWT token
  - Handle success response and update UI state
  - Handle not found errors
  - Handle unauthorized errors
  - Update favorite status in local recipe state

### ✅ API Client Configuration

#### HTTP Client Setup
- [ ] **Axios/Fetch Configuration**
  - Create base API client with proper configuration
  - Set base URL from environment variables
  - Configure default headers (Content-Type: application/json)
  - Set request/response timeout values
  - Configure retry logic for network failures

- [ ] **Request Interceptors**
  - Add Authorization header with JWT token for protected endpoints
  - Add request logging for development environment
  - Handle request transformation if needed
  - Add request ID for tracking

- [ ] **Response Interceptors**
  - Handle successful responses (2xx status codes)
  - Parse error responses and extract meaningful error messages
  - Handle unauthorized responses (401) - trigger logout/token refresh
  - Handle forbidden responses (403) 
  - Handle not found responses (404)
  - Handle server errors (5xx) with user-friendly messages
  - Log response data for development environment

### ✅ Authentication Flow Management

#### JWT Token Management
- [ ] **Token Storage**
  - Use expo-secure-store for secure JWT token storage
  - Store token with appropriate key name
  - Handle storage errors gracefully
  - Clear token on logout

- [ ] **Token Validation**
  - Check token existence on app startup
  - Validate token format and expiration
  - Handle expired tokens (redirect to login)
  - Implement token refresh mechanism if supported by backend

- [ ] **Protected Routes**
  - Check authentication status before accessing protected screens
  - Redirect unauthenticated users to login screen
  - Handle authentication state changes during navigation
  - Implement route guards for authenticated-only screens

#### Authentication Context
- [ ] **Auth Context Setup**
  - Create React Context for authentication state
  - Manage user data, token, and authentication status
  - Provide login, logout, and signup methods
  - Handle authentication state persistence across app restarts

### ✅ Error Handling & User Experience

#### Loading States
- [ ] **Request Loading Indicators**
  - Show loading spinners during API calls
  - Implement skeleton screens for data loading
  - Disable form submissions during processing
  - Show progress indicators for long operations

- [ ] **Global Loading State**
  - Implement app-wide loading state management
  - Show loading overlay for critical operations
  - Handle multiple concurrent requests

#### Error Display
- [ ] **Form Validation Errors**
  - Display inline validation errors for form fields
  - Show field-specific error messages
  - Highlight invalid fields with appropriate styling
  - Clear errors when user corrects input

- [ ] **API Error Messages**
  - Display user-friendly error messages for API failures
  - Handle network connectivity errors
  - Show retry options for failed requests
  - Implement error boundaries for critical failures

- [ ] **Toast/Alert Notifications**
  - Show success messages for completed operations
  - Display error alerts for failed operations
  - Implement dismissible notifications
  - Queue multiple notifications appropriately

### ✅ Data Management & Caching

#### Local State Management
- [ ] **Recipe Data Caching**
  - Cache fetched recipe list locally
  - Update cache on successful create/update/delete operations
  - Implement cache invalidation strategies
  - Handle stale data scenarios

- [ ] **Optimistic Updates**
  - Update UI immediately for user actions (favorites, etc.)
  - Rollback changes on API failures
  - Show pending states for optimistic updates

- [ ] **Offline Support**
  - Cache data for offline viewing
  - Queue operations when offline
  - Sync queued operations when back online
  - Show offline indicators in UI

### ✅ Environment Configuration

#### API Configuration
- [ ] **Environment Variables**
  - Set up development, staging, and production API URLs
  - Configure timeout values per environment
  - Set debug/logging levels per environment
  - Use expo-constants for environment variable access

- [ ] **Base URL Configuration**
  - Configure separate base URLs for User and Recipe APIs if different
  - Handle API versioning in base URLs
  - Support localhost development URLs
  - Implement URL validation

### ✅ Security Implementation

#### API Security
- [ ] **Request Validation**
  - Validate all outgoing data types and formats
  - Sanitize user input before sending to API
  - Handle file upload security (image validation)
  - Implement request rate limiting on client side

- [ ] **Sensitive Data Handling**
  - Never log sensitive data (passwords, tokens)
  - Use secure storage for all sensitive information
  - Implement proper token handling (no localStorage)
  - Handle deep link token parameters securely

### ✅ Testing Integration

#### API Integration Tests
- [ ] **Mock API Responses**
  - Create mock responses for all API endpoints
  - Test success and error scenarios
  - Mock network failures and timeouts
  - Test authentication flows end-to-end

- [ ] **Integration Test Coverage**
  - Test login/logout flows
  - Test recipe CRUD operations
  - Test error handling scenarios
  - Test offline/online state transitions

---

## 🔧 Technical Implementation Details

### API Client Architecture
```typescript
// Example API client structure
class ApiClient {
  private baseURL: string;
  private token?: string;
  
  async request<T>(config: RequestConfig): Promise<T>;
  setAuthToken(token: string): void;
  clearAuthToken(): void;
}

// Separate service classes
class AuthService extends ApiClient;
class RecipeService extends ApiClient;
```

### Error Response Format
```typescript
interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, any>;
}
```

### Authentication Response Format
```typescript
interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
```

### Recipe Response Formats
Based on UserApi.json and RecipeApi.json schemas:
- All recipe operations return appropriate HTTP status codes
- Success responses contain recipe data or confirmation
- Error responses follow standard error format
- UUID format required for all ID parameters

---

## 📱 UI Integration Points

### Screen-to-API Mapping
1. **LoginScreen** → POST /auth/login
2. **SignupScreen** → POST /auth/signup  
3. **ForgotPasswordScreen** → POST /auth/forgot-password
4. **ResetPasswordScreen** → POST /auth/reset-password
5. **HomeScreen/RecipeListScreen** → GET /recipes
6. **RecipeDetailScreen** → GET /recipes/{id}, DELETE /recipes/{id}, POST/DELETE /recipes/{id}/favorite
7. **RecipeFormScreen** → POST /recipes (create), PUT /recipes/{id} (update)

### Real-time UI Updates
- Update recipe lists after create/update/delete operations
- Refresh favorite status across all recipe displays
- Handle authentication state changes globally
- Update user profile information when changed

---

## ⚡ Performance Considerations

### API Optimization
- Implement request debouncing for search queries
- Use pagination for large recipe lists
- Cache frequently accessed data
- Implement efficient image upload handling
- Minimize API calls through smart caching

### Network Efficiency
- Batch API calls where possible
- Implement proper loading states to improve perceived performance
- Use optimistic updates for immediate UI feedback
- Handle slow network conditions gracefully

---

## 🚨 Error Scenarios to Handle

### Authentication Errors
- Invalid credentials
- Expired tokens
- Account lockouts
- Network failures during auth

### Recipe Operation Errors
- Recipe not found (deleted by another user)
- Validation failures
- File upload failures
- Concurrent edit conflicts

### Network Errors
- No internet connection
- Server unavailable
- Request timeouts
- Rate limiting

---

**Dependencies**: 
- expo-secure-store (token storage)
- axios or fetch (HTTP client)
- react-hook-form + yup (form validation)
- React Context (state management)

**Testing**: Integration tests with mocked API responses, error handling tests, authentication flow tests