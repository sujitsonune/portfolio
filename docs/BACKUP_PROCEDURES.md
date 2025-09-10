# Backup and Restore Procedures

This document outlines the backup and restore procedures for the portfolio application, covering all critical data and configurations.

## Table of Contents
- [Overview](#overview)
- [Backup Components](#backup-components)
- [Automated Backups](#automated-backups)
- [Manual Backup](#manual-backup)
- [Restore Procedures](#restore-procedures)
- [Backup Storage](#backup-storage)
- [Monitoring and Alerts](#monitoring-and-alerts)
- [Testing and Validation](#testing-and-validation)
- [Disaster Recovery](#disaster-recovery)

## Overview

### Backup Strategy
- **Full backups**: Complete system backup including all data and configurations
- **Incremental backups**: Daily changes and updates
- **Point-in-time recovery**: Ability to restore to any specific moment
- **Multi-location storage**: Backups stored in multiple geographic locations
- **Automated scheduling**: Regular automated backups with manual override capability

### Backup Schedule
- **Production**: Daily full backups at 2:00 AM UTC
- **Staging**: Weekly backups on Sundays
- **Development**: Manual backups before major changes
- **Critical updates**: Immediate backup before deployment

## Backup Components

### 1. Firestore Database
- **Content**: All user data, projects, experiences, skills, analytics
- **Format**: JSON export with metadata
- **Frequency**: Daily
- **Retention**: 30 days
- **Size**: ~10-50 MB (estimated)

```bash
# Manual Firestore backup
firebase firestore:export gs://your-bucket/firestore-backup/$(date +%Y%m%d)
```

### 2. Firebase Storage
- **Content**: Images, documents, media files
- **Format**: Direct file copy with manifest
- **Frequency**: Daily
- **Retention**: 30 days
- **Size**: ~100-500 MB (estimated)

### 3. Source Code
- **Content**: Complete Git repository
- **Format**: Git archive (tar.gz)
- **Frequency**: On every deployment
- **Retention**: 90 days
- **Include**: Git history, branch information, tags

### 4. Configuration Files
- **Content**: Environment configs, deployment settings
- **Format**: JSON/YAML files
- **Frequency**: On configuration changes
- **Security**: Sensitive data excluded
- **Files**: 
  - `package.json`
  - `next.config.js`
  - `firebase.json`
  - `vercel.json`
  - `tailwind.config.js`

### 5. Static Assets
- **Content**: Public files, images, documents
- **Format**: Direct file copy
- **Frequency**: Weekly
- **Retention**: 60 days

### 6. Analytics and Logs
- **Content**: Performance metrics, error logs
- **Format**: JSON exports
- **Frequency**: Daily
- **Retention**: 90 days

## Automated Backups

### GitHub Actions Backup Workflow

```yaml
name: Automated Backup
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run backup script
        env:
          FIREBASE_ADMIN_PROJECT_ID: ${{ secrets.FIREBASE_ADMIN_PROJECT_ID }}
          FIREBASE_ADMIN_CLIENT_EMAIL: ${{ secrets.FIREBASE_ADMIN_CLIENT_EMAIL }}
          FIREBASE_ADMIN_PRIVATE_KEY: ${{ secrets.FIREBASE_ADMIN_PRIVATE_KEY }}
          BACKUP_STORAGE_BUCKET: ${{ secrets.BACKUP_STORAGE_BUCKET }}
        run: node scripts/backup.js
      
      - name: Upload to cloud storage
        run: |
          gsutil cp backups/*.tar.gz gs://$BACKUP_STORAGE_BUCKET/automated/
```

### Cron Job Setup (Alternative)

```bash
# Add to crontab for server-based backups
0 2 * * * cd /path/to/portfolio && NODE_ENV=production node scripts/backup.js
```

## Manual Backup

### Quick Manual Backup
```bash
# Full backup
npm run backup

# Component-specific backups
npm run backup:firestore
npm run backup:storage
npm run backup:source
```

### Pre-deployment Backup
```bash
# Before major deployments
npm run backup:pre-deploy
```

### Script Usage
```bash
# Using the backup script directly
node scripts/backup.js

# With custom options
BACKUP_DIR=/custom/path node scripts/backup.js
```

## Restore Procedures

### 1. List Available Backups
```bash
# List all available backups
node scripts/restore.js --list

# Output example:
# Available backups:
# 1. 2024-01-15T02-00-00-000Z.tar.gz
#    Created: 2024-01-15T02:00:00.000Z
#    Size: 45.2 MB
```

### 2. Full System Restore
```bash
# Interactive restore
node scripts/restore.js backups/2024-01-15T02-00-00-000Z.tar.gz

# The script will:
# 1. Extract the backup
# 2. Verify integrity
# 3. Show restore plan
# 4. Ask for confirmation
# 5. Perform restore operations
```

### 3. Component-Specific Restore

#### Firestore Only
```bash
# Extract backup manually
tar -xzf backup.tar.gz

# Import Firestore data
firebase firestore:import extracted-backup/firestore
```

#### Storage Only
```bash
# Use Firebase CLI
gsutil -m cp -r extracted-backup/storage/* gs://your-bucket/
```

#### Source Code Only
```bash
# Extract and deploy
tar -xzf backup.tar.gz
cd extracted-backup/source
tar -xzf source.tar.gz
# Deploy using normal deployment process
```

### 4. Point-in-Time Restore
```bash
# Find backup from specific date
ls -la backups/ | grep "2024-01-10"

# Restore from that backup
node scripts/restore.js backups/2024-01-10T02-00-00-000Z.tar.gz
```

## Backup Storage

### Storage Locations
1. **Primary**: Google Cloud Storage
   - Bucket: `portfolio-backups-primary`
   - Location: Multi-regional (US)
   - Versioning: Enabled
   - Lifecycle: Delete after 30 days

2. **Secondary**: AWS S3
   - Bucket: `portfolio-backups-secondary`
   - Location: us-west-2
   - Versioning: Enabled
   - Lifecycle: Archive to Glacier after 7 days

3. **Local**: Development backups
   - Path: `./backups/`
   - Retention: 7 days
   - Purpose: Testing and development

### Storage Configuration
```bash
# Set up Google Cloud Storage
gsutil mb -p your-project-id -c STANDARD -l US gs://portfolio-backups-primary
gsutil versioning set on gs://portfolio-backups-primary

# Set up lifecycle policy
gsutil lifecycle set backup-lifecycle.json gs://portfolio-backups-primary
```

### Backup Encryption
- **At Rest**: AES-256 encryption
- **In Transit**: TLS 1.3
- **Keys**: Managed by cloud provider
- **Access**: Service account with minimal permissions

## Monitoring and Alerts

### Backup Health Monitoring
```bash
# Check backup status
curl -X GET "https://your-api.com/api/backup/status" \
  -H "Authorization: Bearer $API_TOKEN"
```

### Alerts Configuration
1. **Backup Failure**: Immediate notification
2. **Backup Size Anomaly**: If backup size changes >50%
3. **Missing Backup**: If daily backup doesn't complete
4. **Storage Space**: If backup storage >80% full

### Monitoring Dashboard
- Backup success/failure rates
- Backup file sizes over time
- Restore test results
- Storage utilization

## Testing and Validation

### Regular Restore Tests
```bash
# Monthly restore test to staging environment
npm run test:restore-staging

# Quarterly full restore test
npm run test:restore-full
```

### Backup Integrity Checks
```bash
# Verify backup file integrity
node scripts/verify-backup.js backups/latest.tar.gz

# Test restore without applying changes
node scripts/restore.js --dry-run backups/latest.tar.gz
```

### Validation Checklist
- [ ] Backup file exists and is not corrupted
- [ ] All expected components are present
- [ ] Backup size is within expected range
- [ ] Manifest file is valid
- [ ] Restore test completes successfully
- [ ] Application functions correctly after restore

## Disaster Recovery

### Recovery Time Objectives (RTO)
- **Critical data**: 4 hours
- **Full system**: 24 hours
- **Non-critical components**: 72 hours

### Recovery Point Objectives (RPO)
- **Critical data**: 4 hours
- **User data**: 24 hours
- **Configuration**: 72 hours

### Disaster Recovery Steps

#### 1. Assessment
```bash
# Assess damage extent
npm run assess-damage

# Check data availability
npm run check-data-integrity
```

#### 2. Emergency Response
```bash
# Activate disaster recovery mode
npm run activate-dr-mode

# Switch to backup systems
npm run switch-to-backup
```

#### 3. Data Recovery
```bash
# Identify latest good backup
npm run find-latest-backup

# Perform emergency restore
npm run emergency-restore
```

#### 4. Service Restoration
```bash
# Restore services incrementally
npm run restore-critical-services
npm run restore-secondary-services
npm run restore-all-services
```

#### 5. Validation and Testing
```bash
# Comprehensive system test
npm run test-full-system

# User acceptance testing
npm run test-user-acceptance
```

### Emergency Contacts
- **Primary Admin**: [Your Email]
- **Secondary Admin**: [Backup Admin Email]
- **Hosting Provider**: [Provider Support]
- **Database Provider**: [Firebase Support]

## Best Practices

### Backup Best Practices
1. **3-2-1 Rule**: 3 copies, 2 different media, 1 offsite
2. **Regular Testing**: Monthly restore tests
3. **Documentation**: Keep procedures updated
4. **Automation**: Minimize manual intervention
5. **Monitoring**: Continuous backup health monitoring
6. **Security**: Encrypt backups and secure access
7. **Retention**: Balance storage costs with recovery needs

### Security Considerations
- Encrypt all backup data
- Use service accounts with minimal permissions
- Audit backup access regularly
- Secure backup storage locations
- Test restore procedures in isolated environments

### Performance Optimization
- Schedule backups during low-traffic periods
- Use incremental backups where possible
- Compress backup files
- Optimize storage costs with lifecycle policies
- Monitor backup performance metrics

## Troubleshooting

### Common Issues

#### Backup Script Fails
```bash
# Check permissions
ls -la scripts/backup.js

# Check environment variables
env | grep FIREBASE

# Run with debug output
DEBUG=true node scripts/backup.js
```

#### Firestore Backup Empty
```bash
# Check Firestore rules
firebase firestore:rules get

# Verify service account permissions
gcloud iam service-accounts get-iam-policy $SERVICE_ACCOUNT
```

#### Storage Backup Fails
```bash
# Check bucket permissions
gsutil iam get gs://your-bucket

# Test bucket access
gsutil ls gs://your-bucket
```

#### Restore Script Errors
```bash
# Verify backup file integrity
tar -tzf backup.tar.gz

# Check available disk space
df -h

# Verify database connectivity
nc -zv database-host 5432
```

### Getting Help
1. Check logs: `./logs/backup.log`
2. Review error messages carefully
3. Test with minimal backup first
4. Contact system administrator
5. Escalate to disaster recovery team if critical

## Maintenance

### Monthly Tasks
- [ ] Review backup success rates
- [ ] Test restore procedures
- [ ] Clean up old backups
- [ ] Update backup scripts if needed
- [ ] Review storage costs

### Quarterly Tasks
- [ ] Full disaster recovery test
- [ ] Review and update procedures
- [ ] Audit backup security
- [ ] Evaluate backup strategy
- [ ] Update emergency contacts

### Annual Tasks
- [ ] Comprehensive disaster recovery drill
- [ ] Review backup retention policies
- [ ] Evaluate new backup technologies
- [ ] Update disaster recovery plan
- [ ] Security audit of backup systems