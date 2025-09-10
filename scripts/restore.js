#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')
const { execSync } = require('child_process')
const admin = require('firebase-admin')
const readline = require('readline')

class RestoreManager {
  constructor(backupPath) {
    this.backupPath = backupPath
    this.tempDir = path.join(__dirname, '../temp-restore')
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

  async restoreFromBackup() {
    console.log(`🔄 Starting restore process...`)
    console.log(`📦 Backup file: ${this.backupPath}`)

    try {
      // Verify backup file exists
      await fs.access(this.backupPath)

      // Extract backup
      await this.extractBackup()

      // Verify backup integrity
      await this.verifyBackup()

      // Show confirmation prompt
      await this.confirmRestore()

      // Perform restore operations
      await this.performRestore()

      // Cleanup
      await this.cleanup()

      console.log(`✅ Restore completed successfully!`)

    } catch (error) {
      console.error(`❌ Restore failed:`, error)
      await this.cleanup()
      process.exit(1)
    }
  }

  async extractBackup() {
    console.log(`📂 Extracting backup...`)

    try {
      // Create temp directory
      await fs.mkdir(this.tempDir, { recursive: true })

      // Extract tar.gz file
      execSync(`tar -xzf "${this.backupPath}" -C "${this.tempDir}"`)

      // Find the extracted directory
      const files = await fs.readdir(this.tempDir)
      this.extractedDir = path.join(this.tempDir, files[0])

      console.log(`  ✅ Backup extracted to: ${this.extractedDir}`)

    } catch (error) {
      console.error(`  ❌ Extraction failed:`, error)
      throw error
    }
  }

  async verifyBackup() {
    console.log(`🔍 Verifying backup integrity...`)

    try {
      // Check manifest file
      const manifestPath = path.join(this.extractedDir, 'manifest.json')
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))

      console.log(`  📋 Backup Type: ${manifest.type}`)
      console.log(`  📅 Backup Date: ${manifest.timestamp}`)
      console.log(`  📊 Components: ${Object.keys(manifest.components).filter(k => manifest.components[k]).join(', ')}`)
      console.log(`  📈 Files: ${manifest.metadata.fileCount}`)
      console.log(`  💾 Size: ${this.formatBytes(manifest.metadata.size)}`)

      this.manifest = manifest

      // Verify each component
      for (const [component, exists] of Object.entries(manifest.components)) {
        if (exists) {
          const componentPath = path.join(this.extractedDir, component)
          const componentExists = await this.fileExists(componentPath)
          
          if (!componentExists) {
            throw new Error(`Component ${component} is missing from backup`)
          }
          
          console.log(`    ✅ ${component}`)
        }
      }

      console.log(`  ✅ Backup integrity verified`)

    } catch (error) {
      console.error(`  ❌ Verification failed:`, error)
      throw error
    }
  }

  async confirmRestore() {
    console.log(`\n⚠️  WARNING: This will overwrite existing data!`)
    console.log(`📋 Restore will include:`)
    
    for (const [component, exists] of Object.entries(this.manifest.components)) {
      if (exists) {
        console.log(`  • ${component}`)
      }
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise(resolve => {
      rl.question('\nDo you want to proceed with the restore? (yes/no): ', resolve)
    })

    rl.close()

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log(`❌ Restore cancelled by user`)
      process.exit(0)
    }

    console.log(`✅ Restore confirmed, proceeding...`)
  }

  async performRestore() {
    console.log(`🔄 Starting restore operations...`)

    const operations = []

    // Add restore operations based on available components
    if (this.manifest.components.firestore) {
      operations.push(this.restoreFirestore.bind(this))
    }

    if (this.manifest.components.storage) {
      operations.push(this.restoreFirebaseStorage.bind(this))
    }

    if (this.manifest.components.database) {
      operations.push(this.restoreDatabase.bind(this))
    }

    if (this.manifest.components.assets) {
      operations.push(this.restoreAssets.bind(this))
    }

    if (this.manifest.components.config) {
      operations.push(this.restoreConfig.bind(this))
    }

    // Execute restore operations
    for (const operation of operations) {
      await operation()
    }

    console.log(`  ✅ All restore operations completed`)
  }

  async restoreFirestore() {
    console.log(`🔥 Restoring Firestore...`)

    try {
      const firestoreBackupPath = path.join(this.extractedDir, 'firestore.json')
      const firestoreData = JSON.parse(await fs.readFile(firestoreBackupPath, 'utf8'))

      const db = admin.firestore()
      const batch = db.batch()
      let operationCount = 0

      for (const [collectionName, documents] of Object.entries(firestoreData)) {
        console.log(`  📄 Restoring collection: ${collectionName} (${documents.length} documents)`)
        
        for (const doc of documents) {
          const docRef = db.collection(collectionName).doc(doc.id)
          batch.set(docRef, doc.data)
          operationCount++

          // Commit batch every 500 operations (Firestore limit)
          if (operationCount >= 500) {
            await batch.commit()
            operationCount = 0
          }
        }
      }

      // Commit remaining operations
      if (operationCount > 0) {
        await batch.commit()
      }

      console.log(`  ✅ Firestore restore completed`)

    } catch (error) {
      console.error(`  ❌ Firestore restore failed:`, error)
      throw error
    }
  }

  async restoreFirebaseStorage() {
    console.log(`🗃️  Restoring Firebase Storage...`)

    try {
      const storageBackupPath = path.join(this.extractedDir, 'storage')
      const manifestPath = path.join(storageBackupPath, 'manifest.json')
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))

      const bucket = admin.storage().bucket()

      console.log(`  📁 Restoring ${manifest.length} files`)

      for (const fileInfo of manifest) {
        const localFileName = fileInfo.name.replace(/\//g, '_')
        const localPath = path.join(storageBackupPath, localFileName)

        try {
          await bucket.upload(localPath, {
            destination: fileInfo.name,
            metadata: {
              contentType: fileInfo.contentType
            }
          })

          console.log(`    📄 Restored: ${fileInfo.name}`)

        } catch (error) {
          console.warn(`    ⚠️  Failed to restore: ${fileInfo.name} - ${error.message}`)
        }
      }

      console.log(`  ✅ Firebase Storage restore completed`)

    } catch (error) {
      console.error(`  ❌ Firebase Storage restore failed:`, error)
      throw error
    }
  }

  async restoreDatabase() {
    console.log(`🗄️  Restoring database...`)

    try {
      if (!process.env.DATABASE_URL) {
        console.log(`  ⚠️  No database URL configured, skipping database restore`)
        return
      }

      const dbBackupPath = path.join(this.extractedDir, 'database')
      const databaseType = this.getDatabaseType(process.env.DATABASE_URL)

      switch (databaseType) {
        case 'postgresql':
          await this.restorePostgres(dbBackupPath)
          break
        case 'mysql':
          await this.restoreMySQL(dbBackupPath)
          break
        case 'mongodb':
          await this.restoreMongoDB(dbBackupPath)
          break
        default:
          console.log(`  ⚠️  Unsupported database type: ${databaseType}`)
      }

      console.log(`  ✅ Database restore completed`)

    } catch (error) {
      console.error(`  ❌ Database restore failed:`, error)
      throw error
    }
  }

  async restoreAssets() {
    console.log(`🖼️  Restoring static assets...`)

    try {
      const assetsBackupPath = path.join(this.extractedDir, 'assets')

      // Restore public directory
      const publicBackupPath = path.join(assetsBackupPath, 'public')
      if (await this.fileExists(publicBackupPath)) {
        // Backup existing public directory
        if (await this.fileExists('public')) {
          execSync(`mv public public.bak.${Date.now()}`)
        }
        execSync(`cp -r "${publicBackupPath}" public`)
      }

      // Restore other asset directories
      const assetDirs = ['images', 'documents', 'uploads']
      
      for (const dir of assetDirs) {
        const assetBackupPath = path.join(assetsBackupPath, dir)
        
        if (await this.fileExists(assetBackupPath)) {
          // Backup existing directory
          if (await this.fileExists(dir)) {
            execSync(`mv "${dir}" "${dir}.bak.${Date.now()}"`)
          }
          execSync(`cp -r "${assetBackupPath}" "${dir}"`)
        }
      }

      console.log(`  ✅ Static assets restore completed`)

    } catch (error) {
      console.error(`  ❌ Static assets restore failed:`, error)
      throw error
    }
  }

  async restoreConfig() {
    console.log(`⚙️  Restoring configuration files...`)

    try {
      const configBackupPath = path.join(this.extractedDir, 'config')

      // List of config files to restore (excluding sensitive ones)
      const configFiles = [
        'next.config.js',
        'tailwind.config.js',
        'firebase.json',
        'vercel.json'
      ]

      for (const file of configFiles) {
        const backupFilePath = path.join(configBackupPath, file)
        
        if (await this.fileExists(backupFilePath)) {
          // Backup existing file
          if (await this.fileExists(file)) {
            execSync(`mv "${file}" "${file}.bak.${Date.now()}"`)
          }
          
          const content = await fs.readFile(backupFilePath, 'utf8')
          await fs.writeFile(file, content)
          
          console.log(`    ✅ Restored: ${file}`)
        }
      }

      console.log(`  ✅ Configuration restore completed`)

    } catch (error) {
      console.error(`  ❌ Configuration restore failed:`, error)
      throw error
    }
  }

  async cleanup() {
    console.log(`🧹 Cleaning up temporary files...`)

    try {
      if (await this.fileExists(this.tempDir)) {
        execSync(`rm -rf "${this.tempDir}"`)
      }
      
      console.log(`  ✅ Cleanup completed`)

    } catch (error) {
      console.error(`  ❌ Cleanup failed:`, error)
      // Don't throw - cleanup failure shouldn't fail the restore
    }
  }

  // Database restore methods
  async restorePostgres(backupPath) {
    const dumpFile = path.join(backupPath, 'postgres_dump.sql')
    
    if (await this.fileExists(dumpFile)) {
      console.log(`    📄 Restoring from: postgres_dump.sql`)
      execSync(`psql "${process.env.DATABASE_URL}" < "${dumpFile}"`)
    }
  }

  async restoreMySQL(backupPath) {
    const dumpFile = path.join(backupPath, 'mysql_dump.sql')
    
    if (await this.fileExists(dumpFile)) {
      console.log(`    📄 Restoring from: mysql_dump.sql`)
      execSync(`mysql "${process.env.DATABASE_URL}" < "${dumpFile}"`)
    }
  }

  async restoreMongoDB(backupPath) {
    const mongoUri = process.env.DATABASE_URL
    
    console.log(`    📄 Restoring from MongoDB dump`)
    execSync(`mongorestore --uri="${mongoUri}" --drop "${backupPath}"`)
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
}

// Backup listing function
async function listBackups() {
  const backupDir = process.env.BACKUP_DIR || './backups'
  
  try {
    const files = await fs.readdir(backupDir)
    const backupFiles = files.filter(file => file.endsWith('.tar.gz'))
    
    if (backupFiles.length === 0) {
      console.log('No backups found.')
      return
    }

    console.log('Available backups:')
    
    for (let i = 0; i < backupFiles.length; i++) {
      const file = backupFiles[i]
      const filePath = path.join(backupDir, file)
      const stats = await fs.stat(filePath)
      
      console.log(`${i + 1}. ${file}`)
      console.log(`   Created: ${stats.mtime.toISOString()}`)
      console.log(`   Size: ${formatBytes(stats.size)}`)
      console.log('')
    }

  } catch (error) {
    console.error('Error listing backups:', error)
  }
}

function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === '--list') {
    listBackups()
  } else if (args[0] && args[0] !== '--list') {
    const restoreManager = new RestoreManager(args[0])
    restoreManager.restoreFromBackup().catch(console.error)
  } else {
    console.log('Usage:')
    console.log('  node restore.js <backup-file>  # Restore from backup file')
    console.log('  node restore.js --list         # List available backups')
  }
}

module.exports = RestoreManager