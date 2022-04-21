variable "basicauth_username" {
  type      = string
  sensitive = true
}

variable "basicauth_password" {
  type      = string
  sensitive = true
}

terraform {
  backend "s3" {
    workspace_key_prefix = "workspaces"
    region               = "us-east-1"
    bucket               = "todobox-tfstates"
    key                  = "terraform.tfstate"
  }
}

module "aws" {
  source = "./modules/aws"
  stage  = terraform.workspace

  basicauth_username = var.basicauth_username
  basicauth_password = var.basicauth_password
}
