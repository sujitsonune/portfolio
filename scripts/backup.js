#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')
const { execSync } = require('child_process')
const admin = require('firebase-admin')

// Configuration
const BACKUP_CONFIG = {
  outputDir: process.env.BACKUP_DIR || './backups',
  timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
  compressionLevel: 9,
  retentionDays: 30
}

class BackupManager {
  constructor() {
    this.backupPath = path.join(BACKUP_CONFIG.outputDir, BACKUP_CONFIG.timestamp)
    this.initializeFirebase()
  }

  initializeFirebase() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      })
    }
  }

  async createBackup() {
    console.log(`🗄️  Starting backup process...`)
    console.log(`📁 Backup directory: ${this.backupPath}`)

    try {
      // Create backup directory
      await fs.mkdir(this.backupPath, { recursive: true })

      // Run all backup operations
      await Promise.all([
        this.backupFirestore(),
        this.backupFirebaseStorage(),
        this.backupSourceCode(),
        this.backupEnvironmentConfig(),
        this.backupDatabase(),
        this.backupAssets()
      ])

      // Create backup manifest
      await this.createManifest()

      // Compress backup
      await this.compressBackup()

      // Clean old backups
      await this.cleanOldBackups()

      console.log(`✅ Backup completed successfully!`)
      console.log(`📦 Backup location: ${this.backupPath}.tar.gz`)

    } catch (error) {
      console.error(`❌ Backup failed:`, error)
      process.exit(1)
    }
  }

  async backupFirestore() {
    console.log(`🔥 Backing up Firestore...`)

    try {
      const db = admin.firestore()
      const firestoreBackup = {}

      // Get all collections
      const collections = ['users', 'projects', 'experiences', 'skills', 'contacts', 'analytics']

      for (const collectionName of collections) {
        console.log(`  📄 Backing up collection: ${collectionName}`)
        const snapshot = await db.collection(collectionName).get()
        
        firestoreBackup[collectionName] = snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data(),
          createTime: doc.createTime,
          updateTime: doc.updateTime
        }))
      }

      // Save to file
      await fs.writeFile(
        path.join(this.backupPath, 'firestore.json'),
        JSON.stringify(firestoreBackup, null, 2)
      )

      console.log(`  ✅ Firestore backup completed`)

    } catch (error) {
      console.error(`  ❌ Firestore backup failed:`, error)
      throw error
    }
  }

  async backupFirebaseStorage() {
    console.log(`🗃️  Backing up Firebase Storage...`)

    try {
      const bucket = admin.storage().bucket()
      const storageBackupPath = path.join(this.backupPath, 'storage')
      await fs.mkdir(storageBackupPath, { recursive: true })

      // List all files
      const [files] = await bucket.getFiles()
      
      console.log(`  📁 Found ${files.length} files to backup`)

      // Download files
      for (const file of files) {
        const fileName = file.name.replace(/\//g, '_')
        const localPath = path.join(storageBackupPath, fileName)
        
        console.log(`    📄 Downloading: ${file.name}`)
        await file.download({ destination: localPath })
      }

      // Create file manifest
      const fileManifest = files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        updated: file.metadata.updated,
        md5Hash: file.metadata.md5Hash
      }))

      await fs.writeFile(
        path.join(storageBackupPath, 'manifest.json'),
        JSON.stringify(fileManifest, null, 2)
      )

      console.log(`  ✅ Firebase Storage backup completed`)

    } catch (error) {
      console.error(`  ❌ Firebase Storage backup failed:`, error)
      throw error
    }
  }

  async backupSourceCode() {
    console.log(`💾 Backing up source code...`)

    try {
      const sourceBackupPath = path.join(this.backupPath, 'source')
      await fs.mkdir(sourceBackupPath, { recursive: true })

      // Create git archive
      execSync(`git archive --format=tar.gz HEAD -o "${path.join(sourceBackupPath, 'source.tar.gz')}"`, {
        cwd: process.cwd()
      })

      // Save git information
      const gitInfo = {
        branch: execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim(),
        commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
        commitMessage: execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim(),
        commitDate: execSync('git log -1 --pretty=%ci', { encoding: 'utf8' }).trim(),
        remoteUrl: execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim()
      }

      await fs.writeFile(
        path.join(sourceBackupPath, 'git-info.json'),
        JSON.stringify(gitInfo, null, 2)
      )

      console.log(`  ✅ Source code backup completed`)

    } catch (error) {
      console.error(`  ❌ Source code backup failed:`, error)
      throw error
    }
  }

  async backupEnvironmentConfig() {
    console.log(`⚙️  Backing up environment configuration...`)

    try {
      const configBackupPath = path.join(this.backupPath, 'config')
      await fs.mkdir(configBackupPath, { recursive: true })

      // Backup configuration files (without sensitive data)
      const configFiles = [
        'package.json',
        'package-lock.json',
        'next.config.js',
        'tailwind.config.js',
        'tsconfig.json',
        'firebase.json',
        'vercel.json',
        '.env.example'
      ]

      for (const file of configFiles) {
        try {
          const content = await fs.readFile(file, 'utf8')
          await fs.writeFile(path.join(configBackupPath, file), content)
        } catch (error) {
          console.log(`    ⚠️  File not found: ${file}`)
        }
      }

      // Create deployment manifest
      const deploymentInfo = {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        environment: process.env.NODE_ENV,
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION
      }

      await fs.writeFile(
        path.join(configBackupPath, 'deployment-info.json'),
        JSON.stringify(deploymentInfo, null, 2)
      )

      console.log(`  ✅ Environment configuration backup completed`)

    } catch (error) {
      console.error(`  ❌ Environment configuration backup failed:`, error)
      throw error
    }
  }

  async backupDatabase() {
    console.log(`🗄️  Backing up database...`)

    try {
      if (!process.env.DATABASE_URL) {
        console.log(`  ⚠️  No database URL configured, skipping database backup`)
        return
      }

      const dbBackupPath = path.join(this.backupPath, 'database')
      await fs.mkdir(dbBackupPath, { recursive: true })

      // This is a placeholder - implement based on your database type
      // For PostgreSQL: pg_dump
      // For MySQL: mysqldump
      // For MongoDB: mongodump
      
      const databaseType = this.getDatabaseType(process.env.DATABASE_URL)
      
      switch (databaseType) {
        case 'postgresql':
          await this.backupPostgres(dbBackupPath)
          break
        case 'mysql':
          await this.backupMySQL(dbBackupPath)
          break
        case 'mongodb':
          await this.backupMongoDB(dbBackupPath)
          break
        default:
          console.log(`  ⚠️  Unsupported database type: ${databaseType}`)
      }

      console.log(`  ✅ Database backup completed`)

    } catch (error) {
      console.error(`  ❌ Database backup failed:`, error)
      throw error
    }
  }

  async backupAssets() {
    console.log(`🖼️  Backing up static assets...`)

    try {
      const assetsBackupPath = path.join(this.backupPath, 'assets')
      await fs.mkdir(assetsBackupPath, { recursive: true })

      // Backup public directory
      if (await this.fileExists('public')) {
        execSync(`cp -r public "${assetsBackupPath}/public"`)
      }

      // Backup any other asset directories
      const assetDirs = ['images', 'documents', 'uploads']
      
      for (const dir of assetDirs) {
        if (await this.fileExists(dir)) {
          execSync(`cp -r "${dir}" "${assetsBackupPath}/"`)
        }
      }

      console.log(`  ✅ Static assets backup completed`)

    } catch (error) {
      console.error(`  ❌ Static assets backup failed:`, error)
      throw error
    }
  }

  async createManifest() {
    console.log(`📋 Creating backup manifest...`)

    const manifest = {
      version: '1.0.0',
      timestamp: BACKUP_CONFIG.timestamp,
      type: 'full-backup',
      components: {
        firestore: await this.fileExists(path.join(this.backupPath, 'firestore.json')),
        storage: await this.fileExists(path.join(this.backupPath, 'storage')),
        source: await this.fileExists(path.join(this.backupPath, 'source')),
        config: await this.fileExists(path.join(this.backupPath, 'config')),
        database: await this.fileExists(path.join(this.backupPath, 'database')),
        assets: await this.fileExists(path.join(this.backupPath, 'assets'))
      },
      metadata: {
        size: await this.getDirectorySize(this.backupPath),
        fileCount: await this.getFileCount(this.backupPath),
        environment: process.env.NODE_ENV,
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION
      }
    }

    await fs.writeFile(
      path.join(this.backupPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    )

    console.log(`  ✅ Backup manifest created`)
  }

  async compressBackup() {
    console.log(`🗜️  Compressing backup...`)

    try {
      const tarPath = `${this.backupPath}.tar.gz`
      
      execSync(`tar -czf "${tarPath}" -C "${path.dirname(this.backupPath)}" "${path.basename(this.backupPath)}"`)
      
      // Remove uncompressed directory
      execSync(`rm -rf "${this.backupPath}"`)
      
      const stats = await fs.stat(tarPath)
      console.log(`  ✅ Backup compressed: ${this.formatBytes(stats.size)}`)

    } catch (error) {
      console.error(`  ❌ Backup compression failed:`, error)
      throw error
    }
  }

  async cleanOldBackups() {
    console.log(`🧹 Cleaning old backups...`)

    try {
      const files = await fs.readdir(BACKUP_CONFIG.outputDir)
      const backupFiles = files.filter(file => file.endsWith('.tar.gz'))
      
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - BACKUP_CONFIG.retentionDays)

      let deletedCount = 0

      for (const file of backupFiles) {
        const filePath = path.join(BACKUP_CONFIG.outputDir, file)
        const stats = await fs.stat(filePath)
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath)
          deletedCount++
          console.log(`    🗑️  Deleted old backup: ${file}`)
        }
      }

      console.log(`  ✅ Cleaned ${deletedCount} old backups`)

    } catch (error) {
      console.error(`  ❌ Cleanup failed:`, error)
      // Don't throw - cleanup failure shouldn't fail the backup
    }
  }

  // Utility methods
  async fileExists(filePath) {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  async getDirectorySize(dirPath) {
    const files = await fs.readdir(dirPath, { withFileTypes: true })
    let size = 0

    for (const file of files) {
      const filePath = path.join(dirPath, file.name)
      
      if (file.isDirectory()) {
        size += await this.getDirectorySize(filePath)
      } else {
        const stats = await fs.stat(filePath)
        size += stats.size
      }
    }

    return size
  }

  async getFileCount(dirPath) {
    const files = await fs.readdir(dirPath, { withFileTypes: true })
    let count = 0

    for (const file of files) {
      if (file.isDirectory()) {
        const filePath = path.join(dirPath, file.name)
        count += await this.getFileCount(filePath)
      } else {
        count++
      }
    }

    return count
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  getDatabaseType(url) {
    if (url.startsWith('postgresql://') || url.startsWith('postgres://')) return 'postgresql'
    if (url.startsWith('mysql://')) return 'mysql'
    if (url.startsWith('mongodb://') || url.startsWith('mongodb+srv://')) return 'mongodb'
    return 'unknown'
  }

  async backupPostgres(backupPath) {
    const dumpFile = path.join(backupPath, 'postgres_dump.sql')
    execSync(`pg_dump "${process.env.DATABASE_URL}" > "${dumpFile}"`)
  }

  async backupMySQL(backupPath) {
    const dumpFile = path.join(backupPath, 'mysql_dump.sql')
    execSync(`mysqldump "${process.env.DATABASE_URL}" > "${dumpFile}"`)
  }

  async backupMongoDB(backupPath) {
    const mongoUri = process.env.DATABASE_URL
    execSync(`mongodump --uri="${mongoUri}" --out="${backupPath}"`)
  }
}

// CLI execution
if (require.main === module) {
  const backupManager = new BackupManager()
  backupManager.createBackup().catch(console.error)
}

module.exports = BackupManager