# Terraform API Gateway Implementation Plan

## Overview
This document outlines the Terraform infrastructure setup to deploy an API Gateway that routes requests to User and Recipe Lambda functions with proper authorization using a custom Lambda authorizer.

## Architecture Requirements

### Lambda Functions
- **User Lambda**: Handles authentication endpoints (`/auth/*`)
- **Recipe Lambda**: Handles recipe management endpoints (`/recipes/*`) 
- **Authorizer Lambda**: Custom REQUEST authorizer for JWT token validation

### Routing Strategy
- `/auth/signup` → User Lambda (no authorization)
- `/auth/login` → User Lambda (no authorization)  
- `/auth/forgot-password` → User Lambda (no authorization)
- `/auth/reset-password` → User Lambda (no authorization)
- `/auth/profile` → User Lambda (with authorization)
- `/recipes/*` → Recipe Lambda (with authorization)

### Authorization Flow
1. Custom REQUEST authorizer validates JWT tokens from Authorization header
2. Extracts user context (userId, email) from validated token
3. Passes `X-User-Id` and `X-Authorizer-Context` headers to downstream Lambda
4. Recipe Lambda uses these headers for user identification and security validation

## Implementation Steps

### 1. Build Process Setup

Create build scripts that generate Lambda zip files during Terraform deployment:

```bash
# Build script that should run before terraform apply
#!/bin/bash
# build-lambdas.sh

# Create lambdas directory if it doesn't exist
mkdir -p backend/src/IaC/terraform/lambdas

# Build and package User Lambda
cd backend/src/Lambdas/User
dotnet publish -c Release -r linux-x64 --self-contained false -o publish/
cd publish && zip -r ../../IaC/terraform/lambdas/user-lambda.zip . && cd ../../../..

# Build and package Recipe Lambda  
cd backend/src/Lambdas/Recipe
dotnet publish -c Release -r linux-x64 --self-contained false -o publish/
cd publish && zip -r ../../IaC/terraform/lambdas/recipe-lambda.zip . && cd ../../../..

# Build and package Authorizer Lambda
cd backend/src/Lambdas/Authorizer  
dotnet publish -c Release -r linux-x64 --self-contained false -o publish/
cd publish && zip -r ../../IaC/terraform/lambdas/authorizer-lambda.zip . && cd ../../../..
```

### 2. Terraform Configuration Structure

```
backend/src/IaC/terraform/
├── main.tf                 # Main configuration
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── api-gateway.tf          # API Gateway resources
├── lambdas.tf              # Lambda function resources
├── iam.tf                  # IAM roles and policies
├── authorizer.tf           # Custom authorizer configuration
├── lambdas/                # Generated during build process
│   ├── user-lambda.zip
│   ├── recipe-lambda.zip
│   └── authorizer-lambda.zip
└── tasks/
    └── 01_terraform.md     # This document
```

### 3. Core Terraform Resources

#### Lambda Functions (lambdas.tf)
```hcl
# User Lambda Function
resource "aws_lambda_function" "user_lambda" {
  filename         = "lambdas/user-lambda.zip"
  function_name    = "${var.environment}-recipe-app-user"
  role            = aws_iam_role.user_lambda_role.arn
  handler         = "User::User.LambdaEntryPoint::FunctionHandlerAsync"
  runtime         = "dotnet8"
  memory_size     = 512
  timeout         = 30
  
  environment {
    variables = {
      ASPNETCORE_ENVIRONMENT = var.environment
      JWT_SECRET_KEY        = var.jwt_secret_key
      JWT_ISSUER           = var.jwt_issuer
      JWT_AUDIENCE         = var.jwt_audience
      CONNECTION_STRING    = var.database_connection_string
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.user_lambda_basic_execution,
    aws_cloudwatch_log_group.user_lambda,
  ]
}

# Recipe Lambda Function  
resource "aws_lambda_function" "recipe_lambda" {
  filename         = "lambdas/recipe-lambda.zip"
  function_name    = "${var.environment}-recipe-app-recipe"
  role            = aws_iam_role.recipe_lambda_role.arn
  handler         = "Recipe::Recipe.LambdaEntryPoint::FunctionHandlerAsync"
  runtime         = "dotnet8"
  memory_size     = 512
  timeout         = 30

  environment {
    variables = {
      ASPNETCORE_ENVIRONMENT = var.environment
      CONNECTION_STRING     = var.database_connection_string
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.recipe_lambda_basic_execution,
    aws_cloudwatch_log_group.recipe_lambda,
  ]
}

# Authorizer Lambda Function
resource "aws_lambda_function" "authorizer_lambda" {
  filename         = "lambdas/authorizer-lambda.zip"
  function_name    = "${var.environment}-recipe-app-authorizer"
  role            = aws_iam_role.authorizer_lambda_role.arn
  handler         = "Authorizer::Authorizer.Function::FunctionHandler"
  runtime         = "dotnet8"
  memory_size     = 256
  timeout         = 10

  environment {
    variables = {
      JWT_SECRET_KEY = var.jwt_secret_key
      JWT_ISSUER    = var.jwt_issuer
      JWT_AUDIENCE  = var.jwt_audience
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.authorizer_lambda_basic_execution,
    aws_cloudwatch_log_group.authorizer_lambda,
  ]
}
```

