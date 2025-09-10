'use client'

import Link from 'next/link'
import { Github, Linkedin, Twitter, Mail, Instagram, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialLink {
  platform: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  hoverColor: string
}

interface SocialLinksProps {
  links?: Partial<Record<string, string>>
  variant?: 'default' | 'floating' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  direction?: 'horizontal' | 'vertical'
  showLabels?: boolean
  className?: string
}

const socialPlatforms: Record<string, SocialLink> = {
  github: {
    platform: 'GitHub',
    url: '',
    icon: Github,
    color: 'text-gray-700 dark:text-gray-300',
    hoverColor: 'hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
  },
  linkedin: {
    platform: 'LinkedIn',
    url: '',
    icon: Linkedin,
    color: 'text-blue-600',
    hoverColor: 'hover:text-white hover:bg-blue-600',
  },
  twitter: {
    platform: 'Twitter',
    url: '',
    icon: Twitter,
    color: 'text-blue-400',
    hoverColor: 'hover:text-white hover:bg-blue-400',
  },
  email: {
    platform: 'Email',
    url: '',
    icon: Mail,
    color: 'text-red-500',
    hoverColor: 'hover:text-white hover:bg-red-500',
  },
  instagram: {
    platform: 'Instagram',
    url: '',
    icon: Instagram,
    color: 'text-pink-500',
    hoverColor: 'hover:text-white hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600',
  },
  website: {
    platform: 'Website',
    url: '',
    icon: Globe,
    color: 'text-green-500',
    hoverColor: 'hover:text-white hover:bg-green-500',
  },
}

export function SocialLinks({
  links = {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
    email: 'mailto:hello@example.com',
  },
  variant = 'default',
  size = 'md',
  direction = 'horizontal',
  showLabels = false,
  className,
}: SocialLinksProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const containerClasses = {
    horizontal: 'flex flex-row space-x-3',
    vertical: 'flex flex-col space-y-3',
  }

  const variantClasses = {
    default: 'rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white/50 dark:bg-secondary-800/50 backdrop-blur-sm',
    floating: 'rounded-full shadow-lg shadow-primary-500/25 bg-white dark:bg-secondary-800',
    minimal: 'rounded-md',
  }

  return (
    <div className={cn(containerClasses[direction], className)}>
      {Object.entries(links).map(([platform, url]) => {
        const socialConfig = socialPlatforms[platform]
        if (!socialConfig || !url) return null

        const Icon = socialConfig.icon

        return (
          <div key={platform} className="group">
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center justify-center transition-all duration-300',
                'transform hover:scale-110 active:scale-95',
                sizeClasses[size],
                variantClasses[variant],
                socialConfig.color,
                socialConfig.hoverColor,
                'relative overflow-hidden'
              )}
              aria-label={`Visit ${socialConfig.platform}`}
            >
              {/* Background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <Icon className={cn(iconSizes[size], 'relative z-10')} />
              
              {showLabels && (
                <span className="ml-2 text-sm font-medium">{socialConfig.platform}</span>
              )}

              {/* Hover tooltip */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {socialConfig.platform}
              </div>
            </Link>

            {/* Floating variant glow effect */}
            {variant === 'floating' && (
              <div className="absolute inset-0 rounded-full bg-primary-500 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300 -z-10" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Animated social links with stagger effect
export function AnimatedSocialLinks(props: SocialLinksProps) {
  return (
    <div className="space-y-2">
      <div className="animate-fade-in-up">
        <SocialLinks {...props} />
      </div>
    </div>
  )
}

// Floating social bar (fixed position)
export function FloatingSocialBar({
  position = 'left',
  links,
}: {
  position?: 'left' | 'right'
  links?: Partial<Record<string, string>>
}) {
  return (
    <div
      className={cn(
        'fixed top-1/2 transform -translate-y-1/2 z-50',
        'hidden lg:block',
        position === 'left' ? 'left-6' : 'right-6'
      )}
    >
      <SocialLinks
        links={links}
        variant="floating"
        direction="vertical"
        size="md"
        className="bg-white/10 dark:bg-secondary-900/10 backdrop-blur-md rounded-2xl p-3 border border-white/20"
      />
      
      {/* Connecting line */}
      <div className="h-20 w-0.5 bg-gradient-to-b from-primary-500/50 to-transparent mx-auto mt-4" />
    </div>
  )
}