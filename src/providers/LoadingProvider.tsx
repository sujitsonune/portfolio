'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useGlobalStore } from '@/stores/globalStore'

interface LoadingContextType {
  isLoading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  withLoading: <T>(promise: Promise<T>) => Promise<T>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const { setLoading, setError } = useGlobalStore(state => ({
    setLoading: state.setLoading,
    setError: state.setError,
  }))
  
  const isLoading = useGlobalStore(state => state.ui.isLoading)
  const error = useGlobalStore(state => state.ui.error)

  const withLoading = async <T,>(promise: Promise<T>): Promise<T> => {
    try {
      setLoading(true)
      setError(null)
      const result = await promise
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const contextValue: LoadingContextType = {
    isLoading,
    error,
    setLoading,
    setError,
    withLoading,
  }

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}