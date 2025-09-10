'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import type { AdminPermissions } from '@/types'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermissions?: (keyof AdminPermissions)[]
  fallbackRoute?: string
  loadingComponent?: ReactNode
  unauthorizedComponent?: ReactNode
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  fallbackRoute = '/admin/login',
  loadingComponent,
  unauthorizedComponent
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, hasPermission } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(fallbackRoute)
    }
  }, [loading, isAuthenticated, router, fallbackRoute])

  // Show loading state
  if (loading) {
    return loadingComponent || <DefaultLoadingComponent />
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null // Router will handle redirect
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    )

    if (!hasRequiredPermissions) {
      return unauthorizedComponent || (
        <DefaultUnauthorizedComponent 
          requiredPermissions={requiredPermissions}
          userRole={user?.role}
        />
      )
    }
  }

  // Render protected content
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Default loading component
function DefaultLoadingComponent() {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto w-12 h-12 text-primary-600"
        >
          <Loader2 className="w-full h-full" />
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
            Loading Admin Dashboard
          </h2>
          <p className="text-secondary-600 dark:text-secondary-300">
            Verifying your credentials...
          </p>
        </div>

        {/* Loading progress animation */}
        <div className="w-48 h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
          />
        </div>
      </motion.div>
    </div>
  )
}

// Default unauthorized component
interface DefaultUnauthorizedComponentProps {
  requiredPermissions: (keyof AdminPermissions)[]
  userRole?: string
}

function DefaultUnauthorizedComponent({ 
  requiredPermissions, 
  userRole 
}: DefaultUnauthorizedComponentProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-secondary-900 rounded-lg shadow-xl p-8 text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center"
        >
          <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Access Denied
          </h1>
          <p className="text-secondary-600 dark:text-secondary-300">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-md p-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-secondary-600 dark:text-secondary-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Required Permissions:</span>
          </div>
          <ul className="text-sm text-secondary-500 dark:text-secondary-400 space-y-1">
            {requiredPermissions.map(permission => (
              <li key={permission} className="capitalize">
                • {permission.replace(/([A-Z])/g, ' $1').trim()}
              </li>
            ))}
          </ul>
          {userRole && (
            <div className="text-xs text-secondary-400 dark:text-secondary-500 mt-2">
              Your role: <span className="capitalize">{userRole.replace('_', ' ')}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 text-secondary-700 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-800 rounded-md hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Go Back
          </motion.button>
          <motion.button
            onClick={() => router.push('/admin')}
            className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Dashboard
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

// Higher-order component version for easier usage
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions?: (keyof AdminPermissions)[]
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredPermissions={requiredPermissions}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Hook for permission checking in components
export function usePermission(permission: keyof AdminPermissions): boolean {
  const { hasPermission } = useAuthContext()
  return hasPermission(permission)
}

// Hook for role checking
export function useRole(): string | null {
  const { user } = useAuthContext()
  return user?.role || null
}