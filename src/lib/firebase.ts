import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage'
import { getAnalytics, Analytics } from 'firebase/analytics'
import type { FirebaseConfig } from '@/types'

// Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage
let analytics: Analytics | null = null

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  
  // Initialize Firebase services
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)

  // Initialize Analytics (only in browser and production)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    analytics = getAnalytics(app)
  }

  // Connect to Firebase Emulators in development
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    try {
      // Connect to Firestore Emulator
      if (!db._settings?.host?.includes('localhost')) {
        connectFirestoreEmulator(db, 'localhost', 8080)
      }
      
      // Connect to Storage Emulator
      if (!storage._host?.includes('localhost')) {
        connectStorageEmulator(storage, 'localhost', 9199)
      }
    } catch (error) {
      console.warn('Firebase emulators not running, using production services')
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error)
  throw error
}

export { app, auth, db, storage, analytics }
export default app

// Helper function to check Firebase connection
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    const testDoc = await db.collection('_health').doc('test').get()
    return true
  } catch (error) {
    console.error('Firebase connection test failed:', error)
    return false
  }
}