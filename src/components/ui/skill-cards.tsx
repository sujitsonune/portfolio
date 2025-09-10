'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Award, 
  Calendar, 
  TrendingUp, 
  Users, 
  ExternalLink,
  Star,
  Zap,
  CheckCircle,
  Clock,
  Target,
  BookOpen,
  Briefcase
} from 'lucide-react'
import type { Skill, SkillCategory } from '@/types'
import { cn } from '@/lib/utils'

interface SkillCardProps {
  skill: Skill
  variant?: 'default' | 'compact' | 'detailed' | 'minimal'
  interactive?: boolean
  showEndorsements?: boolean
  showCertifications?: boolean
  showProgression?: boolean
  className?: string
  onClick?: (skill: Skill) => void
}

const categoryGradients: Record<SkillCategory, string> = {
  'frontend': 'from-blue-500 to-cyan-500',
  'backend': 'from-green-500 to-emerald-500',
  'database': 'from-purple-500 to-violet-500',
  'mobile': 'from-pink-500 to-rose-500',
  'cloud': 'from-orange-500 to-amber-500',
  'devops': 'from-sky-500 to-blue-500',
  'design': 'from-red-500 to-pink-500',
  'testing': 'from-teal-500 to-green-500',
  'soft-skills': 'from-indigo-500 to-purple-500',
  'tools': 'from-gray-500 to-slate-500',
  'other': 'from-gray-400 to-gray-500'
}

const proficiencyColors = {
  beginner: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
  intermediate: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
  advanced: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  expert: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' }
}

