# Deployment Guide

Complete guide for deploying and managing the portfolio application across different environments.

## Table of Contents
- [Overview](#overview)
- [Environment Setup](#environment-setup)
- [Deployment Platforms](#deployment-platforms)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variables](#environment-variables)
- [Database Deployment](#database-deployment)
- [Monitoring Setup](#monitoring-setup)
- [Security Configuration](#security-configuration)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Overview

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ • Local dev     │    │ • Pre-prod      │    │ • Live site     │
│ • Hot reload    │    │ • Testing       │    │ • Optimized     │
│ • Debug mode    │    │ • QA approval   │    │ • Monitoring    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    CI/CD        │
                    │                 │
                    │ • GitHub Actions│
                    │ • Automated     │
                    │ • Testing       │
                    │ • Deployment    │
                    └─────────────────┘
```

### Technology Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase Functions
- **Database**: Firestore, Firebase Storage
- **Authentication**: Firebase Auth
- **Hosting**: Vercel (Primary), Firebase Hosting (Backup)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, Vercel Analytics, Firebase Performance

## Environment Setup

### Prerequisites
```bash
# Required software
node -v    # v18.0.0 or higher
npm -v     # v9.0.0 or higher
git --version

# Recommended tools
firebase --version
vercel --version
gh --version  # GitHub CLI
```

### Development Environment
```bash
# Clone repository
git clone https://github.com/your-username/portfolio-sujit.git
cd portfolio-sujit

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local

# Start development server
npm run dev
```

### Environment Variables Setup
```bash
# Development (.env.local)
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_dev_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-dev.firebaseapp.com
# ... other Firebase config

# Development-specific
NEXT_PUBLIC_SHOW_PERFORMANCE_MONITOR=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=false
```

## Deployment Platforms

### Vercel Deployment (Primary)

#### Initial Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Set up environments
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
# ... add all required environment variables
```

#### Manual Deployment
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy specific branch
vercel --prod --target production
```

#### Automatic Deployment
- **Trigger**: Push to `main` branch
- **Preview**: All pull requests
- **Production**: Merge to `main`
- **Configuration**: `vercel.json`

### Firebase Hosting (Backup)

#### Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init hosting

# Build for static export
npm run build
npm run export

# Deploy to Firebase
firebase deploy --only hosting
```

#### Environment-Specific Deployment
```bash
# Staging
firebase use staging
firebase deploy --only hosting

# Production
firebase use production
firebase deploy --only hosting
```

## CI/CD Pipeline

### GitHub Actions Workflow

#### Main Workflow (`.github/workflows/ci.yml`)
```yaml
# Triggered on push to main, develop, staging branches
# Includes: lint, test, build, security scan, deploy
```

#### Workflow Stages
1. **Code Quality**
   - ESLint
   - Prettier
   - TypeScript check

2. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

3. **Security**
   - Dependency audit
   - SAST scan
   - Secret detection

4. **Build**
   - Next.js build
   - Bundle analysis
   - Performance checks

5. **Deploy**
   - Environment-specific deployment
   - Health checks
   - Notifications

### Branch Strategy
```
main (production)     ←── merge from staging
  ↑
staging (pre-prod)    ←── merge from develop
  ↑
develop (integration) ←── merge from feature branches
  ↑
feature/xxx           ←── new features
```

### Deployment Process
```bash
# 1. Create feature branch
git checkout -b feature/new-component
git push -u origin feature/new-component

# 2. Make changes and commit
git add .
git commit -m "feat: add new component"
git push

# 3. Create pull request
gh pr create --title "Add new component" --body "Description"

# 4. Merge to develop (triggers staging deployment)
gh pr merge --merge

# 5. Promote to staging
git checkout staging
git merge develop
git push origin staging

# 6. Promote to production
git checkout main
git merge staging
git push origin main
```

## Environment Variables

### Environment-Specific Configuration

#### Development
```env
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_PROJECT_ID=portfolio-dev
NEXT_PUBLIC_SHOW_PERFORMANCE_MONITOR=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

#### Staging
```env
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_APP_URL=https://portfolio-sujit-staging.vercel.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=portfolio-staging
NEXT_PUBLIC_SHOW_PERFORMANCE_MONITOR=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

#### Production
```env
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://sujitportfolio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=portfolio-prod
NEXT_PUBLIC_SHOW_PERFORMANCE_MONITOR=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Secret Management

#### Vercel Secrets
```bash
# Add secrets via CLI
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production
vercel env add SENTRY_AUTH_TOKEN production

# Or via Vercel Dashboard:
# Project Settings > Environment Variables
```

#### GitHub Secrets
```bash
# Repository Settings > Secrets and Variables > Actions
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
SENTRY_AUTH_TOKEN=your_sentry_token
```

## Database Deployment

### Firestore Setup

#### Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access to portfolio data
    match /projects/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    
    match /experiences/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Admin-only write access
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

#### Indexes
```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "featured", "order": "DESCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "experiences",
      "queryScope": "COLLECTION", 
      "fields": [
        {"fieldPath": "startDate", "order": "DESCENDING"},
        {"fieldPath": "endDate", "order": "DESCENDING"}
      ]
    }
  ]
}
```

#### Deploy Database Rules
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy all database configuration
firebase deploy --only firestore
```

### Firebase Storage Setup

#### Storage Rules
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images - public read, auth write
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Documents - auth required
    match /documents/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Public assets
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

## Monitoring Setup

### Sentry Configuration
```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Login to Sentry
sentry-cli login

# Create new project
sentry-cli projects create portfolio-sujit

# Upload source maps (automated in CI/CD)
sentry-cli releases files $RELEASE upload-sourcemaps .next/static/
```

### Performance Monitoring
```typescript
// lib/monitoring.ts setup
import { initializePerformanceTracking } from '@/lib/monitoring'

// Initialize in _app.tsx
useEffect(() => {
  if (typeof window !== 'undefined') {
    initializePerformanceTracking()
  }
}, [])
```

### Analytics Setup
```typescript
// Google Analytics 4
gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: document.title,
  page_location: window.location.href
})

// Vercel Analytics
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

## Security Configuration

### Content Security Policy
```javascript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://firestore.googleapis.com https://*.sentry.io;
`

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  }
]
```

### Environment Security
```bash
# Production environment checklist
□ All secrets stored securely
□ CSP headers configured
□ HTTPS enforced
□ Firebase security rules deployed
□ Rate limiting configured
□ Error messages sanitized
□ Debug mode disabled
□ Source maps uploaded to Sentry only
```

## Performance Optimization

### Build Optimization
```javascript
// next.config.js
module.exports = {
  // Enable SWC minification
  swcMinify: true,
  
  // Enable experimental features
  experimental: {
    optimizeCss: true,
    optimizeImages: true
  },
  
  // Bundle analyzer
  analyzeBundle: process.env.ANALYZE === 'true',
  
  // Image optimization
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif']
  }
}
```

### Deployment Optimization
```bash
# Pre-deployment optimization
npm run lint
npm run type-check
npm run test
npm run build
npm run analyze  # Bundle size analysis
```

### CDN Configuration
```javascript
// Configure CDN in vercel.json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=300, stale-while-revalidate" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=86400, stale-while-revalidate" }
      ]
    }
  ]
}
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check Node.js version
node -v

# Clear cache
npm ci
rm -rf .next

# Check TypeScript errors
npm run type-check

# Check for circular dependencies
npx madge --circular src/
```

#### Environment Variable Issues
```bash
# Verify environment variables
vercel env ls

# Test locally with production env
cp .env.production .env.local
npm run dev

# Check Vercel deployment logs
vercel logs
```

#### Database Connection Issues
```bash
# Test Firestore connection
npm run test:firestore

# Check Firebase project
firebase projects:list
firebase use --add

# Verify service account permissions
firebase auth:export users.json
```

#### Performance Issues
```bash
# Analyze bundle size
npm run analyze

# Check Core Web Vitals
npm run lighthouse

# Profile application
npm run dev -- --profile
```

### Deployment Rollback

#### Quick Rollback (Vercel)
```bash
# List recent deployments
vercel list

# Promote previous deployment
vercel promote https://portfolio-sujit-xxx.vercel.app --target production
```

#### Git-based Rollback
```bash
# Find last known good commit
git log --oneline -10

# Create rollback branch
git checkout -b rollback/fix-critical-issue

# Revert to good commit
git reset --hard GOOD_COMMIT_HASH

# Force push (use with caution)
git push --force-with-lease origin rollback/fix-critical-issue

# Create emergency PR
gh pr create --title "EMERGENCY: Rollback to stable version"
```

### Health Checks

#### Post-Deployment Verification
```bash
#!/bin/bash
# scripts/health-check.sh

URL="https://sujitportfolio.com"
ENDPOINTS=("/" "/about" "/projects" "/contact" "/api/health")

echo "🏥 Health Check: $URL"
echo "================================"

for endpoint in "${ENDPOINTS[@]}"; do
    echo -n "Checking $endpoint... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$URL$endpoint")
    
    if [ "$response" -eq 200 ]; then
        echo "✅ OK ($response)"
    else
        echo "❌ FAILED ($response)"
        exit 1
    fi
done

echo "================================"
echo "✅ All health checks passed!"
```

#### Automated Monitoring
```bash
# Add to CI/CD pipeline
- name: Post-deployment health check
  run: |
    sleep 30  # Wait for deployment to propagate
    ./scripts/health-check.sh ${{ steps.deploy.outputs.url }}
```

## Best Practices

### Pre-Deployment Checklist
```
□ All tests passing
□ Code reviewed and approved
□ Environment variables configured
□ Database migrations applied
□ Security headers configured
□ Performance optimizations applied
□ Monitoring and logging configured
□ Backup created
□ Rollback plan prepared
□ Team notified
```

### Post-Deployment Checklist
```
□ Health checks passed
□ Core functionality verified
□ Performance metrics normal
□ Error rates acceptable
□ Monitoring dashboards updated
□ Documentation updated
□ Team notified of successful deployment
□ Monitor for 24 hours
```

### Emergency Procedures
1. **Critical Issue**: Immediate rollback
2. **Performance Degradation**: Scale resources, investigate
3. **Security Breach**: Take offline, assess, patch, restore
4. **Data Loss**: Restore from backup, investigate cause
5. **Service Outage**: Check dependencies, scale, communicate

### Documentation Maintenance
- Update deployment guide after process changes
- Document new environment variables
- Keep troubleshooting section current
- Review and update monthly
- Version control all documentation changes

## Support and Resources

### Internal Resources
- **Documentation**: `/docs/` directory
- **Scripts**: `/scripts/` directory
- **Configuration**: Root-level config files

### External Resources
- **Vercel Docs**: https://vercel.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Actions**: https://docs.github.com/actions

### Emergency Contacts
- **Primary Developer**: [Your Email]
- **DevOps Lead**: [DevOps Email]
- **Vercel Support**: https://vercel.com/support
- **Firebase Support**: https://firebase.google.com/support

### Monitoring URLs
- **Production**: https://sujitportfolio.com
- **Staging**: https://portfolio-sujit-staging.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Console**: https://console.firebase.google.com
- **Sentry Dashboard**: https://sentry.io/organizations/your-org/