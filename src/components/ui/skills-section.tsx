'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  Radar, 
  Cloud, 
  Grid3X3, 
  List, 
  TrendingUp,
  Filter,
  Download,
  Share2,
  Eye,
  Settings,
  RotateCcw
} from 'lucide-react'
import type { Skill, SkillFilter } from '@/types'
import { cn } from '@/lib/utils'

// Import all skill components
import { SkillRadarChart, SkillComparisonRadar } from './skill-radar-chart'
import { SkillsProgressGrid } from './skill-progress-bars'
import { SkillCloud, Interactive3DSkillCloud } from './skill-cloud'
import { SkillsGrid } from './skill-cards'
import { SkillFilters, useFilteredSkills } from './skill-filters'
import { SkillsProgressionComparison } from './skill-progression-timeline'
import { EndorsementStats } from './skill-endorsements'

type ViewMode = 'radar' | 'progress' | 'cloud' | 'cards' | 'timeline' | 'endorsements'

interface SkillsSectionProps {
  skills: Skill[]
  title?: string
  subtitle?: string
  className?: string
  defaultViewMode?: ViewMode
  showFilters?: boolean
  showStats?: boolean
  allowViewModeChange?: boolean
  allowExport?: boolean
}

export function SkillsSection({
  skills,
  title = "Skills & Expertise",
  subtitle = "A comprehensive overview of my technical and professional capabilities",
  className,
  defaultViewMode = 'cards',
  showFilters = true,
  showStats = true,
  allowViewModeChange = true,
  allowExport = false
}: SkillsSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode)
  const [filters, setFilters] = useState<SkillFilter>({
    categories: [],
    proficiencyLevels: [],
    minExperience: 0,
    maxExperience: 20,
    hasEndorsements: false,
    hasCertifications: false,
    recentlyUsed: false,
    searchTerm: ''
  })

  // Filter skills based on current filters
  const filteredSkills = useFilteredSkills(skills, filters)

  // Calculate statistics
  const stats = useMemo(() => {
    const visibleSkills = skills.filter(skill => skill.isVisible)
    
    return {
      totalSkills: visibleSkills.length,
      filteredSkills: filteredSkills.length,
      averageProficiency: visibleSkills.length > 0 
        ? Math.round(visibleSkills.reduce((sum, skill) => sum + skill.proficiencyScore, 0) / visibleSkills.length)
        : 0,
      totalEndorsements: visibleSkills.reduce((sum, skill) => sum + skill.endorsements.length, 0),
      totalCertifications: visibleSkills.reduce((sum, skill) => 
        sum + skill.certifications.filter(cert => cert.isActive).length, 0
      ),
      categoriesCount: new Set(visibleSkills.map(skill => skill.category)).size,
      expertSkills: visibleSkills.filter(skill => skill.proficiencyLevel === 'expert').length,
      advancedSkills: visibleSkills.filter(skill => skill.proficiencyLevel === 'advanced').length
    }
  }, [skills, filteredSkills])

  // View mode configurations
  const viewModes = [
    { key: 'radar' as ViewMode, label: 'Radar Chart', icon: Radar, description: 'Proficiency overview by category' },
    { key: 'progress' as ViewMode, label: 'Progress Bars', icon: BarChart3, description: 'Detailed skill progress' },
    { key: 'cloud' as ViewMode, label: 'Skill Cloud', icon: Cloud, description: 'Interactive word cloud' },
    { key: 'cards' as ViewMode, label: 'Skill Cards', icon: Grid3X3, description: 'Detailed skill cards' },
    { key: 'timeline' as ViewMode, label: 'Progression', icon: TrendingUp, description: 'Skills growth over time' },
    { key: 'endorsements' as ViewMode, label: 'Validation', icon: Eye, description: 'Endorsements & certifications' }
  ]

  const handleExport = () => {
    const exportData = {
      skills: filteredSkills.map(skill => ({
        name: skill.name,
        category: skill.category,
        proficiencyLevel: skill.proficiencyLevel,
        proficiencyScore: skill.proficiencyScore,
        yearsOfExperience: skill.yearsOfExperience,
        endorsements: skill.endorsements.length,
        certifications: skill.certifications.filter(cert => cert.isActive).length,
        projects: skill.projects.length
      })),
      summary: stats,
      filters: filters,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'skills-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetFilters = () => {
    setFilters({
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
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {title}
        </motion.h2>
        
        <motion.p 
          className="text-lg text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {subtitle}
        </motion.p>

        {/* Stats Overview */}
        {showStats && (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {stats.filteredSkills}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                Skills {filteredSkills.length !== stats.totalSkills && `(${stats.totalSkills} total)`}
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.averageProficiency}%
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                Avg Proficiency
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.expertSkills}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                Expert Level
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalCertifications}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                Certifications
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* View Mode Selector */}
        {allowViewModeChange && (
          <div className="flex flex-wrap gap-2">
            {viewModes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  viewMode === mode.key
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                )}
                title={mode.description}
              >
                <mode.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {allowExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-3 py-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <SkillFilters
          skills={skills}
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Radar Chart View */}
          {viewMode === 'radar' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkillRadarChart
                  skills={filteredSkills}
                  size="large"
                  animate={true}
                />
                <div className="space-y-4">
                  <div className="bg-white dark:bg-secondary-900 rounded-lg p-6 border border-secondary-200 dark:border-secondary-700">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                      Category Breakdown
                    </h3>
                    <div className="space-y-2">
                      {Array.from(new Set(filteredSkills.map(s => s.category))).map(category => {
                        const categorySkills = filteredSkills.filter(s => s.category === category)
                        const avgProficiency = Math.round(
                          categorySkills.reduce((sum, s) => sum + s.proficiencyScore, 0) / categorySkills.length
                        )
                        return (
                          <div key={category} className="flex justify-between items-center p-2 rounded-lg bg-secondary-50 dark:bg-secondary-800">
                            <span className="text-sm font-medium text-secondary-900 dark:text-white capitalize">
                              {category.replace('-', ' ')}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-secondary-600 dark:text-secondary-400">
                                {categorySkills.length} skills
                              </span>
                              <span className="text-sm font-semibold text-secondary-900 dark:text-white">
                                {avgProficiency}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bars View */}
          {viewMode === 'progress' && (
            <SkillsProgressGrid
              skills={filteredSkills}
              variant="default"
              columns={2}
              showDetails={true}
              animateOnView={true}
            />
          )}

          {/* Skill Cloud View */}
          {viewMode === 'cloud' && (
            <div className="space-y-6">
              <Interactive3DSkillCloud
                skills={filteredSkills}
                minFontSize={16}
                maxFontSize={36}
                colorByCategory={true}
                containerClassName="h-96"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from(new Set(filteredSkills.map(s => s.category))).slice(0, 3).map(category => (
                  <div key={category} className="bg-white dark:bg-secondary-900 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700">
                    <h4 className="font-semibold text-secondary-900 dark:text-white capitalize mb-2">
                      {category.replace('-', ' ')}
                    </h4>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      {filteredSkills.filter(s => s.category === category).length} skills
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cards View */}
          {viewMode === 'cards' && (
            <SkillsGrid
              skills={filteredSkills}
              variant="default"
              columns={3}
              interactive={true}
              showEndorsements={true}
              showCertifications={true}
              showProgression={true}
            />
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <SkillsProgressionComparison
              skills={filteredSkills}
              timeRange="all"
            />
          )}

          {/* Endorsements View */}
          {viewMode === 'endorsements' && (
            <EndorsementStats
              skills={filteredSkills}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredSkills.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
            No skills match your filters
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            Try adjusting your search criteria or clearing the filters
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Clear all filters
          </button>
        </motion.div>
      )}

      {/* Footer Stats */}
      {showStats && filteredSkills.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-secondary-600 dark:text-secondary-400"
        >
          Showing {filteredSkills.length} of {stats.totalSkills} skills
          {stats.totalEndorsements > 0 && (
            <span> • {stats.totalEndorsements} endorsements</span>
          )}
          {stats.totalCertifications > 0 && (
            <span> • {stats.totalCertifications} certifications</span>
          )}
        </motion.div>
      )}
    </div>
  )
}

// Specialized Skills Section variants for different use cases
export function CompactSkillsSection({ skills, className }: { skills: Skill[], className?: string }) {
  return (
    <SkillsSection
      skills={skills}
      title="Core Skills"
      subtitle="Key technical competencies"
      className={className}
      defaultViewMode="progress"
      showFilters={false}
      showStats={false}
      allowViewModeChange={false}
      allowExport={false}
    />
  )
}

export function InteractiveSkillsShowcase({ skills, className }: { skills: Skill[], className?: string }) {
  return (
    <SkillsSection
      skills={skills}
      title="Skills & Expertise"
      subtitle="Explore my technical capabilities through interactive visualizations"
      className={className}
      defaultViewMode="radar"
      showFilters={true}
      showStats={true}
      allowViewModeChange={true}
      allowExport={true}
    />
  )
}