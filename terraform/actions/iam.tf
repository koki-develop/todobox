data "aws_iam_openid_connect_provider" "actions" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_role" "actions" {
  name               = "${local.prefix}-role"
  assume_role_policy = data.aws_iam_policy_document.actions_assume_role_policy.json
}

data "aws_iam_policy_document" "actions_assume_role_policy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:koki-develop/todobox:*"]
    }
    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.actions.arn]
    }
  }
}

data "aws_iam_policy" "administrator_access" {
  arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

resource "aws_iam_role_policy_attachment" "actions-administrator_access" {
  role       = aws_iam_role.actions.name
  policy_arn = data.aws_iam_policy.administrator_access.arn
}
