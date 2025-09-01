# API Gateway REST API
resource "aws_api_gateway_rest_api" "recipe_api" {
  name        = "${var.environment}-recipe-api"
  description = "Recipe Application API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  # Explicitly clear binary media types for predictable CORS preflight behavior
  binary_media_types = []
}

# -----------------------------
# Resources
# -----------------------------

# /auth
resource "aws_api_gateway_resource" "auth" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  parent_id   = aws_api_gateway_rest_api.recipe_api.root_resource_id
  path_part   = "auth"
}

# /auth/{proxy+}
resource "aws_api_gateway_resource" "auth_proxy" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "{proxy+}"
}

# /recipes
resource "aws_api_gateway_resource" "recipes" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  parent_id   = aws_api_gateway_rest_api.recipe_api.root_resource_id
  path_part   = "recipes"
}

# /recipes/{proxy+}
resource "aws_api_gateway_resource" "recipes_proxy" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  parent_id   = aws_api_gateway_resource.recipes.id
  path_part   = "{proxy+}"
}

# -----------------------------
# Methods and Integrations
# -----------------------------

# Auth: ANY on /auth (no auth)
resource "aws_api_gateway_method" "auth_root_any" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_api.id
  resource_id   = aws_api_gateway_resource.auth.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_root_integration" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth.id
  http_method = aws_api_gateway_method.auth_root_any.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.user_lambda.invoke_arn
}

# Auth: ANY on /auth/{proxy+} (no auth)
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
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.user_lambda.invoke_arn
}

# Recipes: ANY on /recipes (with authorizer)
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
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.recipe_lambda.invoke_arn

  # Pass through selected authorizer context as headers (best-effort)
  request_parameters = {
    "integration.request.header.X-User-Id"            = "context.authorizer.userId"
    "integration.request.header.X-Authorizer-Context" = "context.authorizer.email"
  }
}

# Recipes: ANY on /recipes/{proxy+} (with authorizer)
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
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.recipe_lambda.invoke_arn

  # Pass through selected authorizer context as headers (best-effort)
  request_parameters = {
    "integration.request.header.X-User-Id"            = "context.authorizer.userId"
    "integration.request.header.X-Authorizer-Context" = "context.authorizer.email"
  }
}

# -----------------------------
# CORS (for local browser access)
# -----------------------------

# CORS for /auth
resource "aws_api_gateway_method" "auth_root_options" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_api.id
  resource_id   = aws_api_gateway_resource.auth.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_root_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth.id
  http_method = aws_api_gateway_method.auth_root_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "auth_root_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth.id
  http_method = aws_api_gateway_method.auth_root_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "auth_root_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth.id
  http_method = aws_api_gateway_method.auth_root_options.http_method
  status_code = aws_api_gateway_method_response.auth_root_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'",
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Requested-With'"
  }

  response_templates = {
    "application/json" = ""
  }
}

# CORS for /auth/{proxy+}
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
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "auth_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth_proxy.id
  http_method = aws_api_gateway_method.auth_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "auth_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth_proxy.id
  http_method = aws_api_gateway_method.auth_options.http_method
  status_code = aws_api_gateway_method_response.auth_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'",
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Requested-With'"
  }

  response_templates = {
    "application/json" = ""
  }
}

# CORS for /recipes
resource "aws_api_gateway_method" "recipes_root_options" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_api.id
  resource_id   = aws_api_gateway_resource.recipes.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "recipes_root_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.recipes.id
  http_method = aws_api_gateway_method.recipes_root_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "recipes_root_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.recipes.id
  http_method = aws_api_gateway_method.recipes_root_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "recipes_root_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.recipes.id
  http_method = aws_api_gateway_method.recipes_root_options.http_method
  status_code = aws_api_gateway_method_response.recipes_root_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'",
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Requested-With'"
  }

  response_templates = {
    "application/json" = ""
  }
}

# CORS for /recipes/{proxy+}
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
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "recipes_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.recipes_proxy.id
  http_method = aws_api_gateway_method.recipes_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "recipes_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.recipes_proxy.id
  http_method = aws_api_gateway_method.recipes_options.http_method
  status_code = aws_api_gateway_method_response.recipes_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'",
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Requested-With'"
  }

  response_templates = {
    "application/json" = ""
  }
}

# Ensure CORS headers are also present for default error responses
resource "aws_api_gateway_gateway_response" "default_4xx" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  response_type = "DEFAULT_4XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'",
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'*'",
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'*'"
  }
}

resource "aws_api_gateway_gateway_response" "default_5xx" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  response_type = "DEFAULT_5XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'",
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'*'",
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'*'"
  }
}

# -----------------------------
# Deployment and Stage
# -----------------------------

resource "aws_api_gateway_deployment" "recipe_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id

  depends_on = [
    # Auth
    aws_api_gateway_method.auth_root_any,
    aws_api_gateway_integration.auth_root_integration,
    aws_api_gateway_method.auth_any,
    aws_api_gateway_integration.auth_integration,
    aws_api_gateway_method.auth_root_options,
    aws_api_gateway_integration.auth_root_options,
    aws_api_gateway_method.auth_options,
    aws_api_gateway_integration.auth_options,

    # Recipes
    aws_api_gateway_method.recipes_root_any,
    aws_api_gateway_integration.recipes_root_integration,
    aws_api_gateway_method.recipes_any,
    aws_api_gateway_integration.recipes_integration,
    aws_api_gateway_method.recipes_root_options,
    aws_api_gateway_integration.recipes_root_options,
    aws_api_gateway_method.recipes_options,
    aws_api_gateway_integration.recipes_options,
  ]

  triggers = {
    redeployment = sha1(jsonencode([
      # resources
      aws_api_gateway_resource.auth.id,
      aws_api_gateway_resource.auth_proxy.id,
      aws_api_gateway_resource.recipes.id,
      aws_api_gateway_resource.recipes_proxy.id,
      # methods
      aws_api_gateway_method.auth_root_any.id,
      aws_api_gateway_method.auth_any.id,
      aws_api_gateway_method.recipes_root_any.id,
      aws_api_gateway_method.recipes_any.id,
      aws_api_gateway_method.auth_root_options.id,
      aws_api_gateway_method.auth_options.id,
      aws_api_gateway_method.recipes_root_options.id,
      aws_api_gateway_method.recipes_options.id,
      # integrations
      aws_api_gateway_integration.auth_root_integration.id,
      aws_api_gateway_integration.auth_integration.id,
      aws_api_gateway_integration.recipes_root_integration.id,
      aws_api_gateway_integration.recipes_integration.id,
      aws_api_gateway_integration.auth_root_options.id,
      aws_api_gateway_integration.auth_options.id,
      aws_api_gateway_integration.recipes_root_options.id,
      aws_api_gateway_integration.recipes_options.id,
      # gateway responses
      aws_api_gateway_gateway_response.default_4xx.id,
      aws_api_gateway_gateway_response.default_5xx.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "recipe_api_stage" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_api.id
  deployment_id = aws_api_gateway_deployment.recipe_api_deployment.id
  stage_name    = var.environment
}

# Configure API Gateway account for CloudWatch logging
resource "aws_api_gateway_account" "account" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch_role.arn
}

# Enable execution logging for all methods in the stage
resource "aws_api_gateway_method_settings" "all" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  stage_name  = aws_api_gateway_stage.recipe_api_stage.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled    = true
    logging_level      = "INFO"
    data_trace_enabled = false
  }
}
