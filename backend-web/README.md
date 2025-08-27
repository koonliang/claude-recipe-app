# Recipe App Local Gateway

A lightweight Express.js gateway for local development that routes requests between the frontend and Lambda services with **centralized authorization**.

## Overview

This gateway solves the problem of having multiple backend services running on different ports during local development while providing **authorization middleware** for secure request handling:

- **User Lambda** (port 5001): Handles authentication (`/auth/*`)
- **Recipe Lambda** (port 5000): Handles recipes (`/recipes/*`)  
- **Authorizer Lambda** (port 5002): Validates JWT tokens and extracts user context
- **Gateway** (port 3000): Routes requests with authorization orchestration

## Quick Start

### 1. Install Dependencies

```bash
cd backend-web
npm install
```

### 2. Start the Services

You need to start all four components:

```bash
# Terminal 1: Start User Lambda (port 5001)
cd backend/src/Lambdas/User
dotnet run

# Terminal 2: Start Recipe Lambda (port 5000)
cd backend/src/Lambdas/Recipe
dotnet run

# Terminal 3: Start Authorizer Lambda (port 5002)
cd backend/src/Lambdas/Authorizer
dotnet run

# Terminal 4: Start Local Gateway (port 3000)
cd backend-web
npm start
```

### 3. Configure Frontend

Make sure your frontend is configured to use the gateway:

```bash
# In frontend/.env (create if needed)
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_ANONYMOUS_MODE=false
```

## Service Routes & Authorization Flow

The gateway routes requests with **authorization middleware**:

### Authentication Requests (No Authorization Required)
| Frontend Request | Gateway Routes To | Target Service |
|------------------|-------------------|----------------|
| `/auth/login` | `http://localhost:5001/auth/login` | User Lambda |
| `/auth/signup` | `http://localhost:5001/auth/signup` | User Lambda |
| `/auth/forgot-password` | `http://localhost:5001/auth/forgot-password` | User Lambda |

### Protected Requests (Authorization Required)
| Frontend Request | Authorization Flow | Target Service |
|------------------|-------------------|----------------|
| `/recipes/*` | Gateway → Authorizer (5002) → Recipe (5000) | Recipe Lambda |
| `/auth/profile` | Gateway → Authorizer (5002) → User (5001) | User Lambda |

### Authorization Process
1. **Request received** with JWT token in `Authorization` header
2. **Authorizer called** at `http://localhost:5002/authorize` 
3. **Token validated** and user context extracted
4. **Request forwarded** with user context in `X-User-Id` header
5. **Target service** trusts the user context from gateway

## Development Features

### Health Check
```bash
curl http://localhost:3000/health
```

### Request Logging
The gateway logs all requests, authorization checks, and responses:
```
[2024-01-01T12:00:00.000Z] GET /recipes
🔐 Calling Authorizer Lambda for authorization...
✅ Authorization successful for user: 123e4567-e89b-12d3-a456-426614174000
🔄 Proxying to Recipe service: GET http://localhost:5000/recipes
✅ Recipe service response: 200
```

### CORS Support
Pre-configured CORS for Expo development:
- `http://localhost:8081` (Expo Dev Server)
- `exp://localhost:8081` (Expo tunneling)
- Local network IPs
- ngrok and tunnel services

### Error Handling
- Service unavailable errors with helpful messages
- Route not found responses
- Connection error details

## Scripts

```bash
# Start the gateway
npm start

# Start with auto-reload (development)
npm run dev

# Test health endpoint
npm test
```

## Troubleshooting

### "User/Recipe service unavailable"
- Check that the respective Lambda service is running
- Verify the correct ports (User: 5001, Recipe: 5000, Authorizer: 5002)
- Check for port conflicts

### "Authorizer service unavailable"
- Ensure Authorizer Lambda is running on port 5002
- Check if JWT configuration is consistent across services
- Verify `.env` files have matching JWT secret keys

### "Authorization failed" 
- Check JWT token format and expiration
- Verify JWT secret key matches between User and Authorizer Lambdas
- Ensure frontend is sending tokens in `Authorization: Bearer <token>` format

### CORS Errors
- Ensure Expo is running on expected ports
- Add your specific IP to the CORS configuration in `local-gateway.js`

### Route Not Found
- Verify the request path matches the configured routes
- Check the frontend is making requests to correct endpoints

## Configuration

### Changing Ports
Edit the configuration in `local-gateway.js`:

```javascript
const USER_SERVICE_URL = 'http://localhost:5001';       // User Lambda port
const RECIPE_SERVICE_URL = 'http://localhost:5000';     // Recipe Lambda port
const AUTHORIZER_SERVICE_URL = 'http://localhost:5002'; // Authorizer Lambda port
const PORT = 3000;                                      // Gateway port
```

### Adding New Routes
To add new services, add a new proxy configuration:

```javascript
app.use('/new-service', createProxyMiddleware({
  target: 'http://localhost:5002',
  changeOrigin: true,
  // ... other options
}));
```

## Production Deployment

This gateway is only for local development. In production:
- AWS API Gateway handles routing automatically
- Lambda functions are deployed as separate services
- Frontend connects directly to API Gateway URL

## Architecture Comparison

**Local Development (with Authorization Gateway):**
```
Frontend → Gateway (port 3000) → Authorizer Lambda (port 5002) → Recipe Lambda (port 5000)
                                → User Lambda (port 5001)
```

**Production (AWS with API Gateway Custom Authorizer):**
```
Frontend → API Gateway → Custom Authorizer → User Lambda
                                          → Recipe Lambda
```

This ensures consistent behavior between development and production environments.