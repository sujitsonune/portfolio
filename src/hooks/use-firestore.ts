'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  UseFirestoreReturn,
  UseFirestoreCollectionReturn,
  FilterOptions,
  SortOptions,
  PersonalInfo,
  WorkExperience,
  Project,
  Skill,
  Achievement,
  Testimonial,
  EnhancedFirebaseError,
} from '@/types'
import {
  personalInfoServiceInstance,
  workExperienceService,
  projectsServiceInstance,
  skillsServiceInstance,
  achievementsService,
  testimonialsService,
} from '@/lib/firebase-services'
import { ErrorHandler, useErrorHandler } from '@/lib/error-handling'

// Generic Firestore document hook
export function useFirestoreDocument<T>(
  getDocument: () => Promise<T | null>,
  dependencies: any[] = []
): UseFirestoreReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { handleAsyncError } = useErrorHandler()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: result, error: err } = await handleAsyncError(getDocument, 'useFirestoreDocument')
    
    if (err) {
      setError(err.userMessage)
      if (ErrorHandler.shouldShowErrorToUser(err)) {
        console.error('Document fetch error:', err)
      }
    } else {
      setData(result)
    }
    
    setLoading(false)
  }, [getDocument, handleAsyncError])

  useEffect(() => {
    fetchData()
  }, dependencies)

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

// Generic Firestore collection hook
export function useFirestoreCollection<T>(
  getCollection: () => Promise<T[]>,
  dependencies: any[] = []
): UseFirestoreCollectionReturn<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const { handleAsyncError } = useErrorHandler()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: result, error: err } = await handleAsyncError(getCollection, 'useFirestoreCollection')
    
    if (err) {
      setError(err.userMessage)
      if (ErrorHandler.shouldShowErrorToUser(err)) {
        console.error('Collection fetch error:', err)
      }
    } else {
      setData(result || [])
    }
    
    setLoading(false)
  }, [getCollection, handleAsyncError])

  useEffect(() => {
    fetchData()
  }, dependencies)

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  // Placeholder for load more functionality
  const loadMore = useCallback(() => {
    // This would be implemented based on pagination requirements
    console.log('Load more functionality not implemented yet')
  }, [])

  return { data, loading, error, refetch, hasMore, loadMore }
}

// Real-time Firestore collection hook
export function useFirestoreCollectionRealtime<T extends { id: string }>(
  service: any,
  filters?: FilterOptions,
  sort?: SortOptions
): UseFirestoreCollectionReturn<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    // Set up real-time listener
    const unsubscribe = service.onSnapshot(
      (newData: T[]) => {
        setData(newData)
        setLoading(false)
        setError(null)
      },
      (err: EnhancedFirebaseError) => {
        setError(err.userMessage)
        setLoading(false)
        if (ErrorHandler.shouldShowErrorToUser(err)) {
          console.error('Real-time listener error:', err)
        }
      },
      filters,
      sort
    )

    unsubscribeRef.current = unsubscribe

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [service, JSON.stringify(filters), JSON.stringify(sort)])

  const refetch = useCallback(() => {
    // For real-time hooks, refetch is handled automatically
    // But we can force a refresh by resubscribing
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }
    setLoading(true)
  }, [])

  const loadMore = useCallback(() => {
    console.log('Load more functionality for real-time not implemented yet')
  }, [])

  return { data, loading, error, refetch, hasMore, loadMore }
}

// Specialized hooks for each data type

// Personal Info hooks
export function usePersonalInfo(): UseFirestoreReturn<PersonalInfo> {
  return useFirestoreDocument(
    () => personalInfoServiceInstance.getActive(),
    []
  )
}

export function usePersonalInfoRealtime(): UseFirestoreReturn<PersonalInfo> {
  const [data, setData] = useState<PersonalInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = personalInfoServiceInstance.onSnapshot(
      (personalInfos) => {
        const activeInfo = personalInfos.find(info => info.isActive) || null
        setData(activeInfo)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.userMessage)
        setLoading(false)
      },
      { visible: true }
    )

    return unsubscribe
  }, [])

  const refetch = useCallback(() => {
    setLoading(true)
  }, [])

  return { data, loading, error, refetch }
}

// Work Experience hooks
export function useWorkExperience(): UseFirestoreCollectionReturn<WorkExperience> {
  return useFirestoreCollectionRealtime(
    workExperienceService,
    { visible: true },
    { field: 'duration.startDate', direction: 'desc' }
  )
}

export function useWorkExperienceVisible(): UseFirestoreCollectionReturn<WorkExperience> {
  return useFirestoreCollection(
    () => workExperienceService.getAll(
      { visible: true },
      { field: 'duration.startDate', direction: 'desc' }
    ),
    []
  )
}

// Projects hooks
export function useProjects(
  filters?: FilterOptions,
  sort?: SortOptions
): UseFirestoreCollectionReturn<Project> {
  return useFirestoreCollectionRealtime(projectsServiceInstance, filters, sort)
}

export function useFeaturedProjects(): UseFirestoreCollectionReturn<Project> {
  return useFirestoreCollection(
    () => projectsServiceInstance.getFeatured(),
    []
  )
}

