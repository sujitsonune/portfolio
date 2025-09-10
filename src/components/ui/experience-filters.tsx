'use client'

import { useState } from 'react'
import { Search, Filter, X, Download, Calendar, Building, Code } from 'lucide-react'
import type { WorkExperience } from '@/types'
import type { ExperienceFilters, ExportOptions } from '@/lib/experience-utils'
import { exportExperience, getFilterOptions } from '@/lib/experience-utils'
import { cn } from '@/lib/utils'

interface ExperienceFiltersProps {
  experiences: WorkExperience[]
  filters: Partial<ExperienceFilters>
  onFiltersChange: (filters: Partial<ExperienceFilters>) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  className?: string
}

export function ExperienceFilters({
  experiences,
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  className,
}: ExperienceFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  
  const filterOptions = getFilterOptions(experiences)
  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value != null
  )

  const clearFilters = () => {
    onFiltersChange({})
    onSearchChange('')
  }

  const toggleFilter = (type: keyof ExperienceFilters, value: string) => {
    const currentValues = filters[type] as string[] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    onFiltersChange({ ...filters, [type]: newValues })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search experiences, roles, technologies..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 dark:text-white placeholder-secondary-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
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
              {Object.values(filters).flat().length}
            </span>
          )}
        </button>

        {/* Export Button */}
        <button
          onClick={() => setShowExportModal(true)}
          className="inline-flex items-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-secondary-600 dark:text-secondary-400">Active filters:</span>
          
          {filters.companies?.map(company => (
            <FilterTag
              key={company}
              label={company}
              icon={Building}
              onRemove={() => toggleFilter('companies', company)}
            />
          ))}
          
          {filters.technologies?.map(tech => (
            <FilterTag
              key={tech}
              label={tech}
              icon={Code}
              onRemove={() => toggleFilter('technologies', tech)}
            />
          ))}
          
          {filters.employmentTypes?.map(type => (
            <FilterTag
              key={type}
              label={type}
              icon={Calendar}
              onRemove={() => toggleFilter('employmentTypes', type)}
            />
          ))}

          <button
            onClick={clearFilters}
            className="text-sm text-secondary-600 hover:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-200 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-6 space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Companies */}
            <div>
              <h4 className="flex items-center gap-2 font-medium text-secondary-900 dark:text-white mb-3">
                <Building className="h-4 w-4" />
                Companies
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                {filterOptions.companies.map(company => (
                  <label key={company} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.companies?.includes(company) || false}
                      onChange={() => toggleFilter('companies', company)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">
                      {company}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div>
              <h4 className="flex items-center gap-2 font-medium text-secondary-900 dark:text-white mb-3">
                <Code className="h-4 w-4" />
                Technologies
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                {filterOptions.technologies.slice(0, 10).map(tech => (
                  <label key={tech} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.technologies?.includes(tech) || false}
                      onChange={() => toggleFilter('technologies', tech)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">
                      {tech}
                    </span>
                  </label>
                ))}
                {filterOptions.technologies.length > 10 && (
                  <p className="text-xs text-secondary-500">
                    +{filterOptions.technologies.length - 10} more technologies
                  </p>
                )}
              </div>
            </div>

            {/* Employment Types */}
            <div>
              <h4 className="flex items-center gap-2 font-medium text-secondary-900 dark:text-white mb-3">
                <Calendar className="h-4 w-4" />
                Employment Type
              </h4>
              <div className="space-y-2">
                {filterOptions.employmentTypes.map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.employmentTypes?.includes(type) || false}
                      onChange={() => toggleFilter('employmentTypes', type)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300 capitalize">
                      {type.replace('-', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          experiences={experiences}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  )
}

function FilterTag({ 
  label, 
  icon: Icon, 
  onRemove 
}: { 
  label: string
  icon: React.ComponentType<{ className?: string }>
  onRemove: () => void 
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 rounded-md text-sm">
      <Icon className="h-3 w-3" />
      {label}
      <button
        onClick={onRemove}
        className="hover:text-primary-900 dark:hover:text-primary-200"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

function ExportModal({ 
  experiences, 
  onClose 
}: { 
  experiences: WorkExperience[]
  onClose: () => void 
}) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeDetails: true,
    includeAchievements: true,
    includeTechnologies: true,
    experiences
  })

  const handleExport = () => {
    try {
      exportExperience(exportOptions)
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-md animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
            Export Experience
          </h3>
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Export Format
            </label>
            <select
              value={exportOptions.format}
              onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
              className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="markdown">Markdown</option>
              <option value="pdf">HTML (PDF Ready)</option>
            </select>
          </div>

          {/* Include Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Include
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={exportOptions.includeDetails}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeDetails: e.target.checked }))}
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-secondary-700 dark:text-secondary-300">
                Job responsibilities
              </span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={exportOptions.includeAchievements}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeAchievements: e.target.checked }))}
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-secondary-700 dark:text-secondary-300">
                Key achievements
              </span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={exportOptions.includeTechnologies}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeTechnologies: e.target.checked }))}
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-secondary-700 dark:text-secondary-300">
                Technologies used
              </span>
            </label>
          </div>

          {/* Export Info */}
          <div className="bg-secondary-50 dark:bg-secondary-700 p-3 rounded-md">
            <p className="text-sm text-secondary-600 dark:text-secondary-300">
              Exporting {experiences.length} experience{experiences.length !== 1 ? 's' : ''} 
              as {exportOptions.format.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-secondary-700 dark:text-secondary-300 border border-secondary-300 dark:border-secondary-600 rounded-md hover:bg-secondary-50 dark:hover:bg-secondary-700"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  )
}