#### API Gateway Configuration (api-gateway.tf)
```hcl
# API Gateway REST API
resource "aws_api_gateway_rest_api" "recipe_api" {
  name        = "${var.environment}-recipe-api"
  description = "Recipe Application API"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }

  binary_media_types = ["*/*"]
}

# Auth Resource (/auth)
resource "aws_api_gateway_resource" "auth" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  parent_id   = aws_api_gateway_rest_api.recipe_api.root_resource_id
  path_part   = "auth"
}

# Auth Proxy Resource (/auth/{proxy+})
resource "aws_api_gateway_resource" "auth_proxy" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "{proxy+}"
}

# Recipes Resource (/recipes)
resource "aws_api_gateway_resource" "recipes" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  parent_id   = aws_api_gateway_rest_api.recipe_api.root_resource_id
  path_part   = "recipes"
}

# Recipes Proxy Resource (/recipes/{proxy+})
resource "aws_api_gateway_resource" "recipes_proxy" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  parent_id   = aws_api_gateway_resource.recipes.id
  path_part   = "{proxy+}"
}
```

#### Custom Authorizer (authorizer.tf)
```hcl
# Custom REQUEST Authorizer
resource "aws_api_gateway_authorizer" "lambda_authorizer" {
  name                   = "${var.environment}-recipe-authorizer"
  rest_api_id           = aws_api_gateway_rest_api.recipe_api.id
  authorizer_uri        = aws_lambda_function.authorizer_lambda.invoke_arn
  authorizer_credentials = aws_iam_role.api_gateway_authorizer_role.arn
  type                  = "REQUEST"
  identity_source       = "method.request.header.Authorization"
  authorizer_result_ttl_in_seconds = 300

  depends_on = [aws_lambda_function.authorizer_lambda]
}
```

#### API Gateway Methods and Integrations

##### Auth Methods (No Authorization except /profile)
```hcl
# Auth ANY method (handles signup, login, forgot-password, reset-password)
resource "aws_api_gateway_method" "auth_any" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_api.id
  resource_id   = aws_api_gateway_resource.auth_proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_integration" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth_proxy.id
  http_method = aws_api_gateway_method.auth_any.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.user_lambda.invoke_arn
}

# Special handling for /auth/profile (requires authorization)
resource "aws_api_gateway_resource" "auth_profile" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "profile"
}

resource "aws_api_gateway_method" "auth_profile_get" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_api.id
  resource_id   = aws_api_gateway_resource.auth_profile.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.lambda_authorizer.id
}

resource "aws_api_gateway_integration" "auth_profile_integration" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth_profile.id
  http_method = aws_api_gateway_method.auth_profile_get.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.user_lambda.invoke_arn

  request_parameters = {
    "integration.request.header.X-User-Id"           = "context.authorizer.userId"
    "integration.request.header.X-Authorizer-Context" = "context.authorizer.email"
  }
}
```

##### Recipe Methods (With Authorization)
```hcl
# Recipes ANY method (with authorization)
resource "aws_api_gateway_method" "recipes_any" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_api.id
  resource_id   = aws_api_gateway_resource.recipes_proxy.id
  http_method   = "ANY"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.lambda_authorizer.id
}

resource "aws_api_gateway_integration" "recipes_integration" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.recipes_proxy.id
  http_method = aws_api_gateway_method.recipes_any.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.recipe_lambda.invoke_arn

  request_parameters = {
    "integration.request.header.X-User-Id"           = "context.authorizer.userId"
    "integration.request.header.X-Authorizer-Context" = "context.authorizer.email"
  }
}

# Direct recipes resource methods
resource "aws_api_gateway_method" "recipes_root_any" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_api.id
  resource_id   = aws_api_gateway_resource.recipes.id
  http_method   = "ANY"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.lambda_authorizer.id
}

resource "aws_api_gateway_integration" "recipes_root_integration" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.recipes.id
  http_method = aws_api_gateway_method.recipes_root_any.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.recipe_lambda.invoke_arn

  request_parameters = {
    "integration.request.header.X-User-Id"           = "context.authorizer.userId"
    "integration.request.header.X-Authorizer-Context" = "context.authorizer.email"
  }
}
```

