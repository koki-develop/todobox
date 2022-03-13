variable "stage" {
  type = string
}

locals {
  prefix = "todo-box-${var.stage}"
}
