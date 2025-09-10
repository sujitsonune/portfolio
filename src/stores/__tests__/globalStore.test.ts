import { act, renderHook } from '@testing-library/react'
import { useGlobalStore, useActions, useProjects, useUser, useIsLoading } from '../globalStore'
import { mockProjects, mockExperiences, mockSkills, mockUser } from '@/test-utils'

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  ...jest.requireActual('zustand/middleware'),
  persist: (fn: any) => fn,
}))

describe('GlobalStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      const store = useGlobalStore.getState()
      store.setProjects([])
      store.setExperiences([])
      store.setSkills([])
      store.setContactMessages([])
      store.setUser(null)
      store.setAuthenticated(false)
      store.setLoading(false)
      store.setError(null)
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.projects).toEqual([])
      expect(result.current.experiences).toEqual([])
      expect(result.current.skills).toEqual([])
      expect(result.current.contactMessages).toEqual([])
      expect(result.current.ui.isLoading).toBe(false)
      expect(result.current.ui.error).toBeNull()
    })
  })

  describe('User Actions', () => {
    it('should set user and authentication status', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setUser(mockUser)
      })
      
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should clear user when set to null', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      // First set a user
      act(() => {
        result.current.setUser(mockUser)
      })
      
      expect(result.current.isAuthenticated).toBe(true)
      
      // Then clear the user
      act(() => {
        result.current.setUser(null)
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should handle authentication status independently', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setAuthenticated(false)
      })
      
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })

  describe('Project Actions', () => {
    it('should set projects', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setProjects(mockProjects)
      })
      
      expect(result.current.projects).toEqual(mockProjects)
    })

    it('should add project', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.addProject(mockProjects[0])
      })
      
      expect(result.current.projects).toHaveLength(1)
      expect(result.current.projects[0]).toEqual(mockProjects[0])
    })

    it('should update project', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      // First add projects
      act(() => {
        result.current.setProjects(mockProjects)
      })
      
      // Then update one
      act(() => {
        result.current.updateProject('1', { title: 'Updated Title' })
      })
      
      const updatedProject = result.current.projects.find(p => p.id === '1')
      expect(updatedProject?.title).toBe('Updated Title')
    })

    it('should delete project', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      // First add projects
      act(() => {
        result.current.setProjects(mockProjects)
      })
      
      expect(result.current.projects).toHaveLength(2)
      
      // Then delete one
      act(() => {
        result.current.deleteProject('1')
      })
      
      expect(result.current.projects).toHaveLength(1)
      expect(result.current.projects.find(p => p.id === '1')).toBeUndefined()
    })
  })

  describe('Experience Actions', () => {
    it('should set experiences', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setExperiences(mockExperiences)
      })
      
      expect(result.current.experiences).toEqual(mockExperiences)
    })

    it('should add experience', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.addExperience(mockExperiences[0])
      })
      
      expect(result.current.experiences).toHaveLength(1)
      expect(result.current.experiences[0]).toEqual(mockExperiences[0])
    })

    it('should update experience', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setExperiences(mockExperiences)
        result.current.updateExperience('1', { position: 'Senior Developer' })
      })
      
      const updatedExp = result.current.experiences.find(e => e.id === '1')
      expect(updatedExp?.position).toBe('Senior Developer')
    })

    it('should delete experience', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setExperiences(mockExperiences)
        result.current.deleteExperience('1')
      })
      
      expect(result.current.experiences).toHaveLength(1)
      expect(result.current.experiences.find(e => e.id === '1')).toBeUndefined()
    })
  })

  describe('Skill Actions', () => {
    it('should set skills', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setSkills(mockSkills)
      })
      
      expect(result.current.skills).toEqual(mockSkills)
    })

    it('should add skill', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.addSkill(mockSkills[0])
      })
      
      expect(result.current.skills).toHaveLength(1)
      expect(result.current.skills[0]).toEqual(mockSkills[0])
    })

    it('should update skill', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setSkills(mockSkills)
        result.current.updateSkill('1', { level: 95 })
      })
      
      const updatedSkill = result.current.skills.find(s => s.id === '1')
      expect(updatedSkill?.level).toBe(95)
    })

    it('should delete skill', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setSkills(mockSkills)
        result.current.deleteSkill('1')
      })
      
      expect(result.current.skills).toHaveLength(2)
      expect(result.current.skills.find(s => s.id === '1')).toBeUndefined()
    })
  })

  describe('UI Actions', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setLoading(true)
      })
      
      expect(result.current.ui.isLoading).toBe(true)
    })

    it('should set error state', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setError('Test error')
      })
      
      expect(result.current.ui.error).toBe('Test error')
    })

    it('should set theme', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setTheme('dark')
      })
      
      expect(result.current.ui.theme).toBe('dark')
    })

    it('should toggle sidebar', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setSidebarOpen(true)
      })
      
      expect(result.current.ui.sidebarOpen).toBe(true)
    })

    it('should set search query', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      act(() => {
        result.current.setSearchQuery('test query')
      })
      
      expect(result.current.ui.searchQuery).toBe('test query')
    })
  })

  describe('Computed Getters', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useGlobalStore())
      act(() => {
        result.current.setProjects(mockProjects)
        result.current.setExperiences(mockExperiences)
        result.current.setSkills(mockSkills)
      })
    })

    it('should get featured projects', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      const featured = result.current.getFeaturedProjects()
      expect(featured).toHaveLength(1)
      expect(featured[0].featured).toBe(true)
    })

    it('should get projects by category', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      const webProjects = result.current.getProjectsByCategory('web')
      expect(webProjects).toHaveLength(1)
      expect(webProjects[0].category).toBe('web')
    })

    it('should get skills by category', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      const frontendSkills = result.current.getSkillsByCategory('frontend')
      expect(frontendSkills).toHaveLength(1)
      expect(frontendSkills[0].category).toBe('frontend')
    })

    it('should get current experience', () => {
      const { result } = renderHook(() => useGlobalStore())
      
      const currentExp = result.current.getCurrentExperience()
      expect(currentExp).toBeTruthy()
      expect(currentExp?.current).toBe(true)
    })
  })

  describe('Selector Hooks', () => {
    it('useProjects should return projects array', () => {
      act(() => {
        useGlobalStore.setState({ projects: mockProjects })
      })
      
      const { result } = renderHook(() => useProjects())
      expect(result.current).toEqual(mockProjects)
    })

    it('useUser should return user object', () => {
      act(() => {
        useGlobalStore.setState({ user: mockUser })
      })
      
      const { result } = renderHook(() => useUser())
      expect(result.current).toEqual(mockUser)
    })

    it('useIsLoading should return loading state', () => {
      act(() => {
        useGlobalStore.setState({ ui: { ...useGlobalStore.getState().ui, isLoading: true } })
      })
      
      const { result } = renderHook(() => useIsLoading())
      expect(result.current).toBe(true)
    })

    it('useActions should return action functions', () => {
      const { result } = renderHook(() => useActions())
      
      expect(typeof result.current.setUser).toBe('function')
      expect(typeof result.current.setProjects).toBe('function')
      expect(typeof result.current.setLoading).toBe('function')
      expect(typeof result.current.setError).toBe('function')
    })
  })
})