export function useProjectsByCategory(category: string): UseFirestoreCollectionReturn<Project> {
  return useFirestoreCollection(
    () => projectsServiceInstance.getByCategory(category),
    [category]
  )
}

export function useProject(id: string): UseFirestoreReturn<Project> {
  return useFirestoreDocument(
    () => projectsServiceInstance.getById(id),
    [id]
  )
}

// Skills hooks
export function useSkills(
  filters?: FilterOptions,
  sort?: SortOptions
): UseFirestoreCollectionReturn<Skill> {
  return useFirestoreCollectionRealtime(skillsServiceInstance, filters, sort)
}

export function useSkillsByCategory(category: string): UseFirestoreCollectionReturn<Skill> {
  return useFirestoreCollection(
    () => skillsServiceInstance.getByCategory(category),
    [category]
  )
}

export function useTopSkills(limit: number = 10): UseFirestoreCollectionReturn<Skill> {
  return useFirestoreCollection(
    () => skillsServiceInstance.getTopSkills(limit),
    [limit]
  )
}

export function useSkillsVisible(): UseFirestoreCollectionReturn<Skill> {
  return useFirestoreCollection(
    () => skillsServiceInstance.getAll(
      { visible: true },
      { field: 'order', direction: 'asc' }
    ),
    []
  )
}

// Achievements hooks
export function useAchievements(
  filters?: FilterOptions,
  sort?: SortOptions
): UseFirestoreCollectionReturn<Achievement> {
  return useFirestoreCollectionRealtime(
    achievementsService,
    filters,
    sort || { field: 'date', direction: 'desc' }
  )
}

export function useAchievementsVisible(): UseFirestoreCollectionReturn<Achievement> {
  return useFirestoreCollection(
    () => achievementsService.getAll(
      { visible: true },
      { field: 'date', direction: 'desc' }
    ),
    []
  )
}

// Testimonials hooks
export function useTestimonials(
  filters?: FilterOptions,
  sort?: SortOptions
): UseFirestoreCollectionReturn<Testimonial> {
  return useFirestoreCollectionRealtime(
    testimonialsService,
    filters,
    sort || { field: 'order', direction: 'asc' }
  )
}

export function useTestimonialsVisible(): UseFirestoreCollectionReturn<Testimonial> {
  return useFirestoreCollection(
    () => testimonialsService.getAll(
      { visible: true },
      { field: 'order', direction: 'asc' }
    ),
    []
  )
}

// Combined hooks for portfolio sections
export function usePortfolioData() {
  const personalInfo = usePersonalInfo()
  const workExperience = useWorkExperienceVisible()
  const featuredProjects = useFeaturedProjects()
  const skills = useSkillsVisible()
  const achievements = useAchievementsVisible()
  const testimonials = useTestimonialsVisible()

  const loading = 
    personalInfo.loading ||
    workExperience.loading ||
    featuredProjects.loading ||
    skills.loading ||
    achievements.loading ||
    testimonials.loading

  const error = 
    personalInfo.error ||
    workExperience.error ||
    featuredProjects.error ||
    skills.error ||
    achievements.error ||
    testimonials.error

  const refetchAll = useCallback(() => {
    personalInfo.refetch()
    workExperience.refetch()
    featuredProjects.refetch()
    skills.refetch()
    achievements.refetch()
    testimonials.refetch()
  }, [personalInfo, workExperience, featuredProjects, skills, achievements, testimonials])

  return {
    data: {
      personalInfo: personalInfo.data,
      workExperience: workExperience.data,
      featuredProjects: featuredProjects.data,
      skills: skills.data,
      achievements: achievements.data,
      testimonials: testimonials.data,
    },
    loading,
    error,
    refetch: refetchAll,
  }
}

// Pagination hook
export function usePagination<T>(
  fetchFunction: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean }>,
  initialLimit: number = 10
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [limit] = useState(initialLimit)
  const { handleAsyncError } = useErrorHandler()

  const loadData = useCallback(async (pageNum: number, append: boolean = false) => {
    setLoading(true)
    setError(null)

    const { data: result, error: err } = await handleAsyncError(
      () => fetchFunction(pageNum, limit),
      'usePagination'
    )

    if (err) {
      setError(err.userMessage)
    } else if (result) {
      setData(prev => append ? [...prev, ...result.data] : result.data)
      setHasMore(result.hasMore)
      setPage(pageNum)
    }

    setLoading(false)
  }, [fetchFunction, limit, handleAsyncError])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadData(page + 1, true)
    }
  }, [loading, hasMore, page, loadData])

  const refetch = useCallback(() => {
    loadData(1, false)
  }, [loadData])

  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
  }
}

// Search hook
export function useSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  debounceMs: number = 300
) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { handleAsyncError } = useErrorHandler()
  const timeoutRef = useRef<NodeJS.Timeout>()

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data: result, error: err } = await handleAsyncError(
      () => searchFunction(searchQuery),
      'useSearch'
    )

    if (err) {
      setError(err.userMessage)
      setResults([])
    } else {
      setResults(result || [])
    }

    setLoading(false)
  }, [searchFunction, handleAsyncError])

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      search(query)
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query, search, debounceMs])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
  }
}