#### IAM Roles and Policies (iam.tf)
```hcl
# User Lambda IAM Role
resource "aws_iam_role" "user_lambda_role" {
  name = "${var.environment}-user-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "user_lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.user_lambda_role.name
}

# Recipe Lambda IAM Role
resource "aws_iam_role" "recipe_lambda_role" {
  name = "${var.environment}-recipe-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "recipe_lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.recipe_lambda_role.name
}

# Authorizer Lambda IAM Role
resource "aws_iam_role" "authorizer_lambda_role" {
  name = "${var.environment}-authorizer-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "authorizer_lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.authorizer_lambda_role.name
}

# API Gateway Authorizer Role
resource "aws_iam_role" "api_gateway_authorizer_role" {
  name = "${var.environment}-api-gateway-authorizer-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "api_gateway_authorizer_policy" {
  name = "${var.environment}-api-gateway-authorizer-policy"
  role = aws_iam_role.api_gateway_authorizer_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = aws_lambda_function.authorizer_lambda.arn
      }
    ]
  })
}
```

### 4. Lambda Permissions
```hcl
# API Gateway invoke permissions
resource "aws_lambda_permission" "allow_api_gateway_user" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.recipe_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_api_gateway_recipe" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.recipe_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.recipe_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_api_gateway_authorizer" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.authorizer_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.recipe_api.execution_arn}/authorizers/*"
}
```

### 5. CloudWatch Log Groups
```hcl
resource "aws_cloudwatch_log_group" "user_lambda" {
  name              = "/aws/lambda/${var.environment}-recipe-app-user"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "recipe_lambda" {
  name              = "/aws/lambda/${var.environment}-recipe-app-recipe"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "authorizer_lambda" {
  name              = "/aws/lambda/${var.environment}-recipe-app-authorizer"
  retention_in_days = 14
}
```

### 6. API Gateway Deployment and Stage
```hcl
resource "aws_api_gateway_deployment" "recipe_api_deployment" {
  depends_on = [
    aws_api_gateway_method.auth_any,
    aws_api_gateway_method.auth_profile_get,
    aws_api_gateway_method.recipes_any,
    aws_api_gateway_method.recipes_root_any,
    aws_api_gateway_integration.auth_integration,
    aws_api_gateway_integration.auth_profile_integration,
    aws_api_gateway_integration.recipes_integration,
    aws_api_gateway_integration.recipes_root_integration,
  ]

  rest_api_id = aws_api_gateway_rest_api.recipe_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.auth.id,
      aws_api_gateway_resource.auth_proxy.id,
      aws_api_gateway_resource.auth_profile.id,
      aws_api_gateway_resource.recipes.id,
      aws_api_gateway_resource.recipes_proxy.id,
      aws_api_gateway_method.auth_any.id,
      aws_api_gateway_method.auth_profile_get.id,
      aws_api_gateway_method.recipes_any.id,
      aws_api_gateway_method.recipes_root_any.id,
      aws_api_gateway_integration.auth_integration.id,
      aws_api_gateway_integration.auth_profile_integration.id,
      aws_api_gateway_integration.recipes_integration.id,
      aws_api_gateway_integration.recipes_root_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "recipe_api_stage" {
  deployment_id = aws_api_gateway_deployment.recipe_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.recipe_api.id
  stage_name    = var.environment
}
```

### 7. Variables and Outputs

#### variables.tf
```hcl
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "jwt_secret_key" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "jwt_issuer" {
  description = "JWT issuer"
  type        = string
  default     = "recipe-app"
}

variable "jwt_audience" {
  description = "JWT audience"
  type        = string
  default     = "recipe-app-users"
}

variable "database_connection_string" {
  description = "Database connection string"
  type        = string
  sensitive   = true
}
```

