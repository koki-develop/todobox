module "aws" {
  source = "./modules/aws"
  stage  = terraform.workspace

  basicauth_username = var.basicauth_username
  basicauth_password = var.basicauth_password
}
