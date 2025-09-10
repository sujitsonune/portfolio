'use client'

import Link from 'next/link'
import { Download, Mail, ArrowRight, ExternalLink, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CTAButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  href?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'
  className?: string
  external?: boolean
}

export function CTAButton({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  external = false,
}: CTAButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-semibold transition-all duration-300',
    'focus:outline-none focus:ring-4 focus:ring-opacity-50',
    'transform hover:scale-105 active:scale-95',
    'relative overflow-hidden group',
    disabled && 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100'
  )

  const variantClasses = {
    primary: cn(
      'bg-primary-600 text-white border border-primary-600',
      'hover:bg-primary-700 hover:border-primary-700',
      'focus:ring-primary-300 dark:focus:ring-primary-800',
      'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40'
    ),
    secondary: cn(
      'bg-secondary-600 text-white border border-secondary-600',
      'hover:bg-secondary-700 hover:border-secondary-700',
      'focus:ring-secondary-300 dark:focus:ring-secondary-800',
      'shadow-lg shadow-secondary-500/25'
    ),
    outline: cn(
      'bg-transparent border-2 border-primary-600 text-primary-600',
      'hover:bg-primary-600 hover:text-white',
      'focus:ring-primary-300 dark:focus:ring-primary-800',
      'dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-400 dark:hover:text-secondary-900'
    ),
    ghost: cn(
      'bg-transparent text-secondary-700 dark:text-secondary-300',
      'hover:bg-secondary-100 dark:hover:bg-secondary-800',
      'focus:ring-secondary-300 dark:focus:ring-secondary-700'
    ),
    gradient: cn(
      'bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 text-white border-0',
      'hover:from-primary-600 hover:via-accent-600 hover:to-primary-700',
      'focus:ring-primary-300 dark:focus:ring-primary-800',
      'shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50',
      'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
      'before:-translate-x-full before:hover:translate-x-full before:transition-transform before:duration-700'
    ),
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-md gap-2',
    md: 'px-6 py-3 text-base rounded-lg gap-3',
    lg: 'px-8 py-4 text-lg rounded-xl gap-3',
    xl: 'px-10 py-5 text-xl rounded-2xl gap-4',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7',
  }

  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  )

  const content = (
    <>
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
        </div>
      )}

      {/* Button content */}
      <div className={cn('flex items-center gap-inherit', loading && 'opacity-0')}>
        {Icon && iconPosition === 'left' && (
          <Icon className={cn(iconSizes[size], 'flex-shrink-0')} />
        )}
        <span>{children}</span>
        {Icon && iconPosition === 'right' && (
          <Icon className={cn(iconSizes[size], 'flex-shrink-0')} />
        )}
      </div>

      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-inherit bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={buttonClasses}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {content}
    </button>
  )
}

// Predefined CTA button components
export function ContactButton({ className, ...props }: Omit<CTAButtonProps, 'children' | 'icon'>) {
  return (
    <CTAButton
      icon={Mail}
      iconPosition="left"
      variant="primary"
      className={className}
      {...props}
    >
      Get In Touch
    </CTAButton>
  )
}

export function ResumeButton({ className, ...props }: Omit<CTAButtonProps, 'children' | 'icon'>) {
  return (
    <CTAButton
      icon={Download}
      iconPosition="left"
      variant="outline"
      external
      className={className}
      {...props}
    >
      Download Resume
    </CTAButton>
  )
}

export function ViewWorkButton({ className, ...props }: Omit<CTAButtonProps, 'children' | 'icon'>) {
  return (
    <CTAButton
      icon={ArrowRight}
      iconPosition="right"
      variant="ghost"
      className={className}
      {...props}
    >
      View My Work
    </CTAButton>
  )
}

export function ScheduleCallButton({ className, ...props }: Omit<CTAButtonProps, 'children' | 'icon'>) {
  return (
    <CTAButton
      icon={MessageCircle}
      iconPosition="left"
      variant="gradient"
      className={className}
      {...props}
    >
      Schedule a Call
    </CTAButton>
  )
}

// CTA button group with animations
export function CTAButtonGroup({
  primaryButton,
  secondaryButton,
  direction = 'horizontal',
  className,
}: {
  primaryButton: React.ReactNode
  secondaryButton?: React.ReactNode
  direction?: 'horizontal' | 'vertical'
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex gap-4',
        direction === 'vertical' ? 'flex-col items-center' : 'flex-col sm:flex-row items-center',
        className
      )}
    >
      <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        {primaryButton}
      </div>
      {secondaryButton && (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          {secondaryButton}
        </div>
      )}
    </div>
  )
}

// Floating action button
export function FloatingActionButton({
  icon: Icon,
  label,
  href,
  onClick,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
  onClick?: () => void
  className?: string
}) {
  return (
    <div className={cn('group relative', className)}>
      <CTAButton
        variant="gradient"
        size="lg"
        href={href}
        onClick={onClick}
        className="rounded-full !p-4 shadow-2xl hover:shadow-primary-500/30"
        aria-label={label}
      >
        <Icon className="h-6 w-6" />
      </CTAButton>
      
      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {label}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-secondary-900 dark:border-t-white" />
      </div>
    </div>
  )
}