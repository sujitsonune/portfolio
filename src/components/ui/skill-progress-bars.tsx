'use client'

import { useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Award, 
  Calendar, 
  TrendingUp, 
  Users, 
  CheckCircle,
  ExternalLink,
  Star,
  Zap
} from 'lucide-react'
import type { Skill, ProficiencyLevel } from '@/types'
import { cn } from '@/lib/utils'

interface SkillProgressBarProps {
  skill: Skill
  index?: number
  showDetails?: boolean
  animateOnView?: boolean
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

const proficiencyConfig = {
  beginner: { color: 'bg-red-500', percentage: 25, label: 'Beginner' },
  intermediate: { color: 'bg-yellow-500', percentage: 50, label: 'Intermediate' },
  advanced: { color: 'bg-blue-500', percentage: 75, label: 'Advanced' },
  expert: { color: 'bg-green-500', percentage: 90, label: 'Expert' }
}

export function SkillProgressBar({
  skill,
  index = 0,
  showDetails = true,
  animateOnView = true,
  variant = 'default',
  className
}: SkillProgressBarProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [isHovered, setIsHovered] = useState(false)
  
  const config = proficiencyConfig[skill.proficiencyLevel]
  const animatedPercentage = animateOnView ? (isInView ? skill.proficiencyScore : 0) : skill.proficiencyScore

  if (variant === 'compact') {
    return (
      <div 
        ref={ref}
        className={cn('group cursor-pointer', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-secondary-900 dark:text-white truncate">
            {skill.name}
          </span>
          <span className="text-xs text-secondary-500 dark:text-secondary-400">
            {skill.proficiencyScore}%
          </span>
        </div>
        
        <div className="relative h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', config.color)}
            initial={{ width: 0 }}
            animate={{ width: `${animatedPercentage}%` }}
            transition={{ 
              duration: 1, 
              delay: animateOnView ? index * 0.1 : 0,
              ease: "easeOut" 
            }}
          />
          
          {/* Shine effect */}
          <motion.div
            className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={isHovered ? { x: '100%' } : { x: '-100%' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={cn(
          'bg-white dark:bg-secondary-800 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 hover:shadow-lg transition-all duration-300',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-lg',
              config.color
            )}>
              {skill.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-white">
                {skill.name}
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {config.label} • {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {skill.endorsements.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
                <Users className="h-3 w-3" />
                <span>{skill.endorsements.length}</span>
              </div>
            )}
            {skill.certifications.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Award className="h-3 w-3" />
                <span>{skill.certifications.filter(cert => cert.isActive).length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {skill.description && (
          <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4 line-clamp-2">
            {skill.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Proficiency
            </span>
            <span className="text-sm font-semibold text-secondary-900 dark:text-white">
              {skill.proficiencyScore}%
            </span>
          </div>
          
          <div className="relative h-3 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full relative', config.color)}
              initial={{ width: 0 }}
              animate={{ width: `${animatedPercentage}%` }}
              transition={{ 
                duration: 1.2, 
                delay: animateOnView ? index * 0.15 : 0,
                ease: "easeOut" 
              }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full" />
            </motion.div>
            
            {/* Animated shine */}
            <motion.div
              className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
              initial={{ x: '-100%' }}
              animate={isHovered ? { x: '100%' } : { x: '-100%' }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Tags */}
        {skill.tags && skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {skill.tags.slice(0, 3).map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="px-2 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {skill.tags.length > 3 && (
              <span className="px-2 py-1 text-secondary-500 text-xs">
                +{skill.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between text-xs text-secondary-500 dark:text-secondary-400">
          <div className="flex items-center gap-4">
            {skill.projects.length > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>{skill.projects.length} project{skill.projects.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            {skill.lastUsed && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Last used: {skill.lastUsed.toDate().getFullYear()}</span>
              </div>
            )}
          </div>
          
          {skill.progression && skill.progression.length > 1 && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3" />
              <span>Growing</span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn('group cursor-pointer', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Skill Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-secondary-900 dark:text-white">
            {skill.name}
          </span>
          {skill.certifications.some(cert => cert.isActive) && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
          {showDetails && (
            <>
              <span>{skill.proficiencyScore}%</span>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                config.color.replace('bg-', 'bg-opacity-20 bg-'),
                config.color.replace('bg-', 'text-').replace('-500', '-700'),
                'dark:' + config.color.replace('bg-', 'text-').replace('-500', '-400')
              )}>
                {config.label}
              </span>
            </>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-3 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden mb-2">
        <motion.div
          className={cn(
            'h-full rounded-full relative overflow-hidden',
            config.color
          )}
          initial={{ width: 0 }}
          animate={{ width: `${animatedPercentage}%` }}
          transition={{ 
            duration: 1, 
            delay: animateOnView ? index * 0.1 : 0,
            ease: "easeOut" 
          }}
        >
          {/* Inner gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0" />
        </motion.div>
        
        {/* Animated shine effect */}
        <motion.div
          className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
          initial={{ x: '-2rem' }}
          animate={isHovered ? { x: '100%' } : { x: '-2rem' }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </div>

      {/* Details */}
      {showDetails && (
        <motion.div 
          className="flex items-center justify-between text-xs text-secondary-500 dark:text-secondary-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span>{skill.yearsOfExperience} years experience</span>
          
          <div className="flex items-center gap-2">
            {skill.endorsements.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{skill.endorsements.length}</span>
              </div>
            )}
            {skill.projects.length > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>{skill.projects.length}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Skills Progress Grid Component
interface SkillsProgressGridProps {
  skills: Skill[]
  variant?: 'default' | 'compact' | 'detailed'
  columns?: 1 | 2 | 3 | 4
  showDetails?: boolean
  animateOnView?: boolean
  className?: string
}

export function SkillsProgressGrid({
  skills,
  variant = 'default',
  columns = 2,
  showDetails = true,
  animateOnView = true,
  className
}: SkillsProgressGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  const visibleSkills = skills.filter(skill => skill.isVisible)
  
  if (visibleSkills.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-secondary-600 dark:text-secondary-400">
          No skills to display
        </p>
      </div>
    )
  }

  return (
    <div className={cn(
      'grid gap-6',
      gridClasses[columns],
      className
    )}>
      {visibleSkills.map((skill, index) => (
        <SkillProgressBar
          key={skill.id}
          skill={skill}
          index={index}
          variant={variant}
          showDetails={showDetails}
          animateOnView={animateOnView}
        />
      ))}
    </div>
  )
}

// Skill Level Distribution Chart
interface SkillLevelDistributionProps {
  skills: Skill[]
  className?: string
}

export function SkillLevelDistribution({ skills, className }: SkillLevelDistributionProps) {
  const distribution = skills.reduce((acc, skill) => {
    if (skill.isVisible) {
      acc[skill.proficiencyLevel] = (acc[skill.proficiencyLevel] || 0) + 1
    }
    return acc
  }, {} as Record<ProficiencyLevel, number>)

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0)

  if (total === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-secondary-500 dark:text-secondary-400">No data available</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h4 className="font-semibold text-secondary-900 dark:text-white">
        Skill Level Distribution
      </h4>
      
      {Object.entries(proficiencyConfig).map(([level, config]) => {
        const count = distribution[level as ProficiencyLevel] || 0
        const percentage = (count / total) * 100

        return (
          <div key={level} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-secondary-700 dark:text-secondary-300">
                {config.label}
              </span>
              <span className="text-secondary-600 dark:text-secondary-400">
                {count} skills ({Math.round(percentage)}%)
              </span>
            </div>
            
            <div className="h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', config.color)}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}