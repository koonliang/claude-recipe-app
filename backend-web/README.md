# Recipe App Local Gateway

A lightweight Express.js gateway for local development that routes requests between the frontend and Lambda services running on different ports.

## Overview

This gateway solves the problem of having multiple backend services running on different ports during local development:

- **User Lambda** (port 5001): Handles authentication (`/auth/*`)
- **Recipe Lambda** (port 5000): Handles recipes (`/recipes/*`)
- **Gateway** (port 3000): Routes requests to appropriate services

## Quick Start

### 1. Install Dependencies

```bash
cd backend-web
npm install
```

### 2. Start the Services

You need to start all three components:

```bash
# Terminal 1: Start User Lambda (port 5001)
cd backend/src/Lambdas/User
dotnet run

# Terminal 2: Start Recipe Lambda (port 5000)
cd backend/src/Lambdas/Recipe
dotnet run

# Terminal 3: Start Local Gateway (port 3000)
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

## Service Routes

The gateway routes requests as follows:

| Frontend Request | Gateway Routes To | Target Service |
|------------------|-------------------|----------------|
| `/auth/login` | `http://localhost:5001/auth/login` | User Lambda |
| `/auth/signup` | `http://localhost:5001/auth/signup` | User Lambda |
| `/auth/profile` | `http://localhost:5001/auth/profile` | User Lambda |
| `/recipes` | `http://localhost:5000/recipes` | Recipe Lambda |
| `/recipes/123` | `http://localhost:5000/recipes/123` | Recipe Lambda |

## Development Features

### Health Check
```bash
curl http://localhost:3000/health
```

### Request Logging
The gateway logs all requests and responses for debugging:
```
[2024-01-01T12:00:00.000Z] POST /auth/login
🔄 Proxying to User service: POST http://localhost:5001/auth/login
✅ User service response: 200
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
- Verify the correct port (User: 5001, Recipe: 5000)
- Check for port conflicts

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
const USER_SERVICE_URL = 'http://localhost:5001';    // User Lambda port
const RECIPE_SERVICE_URL = 'http://localhost:5000';  // Recipe Lambda port
const PORT = 3000;                                   // Gateway port
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

**Local Development (with Gateway):**
```
Frontend → Gateway (port 3000) → User Lambda (port 5001)
                                → Recipe Lambda (port 5000)
```

**Production (AWS):**
```
Frontend → API Gateway → User Lambda
                      → Recipe Lambda
```

This ensures consistent behavior between development and production environments.