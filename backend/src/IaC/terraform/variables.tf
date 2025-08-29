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
  default     = "JHdNc+FmHGMvUYRri9NhWLAlUoLCZX5OXTgACXeRS84="
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
  description = "Database connection string (can be empty if not using database)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "enable_seed_data" {
  description = "Enable database seeding on application startup"
  type        = bool
  default     = true
}

variable "seed_only_if_empty" {
  description = "Only seed data if database is empty"
  type        = bool
  default     = false
}