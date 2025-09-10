'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Globe, 
  Instagram,
  Youtube,
  Facebook,
  Twitch,
  Discord,
  Dribbble,
  Behance,
  Medium,
  Dev,
  ExternalLink,
  Share2,
  Copy,
  CheckCircle
} from 'lucide-react'
import type { SocialLink } from '@/types'
import { cn } from '@/lib/utils'

interface SocialLinksProps {
  socialLinks: SocialLink[]
  variant?: 'default' | 'compact' | 'minimal' | 'detailed'
  showLabels?: boolean
  showStats?: boolean
  animate?: boolean
  className?: string
}

// Social platform configurations
const socialPlatformConfig = {
  github: {
    icon: Github,
    label: 'GitHub',
    color: 'bg-gray-900 hover:bg-gray-800',
    textColor: 'text-white',
    description: 'Code repositories and contributions'
  },
  linkedin: {
    icon: Linkedin,
    label: 'LinkedIn',
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-white',
    description: 'Professional network and experience'
  },
  twitter: {
    icon: Twitter,
    label: 'Twitter',
    color: 'bg-sky-500 hover:bg-sky-600',
    textColor: 'text-white',
    description: 'Thoughts and industry updates'
  },
  email: {
    icon: Mail,
    label: 'Email',
    color: 'bg-red-600 hover:bg-red-700',
    textColor: 'text-white',
    description: 'Direct communication'
  },
  website: {
    icon: Globe,
    label: 'Website',
    color: 'bg-primary-600 hover:bg-primary-700',
    textColor: 'text-white',
    description: 'Personal website'
  },
  instagram: {
    icon: Instagram,
    label: 'Instagram',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    textColor: 'text-white',
    description: 'Visual content and behind the scenes'
  },
  youtube: {
    icon: Youtube,
    label: 'YouTube',
    color: 'bg-red-600 hover:bg-red-700',
    textColor: 'text-white',
    description: 'Video content and tutorials'
  },
  facebook: {
    icon: Facebook,
    label: 'Facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-white',
    description: 'Social updates and community'
  },
  twitch: {
    icon: Twitch,
    label: 'Twitch',
    color: 'bg-purple-600 hover:bg-purple-700',
    textColor: 'text-white',
    description: 'Live streaming and gaming'
  },
  discord: {
    icon: Discord,
    label: 'Discord',
    color: 'bg-indigo-600 hover:bg-indigo-700',
    textColor: 'text-white',
    description: 'Community and chat'
  },
  dribbble: {
    icon: Dribbble,
    label: 'Dribbble',
    color: 'bg-pink-600 hover:bg-pink-700',
    textColor: 'text-white',
    description: 'Design portfolio and inspiration'
  },
  behance: {
    icon: Behance,
    label: 'Behance',
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-white',
    description: 'Creative portfolio showcase'
  },
  medium: {
    icon: Medium,
    label: 'Medium',
    color: 'bg-gray-900 hover:bg-gray-800',
    textColor: 'text-white',
    description: 'Articles and technical writing'
  },
  devto: {
    icon: Dev,
    label: 'Dev.to',
    color: 'bg-gray-900 hover:bg-gray-800',
    textColor: 'text-white',
    description: 'Developer articles and community'
  }
}

interface SocialLinkItemProps {
  socialLink: SocialLink
  variant: 'default' | 'compact' | 'minimal' | 'detailed'
  showLabels: boolean
  showStats: boolean
  animate: boolean
  index: number
}

