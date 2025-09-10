import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { GlobalStateProvider } from '@/providers/GlobalStateProvider'
import { OptimizedAnimationProvider } from '@/providers/OptimizedAnimationProvider'
import { ToastProvider } from '@/providers/ToastProvider'
import { LoadingProvider } from '@/providers/LoadingProvider'

// Custom render function with all providers
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <GlobalStateProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <OptimizedAnimationProvider enablePerformanceMonitoring={false} fallbackToCSS={true}>
          <LoadingProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LoadingProvider>
        </OptimizedAnimationProvider>
      </ThemeProvider>
    </GlobalStateProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => render(ui, { wrapper: AllTheProviders, ...options })

// Mock data for testing
export const mockProjects = [
  {
    id: '1',
    title: 'Test Project 1',
    description: 'A test project for unit testing',
    technologies: ['React', 'TypeScript', 'Jest'],
    imageUrl: '/test-image-1.jpg',
    githubUrl: 'https://github.com/test/project1',
    liveUrl: 'https://project1.test',
    featured: true,
    category: 'web',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Test Project 2',
    description: 'Another test project',
    technologies: ['Next.js', 'Tailwind CSS'],
    imageUrl: '/test-image-2.jpg',
    githubUrl: 'https://github.com/test/project2',
    featured: false,
    category: 'mobile',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
]

export const mockExperiences = [
  {
    id: '1',
    company: 'Test Company',
    position: 'Frontend Developer',
    description: 'Working on React applications',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2024-01-01'),
    technologies: ['React', 'TypeScript'],
    current: false,
  },
  {
    id: '2',
    company: 'Current Company',
    position: 'Full Stack Developer',
    description: 'Building full-stack applications',
    startDate: new Date('2024-01-01'),
    technologies: ['React', 'Node.js', 'PostgreSQL'],
    current: true,
  },
]

export const mockSkills = [
  {
    id: '1',
    name: 'React',
    category: 'frontend' as const,
    level: 90,
    icon: 'react-icon',
  },
  {
    id: '2',
    name: 'Node.js',
    category: 'backend' as const,
    level: 85,
    icon: 'node-icon',
  },
  {
    id: '3',
    name: 'PostgreSQL',
    category: 'database' as const,
    level: 80,
    icon: 'postgres-icon',
  },
]

export const mockUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: '/test-avatar.jpg',
  role: 'admin' as const,
}

export const mockContactMessage = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Test Subject',
  message: 'This is a test message',
  createdAt: new Date('2024-01-01'),
  status: 'unread' as const,
}

// Custom hooks for testing
export const useTestStore = () => {
  const store = require('@/stores/globalStore').useGlobalStore.getState()
  
  // Reset store before each test
  store.setProjects([])
  store.setExperiences([])
  store.setSkills([])
  store.setContactMessages([])
  store.setUser(null)
  store.setAuthenticated(false)
  store.setLoading(false)
  store.setError(null)
  
  return store
}

// Test utilities
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 100))

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.IntersectionObserver = mockIntersectionObserver
  window.IntersectionObserverEntry = jest.fn()
}

export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn()
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.ResizeObserver = mockResizeObserver
}

// Firebase test utilities
export const mockFirebaseAuth = () => {
  return {
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
  }
}

export const mockFirestore = () => {
  return {
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
  }
}

// Animation test utilities
export const disableAnimations = () => {
  const originalAnimate = Element.prototype.animate
  Element.prototype.animate = jest.fn().mockImplementation(() => ({
    finished: Promise.resolve(),
    cancel: jest.fn(),
    pause: jest.fn(),
    play: jest.fn(),
  }))
  return () => {
    Element.prototype.animate = originalAnimate
  }
}

// Error boundary test utility
export const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Form test utilities
export const fillForm = async (getByLabelText: any, formData: Record<string, string>) => {
  const { fireEvent } = await import('@testing-library/react')
  
  Object.entries(formData).forEach(([label, value]) => {
    const field = getByLabelText(new RegExp(label, 'i'))
    fireEvent.change(field, { target: { value } })
  })
}

export const submitForm = async (getByRole: any) => {
  const { fireEvent } = await import('@testing-library/react')
  const submitButton = getByRole('button', { name: /submit/i })
  fireEvent.click(submitButton)
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Override render method
export { customRender as render }