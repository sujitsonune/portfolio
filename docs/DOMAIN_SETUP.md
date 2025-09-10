# Custom Domain Setup Guide

This guide covers setting up custom domains for your portfolio across different hosting platforms.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Vercel Domain Setup](#vercel-domain-setup)
- [Firebase Hosting Domain Setup](#firebase-hosting-domain-setup)
- [DNS Configuration](#dns-configuration)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Domain Verification](#domain-verification)
- [Subdomain Configuration](#subdomain-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up a custom domain, ensure you have:

1. **Domain purchased** from a registrar (GoDaddy, Namecheap, Google Domains, etc.)
2. **Access to DNS settings** for your domain
3. **Project deployed** and working on the default hosting URLs
4. **Admin access** to your hosting platform (Vercel/Firebase)

## Vercel Domain Setup

### 1. Add Domain to Vercel Project

```bash
# Using Vercel CLI
vercel domains add yourdomain.com

# Or add through Vercel Dashboard:
# 1. Go to your project dashboard
# 2. Navigate to "Settings" > "Domains"
# 3. Click "Add Domain"
# 4. Enter your domain name
```

### 2. Configure DNS Records

Add these DNS records to your domain registrar:

#### For Root Domain (yourdomain.com)
```dns
Type: A
Name: @
Value: 76.76.19.61
TTL: 3600
```

#### For WWW Subdomain
```dns
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 3. Automatic SSL
Vercel automatically provisions SSL certificates via Let's Encrypt.

## Firebase Hosting Domain Setup

### 1. Add Domain to Firebase Console

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Enter your domain name
4. Choose domain ownership verification method

### 2. Verify Domain Ownership

#### Option A: TXT Record Verification
```dns
Type: TXT
Name: @
Value: firebase-hosting-verify-xxxxx
TTL: 3600
```

#### Option B: HTML File Upload
Upload the verification file to your domain's root directory.

### 3. Configure DNS Records

#### For Root Domain
```dns
Type: A
Name: @
Value: 199.36.158.100
TTL: 3600

Type: A
Name: @
Value: 199.36.158.100
TTL: 3600
```

#### For WWW Subdomain
```dns
Type: CNAME
Name: www
Value: hosting.firebase.com
TTL: 3600
```

## DNS Configuration Examples

### Common DNS Providers

#### Cloudflare
```bash
# Root domain
Type: A, Name: @, Content: 76.76.19.61, Proxy: DNS only
Type: A, Name: @, Content: 199.36.158.100, Proxy: DNS only

# WWW subdomain
Type: CNAME, Name: www, Content: cname.vercel-dns.com, Proxy: DNS only
```

#### Google Domains
```bash
# Custom resource records
@ A 1800 76.76.19.61
www CNAME 1800 cname.vercel-dns.com.
```

#### Namecheap
```bash
# A Records
Host: @, Value: 76.76.19.61, TTL: Automatic

# CNAME Records
Host: www, Value: cname.vercel-dns.com, TTL: Automatic
```

## SSL Certificate Setup

### Vercel SSL (Automatic)
- SSL certificates are automatically provisioned
- Supports both Let's Encrypt and custom certificates
- HTTPS redirect is enabled by default

### Firebase Hosting SSL
- SSL certificates are automatically managed
- Supports custom certificates for enterprise plans
- HTTP to HTTPS redirection is automatic

### Manual SSL Certificate (Optional)

If you need to upload a custom SSL certificate:

1. **Generate or obtain SSL certificate**
```bash
# Using OpenSSL (for testing only)
openssl req -x509 -newkey rsa:4096 -keyout private.key -out certificate.crt -days 365
```

2. **Upload to hosting platform**
   - Vercel: Dashboard > Settings > Domains > SSL Certificate
   - Firebase: Contact support for enterprise SSL

## Domain Verification

### Verify DNS Propagation
```bash
# Check DNS propagation globally
dig yourdomain.com
nslookup yourdomain.com

# Online tools
# https://www.whatsmydns.net/
# https://dnschecker.org/
```

### Test Domain Access
```bash
# Test HTTP/HTTPS access
curl -I https://yourdomain.com
curl -I https://www.yourdomain.com

# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

## Subdomain Configuration

### Development Subdomain (dev.yourdomain.com)
```dns
Type: CNAME
Name: dev
Value: your-dev-project.vercel.app
TTL: 3600
```

### Staging Subdomain (staging.yourdomain.com)
```dns
Type: CNAME
Name: staging
Value: your-staging-project.vercel.app
TTL: 3600
```

### API Subdomain (api.yourdomain.com)
```dns
Type: CNAME
Name: api
Value: your-api-project.vercel.app
TTL: 3600
```

## Environment-Specific Domains

### Production
- **Primary**: yourdomain.com
- **WWW**: www.yourdomain.com
- **SSL**: Required
- **CDN**: Enabled

### Staging
- **Domain**: staging.yourdomain.com
- **SSL**: Required
- **Password Protection**: Optional
- **Analytics**: Disabled

### Development
- **Domain**: dev.yourdomain.com
- **SSL**: Optional
- **Debug Mode**: Enabled
- **Analytics**: Disabled

## Security Considerations

### DNS Security
```dns
# Add CAA record to prevent unauthorized SSL certificates
Type: CAA
Name: @
Value: 0 issue "letsencrypt.org"
TTL: 3600

Type: CAA
Name: @
Value: 0 issuewild "letsencrypt.org"
TTL: 3600
```

### HSTS Headers
Ensure your hosting platform includes HSTS headers:
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

## Troubleshooting

### Common Issues

#### Domain Not Resolving
```bash
# Check DNS records
dig +trace yourdomain.com

# Clear local DNS cache
# Windows
ipconfig /flushdns

# macOS
sudo dscacheutil -flushcache

# Linux
sudo systemctl restart systemd-resolved
```

#### SSL Certificate Issues
```bash
# Check certificate details
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com | openssl x509 -noout -text

# Check certificate chain
ssl-cert-check -c yourdomain.com
```

#### 404 Errors After Domain Setup
1. Verify DNS propagation (can take up to 48 hours)
2. Check hosting platform configuration
3. Ensure build and deployment succeeded
4. Verify redirect rules are correct

### DNS Propagation Timeline
- **Local DNS**: 0-30 minutes
- **ISP DNS**: 1-4 hours
- **Global DNS**: 4-48 hours
- **CDN Edge Locations**: 1-24 hours

### Support Contacts

#### Vercel Support
- **Documentation**: https://vercel.com/docs/concepts/projects/domains
- **Support**: https://vercel.com/support
- **Community**: https://github.com/vercel/vercel/discussions

#### Firebase Support
- **Documentation**: https://firebase.google.com/docs/hosting/custom-domain
- **Support**: https://firebase.google.com/support
- **Community**: https://stackoverflow.com/questions/tagged/firebase-hosting

## Monitoring and Maintenance

### Domain Health Checks
```bash
#!/bin/bash
# domain-health-check.sh

DOMAIN="yourdomain.com"
ENDPOINTS=("/" "/about" "/projects" "/contact")

for endpoint in "${ENDPOINTS[@]}"; do
    echo "Checking: https://$DOMAIN$endpoint"
    curl -I -s "https://$DOMAIN$endpoint" | head -1
done
```

### SSL Certificate Monitoring
```bash
#!/bin/bash
# ssl-monitor.sh

DOMAIN="yourdomain.com"
EXPIRY=$(openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)

echo "SSL Certificate for $DOMAIN expires: $EXPIRY"
```

### Automated Monitoring Setup
Consider using services like:
- **Pingdom**: Website uptime monitoring
- **UptimeRobot**: Free uptime monitoring
- **StatusCake**: SSL certificate monitoring
- **New Relic**: Performance monitoring

## Best Practices

1. **Always use HTTPS** in production
2. **Implement proper redirects** from HTTP to HTTPS
3. **Set up monitoring** for domain and SSL certificate
4. **Use CDN** for better performance
5. **Implement proper caching** headers
6. **Regular security audits** of domain configuration
7. **Keep DNS records** documentation updated
8. **Monitor certificate expiration** dates
9. **Test domain configuration** in staging first
10. **Have a rollback plan** for domain changes

## Quick Reference

### Essential DNS Records
```dns
# Root domain (A records for Vercel)
@ A 76.76.19.61

# WWW subdomain
www CNAME cname.vercel-dns.com

# Domain verification (when required)
@ TXT "v=verification-code-here"

# Security (CAA record)
@ CAA 0 issue "letsencrypt.org"
```

### Verification Commands
```bash
# Check domain resolution
nslookup yourdomain.com

# Test HTTPS
curl -I https://yourdomain.com

# Verify SSL
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```