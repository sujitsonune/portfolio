'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// Performance optimization utilities for animations
export interface PerformanceConfig {
  prefersReducedMotion: boolean
  deviceMemory?: number
  connection?: string
  isLowEndDevice: boolean
  enableGPUAcceleration: boolean
}

// Detect device capabilities
export function useDeviceCapabilities(): PerformanceConfig {
  const [config, setConfig] = useState<PerformanceConfig>({
    prefersReducedMotion: false,
    isLowEndDevice: false,
    enableGPUAcceleration: true
  })

  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    // Detect device memory (Chrome only)
    const deviceMemory = (navigator as any).deviceMemory || 4

    // Detect connection quality
    const connection = (navigator as any).connection
    const connectionType = connection?.effectiveType || 'unknown'

    // Determine if it's a low-end device
    const isLowEndDevice = deviceMemory <= 2 || 
                          connectionType === 'slow-2g' || 
                          connectionType === '2g' ||
                          /Android.*4\.[0-3]|iPhone.*OS [5-8]/.test(navigator.userAgent)

    // Enable GPU acceleration on capable devices
    const enableGPUAcceleration = deviceMemory >= 4 && 
                                 !isLowEndDevice && 
                                 !prefersReducedMotion

    setConfig({
      prefersReducedMotion,
      deviceMemory,
      connection: connectionType,
      isLowEndDevice,
      enableGPUAcceleration
    })
  }, [prefersReducedMotion])

  return config
}

// Animation performance optimizer
export function useOptimizedAnimation(baseConfig: any) {
  const performance = useDeviceCapabilities()

  return useCallback((animationConfig: any) => {
    if (performance.prefersReducedMotion) {
      return {
        ...animationConfig,
        transition: {
          ...animationConfig.transition,
          duration: 0.01,
          ease: 'linear'
        }
      }
    }

    if (performance.isLowEndDevice) {
      return {
        ...animationConfig,
        transition: {
          ...animationConfig.transition,
          duration: (animationConfig.transition?.duration || 0.3) * 0.5,
          ease: 'easeOut'
        }
      }
    }

    // Add GPU acceleration for capable devices
    if (performance.enableGPUAcceleration && animationConfig.animate) {
      const gpuProps = ['x', 'y', 'scale', 'rotate', 'opacity']
      const hasGPUProps = Object.keys(animationConfig.animate).some(key => 
        gpuProps.includes(key)
      )

      if (hasGPUProps) {
        return {
          ...animationConfig,
          style: {
            ...animationConfig.style,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            perspective: 1000
          }
        }
      }
    }

    return animationConfig
  }, [performance])
}

// Intersection observer with performance optimization
export function useOptimizedIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  const performance = useDeviceCapabilities()
  
  // Reduce threshold on low-end devices
  const optimizedOptions = {
    ...options,
    threshold: performance.isLowEndDevice ? 0.1 : (options.threshold || 0.2),
    rootMargin: options.rootMargin || '50px'
  }

  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementsRef = useRef<Set<Element>>(new Set())

  const observe = useCallback((element: Element) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(callback, optimizedOptions)
    }
    
    observerRef.current.observe(element)
    elementsRef.current.add(element)
  }, [callback, optimizedOptions])

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element)
      elementsRef.current.delete(element)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      elementsRef.current.clear()
      observerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return { observe, unobserve, disconnect }
}

// Frame rate monitor
export function useFrameRate(callback?: (fps: number) => void) {
  const [fps, setFps] = useState(60)
  const frameRef = useRef<number>()
  const lastTimeRef = useRef(performance.now())
  const frameCountRef = useRef(0)

  useEffect(() => {
    const measureFrameRate = () => {
      const currentTime = performance.now()
      frameCountRef.current++

      if (currentTime >= lastTimeRef.current + 1000) {
        const currentFps = Math.round(
          (frameCountRef.current * 1000) / (currentTime - lastTimeRef.current)
        )
        setFps(currentFps)
        if (callback) callback(currentFps)
        
        frameCountRef.current = 0
        lastTimeRef.current = currentTime
      }

      frameRef.current = requestAnimationFrame(measureFrameRate)
    }

    frameRef.current = requestAnimationFrame(measureFrameRate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [callback])

  return fps
}

// Animation queue to prevent too many animations running simultaneously
class AnimationQueue {
  private queue: Array<() => Promise<void>> = []
  private running = false
  private maxConcurrent = 3

  async add(animationFn: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await animationFn()
          resolve()
        } catch (error) {
          reject(error)
        }
      })

      if (!this.running) {
        this.process()
      }
    })
  }

  private async process() {
    if (this.queue.length === 0) {
      this.running = false
      return
    }

    this.running = true
    const concurrent = this.queue.splice(0, this.maxConcurrent)
    
    await Promise.all(concurrent.map(fn => fn()))
    
    // Continue processing if there are more items
    if (this.queue.length > 0) {
      this.process()
    } else {
      this.running = false
    }
  }
}

export const animationQueue = new AnimationQueue()

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    animationCount: 0,
    isOverloaded: false
  })

  const animationCountRef = useRef(0)
  const frameRate = useFrameRate()

  useEffect(() => {
    const updateMetrics = () => {
      const memory = (performance as any).memory
      const memoryUsage = memory ? memory.usedJSHeapSize / memory.jsHeapSizeLimit : 0
      
      setMetrics(prev => ({
        fps: frameRate,
        memoryUsage: memoryUsage * 100,
        animationCount: animationCountRef.current,
        isOverloaded: frameRate < 30 || memoryUsage > 0.8 || animationCountRef.current > 10
      }))
    }

    const interval = setInterval(updateMetrics, 1000)
    return () => clearInterval(interval)
  }, [frameRate])

  const trackAnimation = useCallback((isActive: boolean) => {
    if (isActive) {
      animationCountRef.current++
    } else {
      animationCountRef.current = Math.max(0, animationCountRef.current - 1)
    }
  }, [])

  return { metrics, trackAnimation }
}

// Optimized animation wrapper
export function withPerformanceOptimization<T extends object>(
  Component: React.ComponentType<T>
) {
  const OptimizedComponent = (props: T) => {
    const { metrics } = usePerformanceMonitor()
    const performance = useDeviceCapabilities()

    // Skip animations if performance is poor
    if (metrics.isOverloaded || performance.isLowEndDevice) {
      return <Component {...props} />
    }

    return <Component {...props} />
  }

  OptimizedComponent.displayName = `withPerformanceOptimization(${Component.displayName || Component.name})`
  return OptimizedComponent
}

// CSS-based animation fallbacks for low-end devices
export const getCSSAnimationClass = (animationType: string, isLowEnd: boolean) => {
  if (isLowEnd) {
    return {
      fadeIn: 'animate-none opacity-100',
      slideUp: 'animate-none translate-y-0',
      scale: 'animate-none scale-100'
    }[animationType] || 'animate-none'
  }

  return {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    scale: 'animate-scale-in'
  }[animationType] || ''
}

// Debounced scroll handler for performance
export function useOptimizedScroll(
  callback: (scrollY: number) => void,
  delay = 16 // ~60fps
) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const performance = useDeviceCapabilities()

  // Increase delay on low-end devices
  const optimizedDelay = performance.isLowEndDevice ? delay * 2 : delay

  useEffect(() => {
    const handleScroll = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(window.scrollY)
      }, optimizedDelay)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [callback, optimizedDelay])
}