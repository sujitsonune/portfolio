import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react'
import { generateMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateMetadata({
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
  noIndex: true
})

const popularPages = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: FileQuestion },
  { name: 'About', href: '/about', icon: FileQuestion },
  { name: 'Contact', href: '/contact', icon: FileQuestion },
]

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-secondary-900/[0.02] dark:bg-grid-white/[0.02]" />
      
      {/* Floating Elements */}
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

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* 404 Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-8"
        >
          <div className="text-8xl md:text-9xl font-bold text-primary-600 dark:text-primary-400 leading-none">
            404
          </div>
          <div className="text-2xl md:text-3xl font-semibold text-secondary-900 dark:text-white mt-4">
            Page Not Found
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-12 space-y-4"
        >
          <p className="text-lg text-secondary-600 dark:text-secondary-300">
            Oops! The page you're looking for seems to have vanished into the digital void.
          </p>
          <p className="text-secondary-500 dark:text-secondary-400">
            Don't worry though - even the best developers occasionally misplace a page or two. 
            Let's get you back on track!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-all duration-200 hover:scale-105"
          >
            <Home className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-2 px-6 py-3 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-md font-medium transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>
        </motion.div>

        {/* Popular Pages */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="bg-white dark:bg-secondary-900 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-800 p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Popular Pages
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {popularPages.map((page, index) => (
              <motion.div
                key={page.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Link
                  href={page.href}
                  className="group flex items-center gap-3 p-3 rounded-md hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <page.icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="font-medium text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {page.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search Suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">
            Still can't find what you're looking for?
          </p>
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search the portfolio..."
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-secondary-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value
                  if (query.trim()) {
                    window.location.href = `/?search=${encodeURIComponent(query)}`
                  }
                }
              }}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
          </div>
        </motion.div>

        {/* Fun Error Codes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="mt-12 pt-8 border-t border-secondary-200 dark:border-secondary-700"
        >
          <div className="flex items-center justify-center gap-6 text-xs text-secondary-400">
            <span>Error 404</span>
            <span>•</span>
            <span>Page Not Found</span>
            <span>•</span>
            <span>But You Found This Cool 404 Page! 🎉</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}