#!/bin/bash

# Start Recipe Lambda on port 5000
echo "Starting Recipe service on port 5000..."
cd /app/recipe
ASPNETCORE_URLS="http://+:5000" dotnet Recipe.dll &

# Start User Lambda on port 5001
echo "Starting User service on port 5001..."
cd /app/user
ASPNETCORE_URLS="http://+:5001" dotnet User.dll &

# Start Authorizer Lambda on port 5002
echo "Starting Authorizer service on port 5002..."
cd /app/authorizer
ASPNETCORE_URLS="http://+:5002" dotnet Authorizer.dll &

echo "All services started. Waiting..."

# Wait for all background processes to complete
wait