function SocialLinkItem({ 
  socialLink, 
  variant, 
  showLabels, 
  showStats, 
  animate, 
  index 
}: SocialLinkItemProps) {
  const [copied, setCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  const config = socialPlatformConfig[socialLink.platform.toLowerCase() as keyof typeof socialPlatformConfig] || {
    icon: Globe,
    label: socialLink.platform,
    color: 'bg-secondary-600 hover:bg-secondary-700',
    textColor: 'text-white',
    description: 'Social platform'
  }

  const Icon = config.icon

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await navigator.clipboard.writeText(socialLink.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleClick = () => {
    if (socialLink.platform.toLowerCase() === 'email') {
      window.location.href = `mailto:${socialLink.url}`
    } else {
      window.open(socialLink.url, '_blank', 'noopener,noreferrer')
    }
  }

  if (variant === 'minimal') {
    return (
      <motion.button
        onClick={handleClick}
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 text-secondary-600 hover:text-white dark:text-secondary-400 dark:hover:text-white border border-secondary-200 dark:border-secondary-700',
          config.color
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={animate ? { opacity: 0, y: 20 } : {}}
        animate={animate ? { opacity: 1, y: 0 } : {}}
        transition={animate ? { duration: 0.5, delay: index * 0.1 } : {}}
        title={config.label}
      >
        <Icon className="h-5 w-5" />
      </motion.button>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'group relative flex items-center gap-3 p-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 hover:shadow-md transition-all duration-200',
          config.color.includes('gradient') && 'hover:shadow-lg'
        )}
        whileHover={{ y: -2 }}
        initial={animate ? { opacity: 0, x: -20 } : {}}
        animate={animate ? { opacity: 1, x: 0 } : {}}
        transition={animate ? { duration: 0.5, delay: index * 0.1 } : {}}
      >
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200',
          isHovered ? config.color : 'bg-secondary-100 dark:bg-secondary-800'
        )}>
          <Icon className={cn(
            'h-6 w-6 transition-colors duration-200',
            isHovered ? config.textColor : 'text-secondary-600 dark:text-secondary-400'
          )} />
        </div>
        
        {showLabels && (
          <div className="flex-1 text-left">
            <div className="font-medium text-secondary-900 dark:text-white">
              {config.label}
            </div>
            {socialLink.username && (
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                @{socialLink.username}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-secondary-500" />
            )}
          </button>
          <ExternalLink className="h-4 w-4 text-secondary-400" />
        </div>
      </motion.button>
    )
  }

  // Default and detailed variants
  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative flex items-center gap-4 p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 hover:shadow-md transition-all duration-300',
        'hover:border-primary-300 dark:hover:border-primary-600'
      )}
      whileHover={{ y: -2, scale: 1.02 }}
      initial={animate ? { opacity: 0, x: -20 } : {}}
      animate={animate ? { opacity: 1, x: 0 } : {}}
      transition={animate ? { duration: 0.5, delay: index * 0.1 } : {}}
    >
      {/* Icon */}
      <div className={cn(
        'w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300',
        isHovered ? config.color : 'bg-secondary-100 dark:bg-secondary-800'
      )}>
        <Icon className={cn(
          'h-7 w-7 transition-all duration-300',
          isHovered ? config.textColor : 'text-secondary-600 dark:text-secondary-400'
        )} />
      </div>

      {/* Content */}
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-secondary-900 dark:text-white">
            {showLabels ? config.label : socialLink.platform}
          </h3>
          {socialLink.isVisible === false && (
            <span className="text-xs bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 px-2 py-0.5 rounded-full">
              Private
            </span>
          )}
        </div>
        
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">
          {config.description}
        </p>
        
        {socialLink.username && (
          <p className="text-sm text-primary-600 dark:text-primary-400">
            @{socialLink.username}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={handleCopy}
          className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {copied ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-secondary-500" />
          )}
        </motion.button>
        
        <ExternalLink className="h-5 w-5 text-secondary-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/10 dark:to-primary-800/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
    </motion.button>
  )
}

export function SocialLinks({
  socialLinks,
  variant = 'default',
  showLabels = true,
  showStats = false,
  animate = true,
  className
}: SocialLinksProps) {
  const [showAll, setShowAll] = useState(false)
  
  // Filter visible social links
  const visibleLinks = socialLinks.filter(link => link.isVisible !== false)
  
  // Show only first 6 links by default, unless showAll is true
  const displayedLinks = showAll ? visibleLinks : visibleLinks.slice(0, 6)
  const hasMore = visibleLinks.length > 6

  const handleShareAll = async () => {
    const urls = visibleLinks.map(link => link.url).join('\n')
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Social Media Links',
          text: 'Connect with me on social media:',
          url: urls
        })
      } catch (error) {
        console.log('Share cancelled or failed:', error)
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(urls)
        // You could show a toast notification here
      } catch (error) {
        console.error('Failed to copy links:', error)
      }
    }
  }

  if (visibleLinks.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-4xl mb-4">🔗</div>
        <p className="text-secondary-600 dark:text-secondary-400">
          No social links available
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      {variant !== 'minimal' && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
              Connect With Me
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              Find me on these platforms
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {hasMore && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                {showAll ? 'Show less' : `Show all (${visibleLinks.length})`}
              </button>
            )}
            
            <motion.button
              onClick={handleShareAll}
              className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Share all links"
            >
              <Share2 className="h-4 w-4 text-secondary-500" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Social Links Grid */}
      <div className={cn(
        'grid gap-4',
        variant === 'minimal' && 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8',
        variant === 'compact' && 'grid-cols-1 sm:grid-cols-2',
        variant === 'detailed' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        variant === 'default' && 'grid-cols-1'
      )}>
        {displayedLinks.map((socialLink, index) => (
          <SocialLinkItem
            key={`${socialLink.platform}-${socialLink.url}`}
            socialLink={socialLink}
            variant={variant}
            showLabels={showLabels}
            showStats={showStats}
            animate={animate}
            index={index}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && !showAll && variant !== 'minimal' && (
        <motion.button
          onClick={() => setShowAll(true)}
          className="w-full p-4 border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-xl text-secondary-600 dark:text-secondary-400 hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Show {visibleLinks.length - displayedLinks.length} more platforms
        </motion.button>
      )}

      {/* Stats */}
      {showStats && visibleLinks.length > 0 && (
        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                {visibleLinks.length}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                Platforms
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                {visibleLinks.filter(link => link.username).length}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                With Username
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                {new Set(visibleLinks.map(link => link.platform)).size}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                Unique Types
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}