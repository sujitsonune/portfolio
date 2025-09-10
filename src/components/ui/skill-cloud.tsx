'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import type { Skill, SkillCategory, SkillCloudItem } from '@/types'
import { cn } from '@/lib/utils'

interface SkillCloudProps {
  skills: Skill[]
  width?: number
  height?: number
  minFontSize?: number
  maxFontSize?: number
  padding?: number
  interactive?: boolean
  colorByCategory?: boolean
  className?: string
  onSkillClick?: (skill: Skill) => void
  onSkillHover?: (skill: Skill | null) => void
}

// Category colors for skill cloud
const categoryColors: Record<SkillCategory, string> = {
  'frontend': '#3b82f6',
  'backend': '#22c55e', 
  'database': '#a855f7',
  'mobile': '#ec4899',
  'cloud': '#f59e0b',
  'devops': '#0ea5e9',
  'design': '#f43f5e',
  'testing': '#10b981',
  'soft-skills': '#8b5cf6',
  'tools': '#6b7280',
  'other': '#9ca3af'
}

// Predefined color palette for non-category coloring
const skillColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
]

export function SkillCloud({
  skills,
  width = 600,
  height = 400,
  minFontSize = 14,
  maxFontSize = 36,
  padding = 4,
  interactive = true,
  colorByCategory = true,
  className,
  onSkillClick,
  onSkillHover
}: SkillCloudProps) {
  const [cloudItems, setCloudItems] = useState<SkillCloudItem[]>([])
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true })

  // Calculate positions using a simple spiral algorithm
  const calculatePositions = useCallback(() => {
    const visibleSkills = skills.filter(skill => skill.isVisible)
    if (visibleSkills.length === 0) return []

    // Sort skills by proficiency score for better positioning
    const sortedSkills = [...visibleSkills].sort((a, b) => b.proficiencyScore - a.proficiencyScore)
    
    // Calculate font sizes based on proficiency scores
    const maxScore = Math.max(...sortedSkills.map(s => s.proficiencyScore))
    const minScore = Math.min(...sortedSkills.map(s => s.proficiencyScore))
    const scoreRange = maxScore - minScore || 1

    const items: SkillCloudItem[] = []
    const positions: Array<{ x: number; y: number; width: number; height: number }> = []

    sortedSkills.forEach((skill, index) => {
      // Calculate font size based on proficiency
      const normalizedScore = (skill.proficiencyScore - minScore) / scoreRange
      const fontSize = minFontSize + (maxFontSize - minFontSize) * normalizedScore
      
      // Estimate text dimensions (rough approximation)
      const textWidth = skill.name.length * fontSize * 0.6
      const textHeight = fontSize * 1.2
      
      // Get color
      const color = colorByCategory 
        ? categoryColors[skill.category] 
        : skillColors[index % skillColors.length]

      let x = width / 2
      let y = height / 2
      let placed = false
      let attempts = 0
      const maxAttempts = 1000

      // Try to place the item without overlapping
      while (!placed && attempts < maxAttempts) {
        // Use spiral pattern for placement
        const angle = attempts * 0.3
        const radius = Math.sqrt(attempts) * 8
        x = width / 2 + radius * Math.cos(angle) - textWidth / 2
        y = height / 2 + radius * Math.sin(angle) - textHeight / 2

        // Check bounds
        if (x < padding || x + textWidth > width - padding || 
            y < padding || y + textHeight > height - padding) {
          attempts++
          continue
        }

        // Check for overlaps with existing positions
        const newRect = { x, y, width: textWidth + padding * 2, height: textHeight + padding * 2 }
        const overlaps = positions.some(pos => 
          newRect.x < pos.x + pos.width &&
          newRect.x + newRect.width > pos.x &&
          newRect.y < pos.y + pos.height &&
          newRect.y + newRect.height > pos.y
        )

        if (!overlaps) {
          placed = true
          positions.push(newRect)
        }

        attempts++
      }

      // If we couldn't place it properly, use a fallback position
      if (!placed) {
        const fallbackCol = index % Math.floor(width / (maxFontSize + padding * 2))
        const fallbackRow = Math.floor(index / Math.floor(width / (maxFontSize + padding * 2)))
        x = fallbackCol * (maxFontSize + padding * 2) + padding
        y = fallbackRow * (maxFontSize + padding * 2) + padding
      }

      items.push({
        skill,
        size: fontSize,
        x: Math.max(padding, Math.min(x, width - textWidth - padding)),
        y: Math.max(padding, Math.min(y, height - textHeight - padding)),
        color,
        fontSize: `${fontSize}px`
      })
    })

    return items
  }, [skills, width, height, minFontSize, maxFontSize, padding, colorByCategory])

  // Regenerate cloud when skills change
  useEffect(() => {
    if (isInView) {
      setIsAnimating(true)
      const items = calculatePositions()
      setCloudItems(items)
      
      // Delay animation completion
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }, [calculatePositions, isInView])

  const handleSkillClick = (skill: Skill) => {
    if (interactive && onSkillClick) {
      onSkillClick(skill)
    }
  }

  const handleSkillHover = (skill: Skill | null) => {
    if (interactive) {
      setHoveredSkill(skill)
      onSkillHover?.(skill)
    }
  }

  if (cloudItems.length === 0) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          'flex items-center justify-center bg-secondary-50 dark:bg-secondary-800 rounded-lg border-2 border-dashed border-secondary-200 dark:border-secondary-600',
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">☁️</div>
          <p className="text-secondary-600 dark:text-secondary-400 text-sm">
            No skills to display
          </p>
          <p className="text-secondary-500 dark:text-secondary-500 text-xs mt-1">
            Add skills to see word cloud
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden',
        className
      )}
      style={{ width, height }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <svg width="100%" height="100%">
          <pattern id="skill-cloud-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#skill-cloud-pattern)" />
        </svg>
      </div>

      {/* Skills */}
      <svg width={width} height={height} className="relative z-10">
        {cloudItems.map((item, index) => (
          <motion.text
            key={item.skill.id}
            x={item.x}
            y={item.y}
            fontSize={item.fontSize}
            fill={item.color}
            className={cn(
              'cursor-pointer select-none font-medium transition-all duration-200',
              interactive && 'hover:opacity-80',
              hoveredSkill?.id === item.skill.id && 'drop-shadow-lg'
            )}
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{
              duration: 0.6,
              delay: index * 0.05,
              ease: "easeOut"
            }}
            whileHover={interactive ? { 
              scale: 1.1,
              transition: { duration: 0.2 }
            } : {}}
            onClick={() => handleSkillClick(item.skill)}
            onMouseEnter={() => handleSkillHover(item.skill)}
            onMouseLeave={() => handleSkillHover(null)}
          >
            {item.skill.name}
          </motion.text>
        ))}
      </svg>

      {/* Hover tooltip */}
      {hoveredSkill && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm max-w-xs z-20 pointer-events-none"
        >
          <div className="font-medium">{hoveredSkill.name}</div>
          <div className="text-xs opacity-90">
            {hoveredSkill.proficiencyLevel} • {hoveredSkill.proficiencyScore}%
          </div>
          {hoveredSkill.yearsOfExperience > 0 && (
            <div className="text-xs opacity-75">
              {hoveredSkill.yearsOfExperience} year{hoveredSkill.yearsOfExperience !== 1 ? 's' : ''} experience
            </div>
          )}
        </motion.div>
      )}

      {/* Loading overlay */}
      {isAnimating && (
        <div className="absolute inset-0 bg-white/50 dark:bg-secondary-900/50 flex items-center justify-center z-30">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
        </div>
      )}
    </div>
  )
}

