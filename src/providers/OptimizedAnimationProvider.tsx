'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { useDeviceCapabilities, usePerformanceMonitor } from '@/utils/performanceOptimization'

interface AnimationContextType {
  isOptimized: boolean
  deviceCapabilities: ReturnType<typeof useDeviceCapabilities>
  performanceMetrics: ReturnType<typeof usePerformanceMonitor>['metrics']
  shouldReduceAnimations: boolean
  animationQuality: 'low' | 'medium' | 'high'
}

const AnimationContext = createContext<AnimationContextType | null>(null)

export function useAnimationContext() {
  const context = useContext(AnimationContext)
  if (!context) {
    throw new Error('useAnimationContext must be used within OptimizedAnimationProvider')
  }
  return context
}

interface OptimizedAnimationProviderProps {
  children: ReactNode
  enablePerformanceMonitoring?: boolean
  fallbackToCSS?: boolean
}

export function OptimizedAnimationProvider({
  children,
  enablePerformanceMonitoring = true,
  fallbackToCSS = true
}: OptimizedAnimationProviderProps) {
  const deviceCapabilities = useDeviceCapabilities()
  const { metrics, trackAnimation } = usePerformanceMonitor()
  const [isOptimized, setIsOptimized] = useState(false)
  const [animationQuality, setAnimationQuality] = useState<'low' | 'medium' | 'high'>('high')
  const performanceCheckInterval = useRef<NodeJS.Timeout>()

  // Determine if we should reduce animations
  const shouldReduceAnimations = deviceCapabilities.prefersReducedMotion || 
                                deviceCapabilities.isLowEndDevice || 
                                metrics.isOverloaded

  // Monitor performance and adjust animation quality
  useEffect(() => {
    if (!enablePerformanceMonitoring) return

    const checkPerformance = () => {
      // Adjust animation quality based on performance metrics
      if (metrics.fps < 20 || metrics.memoryUsage > 90) {
        setAnimationQuality('low')
        setIsOptimized(true)
      } else if (metrics.fps < 40 || metrics.memoryUsage > 70) {
        setAnimationQuality('medium')
        setIsOptimized(true)
      } else if (!deviceCapabilities.isLowEndDevice && !deviceCapabilities.prefersReducedMotion) {
        setAnimationQuality('high')
        setIsOptimized(false)
      }
    }

    // Initial check
    checkPerformance()

    // Periodic performance checks
    performanceCheckInterval.current = setInterval(checkPerformance, 2000)

    return () => {
      if (performanceCheckInterval.current) {
        clearInterval(performanceCheckInterval.current)
      }
    }
  }, [metrics, deviceCapabilities, enablePerformanceMonitoring])

  // Add CSS classes for performance optimization
  useEffect(() => {
    const root = document.documentElement

    // Add device capability classes
    root.classList.toggle('low-end-device', deviceCapabilities.isLowEndDevice)
    root.classList.toggle('high-end-device', !deviceCapabilities.isLowEndDevice)
    root.classList.toggle('reduced-motion', deviceCapabilities.prefersReducedMotion)
    root.classList.toggle('gpu-acceleration', deviceCapabilities.enableGPUAcceleration)

    // Add performance classes
    root.classList.toggle('performance-low', animationQuality === 'low')
    root.classList.toggle('performance-medium', animationQuality === 'medium')
    root.classList.toggle('performance-high', animationQuality === 'high')

    return () => {
      root.classList.remove(
        'low-end-device', 'high-end-device', 'reduced-motion', 'gpu-acceleration',
        'performance-low', 'performance-medium', 'performance-high'
      )
    }
  }, [deviceCapabilities, animationQuality])

  // Preload optimized animation CSS if needed
  useEffect(() => {
    if (fallbackToCSS && (shouldReduceAnimations || isOptimized)) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = '/styles/optimized-animations.css'
      link.as = 'style'
      document.head.appendChild(link)

      // Load the actual CSS
      const cssLink = document.createElement('link')
      cssLink.rel = 'stylesheet'
      cssLink.href = '/styles/optimized-animations.css'
      document.head.appendChild(cssLink)

      return () => {
        document.head.removeChild(link)
        document.head.removeChild(cssLink)
      }
    }
  }, [shouldReduceAnimations, isOptimized, fallbackToCSS])

  const contextValue: AnimationContextType = {
    isOptimized,
    deviceCapabilities,
    performanceMetrics: metrics,
    shouldReduceAnimations,
    animationQuality
  }

  // Use LazyMotion for better performance with code splitting
  const MotionProvider = shouldReduceAnimations ? 
    ({ children }: { children: ReactNode }) => <>{children}</> :
    ({ children }: { children: ReactNode }) => (
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    )

  return (
    <AnimationContext.Provider value={contextValue}>
      <MotionProvider>
        {children}
      </MotionProvider>
    </AnimationContext.Provider>
  )
}

