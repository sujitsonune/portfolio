import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentSnapshot,
  FirestoreError,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type {
  PersonalInfo,
  WorkExperience,
  Project,
  Skill,
  Achievement,
  Testimonial,
  ContactSubmission,
  FilterOptions,
  SortOptions,
  PaginatedResponse,
  FirebaseError as CustomFirebaseError,
} from '@/types'

// Collection names
export const COLLECTIONS = {
  PERSONAL_INFO: 'personalInfo',
  WORK_EXPERIENCE: 'workExperience',
  PROJECTS: 'projects',
  SKILLS: 'skills',
  ACHIEVEMENTS: 'achievements',
  TESTIMONIALS: 'testimonials',
  CONTACT_SUBMISSIONS: 'contactSubmissions',
  PAGE_VIEWS: 'pageViews',
} as const

// Generic CRUD operations
class FirebaseService<T extends { id: string }> {
  constructor(private collectionName: string) {}

  // Create
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(collection(db, this.collectionName))
      const timestamp = Timestamp.now()
      
      const documentData = {
        ...data,
        id: docRef.id,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      await setDoc(docRef, documentData)
      return docRef.id
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Read single document
  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        return null
      }

      return docSnap.data() as T
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Read all documents with optional filtering and sorting
  async getAll(
    filters?: FilterOptions,
    sort?: SortOptions,
    limitCount?: number
  ): Promise<T[]> {
    try {
      const constraints = this.buildQueryConstraints(filters, sort, limitCount)
      const q = query(collection(db, this.collectionName), ...constraints)
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => doc.data() as T)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Read paginated documents
  async getPaginated(
    page: number = 1,
    pageSize: number = 10,
    filters?: FilterOptions,
    sort?: SortOptions
  ): Promise<PaginatedResponse<T>> {
    try {
      const constraints = this.buildQueryConstraints(filters, sort)
      
      // Get total count
      const countQuery = query(collection(db, this.collectionName), ...constraints)
      const countSnapshot = await getDocs(countQuery)
      const total = countSnapshot.size

      // Get paginated data
      const offset = (page - 1) * pageSize
      const paginatedQuery = query(
        collection(db, this.collectionName),
        ...constraints,
        limit(pageSize),
        startAfter(offset > 0 ? countSnapshot.docs[offset - 1] : null)
      )
      
      const querySnapshot = await getDocs(paginatedQuery)
      const data = querySnapshot.docs.map(doc => doc.data() as T)

      return {
        data,
        total,
        page,
        limit: pageSize,
        hasMore: page * pageSize < total,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Update
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      }
      
      await updateDoc(docRef, updateData)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Delete
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await deleteDoc(docRef)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Real-time listener
  onSnapshot(
    callback: (data: T[]) => void,
    onError?: (error: CustomFirebaseError) => void,
    filters?: FilterOptions,
    sort?: SortOptions
  ) {
    try {
      const constraints = this.buildQueryConstraints(filters, sort)
      const q = query(collection(db, this.collectionName), ...constraints)
      
      return onSnapshot(
        q,
        (querySnapshot) => {
          const data = querySnapshot.docs.map(doc => doc.data() as T)
          callback(data)
        },
        (error) => {
          if (onError) {
            onError(this.handleError(error))
          }
        }
      )
    } catch (error) {
      if (onError) {
        onError(this.handleError(error))
      }
      return () => {} // Return empty unsubscribe function
    }
  }

  // Private helper methods
  private buildQueryConstraints(
    filters?: FilterOptions,
    sort?: SortOptions,
    limitCount?: number
  ): QueryConstraint[] {
    const constraints: QueryConstraint[] = []

    // Add filters
    if (filters) {
      if (filters.category?.length) {
        constraints.push(where('category', 'in', filters.category))
      }
      if (filters.technology?.length) {
        constraints.push(where('technologies', 'array-contains-any', filters.technology))
      }
      if (filters.featured !== undefined) {
        constraints.push(where('isFeatured', '==', filters.featured))
      }
      if (filters.visible !== undefined) {
        constraints.push(where('isVisible', '==', filters.visible))
      }
      if (filters.dateRange) {
        constraints.push(
          where('createdAt', '>=', Timestamp.fromDate(filters.dateRange.start)),
          where('createdAt', '<=', Timestamp.fromDate(filters.dateRange.end))
        )
      }
    }

    // Add sorting
    if (sort) {
      constraints.push(orderBy(sort.field, sort.direction))
    } else {
      constraints.push(orderBy('order', 'asc'), orderBy('createdAt', 'desc'))
    }

    // Add limit
    if (limitCount) {
      constraints.push(limit(limitCount))
    }

    return constraints
  }

  private handleError(error: any): CustomFirebaseError {
    if (error.code && error.message) {
      return {
        code: error.code,
        message: error.message,
        details: error,
      }
    }
    
    return {
      code: 'unknown',
      message: error.message || 'An unknown error occurred',
      details: error,
    }
  }
}

// Service instances for each collection
export const personalInfoService = new FirebaseService<PersonalInfo>(COLLECTIONS.PERSONAL_INFO)
export const workExperienceService = new FirebaseService<WorkExperience>(COLLECTIONS.WORK_EXPERIENCE)
export const projectsService = new FirebaseService<Project>(COLLECTIONS.PROJECTS)
export const skillsService = new FirebaseService<Skill>(COLLECTIONS.SKILLS)
export const achievementsService = new FirebaseService<Achievement>(COLLECTIONS.ACHIEVEMENTS)
export const testimonialsService = new FirebaseService<Testimonial>(COLLECTIONS.TESTIMONIALS)
export const contactSubmissionsService = new FirebaseService<ContactSubmission>(COLLECTIONS.CONTACT_SUBMISSIONS)

// Specialized service functions
export class PersonalInfoService extends FirebaseService<PersonalInfo> {
  constructor() {
    super(COLLECTIONS.PERSONAL_INFO)
  }

  async getActive(): Promise<PersonalInfo | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.PERSONAL_INFO),
        where('isActive', '==', true),
        limit(1)
      )
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }

