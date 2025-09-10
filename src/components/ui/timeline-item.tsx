'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown, MapPin, Calendar, Building, Award, Target, ChevronRight, ExternalLink } from 'lucide-react'
import type { WorkExperience } from '@/types'
import { formatDateRange, calculateDuration, getCompanyColor } from '@/lib/experience-utils'
import { cn } from '@/lib/utils'

interface TimelineItemProps {
  experience: WorkExperience
  index: number
  isLast?: boolean
  variant?: 'timeline' | 'card'
  className?: string
}

export function TimelineItem({ 
  experience, 
  index, 
  isLast = false, 
  variant = 'timeline',
  className 
}: TimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const itemRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const companyColor = getCompanyColor(experience.company)
  const startDate = experience.duration.startDate.toDate()
  const endDate = experience.duration.endDate?.toDate()
  const dateRange = formatDateRange(startDate, endDate, experience.duration.isCurrent)
  const duration = calculateDuration(startDate, endDate, experience.duration.isCurrent)

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100)
        }
      },
      { threshold: 0.2 }
    )

    if (itemRef.current) {
      observer.observe(itemRef.current)
    }

    return () => observer.disconnect()
  }, [index])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  if (variant === 'card') {
    return (
      <div
        ref={itemRef}
        className={cn(
          'bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 hover-lift transition-all duration-500',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          className
        )}
        style={{ transitionDelay: `${index * 100}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ExperienceCard 
          experience={experience}
          companyColor={companyColor}
          dateRange={dateRange}
          duration={duration}
          isExpanded={isExpanded}
          isHovered={isHovered}
          onToggleExpanded={toggleExpanded}
          contentRef={contentRef}
        />
      </div>
    )
  }

  return (
    <div
      ref={itemRef}
      className={cn(
        'relative transition-all duration-700',
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0',
        className
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-6 top-16 w-0.5 h-full bg-gradient-to-b from-secondary-300 via-secondary-200 to-transparent dark:from-secondary-600 dark:via-secondary-700 dark:to-transparent" />
      )}

      {/* Timeline Dot */}
      <div className="relative flex items-start">
        <div className="flex-shrink-0 relative">
          <div
            className={cn(
              'w-12 h-12 rounded-full border-4 border-white dark:border-secondary-900 flex items-center justify-center transition-all duration-300 shadow-lg',
              isHovered ? 'scale-110 shadow-xl' : 'scale-100'
            )}
            style={{ backgroundColor: companyColor }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {experience.companyLogo ? (
              <Image
                src={experience.companyLogo}
                alt={`${experience.company} logo`}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <Building className="h-6 w-6 text-white" />
            )}
          </div>
          
          {/* Pulse animation for current job */}
          {experience.duration.isCurrent && (
            <div 
              className="absolute inset-0 rounded-full animate-ping"
              style={{ backgroundColor: `${companyColor}40` }}
            />
          )}
        </div>

        {/* Content */}
        <div className="ml-6 flex-1 pb-12">
          <ExperienceCard 
            experience={experience}
            companyColor={companyColor}
            dateRange={dateRange}
            duration={duration}
            isExpanded={isExpanded}
            isHovered={isHovered}
            onToggleExpanded={toggleExpanded}
            contentRef={contentRef}
          />
        </div>
      </div>
    </div>
  )
}

interface ExperienceCardProps {
  experience: WorkExperience
  companyColor: string
  dateRange: string
  duration: string
  isExpanded: boolean
  isHovered: boolean
  onToggleExpanded: () => void
  contentRef: React.RefObject<HTMLDivElement>
}

function ExperienceCard({
  experience,
  companyColor,
  dateRange,
  duration,
  isExpanded,
  isHovered,
  onToggleExpanded,
  contentRef
}: ExperienceCardProps) {
  return (
    <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
      {/* Header */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {experience.role}
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
              <div 
                className="flex items-center gap-2 text-lg font-semibold"
                style={{ color: companyColor }}
              >
                <Building className="h-4 w-4" />
                {experience.company}
              </div>
              
              {experience.companyWebsite && (
                <a
                  href={experience.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Current Badge */}
          {experience.duration.isCurrent && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Current
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{dateRange}</span>
            <span className="text-secondary-400 dark:text-secondary-500">•</span>
            <span className="font-medium">{duration}</span>
          </div>
          
          {(experience.location.city || experience.location.country) && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>
                {experience.location.remote ? 'Remote' : 
                  `${experience.location.city || ''}, ${experience.location.country || ''}`.trim().replace(/^,\s*/, '')
                }
              </span>
            </div>
          )}
          
          <div className="capitalize px-2 py-1 bg-secondary-100 dark:bg-secondary-700 rounded-md text-xs">
            {experience.employmentType.replace('-', ' ')}
          </div>
        </div>
      </div>

      {/* Technology Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {experience.technologies.slice(0, isExpanded ? undefined : 6).map((tech, index) => (
          <span
            key={tech}
            className={cn(
              'px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-md transition-all duration-300',
              isHovered && 'hover:bg-primary-100 dark:hover:bg-primary-900/40 transform hover:scale-105'
            )}
            style={{ 
              transitionDelay: `${index * 50}ms`,
              animation: isVisible ? `fadeInUp 0.5s ease-out ${index * 50}ms both` : undefined
            }}
          >
            {tech}
          </span>
        ))}
        
        {!isExpanded && experience.technologies.length > 6 && (
          <button
            onClick={onToggleExpanded}
            className="px-2 py-1 text-xs text-secondary-500 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400 font-medium"
          >
            +{experience.technologies.length - 6} more
          </button>
        )}
      </div>

      {/* Expandable Content */}
      <div
        ref={contentRef}
        className={cn(
          'overflow-hidden transition-all duration-500 ease-in-out',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700 space-y-6">
          {/* Responsibilities */}
          {experience.responsibilities.length > 0 && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-secondary-900 dark:text-white">
                <Target className="h-5 w-5 text-blue-600" />
                Key Responsibilities
              </h4>
              <ul className="space-y-2">
                {experience.responsibilities.map((responsibility, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-3 text-secondary-700 dark:text-secondary-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ChevronRight className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Achievements */}
          {experience.achievements.length > 0 && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-secondary-900 dark:text-white">
                <Award className="h-5 w-5 text-yellow-600" />
                Key Achievements
              </h4>
              <ul className="space-y-2">
                {experience.achievements.map((achievement, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-3 text-secondary-700 dark:text-secondary-300 animate-fade-in-up"
                    style={{ animationDelay: `${(experience.responsibilities.length + index) * 100}ms` }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: companyColor }}
                    />
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={onToggleExpanded}
        className={cn(
          'flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300',
          'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300',
          'hover:bg-primary-50 dark:hover:bg-primary-900/20',
          'border border-primary-200 dark:border-primary-800 hover:border-primary-300 dark:hover:border-primary-700'
        )}
      >
        <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
        <ChevronDown 
          className={cn(
            'h-4 w-4 transition-transform duration-300',
            isExpanded ? 'rotate-180' : 'rotate-0'
          )} 
        />
      </button>
    </div>
  )
}

// Add CSS animation keyframes
const fadeInUpKeyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = fadeInUpKeyframes
  document.head.appendChild(styleElement)
}