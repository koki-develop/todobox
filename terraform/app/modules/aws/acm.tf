resource "aws_acm_certificate" "default" {
  domain_name       = local.domain
  validation_method = "DNS"
}

resource "aws_acm_certificate_validation" "default" {
  certificate_arn         = aws_acm_certificate.default.arn
  validation_record_fqdns = [aws_route53_record.certificate_validation.fqdn]
}
