'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Star, 
  Award, 
  Users, 
  Calendar,
  TrendingUp,
  RotateCcw
} from 'lucide-react'
import type { Skill, SkillCategory, SkillFilter, ProficiencyLevel } from '@/types'
import { cn } from '@/lib/utils'

interface SkillFiltersProps {
  skills: Skill[]
  filters: SkillFilter
  onFiltersChange: (filters: SkillFilter) => void
  className?: string
}

const categoryLabels: Record<SkillCategory, string> = {
  'frontend': 'Frontend',
  'backend': 'Backend',
  'database': 'Database',
  'mobile': 'Mobile',
  'cloud': 'Cloud',
  'devops': 'DevOps',
  'design': 'Design',
  'testing': 'Testing',
  'soft-skills': 'Soft Skills',
  'tools': 'Tools',
  'other': 'Other'
}

const proficiencyLabels: Record<ProficiencyLevel, string> = {
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced',
  'expert': 'Expert'
}

const categoryColors: Record<SkillCategory, string> = {
  'frontend': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  'backend': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  'database': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  'mobile': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
  'cloud': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  'devops': 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300',
  'design': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  'testing': 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300',
  'soft-skills': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
  'tools': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
  'other': 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300'
}

export function SkillFilters({ 
  skills, 
  filters, 
  onFiltersChange, 
  className 
}: SkillFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get available categories and proficiency levels from skills
  const availableCategories = Array.from(new Set(skills.map(skill => skill.category))).sort()
  const availableProficiencyLevels = Array.from(new Set(skills.map(skill => skill.proficiencyLevel))).sort()

  // Calculate filter counts
  const activeFilterCount = [
    filters.categories.length > 0 ? 1 : 0,
    filters.proficiencyLevels.length > 0 ? 1 : 0,
    filters.searchTerm.trim() !== '' ? 1 : 0,
    filters.hasEndorsements ? 1 : 0,
    filters.hasCertifications ? 1 : 0,
    filters.recentlyUsed ? 1 : 0,
    filters.minExperience > 0 || filters.maxExperience < 20 ? 1 : 0
  ].reduce((sum, count) => sum + count, 0)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value })
  }

  const handleCategoryToggle = (category: SkillCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    onFiltersChange({ ...filters, categories: newCategories })
  }

  const handleProficiencyToggle = (level: ProficiencyLevel) => {
    const newLevels = filters.proficiencyLevels.includes(level)
      ? filters.proficiencyLevels.filter(l => l !== level)
      : [...filters.proficiencyLevels, level]
    onFiltersChange({ ...filters, proficiencyLevels: newLevels })
  }

  const handleReset = () => {
    onFiltersChange({
      categories: [],
      proficiencyLevels: [],
      minExperience: 0,
      maxExperience: 20,
      hasEndorsements: false,
      hasCertifications: false,
      recentlyUsed: false,
      searchTerm: ''
    })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
        <input
          type="text"
          placeholder="Search skills..."
          value={filters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 dark:text-white placeholder-secondary-500"
        />
        {filters.searchTerm && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform',
            isExpanded && 'transform rotate-180'
          )} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              'px-3 py-1 text-xs rounded-md transition-colors',
              showAdvanced 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                : 'bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400'
            )}
          >
            Advanced
          </button>
          
          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-lg p-6 space-y-6">
              {/* Categories */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">
                  Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(category => {
                    const isSelected = filters.categories.includes(category)
                    const skillCount = skills.filter(skill => skill.category === category && skill.isVisible).length
                    
                    return (
                      <button
                        key={category}
                        onClick={() => handleCategoryToggle(category)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                          isSelected 
                            ? categoryColors[category]
                            : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-400 dark:hover:bg-secondary-700'
                        )}
                      >
                        <span>{categoryLabels[category]}</span>
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full',
                          isSelected 
                            ? 'bg-white/20'
                            : 'bg-secondary-200 dark:bg-secondary-700'
                        )}>
                          {skillCount}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Proficiency Levels */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">
                  Proficiency Level
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableProficiencyLevels.map(level => {
                    const isSelected = filters.proficiencyLevels.includes(level)
                    const skillCount = skills.filter(skill => skill.proficiencyLevel === level && skill.isVisible).length
                    
                    return (
                      <button
                        key={level}
                        onClick={() => handleProficiencyToggle(level)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                          isSelected
                            ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300'
                            : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-400 dark:hover:bg-secondary-700'
                        )}
                      >
                        <span>{proficiencyLabels[level]}</span>
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full',
                          isSelected 
                            ? 'bg-primary-200 dark:bg-primary-800'
                            : 'bg-secondary-200 dark:bg-secondary-700'
                        )}>
                          {skillCount}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">
                  Quick Filters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasEndorsements}
                      onChange={(e) => onFiltersChange({ ...filters, hasEndorsements: e.target.checked })}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <Users className="h-4 w-4 text-secondary-500" />
                    <span className="text-sm text-secondary-900 dark:text-white">
                      Has Endorsements
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasCertifications}
                      onChange={(e) => onFiltersChange({ ...filters, hasCertifications: e.target.checked })}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <Award className="h-4 w-4 text-secondary-500" />
                    <span className="text-sm text-secondary-900 dark:text-white">
                      Certified
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.recentlyUsed}
                      onChange={(e) => onFiltersChange({ ...filters, recentlyUsed: e.target.checked })}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <TrendingUp className="h-4 w-4 text-secondary-500" />
                    <span className="text-sm text-secondary-900 dark:text-white">
                      Recently Used
                    </span>
                  </label>
                </div>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-secondary-200 dark:border-secondary-700 pt-6"
                  >
                    <div className="space-y-6">
                      {/* Experience Range */}
                      <div>
                        <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Years of Experience
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="block text-xs text-secondary-600 dark:text-secondary-400 mb-1">
                                Minimum
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={filters.minExperience}
                                onChange={(e) => onFiltersChange({ 
                                  ...filters, 
                                  minExperience: parseInt(e.target.value) || 0 
                                })}
                                className="w-full px-3 py-2 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900 dark:text-white"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-secondary-600 dark:text-secondary-400 mb-1">
                                Maximum
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={filters.maxExperience}
                                onChange={(e) => onFiltersChange({ 
                                  ...filters, 
                                  maxExperience: parseInt(e.target.value) || 20 
                                })}
                                className="w-full px-3 py-2 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900 dark:text-white"
                              />
                            </div>
                          </div>
                          
                          {/* Experience range slider visualization */}
                          <div className="relative h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full">
                            <div 
                              className="absolute h-2 bg-primary-600 rounded-full"
                              style={{
                                left: `${(filters.minExperience / 20) * 100}%`,
                                width: `${((filters.maxExperience - filters.minExperience) / 20) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {/* Search term */}
          {filters.searchTerm && (
            <div className="flex items-center gap-1 bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300 px-2 py-1 rounded-full text-xs">
              <Search className="h-3 w-3" />
              <span>"{filters.searchTerm}"</span>
              <button
                onClick={() => handleSearchChange('')}
                className="ml-1 hover:text-primary-900 dark:hover:text-primary-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Selected categories */}
          {filters.categories.map(category => (
            <div
              key={category}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                categoryColors[category]
              )}
            >
              <span>{categoryLabels[category]}</span>
              <button
                onClick={() => handleCategoryToggle(category)}
                className="ml-1 hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Selected proficiency levels */}
          {filters.proficiencyLevels.map(level => (
            <div
              key={level}
              className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded-full text-xs"
            >
              <Star className="h-3 w-3" />
              <span>{proficiencyLabels[level]}</span>
              <button
                onClick={() => handleProficiencyToggle(level)}
                className="ml-1 hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Other active filters */}
          {filters.hasEndorsements && (
            <div className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-2 py-1 rounded-full text-xs">
              <Users className="h-3 w-3" />
              <span>Endorsed</span>
              <button
                onClick={() => onFiltersChange({ ...filters, hasEndorsements: false })}
                className="ml-1 hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {filters.hasCertifications && (
            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 px-2 py-1 rounded-full text-xs">
              <Award className="h-3 w-3" />
              <span>Certified</span>
              <button
                onClick={() => onFiltersChange({ ...filters, hasCertifications: false })}
                className="ml-1 hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {filters.recentlyUsed && (
            <div className="flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 px-2 py-1 rounded-full text-xs">
              <TrendingUp className="h-3 w-3" />
              <span>Recent</span>
              <button
                onClick={() => onFiltersChange({ ...filters, recentlyUsed: false })}
                className="ml-1 hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

// Hook to filter skills based on filters
export function useFilteredSkills(skills: Skill[], filters: SkillFilter) {
  return skills.filter(skill => {
    if (!skill.isVisible) return false

    // Search term
    if (filters.searchTerm.trim() !== '') {
      const searchTerm = filters.searchTerm.toLowerCase()
      const matchesName = skill.name.toLowerCase().includes(searchTerm)
      const matchesDescription = skill.description?.toLowerCase().includes(searchTerm)
      const matchesTags = skill.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      
      if (!matchesName && !matchesDescription && !matchesTags) {
        return false
      }
    }

    // Categories
    if (filters.categories.length > 0 && !filters.categories.includes(skill.category)) {
      return false
    }

    // Proficiency levels
    if (filters.proficiencyLevels.length > 0 && !filters.proficiencyLevels.includes(skill.proficiencyLevel)) {
      return false
    }

    // Experience range
    if (skill.yearsOfExperience < filters.minExperience || skill.yearsOfExperience > filters.maxExperience) {
      return false
    }

    // Endorsements
    if (filters.hasEndorsements && skill.endorsements.length === 0) {
      return false
    }

    // Certifications
    if (filters.hasCertifications && !skill.certifications.some(cert => cert.isActive)) {
      return false
    }

    // Recently used (within last 2 years)
    if (filters.recentlyUsed) {
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
      
      if (!skill.lastUsed || skill.lastUsed.toDate() < twoYearsAgo) {
        return false
      }
    }

    return true
  })
}