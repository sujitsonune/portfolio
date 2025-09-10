'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { useTheme } from 'next-themes'
import type { Skill, SkillCategory, SkillRadarData } from '@/types'
import { cn } from '@/lib/utils'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface SkillRadarChartProps {
  skills: Skill[]
  selectedCategories?: SkillCategory[]
  className?: string
  size?: 'small' | 'medium' | 'large'
  showLegend?: boolean
  animate?: boolean
}

// Category colors for radar chart
const categoryColors: Record<SkillCategory, { bg: string; border: string }> = {
  'frontend': { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgb(59, 130, 246)' },
  'backend': { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgb(34, 197, 94)' },
  'database': { bg: 'rgba(168, 85, 247, 0.2)', border: 'rgb(168, 85, 247)' },
  'mobile': { bg: 'rgba(236, 72, 153, 0.2)', border: 'rgb(236, 72, 153)' },
  'cloud': { bg: 'rgba(251, 146, 60, 0.2)', border: 'rgb(251, 146, 60)' },
  'devops': { bg: 'rgba(14, 165, 233, 0.2)', border: 'rgb(14, 165, 233)' },
  'design': { bg: 'rgba(244, 63, 94, 0.2)', border: 'rgb(244, 63, 94)' },
  'testing': { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgb(16, 185, 129)' },
  'soft-skills': { bg: 'rgba(139, 92, 246, 0.2)', border: 'rgb(139, 92, 246)' },
  'tools': { bg: 'rgba(107, 114, 128, 0.2)', border: 'rgb(107, 114, 128)' },
  'other': { bg: 'rgba(156, 163, 175, 0.2)', border: 'rgb(156, 163, 175)' }
}

export function SkillRadarChart({
  skills,
  selectedCategories,
  className,
  size = 'medium',
  showLegend = true,
  animate = true
}: SkillRadarChartProps) {
  const { theme } = useTheme()
  const chartRef = useRef<ChartJS<'radar'>>(null)

  // Filter and group skills by category
  const groupedSkills = skills
    .filter(skill => skill.isVisible)
    .filter(skill => !selectedCategories || selectedCategories.includes(skill.category))
    .reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    }, {} as Record<SkillCategory, Skill[]>)

  // Calculate average proficiency per category
  const categoryAverages = Object.entries(groupedSkills).map(([category, categorySkills]) => ({
    category: category as SkillCategory,
    average: categorySkills.reduce((sum, skill) => sum + skill.proficiencyScore, 0) / categorySkills.length,
    count: categorySkills.length
  }))

  const chartData: ChartData<'radar'> = {
    labels: categoryAverages.map(item => 
      item.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: [
      {
        label: 'Proficiency Level',
        data: categoryAverages.map(item => item.average),
        backgroundColor: theme === 'dark' 
          ? 'rgba(59, 130, 246, 0.1)' 
          : 'rgba(59, 130, 246, 0.2)',
        borderColor: theme === 'dark' 
          ? 'rgb(96, 165, 250)' 
          : 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointBackgroundColor: categoryAverages.map(item => 
          categoryColors[item.category]?.border || 'rgb(59, 130, 246)'
        ),
        pointBorderColor: theme === 'dark' ? '#fff' : '#000',
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true
      }
    ]
  }

  const chartOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: true,
    animation: animate ? {
      duration: 1000,
      easing: 'easeInOutQuart'
    } : false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#e5e7eb' : '#374151',
          font: {
            size: size === 'small' ? 10 : size === 'medium' ? 12 : 14
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: theme === 'dark' ? '#f3f4f6' : '#111827',
        bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const categoryData = categoryAverages[context.dataIndex]
            return [
              `${context.label}: ${Math.round(context.parsed.r)}%`,
              `Skills: ${categoryData.count}`,
              `Average proficiency in this category`
            ]
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: theme === 'dark' ? '#6b7280' : '#9ca3af',
          font: {
            size: size === 'small' ? 8 : size === 'medium' ? 10 : 12
          }
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        },
        angleLines: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        },
        pointLabels: {
          color: theme === 'dark' ? '#d1d5db' : '#4b5563',
          font: {
            size: size === 'small' ? 10 : size === 'medium' ? 12 : 14,
            weight: '500'
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest'
    }
  }

  // Chart size classes
  const sizeClasses = {
    small: 'w-64 h-64',
    medium: 'w-80 h-80',
    large: 'w-96 h-96'
  }

  if (categoryAverages.length === 0) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-secondary-50 dark:bg-secondary-800 rounded-lg border-2 border-dashed border-secondary-200 dark:border-secondary-600',
        sizeClasses[size],
        className
      )}>
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-secondary-600 dark:text-secondary-400 text-sm">
            No skills data available
          </p>
          <p className="text-secondary-500 dark:text-secondary-500 text-xs mt-1">
            Add skills to see radar visualization
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'relative bg-white dark:bg-secondary-900 rounded-lg p-4 shadow-sm border border-secondary-200 dark:border-secondary-700',
      sizeClasses[size],
      className
    )}>
      <Radar ref={chartRef} data={chartData} options={chartOptions} />
      
      {/* Chart overlay for additional info */}
      <div className="absolute top-2 right-2">
        <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full text-xs font-medium">
          {Object.values(groupedSkills).flat().length} skills
        </div>
      </div>
    </div>
  )
}

