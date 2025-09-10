// Firebase Admin SDK configuration for server-side operations
// This file should only be used in server-side code (API routes, middleware, etc.)

import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'

// Admin SDK service account configuration
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
}

// Validate required environment variables
const requiredAdminEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL', 
  'FIREBASE_PRIVATE_KEY',
]

for (const envVar of requiredAdminEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Initialize Firebase Admin SDK
let adminApp
try {
  adminApp = getApps().find(app => app.name === 'admin') || 
             initializeApp({
               credential: cert(serviceAccount),
               storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
             }, 'admin')
} catch (error) {
  console.error('Firebase Admin initialization error:', error)
  throw error
}

// Initialize Admin SDK services
export const adminDb = getFirestore(adminApp)
export const adminAuth = getAuth(adminApp)
export const adminStorage = getStorage(adminApp)

// Helper functions for server-side operations
export class FirebaseAdminService {
  // Verify ID token
  static async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken)
      return decodedToken
    } catch (error) {
      throw new Error(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Check if user is admin
  static async isAdmin(uid: string): Promise<boolean> {
    try {
      const adminDoc = await adminDb.collection('admins').doc(uid).get()
      return adminDoc.exists
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  // Create custom token
  static async createCustomToken(uid: string, additionalClaims?: object) {
    try {
      return await adminAuth.createCustomToken(uid, additionalClaims)
    } catch (error) {
      throw new Error(`Custom token creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Set admin claims
  static async setAdminClaims(uid: string) {
    try {
      await adminAuth.setCustomUserClaims(uid, { admin: true })
      // Also add to admins collection
      await adminDb.collection('admins').doc(uid).set({
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } catch (error) {
      throw new Error(`Setting admin claims failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Remove admin claims
  static async removeAdminClaims(uid: string) {
    try {
      await adminAuth.setCustomUserClaims(uid, { admin: false })
      await adminDb.collection('admins').doc(uid).delete()
    } catch (error) {
      throw new Error(`Removing admin claims failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Rate limiting check
  static async checkRateLimit(identifier: string, limit: number = 5, windowMs: number = 60000): Promise<boolean> {
    try {
      const now = Date.now()
      const windowStart = now - windowMs
      
      const rateLimitDoc = adminDb.collection('rateLimiting').doc(identifier)
      const doc = await rateLimitDoc.get()
      
      if (!doc.exists) {
        await rateLimitDoc.set({
          requests: [now],
          createdAt: new Date(),
        })
        return true
      }
      
      const data = doc.data()
      const recentRequests = data.requests.filter((timestamp: number) => timestamp > windowStart)
      
      if (recentRequests.length >= limit) {
        return false
      }
      
      recentRequests.push(now)
      await rateLimitDoc.update({
        requests: recentRequests,
        updatedAt: new Date(),
      })
      
      return true
    } catch (error) {
      console.error('Rate limiting check failed:', error)
      return false
    }
  }

  // Bulk operations
  static async bulkWrite(operations: any[]) {
    try {
      const batch = adminDb.batch()
      operations.forEach(op => {
        switch (op.type) {
          case 'set':
            batch.set(op.ref, op.data)
            break
          case 'update':
            batch.update(op.ref, op.data)
            break
          case 'delete':
            batch.delete(op.ref)
            break
        }
      })
      
      await batch.commit()
    } catch (error) {
      throw new Error(`Bulk write failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Backup data
  static async backupCollection(collectionName: string) {
    try {
      const snapshot = await adminDb.collection(collectionName).get()
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      
      return data
    } catch (error) {
      throw new Error(`Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export default adminApp