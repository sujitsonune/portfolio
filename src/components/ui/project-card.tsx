'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  ExternalLink, 
  Github, 
  Calendar, 
  Users, 
  TrendingUp, 
  Eye,
  Star,
  Clock,
  Award,
  Zap
} from 'lucide-react'
import type { Project } from '@/types'
import { TechnologyGrid } from './technology-icons'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  variant?: 'default' | 'featured' | 'minimal'
  onViewDetails?: (project: Project) => void
  className?: string
  index?: number
}

export function ProjectCard({ 
  project, 
  variant = 'default',
  onViewDetails,
  className,
  index = 0
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const mainImage = project.images?.find(img => img.isMain) || project.images?.[0]
  const statusColors = {
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    'planned': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    'archived': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
  }

  const handleViewDetails = () => {
    onViewDetails?.(project)
  }

  if (variant === 'minimal') {
    return (
      <div 
        className={cn(
          'group relative bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
          className
        )}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {project.title}
            </h3>
            {project.isFeatured && (
              <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-secondary-600 dark:text-secondary-300 line-clamp-2">
            {project.description}
          </p>
          
          <TechnologyGrid
            technologies={project.technologies.slice(0, 3)}
            variant="small"
            showIcons={false}
            maxItems={3}
          />
          
          <div className="flex items-center gap-2 pt-2">
            {project.links?.find(link => link.type === 'live') && (
              <a
                href={project.links.find(link => link.type === 'live')?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {project.links?.find(link => link.type === 'github') && (
              <a
                href={project.links.find(link => link.type === 'github')?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={handleViewDetails}
              className="ml-auto text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'group relative bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary-500/10 animate-fade-in-up',
        variant === 'featured' && 'ring-2 ring-primary-500/20',
        className
      )}
      style={{ animationDelay: `${index * 150}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Featured Badge */}
      {project.isFeatured && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </div>
        </div>
      )}

      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 overflow-hidden">
        {mainImage ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
              </div>
            )}
            <Image
              src={mainImage.url}
              alt={project.title}
              fill
              className={cn(
                'object-cover transition-all duration-700 group-hover:scale-110',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl font-bold text-primary-200 dark:text-primary-800">
              {project.title.charAt(0)}
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )} />

        {/* Hover Actions */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300',
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}>
          <button
            onClick={handleViewDetails}
            className="p-3 bg-white/90 hover:bg-white text-secondary-800 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <Eye className="h-5 w-5" />
          </button>
          
          {project.links?.find(link => link.type === 'live') && (
            <a
              href={project.links.find(link => link.type === 'live')?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
          
          {project.links?.find(link => link.type === 'github') && (
            <a
              href={project.links.find(link => link.type === 'github')?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-secondary-800 hover:bg-secondary-900 text-white rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            statusColors[project.status]
          )}>
            {project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {project.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-secondary-500 dark:text-secondary-400">
              <Calendar className="h-3 w-3" />
              {formatDate(project.timeline.startDate.toDate())}
            </div>
          </div>
          
          <p className="text-secondary-600 dark:text-secondary-300 line-clamp-3 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Metrics */}
        {project.metrics && (
          <div className="grid grid-cols-2 gap-4 py-3 border-y border-secondary-100 dark:border-secondary-700">
            {project.metrics.visitors && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-secondary-600 dark:text-secondary-300">
                  {project.metrics.visitors.toLocaleString()} views
                </span>
              </div>
            )}
            {project.metrics.users && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-secondary-600 dark:text-secondary-300">
                  {project.metrics.users.toLocaleString()} users
                </span>
              </div>
            )}
            {project.metrics.performance && (
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-secondary-600 dark:text-secondary-300">
                  {project.metrics.performance}
                </span>
              </div>
            )}
            {project.metrics.impact && (
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-purple-500" />
                <span className="text-secondary-600 dark:text-secondary-300">
                  {project.metrics.impact}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Technologies */}
        <div className="space-y-2">
          <TechnologyGrid
            technologies={project.technologies}
            variant="small"
            maxItems={6}
          />
        </div>

        {/* Team */}
        {project.team && project.team.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-300">
            <Users className="h-4 w-4" />
            <span>Team of {project.team.length + 1}</span>
          </div>
        )}

        {/* Duration */}
        {project.timeline.duration && (
          <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-300">
            <Clock className="h-4 w-4" />
            <span>{project.timeline.duration}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
          >
            View Details
          </button>
          
          <div className="flex gap-2">
            {project.links?.find(link => link.type === 'live') && (
              <a
                href={project.links.find(link => link.type === 'live')?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-secondary-300 dark:border-secondary-600 hover:border-primary-500 dark:hover:border-primary-500 text-secondary-600 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            
            {project.links?.find(link => link.type === 'github') && (
              <a
                href={project.links.find(link => link.type === 'github')?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-secondary-300 dark:border-secondary-600 hover:border-primary-500 dark:hover:border-primary-500 text-secondary-600 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400 rounded-lg transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Shine effect */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-1000',
        isHovered && 'translate-x-full'
      )} />
    </div>
  )
}

// Project card skeleton
export function ProjectCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'minimal' }) {
  if (variant === 'minimal') {
    return (
      <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 space-y-3 animate-pulse">
        <div className="h-5 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4" />
        <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-full" />
        <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-6 bg-secondary-200 dark:bg-secondary-700 rounded-full w-16" />
          <div className="h-6 bg-secondary-200 dark:bg-secondary-700 rounded-full w-20" />
          <div className="h-6 bg-secondary-200 dark:bg-secondary-700 rounded-full w-14" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden animate-pulse">
      <div className="h-48 bg-secondary-200 dark:bg-secondary-700" />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-6 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4" />
          <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-full" />
          <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-5/6" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 bg-secondary-200 dark:bg-secondary-700 rounded-full w-16" />
          ))}
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-secondary-200 dark:bg-secondary-700 rounded-lg" />
          <div className="h-10 w-10 bg-secondary-200 dark:bg-secondary-700 rounded-lg" />
          <div className="h-10 w-10 bg-secondary-200 dark:bg-secondary-700 rounded-lg" />
        </div>
      </div>
    </div>
  )
}