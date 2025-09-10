'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  X, 
  Grid3X3, 
  List, 
  Star, 
  Calendar,
  TrendingUp,
  Folder,
  Code2,
  Eye
} from 'lucide-react'
import { ProjectCard, ProjectCardSkeleton } from './project-card'
import { ProjectModal } from './project-modal'
import { TechnologyFilter, TechnologyGrid } from './technology-icons'
import type { Project } from '@/types'
import { useProjects } from '@/hooks/use-firestore'
import { cn } from '@/lib/utils'

interface ProjectsSection {
  className?: string
  variant?: 'grid' | 'masonry' | 'list'
  showFilters?: boolean
  showSearch?: boolean
  maxItems?: number
}

export function ProjectsSection({ 
  className,
  variant = 'masonry',
  showFilters = true,
  showSearch = true,
  maxItems
}: ProjectsSection) {
  const { data: projects, loading, error } = useProjects()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(variant === 'list' ? 'list' : 'grid')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (!projects) return []

    let result = projects.filter(project => project.isVisible)

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.longDescription?.toLowerCase().includes(query) ||
        project.technologies.some(tech => 
          tech.name.toLowerCase().includes(query)
        ) ||
        project.features?.some(feature => 
          feature.toLowerCase().includes(query)
        )
      )
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(project => project.category === selectedCategory)
    }

    // Technology filter
    if (selectedTechnologies.length > 0) {
      result = result.filter(project =>
        selectedTechnologies.some(tech =>
          project.technologies.some(projTech => 
            projTech.name.toLowerCase().includes(tech.toLowerCase())
          )
        )
      )
    }

    // Status filter
    if (selectedStatus) {
      result = result.filter(project => project.status === selectedStatus)
    }

    // Featured filter
    if (showFeaturedOnly) {
      result = result.filter(project => project.isFeatured)
    }

    // Sort by order then by date
    result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      if (a.order !== b.order) return a.order - b.order
      return b.timeline.startDate.toDate().getTime() - a.timeline.startDate.toDate().getTime()
    })

    return maxItems ? result.slice(0, maxItems) : result
  }, [projects, searchQuery, selectedCategory, selectedTechnologies, selectedStatus, showFeaturedOnly, maxItems])

  // Get filter options
  const filterOptions = useMemo(() => {
    if (!projects) return { categories: [], technologies: [], statuses: [] }

    const categories = [...new Set(projects.map(p => p.category))].sort()
    const technologies = [...new Set(projects.flatMap(p => p.technologies.map(t => t.name)))].sort()
    const statuses = [...new Set(projects.map(p => p.status))].sort()

    return { categories, technologies, statuses }
  }, [projects])

  // Stats
  const stats = useMemo(() => {
    if (!projects) return null

    return {
      total: projects.filter(p => p.isVisible).length,
      featured: projects.filter(p => p.isVisible && p.isFeatured).length,
      completed: projects.filter(p => p.isVisible && p.status === 'completed').length,
      inProgress: projects.filter(p => p.isVisible && p.status === 'in-progress').length
    }
  }, [projects])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedTechnologies([])
    setSelectedStatus('')
    setShowFeaturedOnly(false)
  }

  const toggleTechnology = (tech: string) => {
    setSelectedTechnologies(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    )
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedTechnologies.length > 0 || selectedStatus || showFeaturedOnly

  if (loading) {
    return <ProjectsSkeletonLoader />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 dark:text-red-400">
            Failed to load projects: {error}
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
            <Folder className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-white">
            Projects
          </h2>
        </div>
        <p className="text-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
          A showcase of my work, featuring web applications, mobile apps, and other creative projects.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className={cn(
          'grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-1000 delay-200',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        )}>
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 hover-lift">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Folder className="h-5 w-5" />
              <span className="font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 hover-lift">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
              <Star className="h-5 w-5" />
              <span className="font-medium">Featured</span>
            </div>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white">
              {stats.featured}
            </p>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 hover-lift">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white">
              {stats.completed}
            </p>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 hover-lift">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white">
              {stats.inProgress}
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      {(showSearch || showFilters) && (
        <div className={cn(
          'space-y-4 transition-all duration-1000 delay-300',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        )}>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            {showSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search projects, technologies, features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 dark:text-white placeholder-secondary-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {/* Filter toggle */}
            {showFilters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-3 bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-700 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg transition-colors',
                  hasActiveFilters && 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                )}
              >
                <Filter className="h-5 w-5" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {[searchQuery, selectedCategory, selectedStatus, showFeaturedOnly].filter(Boolean).length + selectedTechnologies.length}
                  </span>
                )}
              </button>
            )}

            {/* View mode toggle */}
            <div className="flex bg-secondary-100 dark:bg-secondary-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-secondary-600 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white'
                )}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-secondary-600 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white'
                )}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-secondary-600 dark:text-secondary-400">Active filters:</span>
              
              {selectedCategory && (
                <FilterTag label={selectedCategory} onRemove={() => setSelectedCategory('')} />
              )}
              
              {selectedStatus && (
                <FilterTag label={selectedStatus} onRemove={() => setSelectedStatus('')} />
              )}
              
              {showFeaturedOnly && (
                <FilterTag label="Featured" onRemove={() => setShowFeaturedOnly(false)} />
              )}
              
              {selectedTechnologies.map(tech => (
                <FilterTag key={tech} label={tech} onRemove={() => toggleTechnology(tech)} />
              ))}

              <button
                onClick={clearFilters}
                className="text-sm text-secondary-600 hover:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-200 underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-6 space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Category */}
                <div>
                  <h4 className="font-medium text-secondary-900 dark:text-white mb-3">Category</h4>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {filterOptions.categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <h4 className="font-medium text-secondary-900 dark:text-white mb-3">Status</h4>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  >
                    <option value="">All Status</option>
                    {filterOptions.statuses.map(status => (
                      <option key={status} value={status}>
                        {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Featured */}
                <div>
                  <h4 className="font-medium text-secondary-900 dark:text-white mb-3">Type</h4>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showFeaturedOnly}
                      onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">
                      Featured only
                    </span>
                  </label>
                </div>

                {/* Technologies */}
                <div>
                  <h4 className="font-medium text-secondary-900 dark:text-white mb-3">Technologies</h4>
                  <TechnologyFilter
                    technologies={filterOptions.technologies.slice(0, 12)}
                    selectedTechnologies={selectedTechnologies}
                    onTechnologyToggle={toggleTechnology}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      {filteredProjects.length !== (projects?.filter(p => p.isVisible).length || 0) && (
        <div className="text-center">
          <p className="text-secondary-600 dark:text-secondary-400">
            Showing {filteredProjects.length} of {projects?.filter(p => p.isVisible).length || 0} projects
          </p>
        </div>
      )}

      {/* Projects Grid */}
      <div className={cn(
        'transition-all duration-1000 delay-500',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      )}>
        {filteredProjects.length === 0 ? (
          <EmptyState searchQuery={searchQuery} hasFilters={hasActiveFilters} />
        ) : (
          <div className={cn(
            'grid gap-6',
            viewMode === 'list' 
              ? 'grid-cols-1' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
            variant === 'masonry' && viewMode === 'grid' && 'auto-rows-max'
          )}>
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                variant={viewMode === 'list' ? 'minimal' : 'default'}
                onViewDetails={setSelectedProject}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 rounded-md text-sm">
      {label}
      <button onClick={onRemove} className="hover:text-primary-900 dark:hover:text-primary-200">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

function EmptyState({ searchQuery, hasFilters }: { searchQuery: string; hasFilters: boolean }) {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="p-4 bg-secondary-100 dark:bg-secondary-800 rounded-full w-fit mx-auto mb-6">
          <Eye className="h-12 w-12 text-secondary-400" />
        </div>
        <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
          No projects found
        </h3>
        <p className="text-secondary-600 dark:text-secondary-400 mb-4">
          {searchQuery || hasFilters 
            ? 'Try adjusting your search or filters to find what you\'re looking for.'
            : 'No project data is currently available.'
          }
        </p>
      </div>
    </div>
  )
}

function ProjectsSkeletonLoader() {
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
            <div className="h-5 bg-secondary-200 dark:bg-secondary-700 rounded mb-2 animate-pulse" />
            <div className="h-8 bg-secondary-200 dark:bg-secondary-700 rounded w-16 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Search skeleton */}
      <div className="h-12 bg-secondary-200 dark:bg-secondary-700 rounded-lg animate-pulse" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}