// Interactive 3D-style skill cloud
interface Interactive3DSkillCloudProps extends Omit<SkillCloudProps, 'width' | 'height'> {
  containerClassName?: string
}

export function Interactive3DSkillCloud({
  skills,
  minFontSize = 16,
  maxFontSize = 32,
  colorByCategory = true,
  className,
  containerClassName,
  onSkillClick,
  onSkillHover
}: Interactive3DSkillCloudProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width: width || 600, height: height || 400 })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setMousePosition({
        x: (event.clientX - rect.left) / rect.width - 0.5,
        y: (event.clientY - rect.top) / rect.height - 0.5
      })
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn('w-full aspect-[3/2] relative', containerClassName)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
    >
      <motion.div
        className="w-full h-full"
        animate={{
          rotateY: mousePosition.x * 10,
          rotateX: -mousePosition.y * 10,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
        style={{
          perspective: 1000,
          transformStyle: 'preserve-3d'
        }}
      >
        <SkillCloud
          skills={skills}
          width={dimensions.width}
          height={dimensions.height}
          minFontSize={minFontSize}
          maxFontSize={maxFontSize}
          colorByCategory={colorByCategory}
          className={className}
          onSkillClick={onSkillClick}
          onSkillHover={onSkillHover}
        />
      </motion.div>
    </div>
  )
}

// Animated typing skill cloud
interface TypingSkillCloudProps {
  skills: Skill[]
  typingSpeed?: number
  className?: string
}

export function TypingSkillCloud({
  skills,
  typingSpeed = 100,
  className
}: TypingSkillCloudProps) {
  const [displayedSkills, setDisplayedSkills] = useState<Skill[]>([])
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  
  const visibleSkills = skills.filter(skill => skill.isVisible)

  useEffect(() => {
    if (!isTyping || currentSkillIndex >= visibleSkills.length) return

    const currentSkill = visibleSkills[currentSkillIndex]
    const interval = setInterval(() => {
      if (currentCharIndex < currentSkill.name.length) {
        setCurrentCharIndex(prev => prev + 1)
      } else {
        // Move to next skill
        setDisplayedSkills(prev => [...prev, currentSkill])
        setCurrentSkillIndex(prev => prev + 1)
        setCurrentCharIndex(0)
        
        // Check if we're done
        if (currentSkillIndex >= visibleSkills.length - 1) {
          setIsTyping(false)
        }
      }
    }, typingSpeed)

    return () => clearInterval(interval)
  }, [currentSkillIndex, currentCharIndex, isTyping, visibleSkills, typingSpeed])

  return (
    <div className={cn('font-mono text-center space-y-2', className)}>
      {displayedSkills.map((skill, index) => (
        <motion.span
          key={skill.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-block mx-2 px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded text-sm"
        >
          {skill.name}
        </motion.span>
      ))}
      
      {/* Currently typing skill */}
      {isTyping && currentSkillIndex < visibleSkills.length && (
        <span className="inline-block mx-2 px-2 py-1 bg-primary-200 dark:bg-primary-800/20 text-primary-800 dark:text-primary-200 rounded text-sm">
          {visibleSkills[currentSkillIndex].name.substring(0, currentCharIndex)}
          <span className="animate-pulse">|</span>
        </span>
      )}
    </div>
  )
}