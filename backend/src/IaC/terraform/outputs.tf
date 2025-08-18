output "api_gateway_url" {
  description = "The URL of the API Gateway"
  value       = aws_api_gateway_deployment.recipe_app_deployment.invoke_url
}

output "api_gateway_id" {
  description = "The ID of the API Gateway"
  value       = aws_api_gateway_rest_api.recipe_app_api.id
}

output "lambda_execution_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_execution_role.arn
}

output "lambda_execution_role_name" {
  description = "Name of the Lambda execution role"
  value       = aws_iam_role.lambda_execution_role.name
}

output "environment" {
  description = "The environment this infrastructure is deployed to"
  value       = var.environment
}

output "aws_region" {
  description = "The AWS region where resources are deployed"
  value       = var.aws_region
}