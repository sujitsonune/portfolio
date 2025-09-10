'use client'

import { useState, useEffect, useMemo } from 'react'
import { Briefcase, TrendingUp, Clock, Users } from 'lucide-react'
import { TimelineItem } from './timeline-item'
import { ExperienceFilters } from './experience-filters'
import type { WorkExperience } from '@/types'
import type { ExperienceFilters as FilterType } from '@/lib/experience-utils'
import { filterExperiences, searchExperiences, calculateDuration } from '@/lib/experience-utils'
import { useWorkExperience } from '@/hooks/use-firestore'
import { cn } from '@/lib/utils'

interface WorkExperienceTimelineProps {
  className?: string
  variant?: 'timeline' | 'cards'
  showFilters?: boolean
  showStats?: boolean
}

export function WorkExperienceTimeline({ 
  className,
  variant = 'timeline',
  showFilters = true,
  showStats = true
}: WorkExperienceTimelineProps) {
  const { data: experiences, loading, error } = useWorkExperience()
  const [filters, setFilters] = useState<Partial<FilterType>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  // Filter and search experiences
  const filteredExperiences = useMemo(() => {
    if (!experiences) return []
    
    let result = experiences
    
    // Apply search
    if (searchQuery.trim()) {
      result = searchExperiences(result, searchQuery)
    }
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = filterExperiences(result, filters)
    }
    
    return result.sort((a, b) => 
      b.duration.startDate.toDate().getTime() - a.duration.startDate.toDate().getTime()
    )
  }, [experiences, filters, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    if (!experiences) return null

    const totalExperience = experiences.reduce((total, exp) => {
      const duration = calculateDuration(
        exp.duration.startDate.toDate(),
        exp.duration.endDate?.toDate(),
        exp.duration.isCurrent
      )
      // Extract years and months from duration string
      const yearMatch = duration.match(/(\d+) yr/)
      const monthMatch = duration.match /(\d+) mo/)
      
      const years = yearMatch ? parseInt(yearMatch[1]) : 0
      const months = monthMatch ? parseInt(monthMatch[1]) : 0
      
      return total + (years * 12) + months
    }, 0)

    const totalYears = Math.floor(totalExperience / 12)
    const remainingMonths = totalExperience % 12

    const uniqueCompanies = new Set(experiences.map(exp => exp.company)).size
    const uniqueTechnologies = new Set(experiences.flatMap(exp => exp.technologies)).size
    const currentRoles = experiences.filter(exp => exp.duration.isCurrent).length

    return {
      totalExperience: totalYears > 0 && remainingMonths > 0 
        ? `${totalYears} yr${totalYears > 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`
        : totalYears > 0 
          ? `${totalYears} yr${totalYears > 1 ? 's' : ''}`
          : `${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`,
      totalCompanies: uniqueCompanies,
      totalTechnologies: uniqueTechnologies,
      currentRoles
    }
  }, [experiences])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <TimelineSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 dark:text-red-400">
            Failed to load work experience: {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className={cn(
        'text-center space-y-4 transition-all duration-1000',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
            <Briefcase className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-white">
            Work Experience
          </h2>
        </div>
        <p className="text-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
          My professional journey through various roles and companies, 
          building products and solving complex problems.
        </p>
      </div>

      {/* Stats */}
      {showStats && stats && (
        <div className={cn(
          'grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-1000 delay-200',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        )}>
          <StatCard
            icon={Clock}
            label="Total Experience"
            value={stats.totalExperience}
            color="text-blue-600"
            bgColor="bg-blue-100 dark:bg-blue-900/20"
          />
          <StatCard
            icon={Briefcase}
            label="Companies"
            value={stats.totalCompanies.toString()}
            color="text-green-600"
            bgColor="bg-green-100 dark:bg-green-900/20"
          />
          <StatCard
            icon={TrendingUp}
            label="Technologies"
            value={stats.totalTechnologies.toString()}
            color="text-purple-600"
            bgColor="bg-purple-100 dark:bg-purple-900/20"
          />
          <StatCard
            icon={Users}
            label="Current Roles"
            value={stats.currentRoles.toString()}
            color="text-orange-600"
            bgColor="bg-orange-100 dark:bg-orange-900/20"
          />
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className={cn(
          'transition-all duration-1000 delay-300',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        )}>
          <ExperienceFilters
            experiences={experiences || []}
            filters={filters}
            onFiltersChange={setFilters}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      )}

      {/* Results count */}
      {filteredExperiences.length !== (experiences?.length || 0) && (
        <div className="text-center">
          <p className="text-secondary-600 dark:text-secondary-400">
            Showing {filteredExperiences.length} of {experiences?.length || 0} experiences
          </p>
        </div>
      )}

      {/* Timeline/Cards */}
      <div className={cn(
        'transition-all duration-1000 delay-500',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}>
        {filteredExperiences.length === 0 ? (
          <EmptyState searchQuery={searchQuery} hasFilters={Object.keys(filters).length > 0} />
        ) : variant === 'timeline' ? (
          <div className="hidden md:block">
            <div className="space-y-8">
              {filteredExperiences.map((experience, index) => (
                <TimelineItem
                  key={experience.id}
                  experience={experience}
                  index={index}
                  isLast={index === filteredExperiences.length - 1}
                  variant="timeline"
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Mobile cards or card variant */}
        <div className={cn(variant === 'timeline' ? 'md:hidden' : '', 'space-y-6')}>
          {filteredExperiences.map((experience, index) => (
            <TimelineItem
              key={`card-${experience.id}`}
              experience={experience}
              index={index}
              variant="card"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  bgColor 
}: { 
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: string
  bgColor: string
}) {
  return (
    <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 hover-lift group">
      <div className={cn('p-3 rounded-lg mb-3', bgColor)}>
        <Icon className={cn('h-6 w-6', color)} />
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {value}
        </p>
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          {label}
        </p>
      </div>
    </div>
  )
}

function EmptyState({ searchQuery, hasFilters }: { searchQuery: string; hasFilters: boolean }) {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="p-4 bg-secondary-100 dark:bg-secondary-800 rounded-full w-fit mx-auto mb-6">
          <Briefcase className="h-12 w-12 text-secondary-400" />
        </div>
        <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
          No experiences found
        </h3>
        <p className="text-secondary-600 dark:text-secondary-400 mb-4">
          {searchQuery || hasFilters 
            ? 'Try adjusting your search or filters to find what you\'re looking for.'
            : 'No work experience data is currently available.'
          }
        </p>
        {(searchQuery || hasFilters) && (
          <button
            onClick={() => {
              setSearchQuery('')
              setFilters({})
            }}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium underline"
          >
            Clear search and filters
          </button>
        )}
      </div>
    </div>
  )
}

function TimelineSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="text-center space-y-4">
        <div className="h-8 bg-secondary-200 dark:bg-secondary-700 rounded-lg w-64 mx-auto animate-pulse" />
        <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded-lg w-96 mx-auto animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700">
            <div className="h-12 w-12 bg-secondary-200 dark:bg-secondary-700 rounded-lg mb-3 animate-pulse" />
            <div className="h-6 bg-secondary-200 dark:bg-secondary-700 rounded mb-2 animate-pulse" />
            <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-20 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Filter skeleton */}
      <div className="space-y-4">
        <div className="h-12 bg-secondary-200 dark:bg-secondary-700 rounded-lg animate-pulse" />
      </div>

      {/* Timeline items skeleton */}
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="relative flex items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-secondary-200 dark:bg-secondary-700 rounded-full animate-pulse" />
            </div>
            <div className="ml-6 flex-1">
              <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 space-y-4">
                <div className="space-y-2">
                  <div className="h-6 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-2/3 animate-pulse" />
                </div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-6 bg-secondary-200 dark:bg-secondary-700 rounded w-16 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}