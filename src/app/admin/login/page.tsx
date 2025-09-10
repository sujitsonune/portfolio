'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LoginForm } from '@/components/admin/LoginForm'
import { useAuthContext } from '@/context/AuthContext'

export default function AdminLoginPage() {
  const { isAuthenticated, loading } = useAuthContext()
  const router = useRouter()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/admin')
    }
  }, [isAuthenticated, loading, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-secondary-900/[0.02] dark:bg-grid-white/[0.02]" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [-20, 20, -20],
            y: [-20, 20, -20],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-200 dark:bg-primary-900 rounded-full opacity-20 blur-xl"
        />
        <motion.div
          animate={{
            x: [20, -20, 20],
            y: [20, -20, 20],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary-200 dark:bg-secondary-800 rounded-full opacity-20 blur-xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <span className="text-2xl font-bold text-white">A</span>
            </motion.div>
            
            <div>
              <h1 className="text-4xl font-bold text-secondary-900 dark:text-white">
                Portfolio Admin
              </h1>
              <p className="text-secondary-600 dark:text-secondary-300 mt-2">
                Content Management System
              </p>
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <LoginForm 
              onSuccess={() => router.push('/admin')}
              className="backdrop-blur-sm bg-white/80 dark:bg-secondary-900/80"
            />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center space-y-2"
          >
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              Secure admin access • Protected by Firebase Authentication
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-secondary-400">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>© 2024 Portfolio CMS</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-30" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-30" />
    </div>
  )
}