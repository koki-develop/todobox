resource "aws_s3_bucket" "frontend" {
  bucket = "${local.prefix}-frontend"
}

resource "aws_s3_bucket_acl" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  acl    = "private"
}