#### outputs.tf
```hcl
output "api_gateway_url" {
  description = "API Gateway URL"
  value       = "https://${aws_api_gateway_rest_api.recipe_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.recipe_api_stage.stage_name}"
}

output "user_lambda_arn" {
  description = "User Lambda ARN"
  value       = aws_lambda_function.user_lambda.arn
}

output "recipe_lambda_arn" {
  description = "Recipe Lambda ARN"  
  value       = aws_lambda_function.recipe_lambda.arn
}

output "authorizer_lambda_arn" {
  description = "Authorizer Lambda ARN"
  value       = aws_lambda_function.authorizer_lambda.arn
}
```

### 8. CORS Configuration
```hcl
# CORS for auth endpoints
resource "aws_api_gateway_method" "auth_options" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_api.id
  resource_id   = aws_api_gateway_resource.auth_proxy.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth_proxy.id
  http_method = aws_api_gateway_method.auth_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "auth_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth_proxy.id
  http_method = aws_api_gateway_method.auth_options.http_method
  status_code = "200"

  response_headers = {
    "Access-Control-Allow-Origin"  = true
    "Access-Control-Allow-Methods" = true
    "Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "auth_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth_proxy.id
  http_method = aws_api_gateway_method.auth_options.http_method
  status_code = aws_api_gateway_method_response.auth_options.status_code

  response_headers = {
    "Access-Control-Allow-Origin"  = "'*'"
    "Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Requested-With'"
  }
}

# Similar CORS configuration for recipes endpoints
resource "aws_api_gateway_method" "recipes_options" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_api.id
  resource_id   = aws_api_gateway_resource.recipes_proxy.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "recipes_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.recipes_proxy.id
  http_method = aws_api_gateway_method.recipes_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "recipes_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.recipes_proxy.id
  http_method = aws_api_gateway_method.recipes_options.http_method
  status_code = "200"

  response_headers = {
    "Access-Control-Allow-Origin"  = true
    "Access-Control-Allow-Methods" = true
    "Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "recipes_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.recipes_proxy.id
  http_method = aws_api_gateway_method.recipes_options.http_method
  status_code = aws_api_gateway_method_response.recipes_options.status_code

  response_headers = {
    "Access-Control-Allow-Origin"  = "'*'"
    "Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Requested-With'"
  }
}
```

## Deployment Process

### 1. Build and Deploy Script
```bash
#!/bin/bash
# deploy.sh

set -e

# Build Lambda packages
echo "Building Lambda functions..."
./build-lambdas.sh

# Initialize Terraform (if needed)
cd backend/src/IaC/terraform
terraform init

# Plan deployment
terraform plan -out=tfplan \
  -var="jwt_secret_key=${JWT_SECRET_KEY}" \
  -var="database_connection_string=${DATABASE_CONNECTION_STRING}" \
  -var="environment=${ENVIRONMENT:-dev}"

# Apply deployment
terraform apply tfplan

# Output API Gateway URL
echo "Deployment complete!"
echo "API Gateway URL: $(terraform output -raw api_gateway_url)"
```

### 2. Environment Variables
Create a `.env` file for local development:
```bash
# .env
JWT_SECRET_KEY=your-super-secure-jwt-secret-key-here
JWT_ISSUER=recipe-app
JWT_AUDIENCE=recipe-app-users
DATABASE_CONNECTION_STRING=your-database-connection-string
ENVIRONMENT=dev
AWS_REGION=ap-southeast-1
```

### 3. Terraform Backend Configuration
Consider using remote state storage for production:
```hcl
# main.tf
terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "recipe-app/terraform.tfstate"
    region = "ap-southeast-1"
  }
}
```

## Security Considerations

1. **IAM Least Privilege**: Each Lambda function has minimal required permissions
2. **JWT Validation**: Authorizer validates tokens and extracts user context securely
3. **Header Security**: `X-User-Id` and `X-Authorizer-Context` are set by API Gateway, not client
4. **Environment Variables**: Sensitive data stored as Terraform variables
5. **CORS Configuration**: Proper CORS headers for web application integration
6. **CloudWatch Logging**: Comprehensive logging for debugging and monitoring

## Testing Strategy

1. **Unit Tests**: Test Lambda functions individually
2. **Integration Tests**: Test API Gateway routing and authorization
3. **End-to-End Tests**: Test complete request flow through all components
4. **Security Tests**: Verify authorization logic and header forwarding

## Monitoring and Observability

1. **CloudWatch Logs**: Lambda execution logs
2. **API Gateway Metrics**: Request/response metrics and error rates
3. **Custom Metrics**: Application-specific metrics from Lambda functions
4. **Alarms**: Set up CloudWatch alarms for error rates and latency

This plan provides a comprehensive foundation for deploying the Recipe App API infrastructure using Terraform with proper security, monitoring, and maintainability considerations.