// Comparison radar chart for multiple skill sets
interface SkillComparisonRadarProps {
  skillSets: Array<{
    label: string
    skills: Skill[]
    color: string
  }>
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export function SkillComparisonRadar({
  skillSets,
  className,
  size = 'medium'
}: SkillComparisonRadarProps) {
  const { theme } = useTheme()

  // Get all unique categories from all skill sets
  const allCategories = Array.from(new Set(
    skillSets.flatMap(set => 
      set.skills.filter(skill => skill.isVisible).map(skill => skill.category)
    )
  )).sort()

  const chartData: ChartData<'radar'> = {
    labels: allCategories.map(category => 
      category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: skillSets.map((skillSet, index) => {
      // Calculate average for each category in this skill set
      const categoryAverages = allCategories.map(category => {
        const categorySkills = skillSet.skills.filter(
          skill => skill.category === category && skill.isVisible
        )
        return categorySkills.length > 0
          ? categorySkills.reduce((sum, skill) => sum + skill.proficiencyScore, 0) / categorySkills.length
          : 0
      })

      return {
        label: skillSet.label,
        data: categoryAverages,
        backgroundColor: `${skillSet.color}20`,
        borderColor: skillSet.color,
        borderWidth: 2,
        pointBackgroundColor: skillSet.color,
        pointBorderColor: theme === 'dark' ? '#fff' : '#000',
        pointBorderWidth: 1,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true
      }
    })
  }

  const chartOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#e5e7eb' : '#374151',
          font: {
            size: size === 'small' ? 10 : size === 'medium' ? 12 : 14
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
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${Math.round(context.parsed.r)}%`
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: theme === 'dark' ? '#6b7280' : '#9ca3af',
          font: {
            size: size === 'small' ? 8 : 10
          }
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        },
        angleLines: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        },
        pointLabels: {
          color: theme === 'dark' ? '#d1d5db' : '#4b5563',
          font: {
            size: size === 'small' ? 9 : 11,
            weight: '500'
          }
        }
      }
    }
  }

  const sizeClasses = {
    small: 'w-64 h-64',
    medium: 'w-80 h-80', 
    large: 'w-96 h-96'
  }

  return (
    <div className={cn(
      'relative bg-white dark:bg-secondary-900 rounded-lg p-4 shadow-sm border border-secondary-200 dark:border-secondary-700',
      sizeClasses[size],
      className
    )}>
      <Radar data={chartData} options={chartOptions} />
    </div>
  )
}