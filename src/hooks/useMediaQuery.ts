'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Initial check
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    mediaQuery.addListener(handleChange)

    return () => mediaQuery.removeListener(handleChange)
  }, [query])

  return matches
}

// Predefined breakpoints hook
export function useBreakpoint() {
  const isXs = useMediaQuery('(max-width: 480px)')
  const isSm = useMediaQuery('(max-width: 640px)')
  const isMd = useMediaQuery('(max-width: 768px)')
  const isLg = useMediaQuery('(max-width: 1024px)')
  const isXl = useMediaQuery('(max-width: 1280px)')
  const is2Xl = useMediaQuery('(min-width: 1536px)')

  const isSmUp = useMediaQuery('(min-width: 641px)')
  const isMdUp = useMediaQuery('(min-width: 769px)')
  const isLgUp = useMediaQuery('(min-width: 1025px)')
  const isXlUp = useMediaQuery('(min-width: 1281px)')

  return {
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
    isMobile: isMd,
    isTablet: isLg && !isMd,
    isDesktop: isLgUp
  }
}

// Device type detection
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth
      const isTouchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      setIsTouchDevice(isTouchSupported)

      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)

    return () => window.removeEventListener('resize', checkDeviceType)
  }, [])

  return { deviceType, isTouchDevice }
}

// Orientation detection
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)

    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  return orientation
}

// Viewport dimensions hook
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  })

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  return viewport
}

// Responsive values hook
export function useResponsiveValue<T>(
  values: {
    xs?: T
    sm?: T
    md?: T
    lg?: T
    xl?: T
    '2xl'?: T
  },
  defaultValue: T
): T {
  const { isXs, isSm, isMd, isLg, isXl, is2Xl } = useBreakpoint()

  if (is2Xl && values['2xl'] !== undefined) return values['2xl']
  if (isXl && values.xl !== undefined) return values.xl
  if (isLg && values.lg !== undefined) return values.lg
  if (isMd && values.md !== undefined) return values.md
  if (isSm && values.sm !== undefined) return values.sm
  if (isXs && values.xs !== undefined) return values.xs

  return defaultValue
}