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

# Auth Profile Resource (/auth/profile) - Special handling for authorization
resource "aws_api_gateway_resource" "auth_profile" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "profile"
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

# Auth Methods (No Authorization except /profile)
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

# Auth Profile Method (Requires Authorization)
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
}

# Recipes Methods (With Authorization)
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
}

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
    "application/json" = "{\"statusCode\": 200}"
  }
}


resource "aws_api_gateway_integration_response" "auth_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth_proxy.id
  http_method = aws_api_gateway_method.auth_options.http_method
  status_code = "200"

  depends_on = [aws_api_gateway_method_response.auth_options]

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

resource "aws_api_gateway_method_response" "auth_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth_proxy.id
  http_method = aws_api_gateway_method.auth_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}


# CORS for auth profile endpoint
resource "aws_api_gateway_method" "auth_profile_options" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_api.id
  resource_id   = aws_api_gateway_resource.auth_profile.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_profile_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth_profile.id
  http_method = aws_api_gateway_method.auth_profile_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "auth_profile_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth_profile.id
  http_method = aws_api_gateway_method.auth_profile_options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "auth_profile_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.auth_profile.id
  http_method = aws_api_gateway_method.auth_profile_options.http_method
  status_code = "200"

  depends_on = [aws_api_gateway_method_response.auth_profile_options]

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Requested-With'"
  }
}

# CORS for recipes endpoints
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
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "recipes_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.recipes_proxy.id
  http_method = aws_api_gateway_method.recipes_options.http_method
  status_code = "200"

  depends_on = [aws_api_gateway_method_response.recipes_options]

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Requested-With'"
  }
}

# CORS for recipes root endpoint
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
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "recipes_root_options" {
  rest_api_id = aws_api_gateway_rest_api.recipe_api.id
  resource_id = aws_api_gateway_resource.recipes.id
  http_method = aws_api_gateway_method.recipes_root_options.http_method
  status_code = "200"

  depends_on = [aws_api_gateway_method_response.recipes_root_options]

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Requested-With'"
  }
}

# API Gateway Deployment and Stage
resource "aws_api_gateway_deployment" "recipe_api_deployment" {
  depends_on = [
    aws_api_gateway_method.auth_any,
    aws_api_gateway_method.auth_profile_get,
    aws_api_gateway_method.recipes_any,
    aws_api_gateway_method.recipes_root_any,
    aws_api_gateway_method.auth_options,
    aws_api_gateway_method.auth_profile_options,
    aws_api_gateway_method.recipes_options,
    aws_api_gateway_method.recipes_root_options,
    aws_api_gateway_integration.auth_integration,
    aws_api_gateway_integration.auth_profile_integration,
    aws_api_gateway_integration.recipes_integration,
    aws_api_gateway_integration.recipes_root_integration,
    aws_api_gateway_integration.auth_options,
    aws_api_gateway_integration.auth_profile_options,
    aws_api_gateway_integration.recipes_options,
    aws_api_gateway_integration.recipes_root_options,
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
      aws_api_gateway_method.auth_options.id,
      aws_api_gateway_integration.auth_options.id,
      aws_api_gateway_integration_response.auth_options.id,
      aws_api_gateway_method_response.auth_options.id,
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