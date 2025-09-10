'use client'

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals'

// Performance monitoring configuration
interface PerformanceConfig {
  enableWebVitals: boolean
  enableCustomMetrics: boolean
  enableRUM: boolean
  endpoint?: string
  apiKey?: string
}

const config: PerformanceConfig = {
  enableWebVitals: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
  enableCustomMetrics: true,
  enableRUM: true,
  endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
  apiKey: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID
}

// Web Vitals tracking
export function trackWebVitals() {
  if (!config.enableWebVitals) return

  const sendToAnalytics = (metric: Metric) => {
    // Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
        custom_map: {
          custom_metric_1: metric.value,
          custom_metric_2: metric.delta
        }
      })
    }

    // Send to Vercel Analytics
    if (config.apiKey) {
      fetch('/api/vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta,
          navigationType: metric.navigationType,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(console.error)
    }

    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Web Vital:', metric.name, metric.value, metric.rating)
    }
  }

  // Track all Web Vitals metrics
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}

// Custom performance metrics
class PerformanceTracker {
  private metrics: Map<string, number> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    if (typeof window === 'undefined' || !config.enableCustomMetrics) return

    // Navigation timing
    this.observeNavigation()
    
    // Resource loading
    this.observeResources()
    
    // Paint timing
    this.observePaint()
    
    // Layout shifts
    this.observeLayoutShifts()
    
    // Long tasks
    this.observeLongTasks()
  }

  private observeNavigation() {
    if (!('PerformanceNavigationTiming' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const nav = entry as PerformanceNavigationTiming
        
        this.metrics.set('domContentLoaded', nav.domContentLoadedEventEnd - nav.navigationStart)
        this.metrics.set('loadComplete', nav.loadEventEnd - nav.navigationStart)
        this.metrics.set('firstByte', nav.responseStart - nav.navigationStart)
        this.metrics.set('domInteractive', nav.domInteractive - nav.navigationStart)
        
        this.reportCustomMetric('navigation', Object.fromEntries(this.metrics))
      }
    })
    
    observer.observe({ entryTypes: ['navigation'] })
    this.observers.set('navigation', observer)
  }

  private observeResources() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming
        
        if (resource.transferSize > 0) {
          this.reportCustomMetric('resource', {
            name: resource.name,
            duration: resource.duration,
            transferSize: resource.transferSize,
            type: this.getResourceType(resource.name)
          })
        }
      }
    })
    
    observer.observe({ entryTypes: ['resource'] })
    this.observers.set('resource', observer)
  }

  private observePaint() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.reportCustomMetric('paint', {
          name: entry.name,
          startTime: entry.startTime
        })
      }
    })
    
    try {
      observer.observe({ entryTypes: ['paint'] })
      this.observers.set('paint', observer)
    } catch (e) {
      // Paint timing not supported
    }
  }

  private observeLayoutShifts() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & { value: number }
        
        if (!entry.hadRecentInput) {
          this.reportCustomMetric('layout-shift', {
            value: layoutShift.value,
            startTime: entry.startTime
          })
        }
      }
    })
    
    try {
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.set('layout-shift', observer)
    } catch (e) {
      // Layout shift not supported
    }
  }

  private observeLongTasks() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          this.reportCustomMetric('long-task', {
            duration: entry.duration,
            startTime: entry.startTime
          })
        }
      }
    })
    
    try {
      observer.observe({ entryTypes: ['longtask'] })
      this.observers.set('longtask', observer)
    } catch (e) {
      // Long task not supported
    }
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(js|jsx|ts|tsx)$/)) return 'script'
    if (url.match(/\.(css|scss|sass)$/)) return 'stylesheet'
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image'
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font'
    if (url.includes('/api/')) return 'api'
    return 'other'
  }

  private reportCustomMetric(type: string, data: any) {
    if (config.endpoint) {
      fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          type,
          data,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(console.error)
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`📈 Custom Metric [${type}]:`, data)
    }
  }

  // Public methods
  public trackPageView(page: string) {
    this.reportCustomMetric('page-view', {
      page,
      timestamp: Date.now(),
      referrer: document.referrer
    })
  }

  public trackUserInteraction(event: string, data?: any) {
    this.reportCustomMetric('user-interaction', {
      event,
      data,
      timestamp: Date.now()
    })
  }

  public trackError(error: Error, context?: string) {
    this.reportCustomMetric('client-error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    })
  }

  public trackTiming(name: string, duration: number) {
    this.reportCustomMetric('custom-timing', {
      name,
      duration,
      timestamp: Date.now()
    })
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    this.metrics.clear()
  }
}

// Global performance tracker instance
let performanceTracker: PerformanceTracker | null = null

export function initializePerformanceTracking() {
  if (typeof window === 'undefined') return

  // Initialize Web Vitals tracking
  trackWebVitals()

  // Initialize custom performance tracking
  if (!performanceTracker) {
    performanceTracker = new PerformanceTracker()
  }

  return performanceTracker
}

export function getPerformanceTracker(): PerformanceTracker | null {
  return performanceTracker
}

// Real User Monitoring (RUM)
export class RUMTracker {
  private sessionId: string
  private startTime: number

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    this.initializeRUM()
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private initializeRUM() {
    if (!config.enableRUM) return

    // Track session start
    this.trackEvent('session-start', {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    })

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('visibility-change', {
        hidden: document.hidden,
        timestamp: Date.now()
      })
    })

    // Track beforeunload for session duration
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session-end', {
        sessionId: this.sessionId,
        duration: Date.now() - this.startTime
      })
    })
  }

  public trackEvent(event: string, data: any) {
    if (config.endpoint) {
      navigator.sendBeacon(config.endpoint, JSON.stringify({
        type: 'rum-event',
        event,
        data: {
          ...data,
          sessionId: this.sessionId,
          timestamp: Date.now()
        }
      }))
    }
  }
}

// Device and connection info
export function getDeviceInfo() {
  if (typeof window === 'undefined') return {}

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connection: connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    } : null
  }
}

// Performance budget monitoring
export class PerformanceBudget {
  private budgets = {
    LCP: 2500, // Largest Contentful Paint (ms)
    FID: 100,  // First Input Delay (ms)
    CLS: 0.1,  // Cumulative Layout Shift
    FCP: 1800, // First Contentful Paint (ms)
    TTFB: 800, // Time to First Byte (ms)
    bundleSize: 500 * 1024, // 500KB
    imageSize: 200 * 1024   // 200KB per image
  }

  public checkBudget(metric: string, value: number): boolean {
    const budget = this.budgets[metric as keyof typeof this.budgets]
    if (budget && value > budget) {
      console.warn(`Performance budget exceeded for ${metric}: ${value} > ${budget}`)
      
      // Report budget violation
      if (performanceTracker) {
        performanceTracker.trackError(
          new Error(`Performance budget exceeded: ${metric}`),
          `Value: ${value}, Budget: ${budget}`
        )
      }
      
      return false
    }
    return true
  }

  public setBudget(metric: string, value: number) {
    this.budgets[metric as keyof typeof this.budgets] = value
  }
}

// Initialize monitoring when module loads
if (typeof window !== 'undefined') {
  // Delay initialization to avoid blocking the main thread
  setTimeout(() => {
    initializePerformanceTracking()
    new RUMTracker()
  }, 1000)
}