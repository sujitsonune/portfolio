'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'

// Types
export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  role: 'admin' | 'user'
}

export interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  imageUrl: string
  githubUrl?: string
  liveUrl?: string
  featured: boolean
  category: string
  createdAt: Date
  updatedAt: Date
}

export interface Experience {
  id: string
  company: string
  position: string
  description: string
  startDate: Date
  endDate?: Date
  technologies: string[]
  current: boolean
}

export interface Skill {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'database' | 'tools' | 'other'
  level: number
  icon?: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: Date
  status: 'unread' | 'read' | 'replied'
}

export interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  searchOpen: boolean
  searchQuery: string
  isLoading: boolean
  error: string | null
}

export interface GlobalState {
  // User state
  user: User | null
  isAuthenticated: boolean
  
  // Content data
  projects: Project[]
  experiences: Experience[]
  skills: Skill[]
  contactMessages: ContactMessage[]
  
  // UI state
  ui: UIState
  
  // Actions
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  
  // Project actions
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  
  // Experience actions
  setExperiences: (experiences: Experience[]) => void
  addExperience: (experience: Experience) => void
  updateExperience: (id: string, updates: Partial<Experience>) => void
  deleteExperience: (id: string) => void
  
  // Skill actions
  setSkills: (skills: Skill[]) => void
  addSkill: (skill: Skill) => void
  updateSkill: (id: string, updates: Partial<Skill>) => void
  deleteSkill: (id: string) => void
  
  // Contact message actions
  setContactMessages: (messages: ContactMessage[]) => void
  addContactMessage: (message: ContactMessage) => void
  updateContactMessage: (id: string, updates: Partial<ContactMessage>) => void
  deleteContactMessage: (id: string) => void
  
  // UI actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Computed getters
  getFeaturedProjects: () => Project[]
  getProjectsByCategory: (category: string) => Project[]
  getSkillsByCategory: (category: string) => Skill[]
  getCurrentExperience: () => Experience | null
  getUnreadMessages: () => ContactMessage[]
}

const initialUIState: UIState = {
  theme: 'system',
  sidebarOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  searchQuery: '',
  isLoading: false,
  error: null,
}

