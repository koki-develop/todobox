data "aws_route53_zone" "default" {
  name         = "todobox.xyz"
  private_zone = false
}

resource "aws_route53_record" "default" {
  zone_id = data.aws_route53_zone.default.id
  name    = local.domain
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "certificate_validation" {
  zone_id = data.aws_route53_zone.default.zone_id
  name    = aws_acm_certificate.default.domain_validation_options.*.resource_record_name[0]
  type    = aws_acm_certificate.default.domain_validation_options.*.resource_record_type[0]
  records = [aws_acm_certificate.default.domain_validation_options.*.resource_record_value[0]]
  ttl     = 300
}
