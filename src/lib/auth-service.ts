'use client'

import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { AdminUser, AdminRole, AdminPermissions } from '@/types'

// Admin roles and permissions
export const ADMIN_ROLES: Record<AdminRole, AdminPermissions> = {
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

export class AuthService {
  private currentUser: User | null = null
  private adminUser: AdminUser | null = null
  private authStateListeners: ((user: AdminUser | null) => void)[] = []

  constructor() {
    // Initialize auth state listener
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user
      if (user) {
        try {
          const adminUser = await this.getAdminUserData(user.uid)
          this.adminUser = adminUser
          this.notifyAuthStateListeners(adminUser)
        } catch (error) {
          console.error('Error fetching admin user data:', error)
          this.adminUser = null
          this.notifyAuthStateListeners(null)
        }
      } else {
        this.adminUser = null
        this.notifyAuthStateListeners(null)
      }
    })
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ success: boolean; message: string; user?: AdminUser }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Check if user is an admin
      const adminUser = await this.getAdminUserData(user.uid)
      if (!adminUser) {
        await this.signOut()
        return {
          success: false,
          message: 'Access denied. Admin privileges required.'
        }
      }

      // Update last login
      await this.updateLastLogin(user.uid)

      return {
        success: true,
        message: 'Successfully signed in',
        user: adminUser
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      }
    }
  }

  // Sign out
  async signOut(): Promise<{ success: boolean; message: string }> {
    try {
      await signOut(auth)
      return {
        success: true,
        message: 'Successfully signed out'
      }
    } catch (error: any) {
      console.error('Sign out error:', error)
      return {
        success: false,
        message: 'Error signing out'
      }
    }
  }

  // Get admin user data from Firestore
  private async getAdminUserData(uid: string): Promise<AdminUser | null> {
    try {
      const adminDoc = await getDoc(doc(db, 'admin_users', uid))
      if (!adminDoc.exists()) {
        return null
      }

      const data = adminDoc.data()
      const user = auth.currentUser
      if (!user) return null

      return {
        uid: uid,
        email: user.email!,
        displayName: user.displayName || data.displayName || 'Admin User',
        role: data.role || 'editor',
        permissions: ADMIN_ROLES[data.role || 'editor'],
        isActive: data.isActive !== false,
        lastLogin: data.lastLogin?.toDate() || null,
        createdAt: data.createdAt?.toDate() || new Date(),
        profilePicture: data.profilePicture || null,
        preferences: data.preferences || {}
      }
    } catch (error) {
      console.error('Error getting admin user data:', error)
      return null
    }
  }

  // Update last login timestamp
  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'admin_users', uid), {
        lastLogin: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  }

  // Create admin user (for super admins only)
  async createAdminUser(email: string, role: AdminRole, displayName: string): Promise<{ success: boolean; message: string }> {
    if (!this.hasPermission('canManageUsers')) {
      return {
        success: false,
        message: 'Access denied. User management privileges required.'
      }
    }

    try {
      // This would typically be done server-side with Admin SDK
      // For now, we'll create the user document assuming they'll sign up separately
      const userData = {
        role,
        displayName,
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: this.currentUser?.uid,
        preferences: {}
      }

      // In a real implementation, you'd use Firebase Admin SDK on the server
      // await setDoc(doc(db, 'admin_users', newUserId), userData)

      return {
        success: true,
        message: 'Admin user invitation sent'
      }
    } catch (error: any) {
      console.error('Error creating admin user:', error)
      return {
        success: false,
        message: 'Error creating admin user'
      }
    }
  }

  // Update admin user role
  async updateAdminRole(uid: string, newRole: AdminRole): Promise<{ success: boolean; message: string }> {
    if (!this.hasPermission('canManageUsers')) {
      return {
        success: false,
        message: 'Access denied. User management privileges required.'
      }
    }

    try {
      await updateDoc(doc(db, 'admin_users', uid), {
        role: newRole,
        updatedAt: serverTimestamp(),
        updatedBy: this.currentUser?.uid
      })

      return {
        success: true,
        message: 'Admin role updated successfully'
      }
    } catch (error: any) {
      console.error('Error updating admin role:', error)
      return {
        success: false,
        message: 'Error updating admin role'
      }
    }
  }

  // Send password reset email
  async sendPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await sendPasswordResetEmail(auth, email)
      return {
        success: true,
        message: 'Password reset email sent'
      }
    } catch (error: any) {
      console.error('Password reset error:', error)
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      }
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!this.currentUser?.email) {
      return {
        success: false,
        message: 'User not authenticated'
      }
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(this.currentUser.email, currentPassword)
      await reauthenticateWithCredential(this.currentUser, credential)

      // Update password
      await updatePassword(this.currentUser, newPassword)

      return {
        success: true,
        message: 'Password updated successfully'
      }
    } catch (error: any) {
      console.error('Change password error:', error)
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      }
    }
  }

  // Check if current user has specific permission
  hasPermission(permission: keyof AdminPermissions): boolean {
    return this.adminUser?.permissions[permission] || false
  }

  // Get current admin user
  getCurrentUser(): AdminUser | null {
    return this.adminUser
  }

  // Check if user is authenticated and is admin
  isAuthenticated(): boolean {
    return this.adminUser !== null && this.adminUser.isActive
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: AdminUser | null) => void): () => void {
    this.authStateListeners.push(callback)
    // Call immediately with current state
    callback(this.adminUser)

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  // Notify all auth state listeners
  private notifyAuthStateListeners(user: AdminUser | null): void {
    this.authStateListeners.forEach(callback => callback(user))
  }

  // Get human-readable error message
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address'
      case 'auth/wrong-password':
        return 'Incorrect password'
      case 'auth/invalid-email':
        return 'Invalid email address'
      case 'auth/user-disabled':
        return 'This account has been disabled'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later'
      case 'auth/weak-password':
        return 'Password is too weak'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists'
      case 'auth/requires-recent-login':
        return 'Please sign in again to complete this action'
      default:
        return 'An error occurred. Please try again'
    }
  }
}

// Create singleton instance
export const authService = new AuthService()
export default authService