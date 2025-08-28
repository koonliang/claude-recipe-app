terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}


# Lambda execution role
resource "aws_iam_role" "lambda_execution_role" {
  name = "${var.app_name}-lambda-execution-role-${var.environment}"

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

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_execution_role.name
}

# API Gateway authorizer role
resource "aws_iam_role" "api_gateway_authorizer_role" {
  name = "${var.app_name}-api-gateway-authorizer-role-${var.environment}"

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
  name = "${var.app_name}-api-gateway-authorizer-policy-${var.environment}"
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

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "allow_api_gateway_user" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.recipe_app_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_api_gateway_recipe" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.recipe_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.recipe_app_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_api_gateway_authorizer" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.authorizer_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.recipe_app_api.execution_arn}/authorizers/*"
}

# API Gateway
resource "aws_api_gateway_rest_api" "recipe_app_api" {
  name        = "${var.app_name}-api-${var.environment}"
  description = "Recipe App API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  binary_media_types = [
    "application/octet-stream",
    "image/*",
    "multipart/form-data"
  ]
}

resource "aws_api_gateway_deployment" "recipe_app_deployment" {
  depends_on = [
    aws_api_gateway_integration.recipe_lambda_integration,
    aws_api_gateway_integration.recipe_proxy_lambda_integration,
    aws_api_gateway_integration.user_lambda_integration,
    aws_api_gateway_integration.user_proxy_lambda_integration,
    aws_api_gateway_integration.auth_lambda_integration,
    aws_api_gateway_integration.auth_proxy_lambda_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  stage_name  = var.environment
}

# Recipe resource
resource "aws_api_gateway_resource" "recipe_resource" {
  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  parent_id   = aws_api_gateway_rest_api.recipe_app_api.root_resource_id
  path_part   = "recipes"
}

resource "aws_api_gateway_method" "recipe_method" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_app_api.id
  resource_id   = aws_api_gateway_resource.recipe_resource.id
  http_method   = "ANY"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.lambda_authorizer.id
}

# Recipe proxy resource for sub-paths like /recipes/{id}
resource "aws_api_gateway_resource" "recipe_proxy_resource" {
  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  parent_id   = aws_api_gateway_resource.recipe_resource.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "recipe_proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_app_api.id
  resource_id   = aws_api_gateway_resource.recipe_proxy_resource.id
  http_method   = "ANY"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.lambda_authorizer.id
}

# User resource
resource "aws_api_gateway_resource" "user_resource" {
  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  parent_id   = aws_api_gateway_rest_api.recipe_app_api.root_resource_id
  path_part   = "users"
}

# Auth resource (public endpoints)
resource "aws_api_gateway_resource" "auth_resource" {
  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  parent_id   = aws_api_gateway_resource.user_resource.id
  path_part   = "auth"
}

# Public auth endpoints (no authorization required)
resource "aws_api_gateway_method" "auth_method" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_app_api.id
  resource_id   = aws_api_gateway_resource.auth_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Auth proxy resource for sub-paths like /auth/signup, /auth/login
resource "aws_api_gateway_resource" "auth_proxy_resource" {
  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  parent_id   = aws_api_gateway_resource.auth_resource.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "auth_proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_app_api.id
  resource_id   = aws_api_gateway_resource.auth_proxy_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Protected user endpoints (authorization required)
resource "aws_api_gateway_method" "user_method" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_app_api.id
  resource_id   = aws_api_gateway_resource.user_resource.id
  http_method   = "ANY"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.lambda_authorizer.id
}

# User proxy resource for sub-paths (excluding auth)
resource "aws_api_gateway_resource" "user_proxy_resource" {
  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  parent_id   = aws_api_gateway_resource.user_resource.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "user_proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_app_api.id
  resource_id   = aws_api_gateway_resource.user_proxy_resource.id
  http_method   = "ANY"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.lambda_authorizer.id
}

# Lambda Functions
data "archive_file" "user_lambda_zip" {
  type        = "zip"
  source_dir  = "../../Lambdas/User/publish"
  output_path = "user-lambda.zip"
  excludes = [
    "*.pdb",
    "*.md"
  ]
}

resource "aws_lambda_function" "user_lambda" {
  filename         = data.archive_file.user_lambda_zip.output_path
  function_name    = "${var.app_name}-user-${var.environment}"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "User"
  runtime         = "dotnet8"
  timeout         = 30
  memory_size     = 512

  source_code_hash = data.archive_file.user_lambda_zip.output_base64sha256

  environment {
    variables = {
      ENVIRONMENT = var.environment
      ASPNETCORE_ENVIRONMENT = var.environment
      DATABASE_TYPE = "inmemory"
      DATABASE__USEINMEMORYFALLBACK = "true"
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_cloudwatch_log_group.user_lambda_logs,
  ]
}

resource "aws_cloudwatch_log_group" "user_lambda_logs" {
  name              = "/aws/lambda/${var.app_name}-user-${var.environment}"
  retention_in_days = 14
}

data "archive_file" "recipe_lambda_zip" {
  type        = "zip"
  source_dir  = "../../Lambdas/Recipe/publish"
  output_path = "recipe-lambda.zip"
  excludes = [
    "*.pdb",
    "*.md"
  ]
}

resource "aws_lambda_function" "recipe_lambda" {
  filename         = data.archive_file.recipe_lambda_zip.output_path
  function_name    = "${var.app_name}-recipe-${var.environment}"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "Recipe"
  runtime         = "dotnet8"
  timeout         = 30
  memory_size     = 512

  source_code_hash = data.archive_file.recipe_lambda_zip.output_base64sha256

  environment {
    variables = {
      ENVIRONMENT = var.environment
      ASPNETCORE_ENVIRONMENT = var.environment
      DATABASE_TYPE = "inmemory"
      DATABASE__USEINMEMORYFALLBACK = "true"
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_cloudwatch_log_group.recipe_lambda_logs,
  ]
}

resource "aws_cloudwatch_log_group" "recipe_lambda_logs" {
  name              = "/aws/lambda/${var.app_name}-recipe-${var.environment}"
  retention_in_days = 14
}

data "archive_file" "authorizer_lambda_zip" {
  type        = "zip"
  source_dir  = "../../Lambdas/Authorizer/publish"
  output_path = "authorizer-lambda.zip"
  excludes = [
    "*.pdb",
    "*.md"
  ]
}

resource "aws_lambda_function" "authorizer_lambda" {
  filename         = data.archive_file.authorizer_lambda_zip.output_path
  function_name    = "${var.app_name}-authorizer-${var.environment}"
  role            = aws_iam_role.lambda_execution_role.arn
  handler          = "Authorizer::Authorizer.Function::FunctionHandler"
  runtime         = "dotnet8"
  timeout         = 30
  memory_size     = 256

  source_code_hash = data.archive_file.authorizer_lambda_zip.output_base64sha256

  environment {
    variables = {
      ENVIRONMENT = var.environment
      ASPNETCORE_ENVIRONMENT = var.environment
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_cloudwatch_log_group.authorizer_lambda_logs,
  ]
}

resource "aws_cloudwatch_log_group" "authorizer_lambda_logs" {
  name              = "/aws/lambda/${var.app_name}-authorizer-${var.environment}"
  retention_in_days = 14
}

# API Gateway Lambda Integrations
resource "aws_api_gateway_integration" "user_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  resource_id = aws_api_gateway_resource.user_resource.id
  http_method = aws_api_gateway_method.user_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.user_lambda.invoke_arn
}

resource "aws_api_gateway_integration" "auth_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  resource_id = aws_api_gateway_resource.auth_resource.id
  http_method = aws_api_gateway_method.auth_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.user_lambda.invoke_arn
}

resource "aws_api_gateway_integration" "recipe_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  resource_id = aws_api_gateway_resource.recipe_resource.id
  http_method = aws_api_gateway_method.recipe_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.recipe_lambda.invoke_arn
}

resource "aws_api_gateway_integration" "auth_proxy_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  resource_id = aws_api_gateway_resource.auth_proxy_resource.id
  http_method = aws_api_gateway_method.auth_proxy_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.user_lambda.invoke_arn
}

resource "aws_api_gateway_integration" "recipe_proxy_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  resource_id = aws_api_gateway_resource.recipe_proxy_resource.id
  http_method = aws_api_gateway_method.recipe_proxy_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.recipe_lambda.invoke_arn
}

resource "aws_api_gateway_integration" "user_proxy_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  resource_id = aws_api_gateway_resource.user_proxy_resource.id
  http_method = aws_api_gateway_method.user_proxy_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.user_lambda.invoke_arn
}

# Custom Authorizer
resource "aws_api_gateway_authorizer" "lambda_authorizer" {
  name                   = "${var.app_name}-authorizer-${var.environment}"
  rest_api_id           = aws_api_gateway_rest_api.recipe_app_api.id
  authorizer_uri        = aws_lambda_function.authorizer_lambda.invoke_arn
  authorizer_credentials = aws_iam_role.api_gateway_authorizer_role.arn
  type                  = "REQUEST"
  identity_source       = "method.request.header.Authorization"
  authorizer_result_ttl_in_seconds = 300
}

