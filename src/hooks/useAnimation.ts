'use client'

import { useInView, useAnimation, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useMediaQuery } from './useMediaQuery'

// Hook for scroll-triggered animations
export function useScrollAnimation(threshold = 0.1, once = true) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    threshold,
    once
  })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start('animate')
    } else if (!once) {
      controls.start('initial')
    }
  }, [isInView, controls, once])

  return { ref, controls, isInView }
}

// Hook for staggered animations
export function useStaggerAnimation(items: any[], delay = 0.1) {
  const controls = useAnimation()
  const [hasAnimated, setHasAnimated] = useState(false)

  const startAnimation = useCallback(() => {
    if (!hasAnimated) {
      controls.start((i) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * delay,
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }))
      setHasAnimated(true)
    }
  }, [controls, delay, hasAnimated])

  return { controls, startAnimation }
}

// Hook for parallax scrolling effects
export function useParallax(speed = 0.5) {
  const ref = useRef<HTMLElement>(null)
  const y = useMotionValue(0)
  const yRange = [-200, 200]
  const xRange = [0, 1]
  const opacity = useTransform(y, yRange, [0.3, 1])
  const scale = useTransform(y, yRange, [1.2, 1])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const updateY = () => {
      if (element) {
        const rect = element.getBoundingClientRect()
        const scrollY = window.scrollY
        const elementTop = rect.top + scrollY
        const windowHeight = window.innerHeight
        
        // Calculate the scroll progress for this element
        const progress = (scrollY - elementTop + windowHeight) / (windowHeight + rect.height)
        const clampedProgress = Math.max(0, Math.min(1, progress))
        
        y.set((clampedProgress - 0.5) * speed * 200)
      }
    }

    window.addEventListener('scroll', updateY, { passive: true })
    updateY() // Initial call

    return () => window.removeEventListener('scroll', updateY)
  }, [y, speed])

  return { ref, y, opacity, scale }
}

// Hook for typewriter effect
export function useTypewriter(text: string, speed = 50, startDelay = 0) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, currentIndex === 0 ? startDelay : speed)

      return () => clearTimeout(timer)
    } else {
      setIsComplete(true)
    }
  }, [currentIndex, text, speed, startDelay])

  const restart = useCallback(() => {
    setDisplayedText('')
    setCurrentIndex(0)
    setIsComplete(false)
  }, [])

  return { displayedText, isComplete, restart }
}

// Hook for mouse tracking animations
export function useMouseTracking(ref: React.RefObject<HTMLElement>) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [30, -30])
  const rotateY = useTransform(x, [-100, 100], [-30, 30])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      x.set(e.clientX - centerX)
      y.set(e.clientY - centerY)
    }

    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [x, y])

  return { rotateX, rotateY }
}

// Hook for page transitions
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const controls = useAnimation()

  const startTransition = useCallback(async () => {
    setIsTransitioning(true)
    await controls.start({
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3, ease: 'easeInOut' }
    })
  }, [controls])

  const endTransition = useCallback(async () => {
    await controls.start({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    })
    setIsTransitioning(false)
  }, [controls])

  return { isTransitioning, controls, startTransition, endTransition }
}

// Hook for responsive animations based on device type
export function useResponsiveAnimation() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const getAnimationProps = useCallback((baseProps: any) => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.1 }
      }
    }

    if (isMobile) {
      return {
        ...baseProps,
        transition: {
          ...baseProps.transition,
          duration: (baseProps.transition?.duration || 0.3) * 0.8
        }
      }
    }

    return baseProps
  }, [isMobile, prefersReducedMotion])

  const getStaggerDelay = useCallback((index: number) => {
    if (prefersReducedMotion) return 0
    if (isMobile) return index * 0.05
    return index * 0.1
  }, [isMobile, prefersReducedMotion])

  return { 
    isMobile, 
    isTablet, 
    prefersReducedMotion, 
    getAnimationProps, 
    getStaggerDelay 
  }
}

// Hook for intersection observer with custom callback
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '0px',
      ...options
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
      observer.disconnect()
    }
  }, [callback, options])

  return ref
}

// Hook for scroll progress indicator
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollProgress = scrollTop / docHeight
      setProgress(scrollProgress)
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress() // Initial call

    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return progress
}

// Hook for element visibility tracking
export function useElementVisibility(threshold = 0.5) {
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
      observer.disconnect()
    }
  }, [threshold])

  return { ref, isVisible }
}

// Hook for animated counter
export function useAnimatedCounter(end: number, duration = 2000, startDelay = 0) {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const start = useCallback(() => {
    setIsAnimating(true)
    
    const startTime = Date.now() + startDelay
    const animate = () => {
      const now = Date.now()
      if (now < startTime) {
        requestAnimationFrame(animate)
        return
      }

      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const value = Math.floor(easeOut * end)
      
      setCurrent(value)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }
    
    requestAnimationFrame(animate)
  }, [end, duration, startDelay])

  return { current, start, isAnimating }
}