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

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "recipe-app"
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

# API Gateway
resource "aws_api_gateway_rest_api" "recipe_app_api" {
  name        = "${var.app_name}-api-${var.environment}"
  description = "Recipe App API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_deployment" "recipe_app_deployment" {
  depends_on = [
    aws_api_gateway_method.recipe_method,
    aws_api_gateway_method.user_method
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
  authorization = "NONE"
}

# User resource
resource "aws_api_gateway_resource" "user_resource" {
  rest_api_id = aws_api_gateway_rest_api.recipe_app_api.id
  parent_id   = aws_api_gateway_rest_api.recipe_app_api.root_resource_id
  path_part   = "users"
}

resource "aws_api_gateway_method" "user_method" {
  rest_api_id   = aws_api_gateway_rest_api.recipe_app_api.id
  resource_id   = aws_api_gateway_resource.user_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Outputs
output "api_gateway_url" {
  description = "API Gateway URL"
  value       = aws_api_gateway_deployment.recipe_app_deployment.invoke_url
}

output "lambda_execution_role_arn" {
  description = "Lambda execution role ARN"
  value       = aws_iam_role.lambda_execution_role.arn
}