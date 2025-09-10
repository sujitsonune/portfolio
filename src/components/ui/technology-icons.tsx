'use client'

import { 
  Code, 
  Database, 
  Globe, 
  Smartphone, 
  Cloud, 
  Cpu,
  Layers,
  GitBranch,
  Shield,
  Zap,
  Box,
  Monitor
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Technology icon mapping
export const technologyIcons: Record<string, {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  category: string
}> = {
  // Frontend
  'react': {
    icon: Code,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'frontend'
  },
  'vue': {
    icon: Code,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    category: 'frontend'
  },
  'angular': {
    icon: Code,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    category: 'frontend'
  },
  'nextjs': {
    icon: Globe,
    color: 'text-gray-900',
    bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    category: 'frontend'
  },
  'nuxt': {
    icon: Globe,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    category: 'frontend'
  },
  'svelte': {
    icon: Code,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    category: 'frontend'
  },
  'typescript': {
    icon: Code,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'frontend'
  },
  'javascript': {
    icon: Code,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    category: 'frontend'
  },
  'html': {
    icon: Globe,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    category: 'frontend'
  },
  'css': {
    icon: Code,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'frontend'
  },
  'tailwind': {
    icon: Code,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/20',
    category: 'frontend'
  },
  'sass': {
    icon: Code,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900/20',
    category: 'frontend'
  },

  // Backend
  'nodejs': {
    icon: Zap,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    category: 'backend'
  },
  'express': {
    icon: Zap,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    category: 'backend'
  },
  'nestjs': {
    icon: Zap,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    category: 'backend'
  },
  'python': {
    icon: Code,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'backend'
  },
  'django': {
    icon: Layers,
    color: 'text-green-700',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    category: 'backend'
  },
  'flask': {
    icon: Layers,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    category: 'backend'
  },
  'fastapi': {
    icon: Zap,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100 dark:bg-teal-900/20',
    category: 'backend'
  },
  'graphql': {
    icon: Layers,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900/20',
    category: 'backend'
  },

  // Database
  'mongodb': {
    icon: Database,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    category: 'database'
  },
  'postgresql': {
    icon: Database,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'database'
  },
  'mysql': {
    icon: Database,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'database'
  },
  'redis': {
    icon: Database,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    category: 'database'
  },
  'firebase': {
    icon: Database,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    category: 'database'
  },
  'supabase': {
    icon: Database,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    category: 'database'
  },

  // Mobile
  'react-native': {
    icon: Smartphone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'mobile'
  },
  'flutter': {
    icon: Smartphone,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'mobile'
  },
  'ionic': {
    icon: Smartphone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'mobile'
  },
  'expo': {
    icon: Smartphone,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    category: 'mobile'
  },

  // Cloud & DevOps
  'aws': {
    icon: Cloud,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    category: 'cloud'
  },
  'gcp': {
    icon: Cloud,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'cloud'
  },
  'azure': {
    icon: Cloud,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'cloud'
  },
  'docker': {
    icon: Box,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'cloud'
  },
  'kubernetes': {
    icon: Cpu,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'cloud'
  },
  'vercel': {
    icon: Monitor,
    color: 'text-black',
    bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    category: 'cloud'
  },
  'netlify': {
    icon: Monitor,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100 dark:bg-teal-900/20',
    category: 'cloud'
  },

  // Tools
  'git': {
    icon: GitBranch,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    category: 'tools'
  },
  'github': {
    icon: GitBranch,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    category: 'tools'
  },
  'gitlab': {
    icon: GitBranch,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    category: 'tools'
  },
  'jest': {
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    category: 'tools'
  },
  'cypress': {
    icon: Shield,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    category: 'tools'
  },
  'webpack': {
    icon: Box,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    category: 'tools'
  },
  'vite': {
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    category: 'tools'
  }
}

interface TechnologyBadgeProps {
  technology: {
    name: string
    category?: string
    icon?: string
    color?: string
  }
  variant?: 'default' | 'small' | 'large' | 'minimal'
  showIcon?: boolean
  className?: string
  onClick?: () => void
}

export function TechnologyBadge({
  technology,
  variant = 'default',
  showIcon = true,
  className,
  onClick
}: TechnologyBadgeProps) {
  const techKey = technology.name.toLowerCase().replace(/[.\s]/g, '')
  const techConfig = technologyIcons[techKey] || {
    icon: Code,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    category: 'other'
  }

  const variantClasses = {
    default: 'px-3 py-1.5 text-sm',
    small: 'px-2 py-1 text-xs',
    large: 'px-4 py-2 text-base',
    minimal: 'px-2 py-1 text-xs'
  }

  const Icon = techConfig.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-300',
        'hover:scale-105 cursor-pointer',
        techConfig.bgColor,
        techConfig.color,
        variantClasses[variant],
        onClick && 'hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {showIcon && <Icon className="h-4 w-4" />}
      <span>{technology.name}</span>
    </span>
  )
}