export const useGlobalStore = create<GlobalState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        projects: [],
        experiences: [],
        skills: [],
        contactMessages: [],
        ui: initialUIState,

        // User actions
        setUser: (user) => {
          set((state) => {
            state.user = user
            state.isAuthenticated = !!user
          })
        },

        setAuthenticated: (authenticated) => {
          set((state) => {
            state.isAuthenticated = authenticated
            if (!authenticated) {
              state.user = null
            }
          })
        },

        // Project actions
        setProjects: (projects) => {
          set((state) => {
            state.projects = projects
          })
        },

        addProject: (project) => {
          set((state) => {
            state.projects.push(project)
          })
        },

        updateProject: (id, updates) => {
          set((state) => {
            const index = state.projects.findIndex(p => p.id === id)
            if (index !== -1) {
              state.projects[index] = { ...state.projects[index], ...updates }
            }
          })
        },

        deleteProject: (id) => {
          set((state) => {
            state.projects = state.projects.filter(p => p.id !== id)
          })
        },

        // Experience actions
        setExperiences: (experiences) => {
          set((state) => {
            state.experiences = experiences
          })
        },

        addExperience: (experience) => {
          set((state) => {
            state.experiences.push(experience)
          })
        },

        updateExperience: (id, updates) => {
          set((state) => {
            const index = state.experiences.findIndex(e => e.id === id)
            if (index !== -1) {
              state.experiences[index] = { ...state.experiences[index], ...updates }
            }
          })
        },

        deleteExperience: (id) => {
          set((state) => {
            state.experiences = state.experiences.filter(e => e.id !== id)
          })
        },

        // Skill actions
        setSkills: (skills) => {
          set((state) => {
            state.skills = skills
          })
        },

        addSkill: (skill) => {
          set((state) => {
            state.skills.push(skill)
          })
        },

        updateSkill: (id, updates) => {
          set((state) => {
            const index = state.skills.findIndex(s => s.id === id)
            if (index !== -1) {
              state.skills[index] = { ...state.skills[index], ...updates }
            }
          })
        },

        deleteSkill: (id) => {
          set((state) => {
            state.skills = state.skills.filter(s => s.id !== id)
          })
        },

        // Contact message actions
        setContactMessages: (messages) => {
          set((state) => {
            state.contactMessages = messages
          })
        },

        addContactMessage: (message) => {
          set((state) => {
            state.contactMessages.push(message)
          })
        },

        updateContactMessage: (id, updates) => {
          set((state) => {
            const index = state.contactMessages.findIndex(m => m.id === id)
            if (index !== -1) {
              state.contactMessages[index] = { ...state.contactMessages[index], ...updates }
            }
          })
        },

        deleteContactMessage: (id) => {
          set((state) => {
            state.contactMessages = state.contactMessages.filter(m => m.id !== id)
          })
        },

        // UI actions
        setTheme: (theme) => {
          set((state) => {
            state.ui.theme = theme
          })
        },

        setSidebarOpen: (open) => {
          set((state) => {
            state.ui.sidebarOpen = open
          })
        },

        setMobileMenuOpen: (open) => {
          set((state) => {
            state.ui.mobileMenuOpen = open
          })
        },

        setSearchOpen: (open) => {
          set((state) => {
            state.ui.searchOpen = open
          })
        },

        setSearchQuery: (query) => {
          set((state) => {
            state.ui.searchQuery = query
          })
        },

        setLoading: (loading) => {
          set((state) => {
            state.ui.isLoading = loading
          })
        },

        setError: (error) => {
          set((state) => {
            state.ui.error = error
          })
        },

        // Computed getters
        getFeaturedProjects: () => {
          const state = get()
          return state.projects.filter(project => project.featured)
        },

        getProjectsByCategory: (category) => {
          const state = get()
          return state.projects.filter(project => project.category === category)
        },

        getSkillsByCategory: (category) => {
          const state = get()
          return state.skills.filter(skill => skill.category === category)
        },

        getCurrentExperience: () => {
          const state = get()
          return state.experiences.find(exp => exp.current) || null
        },

        getUnreadMessages: () => {
          const state = get()
          return state.contactMessages.filter(msg => msg.status === 'unread')
        },
      })),
      {
        name: 'portfolio-global-state',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist certain parts of the state
          ui: {
            theme: state.ui.theme,
            sidebarOpen: state.ui.sidebarOpen,
          },
        }),
        version: 1,
        migrate: (persistedState: any, version: number) => {
          // Handle state migration for version updates
          if (version === 0) {
            // Migration from version 0 to 1
            return {
              ...persistedState,
              ui: {
                ...initialUIState,
                ...persistedState.ui,
              }
            }
          }
          return persistedState
        },
      }
    ),
    {
      name: 'portfolio-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)

// Selectors for optimized component re-renders
export const useUser = () => useGlobalStore(state => state.user)
export const useIsAuthenticated = () => useGlobalStore(state => state.isAuthenticated)
export const useProjects = () => useGlobalStore(state => state.projects)
export const useFeaturedProjects = () => useGlobalStore(state => state.getFeaturedProjects())
export const useExperiences = () => useGlobalStore(state => state.experiences)
export const useSkills = () => useGlobalStore(state => state.skills)
export const useContactMessages = () => useGlobalStore(state => state.contactMessages)
export const useUnreadMessages = () => useGlobalStore(state => state.getUnreadMessages())
export const useUI = () => useGlobalStore(state => state.ui)
export const useTheme = () => useGlobalStore(state => state.ui.theme)
export const useIsLoading = () => useGlobalStore(state => state.ui.isLoading)
export const useError = () => useGlobalStore(state => state.ui.error)

// Action selectors
export const useActions = () => {
  return useGlobalStore(state => ({
    // User actions
    setUser: state.setUser,
    setAuthenticated: state.setAuthenticated,
    
    // Project actions
    setProjects: state.setProjects,
    addProject: state.addProject,
    updateProject: state.updateProject,
    deleteProject: state.deleteProject,
    
    // Experience actions
    setExperiences: state.setExperiences,
    addExperience: state.addExperience,
    updateExperience: state.updateExperience,
    deleteExperience: state.deleteExperience,
    
    // Skill actions
    setSkills: state.setSkills,
    addSkill: state.addSkill,
    updateSkill: state.updateSkill,
    deleteSkill: state.deleteSkill,
    
    // Contact message actions
    setContactMessages: state.setContactMessages,
    addContactMessage: state.addContactMessage,
    updateContactMessage: state.updateContactMessage,
    deleteContactMessage: state.deleteContactMessage,
    
    // UI actions
    setTheme: state.setTheme,
    setSidebarOpen: state.setSidebarOpen,
    setMobileMenuOpen: state.setMobileMenuOpen,
    setSearchOpen: state.setSearchOpen,
    setSearchQuery: state.setSearchQuery,
    setLoading: state.setLoading,
    setError: state.setError,
  }))
}