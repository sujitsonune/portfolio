import type { WorkExperience } from '@/types'

// Filter utilities
export interface ExperienceFilters {
  companies: string[]
  technologies: string[]
  employmentTypes: string[]
  dateRange: {
    start: Date | null
    end: Date | null
  }
}

export const filterExperiences = (
  experiences: WorkExperience[],
  filters: Partial<ExperienceFilters>
): WorkExperience[] => {
  return experiences.filter(experience => {
    // Filter by companies
    if (filters.companies?.length && !filters.companies.includes(experience.company)) {
      return false
    }

    // Filter by technologies
    if (filters.technologies?.length) {
      const hasMatchingTech = filters.technologies.some(tech =>
        experience.technologies.some(expTech => 
          expTech.toLowerCase().includes(tech.toLowerCase())
        )
      )
      if (!hasMatchingTech) return false
    }

    // Filter by employment types
    if (filters.employmentTypes?.length && !filters.employmentTypes.includes(experience.employmentType)) {
      return false
    }

    // Filter by date range
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const startDate = experience.duration.startDate.toDate()
      const endDate = experience.duration.endDate?.toDate() || new Date()
      
      if (filters.dateRange.start && startDate < filters.dateRange.start) return false
      if (filters.dateRange.end && endDate > filters.dateRange.end) return false
    }

    return true
  })
}

// Get unique values for filter options
export const getFilterOptions = (experiences: WorkExperience[]) => {
  const companies = [...new Set(experiences.map(exp => exp.company))].sort()
  const technologies = [...new Set(experiences.flatMap(exp => exp.technologies))].sort()
  const employmentTypes = [...new Set(experiences.map(exp => exp.employmentType))].sort()
  
  return { companies, technologies, employmentTypes }
}

// Export utilities
export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'markdown'
  includeDetails: boolean
  includeAchievements: boolean
  includeTechnologies: boolean
  experiences: WorkExperience[]
}

export const exportExperience = (options: ExportOptions) => {
  const { format, experiences } = options

  switch (format) {
    case 'json':
      return exportToJSON(experiences, options)
    case 'csv':
      return exportToCSV(experiences, options)
    case 'markdown':
      return exportToMarkdown(experiences, options)
    case 'pdf':
      return exportToPDF(experiences, options)
    default:
      throw new Error('Unsupported export format')
  }
}

const exportToJSON = (experiences: WorkExperience[], options: ExportOptions) => {
  const data = experiences.map(exp => ({
    company: exp.company,
    role: exp.role,
    duration: {
      start: exp.duration.startDate.toDate().toISOString().split('T')[0],
      end: exp.duration.endDate?.toDate().toISOString().split('T')[0] || 'Present',
      isCurrent: exp.duration.isCurrent
    },
    employmentType: exp.employmentType,
    location: exp.location,
    ...(options.includeDetails && { responsibilities: exp.responsibilities }),
    ...(options.includeAchievements && { achievements: exp.achievements }),
    ...(options.includeTechnologies && { technologies: exp.technologies })
  }))

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, 'work-experience.json')
}

