'use client'

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  Timestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type {
  PersonalInfo,
  Experience,
  Skill,
  Project,
  ContactForm,
  SocialLink,
  BaseDocument
} from '@/types'

// Generic CRUD operations
export class PortfolioService {
  // Personal Information
  async getPersonalInfo(): Promise<PersonalInfo | null> {
    try {
      const docRef = doc(db, 'personal_info', 'main')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as PersonalInfo
      }
      
      return null
    } catch (error) {
      console.error('Error fetching personal info:', error)
      throw error
    }
  }

  async updatePersonalInfo(data: Partial<PersonalInfo>): Promise<{ success: boolean; message: string }> {
    try {
      const docRef = doc(db, 'personal_info', 'main')
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(docRef, updateData)
      
      return {
        success: true,
        message: 'Personal information updated successfully'
      }
    } catch (error) {
      console.error('Error updating personal info:', error)
      return {
        success: false,
        message: 'Failed to update personal information'
      }
    }
  }

  // Experience Management
  async getExperiences(): Promise<Experience[]> {
    try {
      const q = query(
        collection(db, 'experiences'),
        orderBy('startDate', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt
      })) as Experience[]
    } catch (error) {
      console.error('Error fetching experiences:', error)
      throw error
    }
  }

  async createExperience(data: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; id?: string }> {
    try {
      const experienceData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'experiences'), experienceData)
      
      return {
        success: true,
        message: 'Experience added successfully',
        id: docRef.id
      }
    } catch (error) {
      console.error('Error creating experience:', error)
      return {
        success: false,
        message: 'Failed to add experience'
      }
    }
  }

  async updateExperience(id: string, data: Partial<Experience>): Promise<{ success: boolean; message: string }> {
    try {
      const docRef = doc(db, 'experiences', id)
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(docRef, updateData)
      
      return {
        success: true,
        message: 'Experience updated successfully'
      }
    } catch (error) {
      console.error('Error updating experience:', error)
      return {
        success: false,
        message: 'Failed to update experience'
      }
    }
  }

  async deleteExperience(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const docRef = doc(db, 'experiences', id)
      await deleteDoc(docRef)
      
      return {
        success: true,
        message: 'Experience deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting experience:', error)
      return {
        success: false,
        message: 'Failed to delete experience'
      }
    }
  }

  // Skills Management
  async getSkills(): Promise<Skill[]> {
    try {
      const q = query(
        collection(db, 'skills'),
        orderBy('category'),
        orderBy('proficiency', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt
      })) as Skill[]
    } catch (error) {
      console.error('Error fetching skills:', error)
      throw error
    }
  }

  async createSkill(data: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; id?: string }> {
    try {
      const skillData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'skills'), skillData)
      
      return {
        success: true,
        message: 'Skill added successfully',
        id: docRef.id
      }
    } catch (error) {
      console.error('Error creating skill:', error)
      return {
        success: false,
        message: 'Failed to add skill'
      }
    }
  }

  async updateSkill(id: string, data: Partial<Skill>): Promise<{ success: boolean; message: string }> {
    try {
      const docRef = doc(db, 'skills', id)
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(docRef, updateData)
      
      return {
        success: true,
        message: 'Skill updated successfully'
      }
    } catch (error) {
      console.error('Error updating skill:', error)
      return {
        success: false,
        message: 'Failed to update skill'
      }
    }
  }

  async deleteSkill(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const docRef = doc(db, 'skills', id)
      await deleteDoc(docRef)
      
      return {
        success: true,
        message: 'Skill deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting skill:', error)
      return {
        success: false,
        message: 'Failed to delete skill'
      }
    }
  }

  // Projects Management
  async getProjects(): Promise<Project[]> {
    try {
      const q = query(
        collection(db, 'projects'),
        orderBy('featured', 'desc'),
        orderBy('endDate', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt
      })) as Project[]
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
  }

  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; id?: string }> {
    try {
      const projectData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'projects'), projectData)
      
      return {
        success: true,
        message: 'Project added successfully',
        id: docRef.id
      }
    } catch (error) {
      console.error('Error creating project:', error)
      return {
        success: false,
        message: 'Failed to add project'
      }
    }
  }

  async updateProject(id: string, data: Partial<Project>): Promise<{ success: boolean; message: string }> {
    try {
      const docRef = doc(db, 'projects', id)
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(docRef, updateData)
      
      return {
        success: true,
        message: 'Project updated successfully'
      }
    } catch (error) {
      console.error('Error updating project:', error)
      return {
        success: false,
        message: 'Failed to update project'
      }
    }
  }

  async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const docRef = doc(db, 'projects', id)
      
      // Get project data to delete associated images
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const project = docSnap.data() as Project
        
        // Delete associated images from storage
        if (project.images && project.images.length > 0) {
          await Promise.all(
            project.images.map(async (imageUrl) => {
              try {
                const imageRef = ref(storage, imageUrl)
                await deleteObject(imageRef)
              } catch (error) {
                console.warn('Error deleting image:', error)
              }
            })
          )
        }
      }
      
      await deleteDoc(docRef)
      
      return {
        success: true,
        message: 'Project deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      return {
        success: false,
        message: 'Failed to delete project'
      }
    }
  }

  // Contact Form Submissions
  async getContactSubmissions(limit: number = 50): Promise<ContactForm[]> {
    try {
      const q = query(
        collection(db, 'contact_submissions'),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.slice(0, limit).map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt
      })) as ContactForm[]
    } catch (error) {
      console.error('Error fetching contact submissions:', error)
      throw error
    }
  }

  async markContactAsRead(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const docRef = doc(db, 'contact_submissions', id)
      await updateDoc(docRef, {
        read: true,
        readAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return {
        success: true,
        message: 'Contact marked as read'
      }
    } catch (error) {
      console.error('Error marking contact as read:', error)
      return {
        success: false,
        message: 'Failed to mark contact as read'
      }
    }
  }

  // File Upload
  async uploadFile(file: File, path: string): Promise<{ success: boolean; url?: string; message: string }> {
    try {
      const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(fileRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return {
        success: true,
        url: downloadURL,
        message: 'File uploaded successfully'
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        message: 'Failed to upload file'
      }
    }
  }

  async deleteFile(url: string): Promise<{ success: boolean; message: string }> {
    try {
      const fileRef = ref(storage, url)
      await deleteObject(fileRef)
      
      return {
        success: true,
        message: 'File deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      return {
        success: false,
        message: 'Failed to delete file'
      }
    }
  }

  // Batch Operations
  async reorderItems(collectionName: string, items: Array<{ id: string; order: number }>): Promise<{ success: boolean; message: string }> {
    try {
      const batch = writeBatch(db)
      
      items.forEach(item => {
        const docRef = doc(db, collectionName, item.id)
        batch.update(docRef, {
          order: item.order,
          updatedAt: serverTimestamp()
        })
      })
      
      await batch.commit()
      
      return {
        success: true,
        message: 'Items reordered successfully'
      }
    } catch (error) {
      console.error('Error reordering items:', error)
      return {
        success: false,
        message: 'Failed to reorder items'
      }
    }
  }

  async bulkDelete(collectionName: string, ids: string[]): Promise<{ success: boolean; message: string }> {
    try {
      const batch = writeBatch(db)
      
      ids.forEach(id => {
        const docRef = doc(db, collectionName, id)
        batch.delete(docRef)
      })
      
      await batch.commit()
      
      return {
        success: true,
        message: `${ids.length} items deleted successfully`
      }
    } catch (error) {
      console.error('Error bulk deleting items:', error)
      return {
        success: false,
        message: 'Failed to delete items'
      }
    }
  }

  // Real-time subscriptions
  subscribeToCollection(
    collectionName: string,
    callback: (data: any[]) => void,
    orderByField?: string
  ): () => void {
    const q = orderByField 
      ? query(collection(db, collectionName), orderBy(orderByField))
      : collection(db, collectionName)
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt
      }))
      callback(data)
    })
  }

  // Analytics and Stats
  async getStats(): Promise<{
    totalProjects: number
    totalSkills: number
    totalExperiences: number
    totalContacts: number
    recentContacts: number
  }> {
    try {
      const [projects, skills, experiences, contacts] = await Promise.all([
        getDocs(collection(db, 'projects')),
        getDocs(collection(db, 'skills')),
        getDocs(collection(db, 'experiences')),
        getDocs(collection(db, 'contact_submissions'))
      ])

      // Count recent contacts (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const recentContactsQuery = query(
        collection(db, 'contact_submissions'),
        where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
      )
      const recentContacts = await getDocs(recentContactsQuery)

      return {
        totalProjects: projects.size,
        totalSkills: skills.size,
        totalExperiences: experiences.size,
        totalContacts: contacts.size,
        recentContacts: recentContacts.size
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      throw error
    }
  }
}

// Create singleton instance
export const portfolioService = new PortfolioService()
export default portfolioService