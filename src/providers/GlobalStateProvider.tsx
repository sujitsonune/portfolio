'use client'

import { ReactNode } from 'react'
import { useGlobalStore } from '@/stores/globalStore'

interface GlobalStateProviderProps {
  children: ReactNode
}

export function GlobalStateProvider({ children }: GlobalStateProviderProps) {
  return <>{children}</>
}

// Hook for accessing store outside of React components
export const getGlobalStore = () => useGlobalStore.getState()

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Make store available in browser console for debugging
  if (typeof window !== 'undefined') {
    (window as any).store = useGlobalStore
  }
}