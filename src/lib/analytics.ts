'use client'

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals'

// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Google Analytics functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

export const event = (
  action: string,
  {
    event_category,
    event_label,
    value,
    custom_parameters = {},
  }: {
    event_category?: string
    event_label?: string
    value?: number
    custom_parameters?: Record<string, any>
  } = {}
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category,
      event_label,
      value,
      ...custom_parameters,
    })
  }
}

// Enhanced event tracking for portfolio interactions
export const trackPortfolioEvents = {
  // Project interactions
  viewProject: (projectId: string, projectTitle: string) => {
    event('view_project', {
      event_category: 'engagement',
      event_label: projectTitle,
      custom_parameters: {
        project_id: projectId,
        content_type: 'project'
      }
    })
  },

  clickProjectDemo: (projectId: string, projectTitle: string) => {
    event('click_demo', {
      event_category: 'engagement',
      event_label: projectTitle,
      custom_parameters: {
        project_id: projectId,
        link_type: 'demo'
      }
    })
  },

  clickProjectCode: (projectId: string, projectTitle: string) => {
    event('click_code', {
      event_category: 'engagement',
      event_label: projectTitle,
      custom_parameters: {
        project_id: projectId,
        link_type: 'github'
      }
    })
  },

  // Contact interactions
  submitContactForm: (formData: { name: string; subject: string }) => {
    event('submit_contact_form', {
      event_category: 'conversion',
      event_label: formData.subject,
      custom_parameters: {
        form_type: 'contact',
        lead_source: 'portfolio'
      }
    })
  },

  downloadResume: () => {
    event('download_resume', {
      event_category: 'engagement',
      event_label: 'resume_pdf',
      custom_parameters: {
        file_type: 'pdf',
        content_type: 'resume'
      }
    })
  },

  clickSocialLink: (platform: string) => {
    event('click_social_link', {
      event_category: 'engagement',
      event_label: platform,
      custom_parameters: {
        social_platform: platform,
        link_type: 'external'
      }
    })
  },

  // Skills and experience tracking
  viewSkillsSection: () => {
    event('view_skills', {
      event_category: 'engagement',
      event_label: 'skills_section',
      custom_parameters: {
        section_type: 'skills'
      }
    })
  },

  interactWithSkillChart: (chartType: string) => {
    event('interact_skill_chart', {
      event_category: 'engagement',
      event_label: chartType,
      custom_parameters: {
        interaction_type: 'chart',
        chart_type: chartType
      }
    })
  },

  // Newsletter signup
  subscribeNewsletter: (email: string) => {
    event('subscribe_newsletter', {
      event_category: 'conversion',
      event_label: 'newsletter_signup',
      custom_parameters: {
        subscription_type: 'newsletter',
        lead_source: 'portfolio'
      }
    })
  },

  // Search and navigation
  searchPortfolio: (query: string) => {
    event('search', {
      event_category: 'engagement',
      event_label: query,
      custom_parameters: {
        search_term: query
      }
    })
  },

  // Time on page tracking
  timeOnPage: (page: string, timeInSeconds: number) => {
    event('time_on_page', {
      event_category: 'engagement',
      value: timeInSeconds,
      custom_parameters: {
        page_path: page,
        time_seconds: timeInSeconds
      }
    })
  }
}

// Core Web Vitals tracking
export const trackWebVitals = (metric: Metric) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
      custom_parameters: {
        metric_rating: metric.rating,
        metric_delta: metric.delta,
        metric_entries: metric.entries?.length || 0,
      }
    })
  }
}

// Initialize Core Web Vitals tracking
export const initWebVitals = () => {
  try {
    getCLS(trackWebVitals)
    getFID(trackWebVitals)
    getFCP(trackWebVitals)
    getLCP(trackWebVitals)
    getTTFB(trackWebVitals)
  } catch (err) {
    console.warn('Web Vitals tracking failed:', err)
  }
}