// HOC for optimized animations
export function withOptimizedAnimations<P extends object>(
  Component: React.ComponentType<P>
) {
  const OptimizedComponent = (props: P) => {
    const { shouldReduceAnimations, animationQuality, isOptimized } = useAnimationContext()

    // If animations should be reduced, render without Framer Motion
    if (shouldReduceAnimations) {
      return <Component {...props} />
    }

    // Use appropriate motion component based on quality
    const MotionComponent = animationQuality === 'low' ? m.div : Component

    return <MotionComponent {...props} />
  }

  OptimizedComponent.displayName = `withOptimizedAnimations(${Component.displayName || Component.name})`
  return OptimizedComponent
}

// Custom hook for optimized motion values
export function useOptimizedMotionValue(
  baseValue: any,
  options: {
    reducedMotionValue?: any
    lowQualityValue?: any
    mediumQualityValue?: any
  } = {}
) {
  const { shouldReduceAnimations, animationQuality } = useAnimationContext()

  if (shouldReduceAnimations && options.reducedMotionValue !== undefined) {
    return options.reducedMotionValue
  }

  switch (animationQuality) {
    case 'low':
      return options.lowQualityValue || baseValue
    case 'medium':
      return options.mediumQualityValue || baseValue
    case 'high':
    default:
      return baseValue
  }
}

// Performance-aware animation wrapper
interface OptimizedMotionProps {
  children: ReactNode
  animation?: object
  reducedMotionAnimation?: object
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function OptimizedMotion({
  children,
  animation,
  reducedMotionAnimation,
  className,
  as = 'div',
  ...props
}: OptimizedMotionProps) {
  const { shouldReduceAnimations, animationQuality } = useAnimationContext()

  // Return static element if animations should be reduced
  if (shouldReduceAnimations) {
    const Element = as
    return (
      <Element className={className} {...props}>
        {children}
      </Element>
    )
  }

  // Use appropriate animation based on quality
  const finalAnimation = (() => {
    if (shouldReduceAnimations && reducedMotionAnimation) {
      return reducedMotionAnimation
    }
    
    if (animationQuality === 'low' && animation) {
      // Simplify animation for low quality
      return {
        ...animation,
        transition: {
          ...((animation as any).transition || {}),
          duration: ((animation as any).transition?.duration || 0.3) * 0.5
        }
      }
    }

    return animation
  })()

  const MotionElement = m[as as keyof typeof m] as any

  return (
    <MotionElement className={className} {...finalAnimation} {...props}>
      {children}
    </MotionElement>
  )
}

// Global performance styles injection
export function InjectPerformanceStyles() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      /* Performance optimization styles */
      .low-end-device * {
        will-change: auto !important;
      }
      
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      .performance-low * {
        animation-duration: 0.2s !important;
        transition-duration: 0.2s !important;
      }
      
      .performance-medium * {
        animation-duration: 0.4s !important;
        transition-duration: 0.4s !important;
      }
      
      .gpu-acceleration * {
        backface-visibility: hidden;
        perspective: 1000px;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return null
}