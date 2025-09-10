import { motion } from 'framer-motion'
import { WifiOff, RefreshCw, Home, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { generateMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateMetadata({
  title: 'You are Offline',
  description: 'No internet connection. Some content may not be available.',
  noIndex: true
})

export default function OfflinePage() {
  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-primary-950 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-secondary-900/[0.02] dark:bg-grid-white/[0.02]" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [-30, 30, -30],
            y: [-30, 30, -30],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/3 left-1/3 w-40 h-40 bg-orange-200 dark:bg-orange-900 rounded-full opacity-10 blur-xl"
        />
        <motion.div
          animate={{
            x: [30, -30, 30],
            y: [30, -30, 30],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-yellow-200 dark:bg-yellow-900 rounded-full opacity-10 blur-xl"
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Offline Icon Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="mb-8"
        >
          <div className="mx-auto w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6">
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1] 
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <WifiOff className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </motion.div>
          </div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-4"
          >
            You're Offline
          </motion.h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-12 space-y-4"
        >
          <p className="text-xl text-secondary-600 dark:text-secondary-300">
            No internet connection detected
          </p>
          <p className="text-secondary-500 dark:text-secondary-400 max-w-lg mx-auto">
            Don't worry! Thanks to our Progressive Web App technology, 
            you can still browse cached content and use some features offline.
          </p>
        </motion.div>

        {/* Available Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-secondary-900 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-800 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Available Offline Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-medium text-secondary-900 dark:text-white">
                  Cached Pages
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">
                  Browse previously visited pages
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-medium text-secondary-900 dark:text-white">
                  Portfolio Content
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">
                  View projects and skills information
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-medium text-secondary-900 dark:text-white">
                  Resume Download
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">
                  Download cached resume file
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-medium text-secondary-900 dark:text-white">
                  Contact Form
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">
                  Save messages for later sending
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <button
            onClick={handleRefresh}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-all duration-200 hover:scale-105"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="h-4 w-4" />
            </motion.div>
            Try Again
          </button>

          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-6 py-3 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-md font-medium transition-all duration-200 hover:scale-105"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                PWA Tip
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Add this portfolio to your home screen for the best offline experience! 
                You'll be able to access it like a native app even without internet.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Network Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-700"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-secondary-500 dark:text-secondary-400">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 bg-orange-500 rounded-full"
              />
              <span>Checking connection...</span>
            </div>
          </div>
          <p className="text-xs text-secondary-400 mt-2">
            You'll automatically be reconnected when internet is available
          </p>
        </motion.div>
      </div>
    </div>
  )
}