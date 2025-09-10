'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { PanInfo } from 'framer-motion'

interface TouchPosition {
  x: number
  y: number
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down' | null
  distance: number
  velocity: number
}

// Hook for swipe gestures
export function useSwipeGesture(
  onSwipe?: (gesture: SwipeGesture) => void,
  threshold = 50,
  velocityThreshold = 0.3
) {
  const [startPos, setStartPos] = useState<TouchPosition | null>(null)
  const [gesture, setGesture] = useState<SwipeGesture>({
    direction: null,
    distance: 0,
    velocity: 0
  })

  const handlePanStart = useCallback((event: any, info: PanInfo) => {
    setStartPos({ x: info.point.x, y: info.point.y })
  }, [])

  const handlePanEnd = useCallback((event: any, info: PanInfo) => {
    if (!startPos) return

    const deltaX = info.point.x - startPos.x
    const deltaY = info.point.y - startPos.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = Math.sqrt(info.velocity.x * info.velocity.x + info.velocity.y * info.velocity.y)

    let direction: SwipeGesture['direction'] = null

    if (distance > threshold || velocity > velocityThreshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }
    }

    const swipeGesture: SwipeGesture = {
      direction,
      distance,
      velocity
    }

    setGesture(swipeGesture)
    onSwipe?.(swipeGesture)
    setStartPos(null)
  }, [startPos, onSwipe, threshold, velocityThreshold])

  return {
    gesture,
    panProps: {
      onPanStart: handlePanStart,
      onPanEnd: handlePanEnd
    }
  }
}

// Hook for pinch/zoom gestures
export function usePinchGesture(
  onPinch?: (scale: number, velocity: number) => void,
  scaleThreshold = 0.1
) {
  const [isActive, setIsActive] = useState(false)
  const [scale, setScale] = useState(1)
  const initialDistance = useRef<number>(0)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      setIsActive(true)
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      initialDistance.current = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isActive || e.touches.length !== 2) return

    e.preventDefault()
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )

    const newScale = currentDistance / initialDistance.current
    
    if (Math.abs(newScale - 1) > scaleThreshold) {
      setScale(newScale)
      onPinch?.(newScale, newScale - scale)
    }
  }, [isActive, onPinch, scale, scaleThreshold])

  const handleTouchEnd = useCallback(() => {
    setIsActive(false)
    setScale(1)
    initialDistance.current = 0
  }, [])

  return {
    isActive,
    scale,
    touchProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  }
}

// Hook for long press gesture
export function useLongPress(
  onLongPress: () => void,
  delay = 500,
  shouldPreventDefault = true
) {
  const [isPressed, setIsPressed] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const preventRef = useRef<boolean>(shouldPreventDefault)

  const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (preventRef.current && 'preventDefault' in e) {
      e.preventDefault()
    }
    
    setIsPressed(true)
    timeoutRef.current = setTimeout(() => {
      onLongPress()
      setIsPressed(false)
    }, delay)
  }, [onLongPress, delay])

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    setIsPressed(false)
  }, [])

  return {
    isPressed,
    longPressProps: {
      onTouchStart: start,
      onTouchEnd: clear,
      onMouseDown: start,
      onMouseUp: clear,
      onMouseLeave: clear
    }
  }
}

// Hook for tap/click with touch feedback
export function useTapGesture(
  onTap?: () => void,
  doubleTapDelay = 300
) {
  const [tapCount, setTapCount] = useState(0)
  const [lastTap, setLastTap] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleTap = useCallback(() => {
    const now = Date.now()
    
    if (now - lastTap < doubleTapDelay) {
      // Double tap detected
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = undefined
      }
      setTapCount(2)
    } else {
      // Single tap - wait to see if double tap occurs
      setTapCount(1)
      timeoutRef.current = setTimeout(() => {
        onTap?.()
        setTapCount(0)
      }, doubleTapDelay)
    }
    
    setLastTap(now)
  }, [onTap, lastTap, doubleTapDelay])

  return {
    tapCount,
    handleTap
  }
}

// Hook for drag gesture with constraints
export function useDragGesture(
  constraints?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  },
  onDragEnd?: (info: PanInfo) => void
) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDrag = useCallback((event: any, info: PanInfo) => {
    setDragOffset({ x: info.offset.x, y: info.offset.y })
  }, [])

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    setIsDragging(false)
    onDragEnd?.(info)
  }, [onDragEnd])

  return {
    isDragging,
    dragOffset,
    dragProps: {
      drag: true,
      dragConstraints: constraints,
      dragElastic: 0.1,
      dragMomentum: false,
      onDragStart: handleDragStart,
      onDrag: handleDrag,
      onDragEnd: handleDragEnd,
      whileDrag: { scale: 1.05, cursor: 'grabbing' }
    }
  }
}

// Hook for touch-friendly carousel/slider
export function useCarouselGesture(
  itemCount: number,
  onIndexChange?: (index: number) => void
) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const { gesture, panProps } = useSwipeGesture(
    (swipeGesture) => {
      if (swipeGesture.direction === 'left' && currentIndex < itemCount - 1) {
        const newIndex = currentIndex + 1
        setCurrentIndex(newIndex)
        onIndexChange?.(newIndex)
      } else if (swipeGesture.direction === 'right' && currentIndex > 0) {
        const newIndex = currentIndex - 1
        setCurrentIndex(newIndex)
        onIndexChange?.(newIndex)
      }
    },
    80, // threshold
    0.4  // velocity threshold
  )

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < itemCount) {
      setCurrentIndex(index)
      onIndexChange?.(index)
    }
  }, [itemCount, onIndexChange])

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1)
  }, [currentIndex, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1)
  }, [currentIndex, goToSlide])

  return {
    currentIndex,
    isDragging,
    canGoNext: currentIndex < itemCount - 1,
    canGoPrev: currentIndex > 0,
    goToSlide,
    nextSlide,
    prevSlide,
    panProps: {
      ...panProps,
      onPanStart: (e: any, info: any) => {
        setIsDragging(true)
        panProps.onPanStart?.(e, info)
      },
      onPanEnd: (e: any, info: any) => {
        setIsDragging(false)
        panProps.onPanEnd?.(e, info)
      }
    }
  }
}

// Hook for pull-to-refresh gesture
export function usePullToRefresh(
  onRefresh: () => void | Promise<void>,
  threshold = 80
) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handlePullStart = useCallback((event: any, info: PanInfo) => {
    if (window.scrollY === 0 && info.delta.y > 0) {
      setIsPulling(true)
    }
  }, [])

  const handlePull = useCallback((event: any, info: PanInfo) => {
    if (isPulling && info.delta.y > 0) {
      setPullDistance(Math.min(info.delta.y, threshold * 1.5))
    }
  }, [isPulling, threshold])

  const handlePullEnd = useCallback(async (event: any, info: PanInfo) => {
    if (isPulling) {
      setIsPulling(false)
      
      if (pullDistance >= threshold) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }
      
      setPullDistance(0)
    }
  }, [isPulling, pullDistance, threshold, onRefresh])

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    canRefresh: pullDistance >= threshold,
    pullProgress: Math.min(pullDistance / threshold, 1),
    panProps: {
      onPanStart: handlePullStart,
      onPan: handlePull,
      onPanEnd: handlePullEnd
    }
  }
}