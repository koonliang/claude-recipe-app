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

output "api_gateway_rest_api_id" {
  description = "API Gateway REST API ID"
  value       = aws_api_gateway_rest_api.recipe_api.id
}

output "api_gateway_stage_name" {
  description = "API Gateway Stage Name"
  value       = aws_api_gateway_stage.recipe_api_stage.stage_name
}