import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app'

// Initialize Firebase Admin (server-side)
let adminApp: App
try {
  adminApp = getApps().length === 0 
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    : getApps()[0]
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error)
}

const adminAuth = adminApp ? getAuth(adminApp) : null
const adminDb = adminApp ? getFirestore(adminApp) : null

export interface AuthMiddlewareOptions {
  requirePermission?: string[]
  redirectTo?: string
}

export async function withAuth(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{ isAuthenticated: boolean; user?: any; response?: NextResponse }> {
  try {
    // Extract token from Authorization header or cookie
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : request.cookies.get('admin-token')?.value

    if (!token || !adminAuth) {
      return {
        isAuthenticated: false,
        response: NextResponse.redirect(new URL(options.redirectTo || '/admin/login', request.url))
      }
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(token)
    const uid = decodedToken.uid

    // Get admin user data from Firestore
    if (!adminDb) {
      throw new Error('Admin database not initialized')
    }

    const adminUserDoc = await adminDb.collection('admin_users').doc(uid).get()
    
    if (!adminUserDoc.exists) {
      return {
        isAuthenticated: false,
        response: NextResponse.redirect(new URL(options.redirectTo || '/admin/login', request.url))
      }
    }

    const adminUserData = adminUserDoc.data()
    
    // Check if user is active
    if (!adminUserData?.isActive) {
      return {
        isAuthenticated: false,
        response: NextResponse.redirect(new URL(options.redirectTo || '/admin/login', request.url))
      }
    }

    // Check permissions if required
    if (options.requirePermission && options.requirePermission.length > 0) {
      const userRole = adminUserData.role
      const rolePermissions = getRolePermissions(userRole)
      
      const hasRequiredPermissions = options.requirePermission.every(permission => 
        rolePermissions[permission as keyof typeof rolePermissions]
      )
      
      if (!hasRequiredPermissions) {
        return {
          isAuthenticated: false,
          response: NextResponse.redirect(new URL('/admin/unauthorized', request.url))
        }
      }
    }

    // Update last activity
    try {
      await adminDb.collection('admin_users').doc(uid).update({
        lastActivity: new Date()
      })
    } catch (error) {
      console.warn('Failed to update last activity:', error)
    }

    return {
      isAuthenticated: true,
      user: {
        uid,
        email: decodedToken.email,
        role: adminUserData.role,
        permissions: getRolePermissions(adminUserData.role)
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return {
      isAuthenticated: false,
      response: NextResponse.redirect(new URL(options.redirectTo || '/admin/login', request.url))
    }
  }
}

// Helper function to get role permissions (should match client-side)
function getRolePermissions(role: string) {
  const permissions = {
    super_admin: {
      canEditContent: true,
      canManageUsers: true,
      canAccessAnalytics: true,
      canExportData: true,
      canManageSettings: true,
      canDeleteContent: true
    },
    content_admin: {
      canEditContent: true,
      canManageUsers: false,
      canAccessAnalytics: true,
      canExportData: true,
      canManageSettings: false,
      canDeleteContent: false
    },
    editor: {
      canEditContent: true,
      canManageUsers: false,
      canAccessAnalytics: false,
      canExportData: false,
      canManageSettings: false,
      canDeleteContent: false
    }
  }

  return permissions[role as keyof typeof permissions] || permissions.editor
}

// Route protection helper for API routes
export function createProtectedRoute(
  handler: (req: NextRequest, context: { user: any }) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest) => {
    const authResult = await withAuth(request, options)
    
    if (!authResult.isAuthenticated || authResult.response) {
      return authResult.response || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return handler(request, { user: authResult.user })
  }
}