      return querySnapshot.docs[0].data() as PersonalInfo
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

export class ProjectsService extends FirebaseService<Project> {
  constructor() {
    super(COLLECTIONS.PROJECTS)
  }

  async getFeatured(): Promise<Project[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.PROJECTS),
        where('isFeatured', '==', true),
        where('isVisible', '==', true),
        orderBy('order', 'asc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => doc.data() as Project)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getByCategory(category: string): Promise<Project[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.PROJECTS),
        where('category', '==', category),
        where('isVisible', '==', true),
        orderBy('order', 'asc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => doc.data() as Project)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getByTechnology(technology: string): Promise<Project[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.PROJECTS),
        where('technologies', 'array-contains', { name: technology }),
        where('isVisible', '==', true),
        orderBy('order', 'asc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => doc.data() as Project)
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

export class SkillsService extends FirebaseService<Skill> {
  constructor() {
    super(COLLECTIONS.SKILLS)
  }

  async getByCategory(category: string): Promise<Skill[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.SKILLS),
        where('category', '==', category),
        where('isVisible', '==', true),
        orderBy('order', 'asc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => doc.data() as Skill)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getTopSkills(limitCount: number = 10): Promise<Skill[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.SKILLS),
        where('isVisible', '==', true),
        orderBy('yearsOfExperience', 'desc'),
        orderBy('proficiencyLevel', 'desc'),
        limit(limitCount)
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => doc.data() as Skill)
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

// File upload service
export class FileUploadService {
  async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path)
      const uploadTask = uploadBytes(storageRef, file)
      
      // If progress callback is provided, monitor upload
      if (onProgress) {
        // Note: uploadBytes doesn't support progress monitoring
        // For progress monitoring, use uploadBytesResumable instead
        onProgress(100)
      }

      const snapshot = await uploadTask
      const downloadUrl = await getDownloadURL(snapshot.ref)
      
      return downloadUrl
    } catch (error) {
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
    } catch (error) {
      throw new Error(`File deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async uploadImage(
    file: File,
    collection: string,
    fileName?: string
  ): Promise<string> {
    const timestamp = Date.now()
    const name = fileName || `${timestamp}-${file.name}`
    const path = `images/${collection}/${name}`
    
    return this.uploadFile(file, path)
  }

  async uploadDocument(
    file: File,
    collection: string,
    fileName?: string
  ): Promise<string> {
    const timestamp = Date.now()
    const name = fileName || `${timestamp}-${file.name}`
    const path = `documents/${collection}/${name}`
    
    return this.uploadFile(file, path)
  }
}

// Analytics service
export class AnalyticsService {
  async trackPageView(page: string): Promise<void> {
    try {
      const docRef = doc(collection(db, COLLECTIONS.PAGE_VIEWS))
      await setDoc(docRef, {
        page,
        timestamp: Timestamp.now(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        referrer: typeof window !== 'undefined' ? document.referrer : '',
      })
    } catch (error) {
      console.error('Failed to track page view:', error)
    }
  }

  async submitContactForm(formData: any): Promise<void> {
    try {
      await contactSubmissionsService.create({
        form: formData,
        timestamp: Timestamp.now(),
        responded: false,
      })
    } catch (error) {
      throw new Error(`Contact form submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Service instances
export const personalInfoServiceInstance = new PersonalInfoService()
export const projectsServiceInstance = new ProjectsService()
export const skillsServiceInstance = new SkillsService()
export const fileUploadService = new FileUploadService()
export const analyticsService = new AnalyticsService()

// Batch operations
export class BatchService {
  async updateMultiple<T extends { id: string }>(
    service: FirebaseService<T>,
    updates: Array<{ id: string; data: Partial<T> }>
  ): Promise<void> {
    try {
      const promises = updates.map(({ id, data }) => service.update(id, data))
      await Promise.all(promises)
    } catch (error) {
      throw new Error(`Batch update failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteMultiple<T extends { id: string }>(
    service: FirebaseService<T>,
    ids: string[]
  ): Promise<void> {
    try {
      const promises = ids.map(id => service.delete(id))
      await Promise.all(promises)
    } catch (error) {
      throw new Error(`Batch delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const batchService = new BatchService()