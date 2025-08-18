# Configuration Setup Implementation - TODO

**Requirements**: Bootstrap step 1 from requirements.md

---

## 📋 Implementation Checklist

### ✅ Core Requirements

- [ ] **Lambdas.Recipe Configuration**
  - Enhanced appsettings.json with all required sections
  - Environment variable override capability  
  - Configuration validation on startup
  - Structured configuration classes

- [ ] **Lambdas.User Configuration**  
  - Complete appsettings.json setup
  - Environment variable support
  - Configuration validation
  - User-specific configuration sections

- [ ] **Lambdas.Authorizer Configuration**
  - Minimal appsettings.json for authorizer
  - Environment variable override support
  - JWT configuration sections
  - Authorization-specific settings

- [ ] **Environment Variable Override**
  - Implement proper configuration precedence (env vars > appsettings.json)
  - Support for all configuration sections
  - Environment-specific settings (dev/staging/prod)
  - Secure handling of sensitive configuration

### 🎨 Configuration Structure

- [ ] **appsettings.json Sections**
  - Logging configuration (Serilog)
  - Database connection strings
  - JWT authentication settings
  - API Gateway configuration
  - Environment-specific overrides

- [ ] **Configuration Classes**
  - DatabaseOptions class
  - JwtOptions class  
  - LoggingOptions class
  - ApiGatewayOptions class
  - Validation attributes and logic

- [ ] **Environment Variables**
  - CONNECTION_STRING override
  - JWT_SECRET override
  - LOGGING_LEVEL override
  - API_GATEWAY_URL override

### 🔧 Technical Implementation

- [ ] **Configuration Provider Setup**
  - JSON configuration provider
  - Environment variables provider
  - AWS Parameter Store (future consideration)
  - Configuration precedence ordering

- [ ] **Validation and Error Handling**
  - Required configuration validation
  - Connection string format validation
  - JWT configuration validation
  - Graceful error handling for missing config

- [ ] **Configuration Classes Structure**
  ```csharp
  // Core/Application/Configuration/
  ├── DatabaseOptions.cs
  ├── JwtOptions.cs
  ├── LoggingOptions.cs
  └── ConfigurationExtensions.cs
  ```

### 📁 File Structure

```
src/
├── Core/
│   └── Application/
│       └── Configuration/
│           ├── DatabaseOptions.cs
│           ├── JwtOptions.cs
│           ├── LoggingOptions.cs
│           └── ConfigurationExtensions.cs
├── Lambdas/
│   ├── Recipe/
│   │   ├── appsettings.json (enhanced)
│   │   ├── appsettings.Development.json
│   │   └── Program.cs (updated config setup)
│   ├── User/
│   │   ├── appsettings.json (enhanced)
│   │   ├── appsettings.Development.json
│   │   └── Program.cs (updated config setup)
│   └── Authorizer/
│       ├── appsettings.json (enhanced)
│       ├── appsettings.Development.json
│       └── Function.cs (updated config setup)
```

### 🧪 Testing Requirements

- [ ] **Configuration Tests**
  - Environment variable override behavior
  - Configuration validation logic
  - Missing configuration handling
  - Invalid configuration format handling

- [ ] **Integration Tests**
  - Lambda startup with various configurations
  - Database connection with config
  - JWT validation with config
  - Logging configuration verification

### 🎯 Acceptance Criteria

**Given** a Lambda function starts up  
**When** appsettings.json contains valid configuration  
**Then** the Lambda loads configuration successfully

**Given** environment variables are set  
**When** they conflict with appsettings.json values  
**Then** environment variables take precedence

**Given** required configuration is missing  
**When** Lambda attempts to start  
**Then** clear error message is provided and startup fails gracefully

**Given** database connection string is provided via environment variable  
**When** Lambda connects to database  
**Then** environment variable value is used instead of appsettings.json

**Given** invalid configuration format is provided  
**When** Lambda validates configuration  
**Then** detailed validation errors are logged and startup fails

---

## 🚀 Implementation Priority

1. **Phase 1**: Create configuration classes and validation logic
2. **Phase 2**: Update appsettings.json files for all Lambdas  
3. **Phase 3**: Implement environment variable override capability
4. **Phase 4**: Add configuration validation to Lambda startup
5. **Phase 5**: Test configuration loading and error scenarios

---

## 📊 Current State Analysis

### ✅ Already Implemented
- Basic appsettings.json in all Lambda projects
- Database connection string configuration
- Serilog configuration structure
- Basic configuration loading in Program.cs

### ❌ Missing Implementation
- Environment variable override capability
- Configuration validation and error handling
- Structured configuration classes
- Comprehensive appsettings.json sections
- Development/Production environment-specific configs

---

## 🔍 Configuration Examples

### Database Configuration
```json
{
  "Database": {
    "ConnectionString": "Server=localhost;Database=RecipeApp;User=root;Password=password;",
    "CommandTimeout": 30,
    "EnableRetryOnFailure": true
  }
}
```

### JWT Configuration
```json
{
  "Jwt": {
    "SecretKey": "your-secret-key-here",
    "Issuer": "RecipeApp",
    "Audience": "RecipeApp-API",
    "ExpirationMinutes": 60
  }
}
```

---

**Dependencies**: None  
**Estimated Effort**: 3-4 hours  
**Status**: 🚧 Not Started  
**Assignee**: Claude Code  
**Created**: 2025-08-18