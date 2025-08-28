output "api_gateway_url" {
  description = "The URL of the API Gateway"
  value       = "https://${aws_api_gateway_rest_api.recipe_app_api.id}.execute-api.${var.aws_region}.amazonaws.com/${var.environment}"
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

output "user_lambda_function_name" {
  description = "Name of the User Lambda function"
  value       = aws_lambda_function.user_lambda.function_name
}

output "user_lambda_function_arn" {
  description = "ARN of the User Lambda function"
  value       = aws_lambda_function.user_lambda.arn
}

output "recipe_lambda_function_name" {
  description = "Name of the Recipe Lambda function"
  value       = aws_lambda_function.recipe_lambda.function_name
}

output "recipe_lambda_function_arn" {
  description = "ARN of the Recipe Lambda function"
  value       = aws_lambda_function.recipe_lambda.arn
}

output "authorizer_lambda_function_name" {
  description = "Name of the Authorizer Lambda function"
  value       = aws_lambda_function.authorizer_lambda.function_name
}

output "authorizer_lambda_function_arn" {
  description = "ARN of the Authorizer Lambda function"
  value       = aws_lambda_function.authorizer_lambda.arn
}