const exportToCSV = (experiences: WorkExperience[], options: ExportOptions) => {
  const headers = [
    'Company',
    'Role',
    'Start Date',
    'End Date',
    'Employment Type',
    'Location',
    ...(options.includeDetails ? ['Responsibilities'] : []),
    ...(options.includeAchievements ? ['Key Achievements'] : []),
    ...(options.includeTechnologies ? ['Technologies'] : [])
  ]

  const rows = experiences.map(exp => [
    exp.company,
    exp.role,
    exp.duration.startDate.toDate().toISOString().split('T')[0],
    exp.duration.endDate?.toDate().toISOString().split('T')[0] || 'Present',
    exp.employmentType,
    `${exp.location.city || ''}, ${exp.location.country || ''}`.trim().replace(/^,\s*/, ''),
    ...(options.includeDetails ? [exp.responsibilities.join('; ')] : []),
    ...(options.includeAchievements ? [exp.achievements.join('; ')] : []),
    ...(options.includeTechnologies ? [exp.technologies.join(', ')] : [])
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  downloadBlob(blob, 'work-experience.csv')
}

const exportToMarkdown = (experiences: WorkExperience[], options: ExportOptions) => {
  let markdown = '# Work Experience\n\n'

  experiences.forEach(exp => {
    const startDate = exp.duration.startDate.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const endDate = exp.duration.endDate?.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || 'Present'
    
    markdown += `## ${exp.role} at ${exp.company}\n`
    markdown += `**Duration:** ${startDate} - ${endDate}\n`
    markdown += `**Employment Type:** ${exp.employmentType}\n`
    
    if (exp.location.city || exp.location.country) {
      markdown += `**Location:** ${exp.location.city || ''}, ${exp.location.country || ''}`.trim().replace(/^,\s*/, '') + '\n'
    }
    
    markdown += '\n'

    if (options.includeDetails && exp.responsibilities.length > 0) {
      markdown += '### Responsibilities\n'
      exp.responsibilities.forEach(resp => markdown += `- ${resp}\n`)
      markdown += '\n'
    }

    if (options.includeAchievements && exp.achievements.length > 0) {
      markdown += '### Key Achievements\n'
      exp.achievements.forEach(achievement => markdown += `- ${achievement}\n`)
      markdown += '\n'
    }

    if (options.includeTechnologies && exp.technologies.length > 0) {
      markdown += '### Technologies Used\n'
      markdown += exp.technologies.join(', ') + '\n\n'
    }

    markdown += '---\n\n'
  })

  const blob = new Blob([markdown], { type: 'text/markdown' })
  downloadBlob(blob, 'work-experience.md')
}

const exportToPDF = async (experiences: WorkExperience[], options: ExportOptions) => {
  // This would require a PDF library like jsPDF or Puppeteer
  // For now, we'll create a simplified HTML version
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Work Experience</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .experience { margin-bottom: 30px; page-break-inside: avoid; }
        .company { color: #2563eb; font-size: 1.2em; font-weight: bold; }
        .role { font-size: 1.1em; font-weight: 600; margin-bottom: 5px; }
        .duration { color: #666; font-size: 0.9em; }
        .section { margin: 10px 0; }
        .section h4 { margin: 10px 0 5px 0; color: #374151; }
        ul { margin: 5px 0 15px 20px; }
        .technologies { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
        .tech-tag { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; }
      </style>
    </head>
    <body>
      <h1>Work Experience</h1>
  `

  experiences.forEach(exp => {
    const startDate = exp.duration.startDate.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const endDate = exp.duration.endDate?.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || 'Present'
    
    html += `
      <div class="experience">
        <div class="company">${exp.company}</div>
        <div class="role">${exp.role}</div>
        <div class="duration">${startDate} - ${endDate} • ${exp.employmentType}</div>
    `
    
    if (exp.location.city || exp.location.country) {
      html += `<div class="duration">${exp.location.city || ''}, ${exp.location.country || ''}`.trim().replace(/^,\s*/, '') + '</div>'
    }

    if (options.includeDetails && exp.responsibilities.length > 0) {
      html += '<div class="section"><h4>Responsibilities</h4><ul>'
      exp.responsibilities.forEach(resp => html += `<li>${resp}</li>`)
      html += '</ul></div>'
    }

    if (options.includeAchievements && exp.achievements.length > 0) {
      html += '<div class="section"><h4>Key Achievements</h4><ul>'
      exp.achievements.forEach(achievement => html += `<li>${achievement}</li>`)
      html += '</ul></div>'
    }

    if (options.includeTechnologies && exp.technologies.length > 0) {
      html += '<div class="section"><h4>Technologies</h4><div class="technologies">'
      exp.technologies.forEach(tech => html += `<span class="tech-tag">${tech}</span>`)
      html += '</div></div>'
    }

    html += '</div>'
  })

  html += '</body></html>'

  const blob = new Blob([html], { type: 'text/html' })
  downloadBlob(blob, 'work-experience.html')
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Date formatting utilities
export const formatDateRange = (startDate: Date, endDate: Date | null, isCurrent: boolean) => {
  const start = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  
  if (isCurrent) {
    return `${start} - Present`
  }
  
  if (!endDate) {
    return start
  }
  
  const end = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  return `${start} - ${end}`
}

export const calculateDuration = (startDate: Date, endDate: Date | null, isCurrent: boolean) => {
  const end = isCurrent || !endDate ? new Date() : endDate
  const diffTime = Math.abs(end.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)
  
  if (years > 0 && months > 0) {
    return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`
  } else if (years > 0) {
    return `${years} yr${years > 1 ? 's' : ''}`
  } else if (months > 0) {
    return `${months} mo${months > 1 ? 's' : ''}`
  } else {
    return 'Less than 1 month'
  }
}

// Company color utilities
export const getCompanyColor = (company: string): string => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ]
  
  const hash = company.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return colors[Math.abs(hash) % colors.length]
}

// Animation timing utilities
export const getStaggerDelay = (index: number, baseDelay: number = 100): number => {
  return index * baseDelay
}

// Search utilities
export const searchExperiences = (experiences: WorkExperience[], query: string): WorkExperience[] => {
  if (!query.trim()) return experiences

  const lowerQuery = query.toLowerCase()
  
  return experiences.filter(exp => 
    exp.company.toLowerCase().includes(lowerQuery) ||
    exp.role.toLowerCase().includes(lowerQuery) ||
    exp.responsibilities.some(resp => resp.toLowerCase().includes(lowerQuery)) ||
    exp.achievements.some(achievement => achievement.toLowerCase().includes(lowerQuery)) ||
    exp.technologies.some(tech => tech.toLowerCase().includes(lowerQuery))
  )
}