terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment for remote state storage in production
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "recipe-app/terraform.tfstate"
  #   region = "ap-southeast-1"
  # }
}

provider "aws" {
  region = var.aws_region
}