interface TechnologyGridProps {
  technologies: Array<{
    name: string
    category?: string
    icon?: string
    color?: string
  }>
  variant?: 'default' | 'small' | 'large' | 'minimal'
  showIcons?: boolean
  maxItems?: number
  onTechnologyClick?: (technology: string) => void
  className?: string
}

export function TechnologyGrid({
  technologies,
  variant = 'default',
  showIcons = true,
  maxItems,
  onTechnologyClick,
  className
}: TechnologyGridProps) {
  const displayTechnologies = maxItems ? technologies.slice(0, maxItems) : technologies
  const remainingCount = maxItems && technologies.length > maxItems 
    ? technologies.length - maxItems 
    : 0

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {displayTechnologies.map((tech, index) => (
        <TechnologyBadge
          key={`${tech.name}-${index}`}
          technology={tech}
          variant={variant}
          showIcon={showIcons}
          onClick={() => onTechnologyClick?.(tech.name)}
          className="animate-fade-in-up"
          style={{
            animationDelay: `${index * 50}ms`
          } as React.CSSProperties}
        />
      ))}
      
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 text-xs text-secondary-500 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800 rounded-full">
          +{remainingCount} more
        </span>
      )}
    </div>
  )
}

// Technology category colors
export const categoryColors: Record<string, string> = {
  frontend: 'bg-blue-500',
  backend: 'bg-green-500',
  database: 'bg-purple-500',
  mobile: 'bg-pink-500',
  cloud: 'bg-orange-500',
  tools: 'bg-gray-500',
  other: 'bg-gray-400'
}

export function getCategoryColor(category?: string): string {
  return categoryColors[category || 'other'] || categoryColors.other
}

// Get technology by name
export function getTechnologyConfig(name: string) {
  const techKey = name.toLowerCase().replace(/[.\s]/g, '')
  return technologyIcons[techKey]
}

// Get technologies by category
export function getTechnologiesByCategory(category: string) {
  return Object.entries(technologyIcons)
    .filter(([_, config]) => config.category === category)
    .map(([name, config]) => ({ name, ...config }))
}

// Technology filter component
interface TechnologyFilterProps {
  technologies: string[]
  selectedTechnologies: string[]
  onTechnologyToggle: (tech: string) => void
  className?: string
}

export function TechnologyFilter({
  technologies,
  selectedTechnologies,
  onTechnologyToggle,
  className
}: TechnologyFilterProps) {
  const categories = [...new Set(
    technologies.map(tech => {
      const techKey = tech.toLowerCase().replace(/[.\s]/g, '')
      const config = technologyIcons[techKey]
      return config?.category || 'other'
    })
  )].sort()

  return (
    <div className={cn('space-y-4', className)}>
      {categories.map(category => {
        const categoryTechs = technologies.filter(tech => {
          const techKey = tech.toLowerCase().replace(/[.\s]/g, '')
          const config = technologyIcons[techKey]
          return (config?.category || 'other') === category
        })

        return (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 capitalize">
              {category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {categoryTechs.map(tech => (
                <button
                  key={tech}
                  onClick={() => onTechnologyToggle(tech)}
                  className={cn(
                    'transition-all duration-200',
                    selectedTechnologies.includes(tech) 
                      ? 'ring-2 ring-primary-500 ring-offset-1' 
                      : 'opacity-70 hover:opacity-100'
                  )}
                >
                  <TechnologyBadge
                    technology={{ name: tech }}
                    variant="small"
                  />
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}