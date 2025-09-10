'use client'

import { motion, Variants, HTMLMotionProps } from 'framer-motion'
import { forwardRef, ReactNode, useId, useRef, useEffect, useState } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

// Accessible animated button
interface AccessibleButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    loadingText = 'Loading...',
    icon,
    iconPosition = 'left',
    fullWidth = false,
    className,
    disabled,
    ...props 
  }, ref) => {
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
    const id = useId()

    const variants: Variants = {
      rest: { scale: 1 },
      hover: { 
        scale: prefersReducedMotion ? 1 : 1.02,
        y: prefersReducedMotion ? 0 : -2,
        transition: { duration: 0.2, ease: 'easeOut' }
      },
      tap: { 
        scale: prefersReducedMotion ? 1 : 0.98,
        y: prefersReducedMotion ? 0 : 0,
        transition: { duration: 0.1 }
      }
    }

    const variantClasses = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600 hover:border-primary-700',
      secondary: 'bg-secondary-200 hover:bg-secondary-300 text-secondary-900 border-secondary-200 hover:border-secondary-300',
      ghost: 'bg-transparent hover:bg-secondary-100 text-secondary-700 border-transparent hover:border-secondary-300',
      link: 'bg-transparent hover:bg-transparent text-primary-600 hover:text-primary-700 border-transparent hover:border-transparent underline'
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    }

    return (
      <motion.button
        ref={ref}
        id={id}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 border rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        variants={variants}
        initial="rest"
        whileHover={disabled || loading ? 'rest' : 'hover'}
        whileTap={disabled || loading ? 'rest' : 'tap'}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        aria-describedby={loading ? `${id}-status` : undefined}
        {...props}
      >
        {loading && (
          <>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 sr-only" id={`${id}-status`}>
                {loadingText}
              </span>
            </motion.div>
            <span className="opacity-0" aria-hidden="true">
              {children}
            </span>
          </>
        )}
        
        {!loading && (
          <>
            {icon && iconPosition === 'left' && (
              <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
            )}
            <span>{children}</span>
            {icon && iconPosition === 'right' && (
              <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
            )}
          </>
        )}
      </motion.button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

// Accessible animated link with focus management
interface AccessibleLinkProps extends HTMLMotionProps<'a'> {
  children: ReactNode
  external?: boolean
  showExternalIcon?: boolean
}

export const AccessibleLink = forwardRef<HTMLAnchorElement, AccessibleLinkProps>(
  ({ children, external = false, showExternalIcon = true, className, ...props }, ref) => {
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

    const variants: Variants = {
      rest: { scale: 1 },
      hover: { 
        scale: prefersReducedMotion ? 1 : 1.02,
        transition: { duration: 0.2 }
      }
    }

    return (
      <motion.a
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded',
          className
        )}
        variants={variants}
        initial="rest"
        whileHover="hover"
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        aria-describedby={external ? 'external-link-description' : undefined}
        {...props}
      >
        <span>{children}</span>
        {external && showExternalIcon && (
          <svg 
            className="w-4 h-4 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
        {external && (
          <span id="external-link-description" className="sr-only">
            Opens in a new tab
          </span>
        )}
      </motion.a>
    )
  }
)

AccessibleLink.displayName = 'AccessibleLink'

// Skip link for keyboard navigation
export function SkipLink({ href = '#main-content', children = 'Skip to main content' }: { 
  href?: string 
  children?: ReactNode 
}) {
  return (
    <motion.a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      initial={{ opacity: 0, y: -10 }}
      whileFocus={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.a>
  )
}

// Accessible card with proper focus management
interface AccessibleCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  interactive?: boolean
  onClick?: () => void
  href?: string
  title?: string
  description?: string
}

export const AccessibleCard = forwardRef<HTMLDivElement, AccessibleCardProps>(
  ({ children, interactive = false, onClick, href, title, description, className, ...props }, ref) => {
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
    const cardRef = useRef<HTMLDivElement>(null)

    const variants: Variants = {
      rest: { 
        y: 0, 
        scale: 1,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      },
      hover: { 
        y: prefersReducedMotion ? 0 : -4,
        scale: prefersReducedMotion ? 1 : 1.02,
        boxShadow: prefersReducedMotion 
          ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && (onClick || href)) {
        e.preventDefault()
        if (onClick) {
          onClick()
        } else if (href) {
          window.location.href = href
        }
      }
    }

    const CardComponent = motion.div

    return (
      <CardComponent
        ref={ref}
        className={cn(
          'bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800 overflow-hidden',
          interactive && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          className
        )}
        variants={variants}
        initial="rest"
        whileHover={interactive ? 'hover' : 'rest'}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        aria-label={title}
        aria-describedby={description ? `card-description-${title}` : undefined}
        {...props}
      >
        {children}
        {description && (
          <span id={`card-description-${title}`} className="sr-only">
            {description}
          </span>
        )}
      </CardComponent>
    )
  }
)

AccessibleCard.displayName = 'AccessibleCard'

// Focus trap for modals and dialogs
interface FocusTrapProps {
  children: ReactNode
  active?: boolean
  initialFocus?: React.RefObject<HTMLElement>
}

export function FocusTrap({ children, active = true, initialFocus }: FocusTrapProps) {
  const trapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !trapRef.current) return

    const trap = trapRef.current
    const focusableElements = trap.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

    // Focus initial element or first focusable element
    if (initialFocus?.current) {
      initialFocus.current.focus()
    } else if (firstFocusable) {
      firstFocusable.focus()
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [active, initialFocus])

  return (
    <div ref={trapRef}>
      {children}
    </div>
  )
}

// Accessible progress indicator
interface ProgressIndicatorProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  className?: string
}

export function ProgressIndicator({ 
  value, 
  max = 100, 
  label, 
  showValue = true, 
  className 
}: ProgressIndicatorProps) {
  const percentage = Math.round((value / max) * 100)
  const progressId = useId()

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span id={`${progressId}-label`} className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm text-secondary-600 dark:text-secondary-400">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div 
        className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={label ? `${progressId}-label` : undefined}
        aria-valuetext={`${percentage} percent complete`}
      >
        <motion.div
          className="bg-primary-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// Accessible accordion
interface AccordionItemProps {
  title: string
  children: ReactNode
  isOpen: boolean
  onToggle: () => void
  id: string
}

export function AccordionItem({ title, children, isOpen, onToggle, id }: AccordionItemProps) {
  const contentId = `${id}-content`
  const buttonId = `${id}-button`

  return (
    <div className="border-b border-secondary-200 dark:border-secondary-700">
      <h3>
        <motion.button
          id={buttonId}
          className="flex justify-between items-center w-full px-4 py-4 text-left font-medium text-secondary-900 dark:text-white hover:bg-secondary-50 dark:hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={contentId}
          whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
        >
          <span>{title}</span>
          <motion.svg
            className="w-5 h-5 text-secondary-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.button>
      </h3>
      <motion.div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 text-secondary-600 dark:text-secondary-300">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

// Live region for screen readers
interface LiveRegionProps {
  children: ReactNode
  priority?: 'polite' | 'assertive'
  atomic?: boolean
  className?: string
}

export function LiveRegion({ 
  children, 
  priority = 'polite', 
  atomic = false, 
  className 
}: LiveRegionProps) {
  return (
    <div
      className={cn('sr-only', className)}
      aria-live={priority}
      aria-atomic={atomic}
      role="status"
    >
      {children}
    </div>
  )
}