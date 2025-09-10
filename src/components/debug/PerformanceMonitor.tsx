'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePerformanceMonitor, useDeviceCapabilities } from '@/utils/performanceOptimization'

interface PerformanceMonitorProps {
  show?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
}

export function PerformanceMonitor({ 
  show = false, 
  position = 'top-right',
  className 
}: PerformanceMonitorProps) {
  const { metrics, trackAnimation } = usePerformanceMonitor()
  const deviceCapabilities = useDeviceCapabilities()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!show) return null

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  const getStatusColor = (value: number, thresholds: [number, number]) => {
    if (value >= thresholds[1]) return 'text-red-500'
    if (value >= thresholds[0]) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed ${positionClasses[position]} z-50 bg-black/90 backdrop-blur-sm text-white rounded-lg shadow-xl border border-white/20 ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {/* Compact View */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-white/90">Performance</h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/60 hover:text-white text-xs"
            >
              {isExpanded ? '−' : '+'}
            </button>
          </div>

          {/* Key Metrics */}
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-white/70">FPS:</span>
              <span className={getStatusColor(60 - metrics.fps, [10, 30])}>
                {metrics.fps}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Memory:</span>
              <span className={getStatusColor(metrics.memoryUsage, [60, 80])}>
                {metrics.memoryUsage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Animations:</span>
              <span className={getStatusColor(metrics.animationCount, [5, 10])}>
                {metrics.animationCount}
              </span>
            </div>
          </div>

          {/* Performance Status */}
          <div className="mt-2 pt-2 border-t border-white/20">
            <div className="flex items-center space-x-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  metrics.isOverloaded ? 'bg-red-500' : 'bg-green-500'
                }`}
              />
              <span className="text-xs text-white/80">
                {metrics.isOverloaded ? 'Overloaded' : 'Optimal'}
              </span>
            </div>
          </div>

          {/* Expanded View */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-white/20 space-y-3">
                  {/* Device Capabilities */}
                  <div>
                    <h4 className="text-xs font-medium text-white/90 mb-1">Device</h4>
                    <div className="text-xs text-white/70 space-y-1">
                      <div>Memory: {deviceCapabilities.deviceMemory || 'Unknown'} GB</div>
                      <div>Connection: {deviceCapabilities.connection || 'Unknown'}</div>
                      <div>Low-end: {deviceCapabilities.isLowEndDevice ? 'Yes' : 'No'}</div>
                      <div>GPU Accel: {deviceCapabilities.enableGPUAcceleration ? 'Yes' : 'No'}</div>
                      <div>Reduced Motion: {deviceCapabilities.prefersReducedMotion ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  {/* Performance Recommendations */}
                  <div>
                    <h4 className="text-xs font-medium text-white/90 mb-1">Recommendations</h4>
                    <div className="text-xs text-white/70 space-y-1">
                      {metrics.fps < 30 && (
                        <div className="text-yellow-400">• Reduce animation complexity</div>
                      )}
                      {metrics.memoryUsage > 80 && (
                        <div className="text-red-400">• High memory usage detected</div>
                      )}
                      {metrics.animationCount > 10 && (
                        <div className="text-yellow-400">• Too many concurrent animations</div>
                      )}
                      {deviceCapabilities.isLowEndDevice && (
                        <div className="text-blue-400">• Using optimized animations</div>
                      )}
                      {!metrics.isOverloaded && (
                        <div className="text-green-400">• Performance is optimal</div>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div>
                    <h4 className="text-xs font-medium text-white/90 mb-1">Controls</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          // Force garbage collection if available
                          if ((window as any).gc) {
                            (window as any).gc()
                          }
                        }}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-xs rounded"
                      >
                        GC
                      </button>
                      <button
                        onClick={() => {
                          // Reset animation tracking
                          trackAnimation(false)
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-xs rounded"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Development-only performance overlay
export function DevPerformanceOverlay() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Ctrl/Cmd + Shift + P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setShow(!show)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [show])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <>
      <PerformanceMonitor show={show} />
      {!show && (
        <div className="fixed bottom-4 left-4 text-xs text-gray-500 pointer-events-none">
          Press Ctrl+Shift+P to show performance monitor
        </div>
      )}
    </>
  )
}

// Performance warning component
interface PerformanceWarningProps {
  threshold?: number
  children?: React.ReactNode
}

export function PerformanceWarning({ 
  threshold = 30, 
  children 
}: PerformanceWarningProps) {
  const { metrics } = usePerformanceMonitor()
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    const shouldShow = metrics.fps < threshold || metrics.isOverloaded
    setShowWarning(shouldShow)
  }, [metrics, threshold])

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">
              {children || `Low performance detected (${metrics.fps} FPS)`}
            </span>
            <button
              onClick={() => setShowWarning(false)}
              className="ml-2 text-yellow-600 hover:text-yellow-800"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}