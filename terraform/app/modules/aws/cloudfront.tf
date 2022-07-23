resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = [local.domain]


  origin {
    origin_id   = aws_s3_bucket.frontend.id
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    target_origin_id       = aws_s3_bucket.frontend.id
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = var.stage == "prod" ? 0 : 0
    default_ttl            = var.stage == "prod" ? 3600 : 0
    max_ttl                = var.stage == "prod" ? 86400 : 0
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    dynamic "function_association" {
      for_each = var.stage != "prod" ? [1] : []
      content {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.basicauth[0].arn
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  custom_error_response {
    error_code         = 403
    response_page_path = "/"
    response_code      = 200
  }

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate.default.arn
    cloudfront_default_certificate = false
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = "sni-only"
  }
}

resource "aws_cloudfront_origin_access_identity" "frontend" {}

resource "aws_cloudfront_function" "basicauth" {
  count = var.stage == "prod" ? 0 : 1

  name    = "${local.prefix}-basicauth"
  runtime = "cloudfront-js-1.0"
  publish = true
  code = templatefile(
    "${path.module}/functions/basicauth.js",
    {
      authString = format("Basic %s", base64encode("${var.basicauth_username}:${var.basicauth_password}"))
    }
  )
}

