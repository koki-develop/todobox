variable "stage" {
  type = string
}

variable "basicauth_username" {
  type      = string
  sensitive = true
}

variable "basicauth_password" {
  type      = string
  sensitive = true
}

locals {
  prefix = "todobox-${var.stage}"
  domain = var.stage == "prod" ? "todobox.xyz" : "${var.stage}.todobox.xyz"
}
