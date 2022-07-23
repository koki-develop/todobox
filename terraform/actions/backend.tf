terraform {
  backend "s3" {
    region  = "us-east-1"
    bucket  = "todobox-tfstates"
    key     = "actions/terraform.tfstate"
    encrypt = true
  }
}