export function SkillCard({
  skill,
  variant = 'default',
  interactive = true,
  showEndorsements = true,
  showCertifications = true,
  showProgression = false,
  className,
  onClick
}: SkillCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const proficiencyConfig = proficiencyColors[skill.proficiencyLevel]
  const gradient = categoryGradients[skill.category]

  const handleClick = () => {
    if (interactive && onClick) {
      onClick(skill)
    } else if (interactive && variant === 'detailed') {
      setIsFlipped(!isFlipped)
    }
  }

  if (variant === 'minimal') {
    return (
      <motion.div
        className={cn(
          'group cursor-pointer',
          className
        )}
        whileHover={{ scale: interactive ? 1.05 : 1 }}
        whileTap={{ scale: interactive ? 0.95 : 1 }}
        onClick={handleClick}
      >
        <div className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
          'bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700',
          'hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600'
        )}>
          <div className={cn(
            'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-semibold',
            gradient
          )}>
            {skill.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-secondary-900 dark:text-white truncate">
              {skill.name}
            </div>
            <div className="text-xs text-secondary-500 dark:text-secondary-400">
              {skill.proficiencyLevel} • {skill.yearsOfExperience}y
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-secondary-400">
            {skill.endorsements.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{skill.endorsements.length}</span>
              </div>
            )}
            {skill.certifications.some(cert => cert.isActive) && (
              <Award className="h-3 w-3 text-green-500" />
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'group cursor-pointer',
          className
        )}
        whileHover={{ y: interactive ? -2 : 0 }}
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className={cn(
          'p-4 rounded-xl border transition-all duration-300',
          'bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700',
          isHovered && 'shadow-lg border-primary-300 dark:border-primary-600'
        )}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shadow-md',
              gradient
            )}>
              {skill.name.charAt(0).toUpperCase()}
            </div>
            
            <div className={cn(
              'px-2 py-1 rounded-full text-xs font-medium border',
              proficiencyConfig.bg,
              proficiencyConfig.text,
              proficiencyConfig.border
            )}>
              {skill.proficiencyLevel}
            </div>
          </div>

          {/* Skill Name */}
          <h3 className="font-semibold text-secondary-900 dark:text-white mb-1 line-clamp-1">
            {skill.name}
          </h3>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-secondary-600 dark:text-secondary-400">Proficiency</span>
              <span className="font-medium text-secondary-900 dark:text-white">{skill.proficiencyScore}%</span>
            </div>
            <div className="h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
              <motion.div
                className={cn('h-full bg-gradient-to-r', gradient)}
                initial={{ width: 0 }}
                animate={{ width: `${skill.proficiencyScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-secondary-500 dark:text-secondary-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{skill.yearsOfExperience}y exp</span>
            </div>
            
            <div className="flex items-center gap-2">
              {showEndorsements && skill.endorsements.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{skill.endorsements.length}</span>
                </div>
              )}
              {showCertifications && skill.certifications.some(cert => cert.isActive) && (
                <Award className="h-3 w-3 text-green-500" />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        className={cn('perspective-1000', className)}
        whileHover={{ scale: interactive ? 1.02 : 1 }}
      >
        <motion.div
          className="relative w-full h-80 preserve-3d cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          onClick={handleClick}
        >
          {/* Front Side */}
          <div className="absolute inset-0 backface-hidden">
            <div className={cn(
              'w-full h-full p-6 rounded-2xl border shadow-lg transition-all duration-300',
              'bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-700',
              'hover:shadow-xl'
            )}>
              {/* Header with gradient */}
              <div className={cn(
                'relative p-4 rounded-xl mb-4 bg-gradient-to-br text-white overflow-hidden',
                gradient
              )}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold">
                      {skill.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {skill.category.replace('-', ' ')}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{skill.name}</h3>
                  <div className="text-sm opacity-90">
                    {skill.proficiencyLevel} • {skill.proficiencyScore}%
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8" />
              </div>

              {/* Progress Ring */}
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-secondary-200 dark:text-secondary-700"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#skillGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: skill.proficiencyScore / 100 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      style={{
                        strokeDasharray: '251.2',
                        strokeDashoffset: `${251.2 * (1 - skill.proficiencyScore / 100)}`
                      }}
                    />
                    <defs>
                      <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-secondary-900 dark:text-white">
                      {skill.proficiencyScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                  <div className="text-lg font-semibold text-secondary-900 dark:text-white">
                    {skill.yearsOfExperience}
                  </div>
                  <div className="text-xs text-secondary-600 dark:text-secondary-400">
                    Years Exp
                  </div>
                </div>
                <div className="text-center p-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                  <div className="text-lg font-semibold text-secondary-900 dark:text-white">
                    {skill.projects.length}
                  </div>
                  <div className="text-xs text-secondary-600 dark:text-secondary-400">
                    Projects
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {skill.endorsements.length > 0 && (
                  <div className="flex-1 flex items-center justify-center gap-1 p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-sm">
                    <Users className="h-4 w-4" />
                    <span>{skill.endorsements.length} endorsements</span>
                  </div>
                )}
                {skill.certifications.some(cert => cert.isActive) && (
                  <div className="flex-1 flex items-center justify-center gap-1 p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
                    <Award className="h-4 w-4" />
                    <span>Certified</span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-4 text-xs text-secondary-400">
                Click to flip
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className={cn(
              'w-full h-full p-6 rounded-2xl border shadow-lg',
              'bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-700'
            )}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-secondary-900 dark:text-white">
                  {skill.name}
                </h3>
                <button className="text-xs text-secondary-500 hover:text-secondary-700">
                  Flip back
                </button>
              </div>

              {/* Description */}
              {skill.description && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-3">
                    {skill.description}
                  </p>
                </div>
              )}

              {/* Recent Certifications */}
              {skill.certifications.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Certifications
                  </h4>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {skill.certifications.filter(cert => cert.isActive).slice(0, 2).map((cert, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-secondary-900 dark:text-white truncate">
                          {cert.name}
                        </span>
                        <span className="text-secondary-500 dark:text-secondary-400">
                          {cert.date.toDate().getFullYear()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Endorsements */}
              {skill.endorsements.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Recent Endorsements
                  </h4>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {skill.endorsements.slice(0, 2).map((endorsement, index) => (
                      <div key={index} className="text-xs">
                        <div className="font-medium text-secondary-900 dark:text-white">
                          {endorsement.endorserName}
                        </div>
                        <div className="text-secondary-500 dark:text-secondary-400">
                          {endorsement.endorserRole} • {endorsement.endorserCompany}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {skill.tags && skill.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Related
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {skill.tags.slice(0, 6).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      className={cn('group cursor-pointer', className)}
      whileHover={{ y: interactive ? -4 : 0 }}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className={cn(
        'relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden',
        'bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-700',
        isHovered && 'shadow-2xl border-primary-300 dark:border-primary-600'
      )}>
        {/* Background Gradient */}
        <div className={cn(
          'absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full transform translate-x-16 -translate-y-16',
          gradient
        )} />

        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className={cn(
            'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg',
            gradient
          )}>
            {skill.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex items-center gap-2">
            {showProgression && skill.progression && skill.progression.length > 1 && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Growing</span>
              </div>
            )}
            
            <div className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border',
              proficiencyConfig.bg,
              proficiencyConfig.text,
              proficiencyConfig.border
            )}>
              {skill.proficiencyLevel}
            </div>
          </div>
        </div>

        {/* Skill Name and Category */}
        <div className="mb-4 relative z-10">
          <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-1">
            {skill.name}
          </h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400 capitalize">
            {skill.category.replace('-', ' ')} • {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''} experience
          </p>
        </div>

        {/* Description */}
        {skill.description && (
          <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4 line-clamp-2 relative z-10">
            {skill.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mb-4 relative z-10">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-secondary-700 dark:text-secondary-300 font-medium">Proficiency</span>
            <span className="font-bold text-secondary-900 dark:text-white">{skill.proficiencyScore}%</span>
          </div>
          <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full bg-gradient-to-r rounded-full relative', gradient)}
              initial={{ width: 0 }}
              animate={{ width: `${skill.proficiencyScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </motion.div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4 relative z-10">
          <div className="text-center p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Briefcase className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div className="text-lg font-semibold text-secondary-900 dark:text-white">
              {skill.projects.length}
            </div>
            <div className="text-xs text-secondary-600 dark:text-secondary-400">
              Projects
            </div>
          </div>
          
          {showEndorsements && (
            <div className="text-center p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div className="text-lg font-semibold text-secondary-900 dark:text-white">
                {skill.endorsements.length}
              </div>
              <div className="text-xs text-secondary-600 dark:text-secondary-400">
                Endorsements
              </div>
            </div>
          )}
          
          {showCertifications && (
            <div className="text-center p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Award className={cn(
                  'h-4 w-4',
                  skill.certifications.some(cert => cert.isActive) 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-secondary-600 dark:text-secondary-400'
                )} />
              </div>
              <div className="text-lg font-semibold text-secondary-900 dark:text-white">
                {skill.certifications.filter(cert => cert.isActive).length}
              </div>
              <div className="text-xs text-secondary-600 dark:text-secondary-400">
                Certs
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {skill.tags && skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 relative z-10">
            {skill.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded-full"
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

        {/* Hover Indicator */}
        <AnimatePresence>
          {isHovered && interactive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 right-4 bg-primary-600 text-white p-2 rounded-full shadow-lg z-20"
            >
              <ExternalLink className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Skills Grid Component
interface SkillsGridProps {
  skills: Skill[]
  variant?: 'default' | 'compact' | 'detailed' | 'minimal'
  columns?: 1 | 2 | 3 | 4
  interactive?: boolean
  showEndorsements?: boolean
  showCertifications?: boolean
  showProgression?: boolean
  className?: string
  onSkillClick?: (skill: Skill) => void
}

export function SkillsGrid({
  skills,
  variant = 'default',
  columns = 3,
  interactive = true,
  showEndorsements = true,
  showCertifications = true,
  showProgression = false,
  className,
  onSkillClick
}: SkillsGridProps) {
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
        <div className="text-4xl mb-4">🎯</div>
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
        <motion.div
          key={skill.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <SkillCard
            skill={skill}
            variant={variant}
            interactive={interactive}
            showEndorsements={showEndorsements}
            showCertifications={showCertifications}
            showProgression={showProgression}
            onClick={onSkillClick}
          />
        </motion.div>
      ))}
    </div>
  )
}