resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"

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
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.basicauth.arn
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
    cloudfront_default_certificate = true
  }
}

resource "aws_cloudfront_origin_access_identity" "frontend" {}

resource "aws_cloudfront_function" "basicauth" {
  name    = "${local.prefix}-basicauth"
  runtime = "cloudfront-js-1.0"
  publish = true
  code = templatefile(
    "${path.module}/basicauth.js",
    {
      authString = format("Basic %s", base64encode("${var.basicauth_username}:${var.basicauth_password}"))
    }
  )
}

