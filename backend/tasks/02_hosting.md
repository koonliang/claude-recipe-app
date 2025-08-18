# Lambda Hosting Implementation - TODO

**Requirements**: Bootstrap step 2 from requirements.md

---

## 📋 Implementation Checklist

### ✅ Core Requirements

- [ ] **Lambdas.Recipe Hosting Configuration**
  - Configure `AddAWSLambdaHosting(LambdaEventSource.RestApi)` in Program.cs
  - AWS REST API Gateway integration setup
  - Lambda function entry point configuration
  - Request/response handling for API Gateway events

- [ ] **Lambdas.User Hosting Configuration**  
  - Configure `AddAWSLambdaHosting(LambdaEventSource.RestApi)` in Program.cs
  - AWS REST API Gateway integration setup
  - Lambda function entry point configuration
  - User service specific routing and handlers

- [ ] **AWS Lambda Runtime Integration**
  - Amazon.Lambda.AspNetCoreServer package integration
  - Lambda function handler setup
  - AWS context and event handling
  - Cold start optimization strategies

- [ ] **API Gateway Event Source Configuration**
  - REST API event source binding
  - HTTP method routing (GET, POST, PUT, DELETE)
  - Path parameter and query string handling
  - Request/response transformation

### 🎨 Hosting Architecture

- [ ] **Lambda Function Structure**
  - ASP.NET Core Minimal API hosting
  - Lambda-specific middleware pipeline
  - AWS API Gateway proxy integration
  - Serverless application lifecycle management

- [ ] **Request Processing Flow**
  - API Gateway → Lambda → ASP.NET Core
  - HTTP request mapping to Lambda events
  - Response formatting for API Gateway
  - Error handling and status code mapping

- [ ] **Performance Optimization**
  - Lambda cold start minimization
  - Dependency injection optimization for serverless
  - Assembly loading strategies
  - Memory and CPU allocation considerations

### 🔧 Technical Implementation

- [ ] **Program.cs Updates for Recipe Lambda**
  ```csharp
  // Lambdas/Recipe/Program.cs
  builder.Services.AddAWSLambdaHosting(LambdaEventSource.RestApi);
  ```

- [ ] **Program.cs Updates for User Lambda**
  ```csharp
  // Lambdas/User/Program.cs  
  builder.Services.AddAWSLambdaHosting(LambdaEventSource.RestApi);
  ```

- [ ] **Package Dependencies**
  - Amazon.Lambda.AspNetCoreServer
  - Amazon.Lambda.Core
  - Amazon.Lambda.APIGatewayEvents
  - AWS SDK integration packages

- [ ] **Lambda Function Handler**
  - Lambda entry point configuration
  - ASP.NET Core app delegation
  - AWS context integration
  - Environment-specific handling

- [ ] **API Gateway Integration**
  - Proxy integration setup
  - CORS configuration
  - Request validation
  - Response headers management

### 📁 File Structure

```
src/
├── Lambdas/
│   ├── Recipe/
│   │   ├── Program.cs (updated for Lambda hosting)
│   │   ├── Recipe.csproj (updated dependencies)
│   │   └── aws-lambda-tools-defaults.json (new)
│   ├── User/
│   │   ├── Program.cs (updated for Lambda hosting)
│   │   ├── User.csproj (updated dependencies)
│   │   └── aws-lambda-tools-defaults.json (new)
│   └── Authorizer/
│       └── Function.cs (existing - no changes needed)
```

### 🧪 Testing Requirements

- [ ] **Local Development Tests**
  - ASP.NET Core hosting in development mode
  - Lambda hosting simulation
  - API Gateway event mocking
  - Local serverless testing

- [ ] **Integration Tests**
  - Lambda function deployment verification
  - API Gateway request/response flow
  - Performance and cold start testing
  - Error handling scenarios

- [ ] **Performance Tests**
  - Cold start duration measurement
  - Warm execution performance
  - Memory usage optimization
  - Concurrent request handling

### 🎯 Acceptance Criteria

**Given** Recipe Lambda is configured with AWS Lambda hosting  
**When** an API Gateway request is received  
**Then** the request is processed by ASP.NET Core and returns appropriate response

**Given** User Lambda is configured with AWS Lambda hosting  
**When** user-related API calls are made through API Gateway  
**Then** the Lambda processes the request correctly using REST API event source

**Given** both Lambdas are deployed to AWS  
**When** API Gateway routes requests to the functions  
**Then** they respond within acceptable performance thresholds

**Given** a Lambda function experiences a cold start  
**When** the first request arrives  
**Then** initialization completes quickly and serves the request

**Given** multiple concurrent requests hit the Lambda functions  
**When** API Gateway distributes the load  
**Then** each Lambda instance handles requests independently

---

## 🚀 Implementation Priority

1. **Phase 1**: Add AWS Lambda hosting packages to Recipe and User projects
2. **Phase 2**: Update Program.cs files with AddAWSLambdaHosting configuration  
3. **Phase 3**: Configure Lambda deployment settings and tools
4. **Phase 4**: Test local development with Lambda hosting simulation
5. **Phase 5**: Verify API Gateway integration and request routing

---

## 📊 Current State Analysis

### ✅ Already Implemented
- Basic ASP.NET Core setup in Recipe and User Lambdas
- Program.cs with standard ASP.NET Core configuration
- Project structure supporting Lambda development
- Authorizer Lambda with Function.cs entry point

### ❌ Missing Implementation
- AWS Lambda hosting configuration in Program.cs
- Amazon.Lambda.AspNetCoreServer package references
- Lambda-specific configuration and optimization
- API Gateway REST API event source binding
- Deployment configuration files

---

## 🔍 Implementation Examples

### Recipe Lambda Program.cs
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add AWS Lambda hosting for REST API Gateway
builder.Services.AddAWSLambdaHosting(LambdaEventSource.RestApi);

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### User Lambda Program.cs
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add AWS Lambda hosting for REST API Gateway
builder.Services.AddAWSLambdaHosting(LambdaEventSource.RestApi);

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### Package References
```xml
<PackageReference Include="Amazon.Lambda.AspNetCoreServer" Version="8.1.0" />
<PackageReference Include="Amazon.Lambda.Core" Version="2.2.0" />
<PackageReference Include="Amazon.Lambda.APIGatewayEvents" Version="2.6.0" />
```

---

## 🔗 Related Components

- **Configuration**: Uses configuration setup from 01_config.md
- **Dependencies**: Requires AWS Lambda packages and ASP.NET Core
- **Deployment**: Supports SAM/CloudFormation templates in IaC folder
- **Development**: Local testing with Lambda tools and simulators

---

## 💡 Additional Considerations

### Cold Start Optimization
- Minimize dependency injection container setup time
- Use ahead-of-time compilation where possible
- Optimize assembly loading and reflection usage
- Consider provisioned concurrency for critical functions

### API Gateway Integration
- Configure proper CORS headers for web client access
- Set up request/response mapping templates if needed
- Handle binary media types for file uploads
- Implement proper error response formatting

### Monitoring and Logging
- AWS CloudWatch integration for Lambda metrics
- Structured logging for Lambda execution context
- Performance monitoring and alerting
- Cold start and execution duration tracking

---

**Dependencies**: Configuration Setup (01_config.md)  
**Estimated Effort**: 2-3 hours  
**Status**: ✅ Completed  
**Assignee**: Claude Code  
**Created**: 2025-08-18