'use client'

import { motion, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

// Spinner components
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
}

export function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    secondary: 'border-secondary-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  }

  return (
    <motion.div
      className={cn(
        'border-2 rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
      role="status"
      aria-label="Loading"
    />
  )
}

// Dots spinner
interface DotsSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
}

export function DotsSpinner({ size = 'md', color = 'primary', className }: DotsSpinnerProps) {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    white: 'bg-white'
  }

  const dotVariants: Variants = {
    animate: {
      y: [-4, 4, -4],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  return (
    <div className={cn('flex space-x-1', className)} role="status" aria-label="Loading">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(
            'rounded-full',
            sizeClasses[size],
            colorClasses[color]
          )}
          variants={dotVariants}
          animate="animate"
          transition={{
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  )
}

// Pulse spinner
export function PulseSpinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    white: 'bg-white'
  }

  return (
    <motion.div
      className={cn(
        'rounded-full opacity-75',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      role="status"
      aria-label="Loading"
    />
  )
}

// Wave spinner
export function WaveSpinner({ className }: { className?: string }) {
  const barVariants: Variants = {
    animate: {
      scaleY: [1, 2, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  return (
    <div className={cn('flex space-x-1 items-center', className)} role="status" aria-label="Loading">
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className="w-1 h-8 bg-primary-600 rounded-full"
          variants={barVariants}
          animate="animate"
          transition={{
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  )
}

// Skeleton components
interface SkeletonProps {
  className?: string
  animate?: boolean
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  const baseClasses = 'bg-secondary-200 dark:bg-secondary-800 rounded'
  
  if (!animate) {
    return <div className={cn(baseClasses, className)} />
  }

  return (
    <motion.div
      className={cn(baseClasses, className)}
      animate={{
        opacity: [0.4, 0.8, 0.4]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  )
}

// Avatar skeleton
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  return <Skeleton className={cn('rounded-full', sizeClasses[size])} />
}

// Text skeleton
interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            'h-4',
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

// Card skeleton
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 space-y-4 bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800', className)}>
      <div className="flex items-center space-x-4">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  )
}

// Project card skeleton
export function SkeletonProjectCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden', className)}>
      <Skeleton className="h-48 w-full" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <SkeletonText lines={2} />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading states for different content types
interface LoadingStateProps {
  type: 'spinner' | 'skeleton' | 'dots' | 'wave' | 'pulse'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

export function LoadingState({ type, size = 'md', className, text }: LoadingStateProps) {
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return <Spinner size={size} className="mx-auto" />
      case 'dots':
        return <DotsSpinner size={size} className="mx-auto" />
      case 'wave':
        return <WaveSpinner className="mx-auto" />
      case 'pulse':
        return <PulseSpinner size={size} className="mx-auto" />
      case 'skeleton':
        return <SkeletonCard />
      default:
        return <Spinner size={size} className="mx-auto" />
    }
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      {renderLoader()}
      {text && (
        <motion.p
          className="mt-4 text-sm text-secondary-600 dark:text-secondary-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

// Page loading overlay
interface PageLoadingProps {
  isLoading: boolean
  message?: string
}

export function PageLoading({ isLoading, message = 'Loading...' }: PageLoadingProps) {
  if (!isLoading) return null

  return (
    <motion.div
      className="fixed inset-0 bg-white/80 dark:bg-secondary-950/80 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <motion.p
          className="text-secondary-600 dark:text-secondary-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  )
}

// Progress loader
interface ProgressLoaderProps {
  progress: number
  className?: string
  showPercentage?: boolean
}

export function ProgressLoader({ progress, className, showPercentage = true }: ProgressLoaderProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
          Loading...
        </span>
        {showPercentage && (
          <span className="text-sm text-secondary-600 dark:text-secondary-400">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
        <motion.div
          className="bg-primary-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// Content placeholder with shimmer effect
export function ContentPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="space-y-6">
        <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4" />
        <div className="space-y-3">
          <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded" />
          <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-5/6" />
          <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-4/6" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-secondary-200 dark:bg-secondary-700 rounded" />
          <div className="h-20 bg-secondary-200 dark:bg-secondary-700 rounded" />
          <div className="h-20 bg-secondary-200 dark:bg-secondary-700 rounded" />
        </div>
      </div>
    </div>
  )
}