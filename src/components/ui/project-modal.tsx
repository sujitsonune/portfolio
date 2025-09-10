'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  ExternalLink, 
  Github, 
  Calendar, 
  Users, 
  Target,
  Lightbulb,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Linkedin
} from 'lucide-react'
import type { Project } from '@/types'
import { ImageCarousel } from './image-carousel'
import { TechnologyGrid } from './technology-icons'
import { cn } from '@/lib/utils'

interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [activeSection, setActiveSection] = useState<string>('overview')
  const [isAnimating, setIsAnimating] = useState(false)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen || !project) return null

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    })
  }

  const statusColors = {
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    'planned': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    'archived': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'features', label: 'Features', icon: Lightbulb },
    { id: 'challenges', label: 'Challenges', icon: TrendingUp },
    { id: 'learnings', label: 'Learnings', icon: Award },
    { id: 'team', label: 'Team', icon: Users }
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className={cn(
          'bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden transition-all duration-300',
          isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-secondary-900/95 backdrop-blur-sm border-b border-secondary-200 dark:border-secondary-700 p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {project.title}
                </h2>
                <span className={cn(
                  'px-3 py-1 text-sm font-medium rounded-full',
                  statusColors[project.status]
                )}>
                  {project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              
              <p className="text-secondary-600 dark:text-secondary-300 text-lg">
                {project.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(project.timeline.startDate.toDate())}
                  {project.timeline.endDate && (
                    <span> - {formatDate(project.timeline.endDate.toDate())}</span>
                  )}
                </div>
                {project.timeline.duration && (
                  <span>• {project.timeline.duration}</span>
                )}
                <span>• {project.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-4">
              {/* Action buttons */}
              {project.links?.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    link.type === 'live' 
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-300'
                  )}
                  title={link.label}
                >
                  {link.type === 'live' && <ExternalLink className="h-5 w-5" />}
                  {link.type === 'github' && <Github className="h-5 w-5" />}
                  {link.type === 'demo' && <ExternalLink className="h-5 w-5" />}
                </a>
              ))}
              
              <button
                onClick={onClose}
                className="p-2 bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-300 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-1 mt-4 bg-secondary-100 dark:bg-secondary-800 p-1 rounded-lg">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  activeSection === section.id
                    ? 'bg-white dark:bg-secondary-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white'
                )}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] scrollbar-thin">
          <div className="p-6 space-y-8">
            
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Image Gallery */}
                {project.images && project.images.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                      Project Screenshots
                    </h3>
                    <ImageCarousel
                      images={project.images}
                      showThumbnails={project.images.length > 1}
                      className="h-80"
                    />
                  </div>
                )}

                {/* Long Description */}
                {project.longDescription && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                      About This Project
                    </h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
                        {project.longDescription}
                      </p>
                    </div>
                  </div>
                )}

                {/* Technologies */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                    Technologies Used
                  </h3>
                  <TechnologyGrid
                    technologies={project.technologies}
                    variant="default"
                    showIcons={true}
                  />
                </div>

                {/* Metrics */}
                {project.metrics && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                      Project Metrics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {project.metrics.visitors && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                            <TrendingUp className="h-5 w-5" />
                            <span className="font-medium">Visitors</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {project.metrics.visitors.toLocaleString()}
                          </p>
                        </div>
                      )}
                      
                      {project.metrics.users && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                            <Users className="h-5 w-5" />
                            <span className="font-medium">Users</span>
                          </div>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {project.metrics.users.toLocaleString()}
                          </p>
                        </div>
                      )}
                      
                      {project.metrics.performance && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
                            <Award className="h-5 w-5" />
                            <span className="font-medium">Performance</span>
                          </div>
                          <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                            {project.metrics.performance}
                          </p>
                        </div>
                      )}
                      
                      {project.metrics.impact && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                            <Target className="h-5 w-5" />
                            <span className="font-medium">Impact</span>
                          </div>
                          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                            {project.metrics.impact}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Features Section */}
            {activeSection === 'features' && project.features && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Key Features
                </h3>
                <div className="grid gap-4">
                  {project.features.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg"
                    >
                      <div className="p-1 bg-primary-100 dark:bg-primary-900/30 rounded">
                        <Lightbulb className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <p className="text-secondary-700 dark:text-secondary-300">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Challenges Section */}
            {activeSection === 'challenges' && project.challenges && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Challenges Overcome
                </h3>
                <div className="grid gap-4">
                  {project.challenges.map((challenge, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                    >
                      <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded">
                        <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="text-secondary-700 dark:text-secondary-300">
                        {challenge}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learnings Section */}
            {activeSection === 'learnings' && project.learnings && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Key Learnings
                </h3>
                <div className="grid gap-4">
                  {project.learnings.map((learning, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
                    >
                      <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                        <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-secondary-700 dark:text-secondary-300">
                        {learning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Section */}
            {activeSection === 'team' && project.team && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Team Members
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {project.team.map((member, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-secondary-900 dark:text-white">
                          {member.name}
                        </h4>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300">
                          {member.role}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {member.linkedIn && (
                          <a
                            href={member.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-secondary-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {member.github && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200 transition-colors"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 dark:bg-secondary-900/95 backdrop-blur-sm border-t border-secondary-200 dark:border-secondary-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {project.links?.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                >
                  {link.type === 'live' && <ExternalLink className="h-4 w-4" />}
                  {link.type === 'github' && <Github className="h-4 w-4" />}
                  {link.type === 'demo' && <ExternalLink className="h-4 w-4" />}
                  {link.label}
                </a>
              ))}
            </div>
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-secondary-600 dark:text-secondary-300 hover:text-secondary-800 dark:hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}