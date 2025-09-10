'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns'
import { 
  TrendingUp, 
  Award, 
  BookOpen, 
  Briefcase, 
  Calendar,
  Target,
  Star,
  ChevronRight,
  ExternalLink,
  X
} from 'lucide-react'
import { useTheme } from 'next-themes'
import type { Skill, SkillProgression } from '@/types'
import { cn } from '@/lib/utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

interface SkillProgressionTimelineProps {
  skill: Skill
  className?: string
  variant?: 'chart' | 'timeline' | 'compact'
  showMilestones?: boolean
  interactive?: boolean
}

export function SkillProgressionTimeline({
  skill,
  className,
  variant = 'timeline',
  showMilestones = true,
  interactive = true
}: SkillProgressionTimelineProps) {
  const { theme } = useTheme()
  const [selectedMilestone, setSelectedMilestone] = useState<SkillProgression | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const sortedProgression = [...skill.progression].sort(
    (a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()
  )

  if (variant === 'chart') {
    const chartData = {
      labels: sortedProgression.map(p => p.date.toDate()),
      datasets: [
        {
          label: 'Proficiency Score',
          data: sortedProgression.map(p => p.proficiencyScore),
          borderColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
          backgroundColor: theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
          pointBorderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.4
        }
      ]
    }

    const chartOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          titleColor: theme === 'dark' ? '#f3f4f6' : '#111827',
          bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            title: function(context) {
              return new Date(context[0].label).toLocaleDateString()
            },
            label: function(context) {
              const progression = sortedProgression[context.dataIndex]
              return [
                `Proficiency: ${context.parsed.y}%`,
                ...(progression.milestone ? [`Milestone: ${progression.milestone}`] : []),
                ...(progression.project ? [`Project: ${progression.project}`] : []),
                ...(progression.certificate ? [`Certificate: ${progression.certificate}`] : [])
              ]
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'month',
            displayFormats: {
              month: 'MMM yyyy'
            }
          },
          grid: {
            color: theme === 'dark' ? '#374151' : '#e5e7eb'
          },
          ticks: {
            color: theme === 'dark' ? '#9ca3af' : '#6b7280'
          }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: theme === 'dark' ? '#374151' : '#e5e7eb'
          },
          ticks: {
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            callback: function(value) {
              return value + '%'
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'nearest'
      }
    }

    return (
      <div ref={ref} className={cn('bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700', className)}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
            {skill.name} Progression
          </h3>
          <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
            <TrendingUp className="h-4 w-4" />
            <span>{sortedProgression.length} milestones</span>
          </div>
        </div>
        
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Key milestones below chart */}
        {showMilestones && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Key Milestones
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {sortedProgression.filter(p => p.milestone).slice(-3).map((progression, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-secondary-600 dark:text-secondary-400">
                  <Calendar className="h-3 w-3" />
                  <span>{progression.date.toDate().toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{progression.milestone}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    const latestProgression = sortedProgression[sortedProgression.length - 1]
    const firstProgression = sortedProgression[0]
    const improvement = latestProgression ? latestProgression.proficiencyScore - (firstProgression?.proficiencyScore || 0) : 0

    return (
      <div ref={ref} className={cn('bg-white dark:bg-secondary-900 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700', className)}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-secondary-900 dark:text-white">
              {skill.name}
            </h4>
            <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
              <TrendingUp className="h-3 w-3" />
              <span>{improvement > 0 ? '+' : ''}{improvement}% improvement</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-secondary-900 dark:text-white">
              {skill.proficiencyScore}%
            </div>
            <div className="text-xs text-secondary-500 dark:text-secondary-400">
              {sortedProgression.length} milestones
            </div>
          </div>
        </div>

        {/* Mini progress line */}
        <div className="mt-4 h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={isInView ? { width: `${skill.proficiencyScore}%` } : {}}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    )
  }

  // Timeline variant (default)
  return (
    <div ref={ref} className={cn('bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-primary-600" />
          {skill.name} Journey
        </h3>
        <div className="text-sm text-secondary-600 dark:text-secondary-400">
          {sortedProgression.length} milestones
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-secondary-200 dark:bg-secondary-700" />
        
        <div className="space-y-6">
          {sortedProgression.map((progression, index) => {
            const isLatest = index === sortedProgression.length - 1
            const date = progression.date.toDate()
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  'relative flex items-start gap-4 cursor-pointer group',
                  interactive && 'hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg p-2 -m-2'
                )}
                onClick={() => interactive && setSelectedMilestone(progression)}
              >
                {/* Timeline dot */}
                <div className={cn(
                  'relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-200',
                  isLatest 
                    ? 'bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-lg'
                    : 'bg-white dark:bg-secondary-800 border-2 border-secondary-200 dark:border-secondary-600 text-secondary-600 dark:text-secondary-400',
                  interactive && 'group-hover:scale-110'
                )}>
                  {progression.certificate ? (
                    <Award className="h-5 w-5" />
                  ) : progression.project ? (
                    <Briefcase className="h-5 w-5" />
                  ) : progression.milestone ? (
                    <Star className="h-5 w-5" />
                  ) : (
                    <BookOpen className="h-5 w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-secondary-900 dark:text-white">
                          {date.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                        {isLatest && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-xs rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                      
                      <div className="text-lg font-semibold text-secondary-900 dark:text-white mb-1">
                        {progression.proficiencyScore}% Proficiency
                      </div>

                      {/* Milestone details */}
                      <div className="space-y-1">
                        {progression.milestone && (
                          <div className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-300">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{progression.milestone}</span>
                          </div>
                        )}
                        
                        {progression.project && (
                          <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                            <Briefcase className="h-3 w-3" />
                            <span>Project: {progression.project}</span>
                          </div>
                        )}
                        
                        {progression.certificate && (
                          <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                            <Award className="h-3 w-3 text-green-500" />
                            <span>Certificate: {progression.certificate}</span>
                          </div>
                        )}
                        
                        {progression.experience && (
                          <div className="text-sm text-secondary-600 dark:text-secondary-400">
                            <BookOpen className="h-3 w-3 inline mr-2" />
                            {progression.experience}
                          </div>
                        )}
                      </div>
                    </div>

                    {interactive && (
                      <ChevronRight className="h-4 w-4 text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  {/* Progress improvement indicator */}
                  {index > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <TrendingUp className="h-3 w-3" />
                        <span>
                          +{progression.proficiencyScore - sortedProgression[index - 1].proficiencyScore}% improvement
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Selected milestone modal/details */}
      {selectedMilestone && interactive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMilestone(null)}
        >
          <motion.div
            className="bg-white dark:bg-secondary-900 rounded-xl p-6 max-w-md w-full border border-secondary-200 dark:border-secondary-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Milestone Details
              </h3>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">Date</div>
                <div className="font-medium text-secondary-900 dark:text-white">
                  {selectedMilestone.date.toDate().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">Proficiency Level</div>
                <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {selectedMilestone.proficiencyScore}%
                </div>
              </div>

              {selectedMilestone.milestone && (
                <div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-400">Milestone</div>
                  <div className="font-medium text-secondary-900 dark:text-white">
                    {selectedMilestone.milestone}
                  </div>
                </div>
              )}

              {selectedMilestone.project && (
                <div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-400">Related Project</div>
                  <div className="font-medium text-secondary-900 dark:text-white">
                    {selectedMilestone.project}
                  </div>
                </div>
              )}

              {selectedMilestone.certificate && (
                <div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-400">Certificate</div>
                  <div className="font-medium text-secondary-900 dark:text-white">
                    {selectedMilestone.certificate}
                  </div>
                </div>
              )}

              {selectedMilestone.experience && (
                <div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-400">Experience</div>
                  <div className="text-secondary-900 dark:text-white">
                    {selectedMilestone.experience}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

// Multiple skills progression comparison
interface SkillsProgressionComparisonProps {
  skills: Skill[]
  className?: string
  timeRange?: 'all' | '1year' | '2years' | '5years'
}

export function SkillsProgressionComparison({
  skills,
  className,
  timeRange = 'all'
}: SkillsProgressionComparisonProps) {
  const { theme } = useTheme()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  // Filter skills with progression data
  const skillsWithProgression = skills.filter(skill => 
    skill.progression && skill.progression.length > 1 && skill.isVisible
  )

  // Generate colors for each skill
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ]

  const chartData = {
    datasets: skillsWithProgression.slice(0, 5).map((skill, index) => {
      let progressionData = [...skill.progression].sort(
        (a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()
      )

      // Filter by time range
      if (timeRange !== 'all') {
        const cutoffDate = new Date()
        const years = timeRange === '1year' ? 1 : timeRange === '2years' ? 2 : 5
        cutoffDate.setFullYear(cutoffDate.getFullYear() - years)
        
        progressionData = progressionData.filter(
          p => p.date.toDate() >= cutoffDate
        )
      }

      return {
        label: skill.name,
        data: progressionData.map(p => ({
          x: p.date.toDate(),
          y: p.proficiencyScore
        })),
        borderColor: colors[index % colors.length],
        backgroundColor: `${colors[index % colors.length]}20`,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.3
      }
    })
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#e5e7eb' : '#374151',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: theme === 'dark' ? '#f3f4f6' : '#111827',
        bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: function(context) {
            return new Date(context[0].parsed.x).toLocaleDateString()
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}%`
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          displayFormats: {
            month: 'MMM yyyy'
          }
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          callback: function(value) {
            return value + '%'
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }

  if (skillsWithProgression.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-secondary-900 rounded-xl p-8 border border-secondary-200 dark:border-secondary-700 text-center', className)}>
        <div className="text-4xl mb-4">📈</div>
        <p className="text-secondary-600 dark:text-secondary-400">
          No progression data available
        </p>
        <p className="text-secondary-500 dark:text-secondary-500 text-sm mt-1">
          Add skill progression milestones to see comparison chart
        </p>
      </div>
    )
  }

  return (
    <div ref={ref} className={cn('bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          Skills Progression Comparison
        </h3>
        <div className="text-sm text-secondary-600 dark:text-secondary-400">
          {skillsWithProgression.length} skills tracked
        </div>
      </div>

      <div className="h-80 mb-6">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Skills summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {skillsWithProgression.slice(0, 3).map((skill, index) => {
          const latestProgression = skill.progression
            .sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime())[0]
          const firstProgression = skill.progression
            .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime())[0]
          const improvement = latestProgression.proficiencyScore - firstProgression.proficiencyScore

          return (
            <div key={skill.id} className="p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="font-medium text-secondary-900 dark:text-white">
                  {skill.name}
                </span>
              </div>
              <div className="text-lg font-bold text-secondary-900 dark:text-white">
                {skill.proficiencyScore}%
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3" />
                <span>+{improvement}% growth</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}