// Performance monitoring
export const performanceMonitor = {
  // Track page load performance
  trackPageLoad: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          // Track key timing metrics
          const metrics = {
            dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp_connect: navigation.connectEnd - navigation.connectStart,
            server_response: navigation.responseStart - navigation.requestStart,
            dom_parsing: navigation.domContentLoadedEventStart - navigation.responseStart,
            resource_loading: navigation.loadEventStart - navigation.domContentLoadedEventStart,
            total_page_load: navigation.loadEventEnd - navigation.navigationStart
          }

          // Send to analytics
          Object.entries(metrics).forEach(([key, value]) => {
            event('performance_timing', {
              event_category: 'Performance',
              event_label: key,
              value: Math.round(value),
              custom_parameters: {
                timing_type: key,
                timing_value: Math.round(value)
              }
            })
          })
        }
      })
    }
  },

  // Track resource loading errors
  trackResourceErrors: () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (error) => {
        if (error.target && error.target !== window) {
          const target = error.target as HTMLElement
          event('resource_error', {
            event_category: 'Error',
            event_label: target.tagName || 'unknown',
            custom_parameters: {
              error_source: target.src || target.href || 'unknown',
              error_type: 'resource_load_error'
            }
          })
        }
      }, true)
    }
  },

  // Track JavaScript errors
  trackJSErrors: () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (error) => {
        event('javascript_error', {
          event_category: 'Error',
          event_label: error.message,
          custom_parameters: {
            error_filename: error.filename,
            error_line: error.lineno,
            error_column: error.colno,
            error_stack: error.error?.stack?.substring(0, 500) || 'No stack trace'
          }
        })
      })

      window.addEventListener('unhandledrejection', (error) => {
        event('promise_rejection', {
          event_category: 'Error',
          event_label: error.reason?.toString() || 'Unknown promise rejection',
          custom_parameters: {
            error_type: 'unhandled_promise_rejection',
            error_reason: error.reason?.toString()?.substring(0, 500) || 'Unknown'
          }
        })
      })
    }
  }
}

// User engagement tracking
export const engagementTracker = {
  startSession: () => {
    const sessionStart = Date.now()
    sessionStorage.setItem('session_start', sessionStart.toString())
    
    event('session_start', {
      event_category: 'Engagement',
      custom_parameters: {
        session_id: sessionStart.toString()
      }
    })
  },

  trackScrollDepth: () => {
    if (typeof window !== 'undefined') {
      let maxScroll = 0
      const thresholds = [25, 50, 75, 90, 100]
      const tracked: Set<number> = new Set()

      const handleScroll = () => {
        const scrollTop = window.pageYOffset
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrollPercent = Math.round((scrollTop / docHeight) * 100)

        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent

          thresholds.forEach(threshold => {
            if (scrollPercent >= threshold && !tracked.has(threshold)) {
              tracked.add(threshold)
              event('scroll_depth', {
                event_category: 'Engagement',
                event_label: `${threshold}%`,
                value: threshold,
                custom_parameters: {
                  scroll_percentage: threshold
                }
              })
            }
          })
        }
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
    }
  },

  trackTimeOnPage: () => {
    if (typeof window !== 'undefined') {
      const startTime = Date.now()
      
      const sendTimeOnPage = () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000)
        if (timeSpent > 10) { // Only track if more than 10 seconds
          trackPortfolioEvents.timeOnPage(window.location.pathname, timeSpent)
        }
      }

      // Track on page visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          sendTimeOnPage()
        }
      })

      // Track on page unload
      window.addEventListener('beforeunload', sendTimeOnPage)
    }
  }
}

// Initialize all tracking
export const initAnalytics = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    initWebVitals()
    performanceMonitor.trackPageLoad()
    performanceMonitor.trackResourceErrors()
    performanceMonitor.trackJSErrors()
    engagementTracker.startSession()
    engagementTracker.trackScrollDepth()
    engagementTracker.trackTimeOnPage()
  }
}