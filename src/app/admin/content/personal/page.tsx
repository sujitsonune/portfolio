'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Upload, Trash2, Plus, X } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/DashboardLayout'
import { portfolioService } from '@/lib/portfolio-service'
import { useAuthContext } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { PersonalInfo, SocialLink } from '@/types'

interface FormData {
  name: string
  title: string
  bio: string
  profileImage: string
  resume: string
  contact: {
    email: string
    phone: string
    location: {
      city: string
      country: string
      timezone: string
    }
    availability: 'available' | 'busy' | 'unavailable'
  }
  socialLinks: SocialLink[]
}

const initialFormData: FormData = {
  name: '',
  title: '',
  bio: '',
  profileImage: '',
  resume: '',
  contact: {
    email: '',
    phone: '',
    location: {
      city: '',
      country: '',
      timezone: ''
    },
    availability: 'available'
  },
  socialLinks: []
}

export default function PersonalInfoPage() {
  const { hasPermission } = useAuthContext()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [resumeUploading, setResumeUploading] = useState(false)

  // Check permissions
  if (!hasPermission('canEditContent')) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-secondary-600 dark:text-secondary-300">
            You don't have permission to edit content.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  useEffect(() => {
    loadPersonalInfo()
  }, [])

  const loadPersonalInfo = async () => {
    try {
      setLoading(true)
      const data = await portfolioService.getPersonalInfo()
      
      if (data) {
        setFormData({
          name: data.name || '',
          title: data.title || '',
          bio: data.bio || '',
          profileImage: data.profileImage || '',
          resume: data.resume || '',
          contact: {
            email: data.contact?.email || '',
            phone: data.contact?.phone || '',
            location: {
              city: data.contact?.location?.city || '',
              country: data.contact?.location?.country || '',
              timezone: data.contact?.location?.timezone || ''
            },
            availability: data.contact?.availability || 'available'
          },
          socialLinks: data.socialLinks || []
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load personal information' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const result = await portfolioService.updatePersonalInfo(formData)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save personal information' })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setImageUploading(true)
      const result = await portfolioService.uploadFile(file, 'profile-images')
      
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, profileImage: result.url! }))
        setMessage({ type: 'success', text: 'Profile image uploaded successfully' })
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload profile image' })
    } finally {
      setImageUploading(false)
    }
  }

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setResumeUploading(true)
      const result = await portfolioService.uploadFile(file, 'documents')
      
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, resume: result.url! }))
        setMessage({ type: 'success', text: 'Resume uploaded successfully' })
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload resume' })
    } finally {
      setResumeUploading(false)
    }
  }

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        {
          platform: '',
          url: '',
          icon: '',
          color: '#000000'
        }
      ]
    }))
  }

  const updateSocialLink = (index: number, updates: Partial<SocialLink>) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) =>
        i === index ? { ...link, ...updates } : link
      )
    }))
  }

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary-200 dark:bg-secondary-800 rounded w-1/4" />
          <div className="h-64 bg-secondary-200 dark:bg-secondary-800 rounded" />
          <div className="h-32 bg-secondary-200 dark:bg-secondary-800 rounded" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Personal Information
            </h1>
            <p className="text-secondary-600 dark:text-secondary-300 mt-1">
              Manage your personal details and contact information
            </p>
          </div>
          
          <motion.button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors",
              saving
                ? "bg-secondary-300 text-secondary-500 cursor-not-allowed"
                : "bg-primary-600 hover:bg-primary-700 text-white"
            )}
            whileHover={!saving ? { scale: 1.02 } : {}}
            whileTap={!saving ? { scale: 0.98 } : {}}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-secondary-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-md",
              message.type === 'success'
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
            )}
          >
            {message.text}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 p-6">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Full Stack Developer"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 p-6">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.contact.location.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        location: { ...prev.contact.location, city: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="New York"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.contact.location.country}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        location: { ...prev.contact.location, country: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="United States"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={formData.contact.location.timezone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        location: { ...prev.contact.location, timezone: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="EST"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Availability Status
                </label>
                <select
                  value={formData.contact.availability}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, availability: e.target.value as 'available' | 'busy' | 'unavailable' }
                  }))}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="available">Available for work</option>
                  <option value="busy">Limited availability</option>
                  <option value="unavailable">Not available</option>
                </select>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Social Media Links
                </h2>
                <button
                  onClick={addSocialLink}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Link
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.socialLinks.map((link, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Platform (e.g., LinkedIn)"
                      value={link.platform}
                      onChange={(e) => updateSocialLink(index, { platform: e.target.value })}
                      className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, { url: e.target.value })}
                      className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {formData.socialLinks.length === 0 && (
                  <p className="text-secondary-500 dark:text-secondary-400 text-sm text-center py-4">
                    No social media links added yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Profile Image
              </h3>
              
              {formData.profileImage ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-3">
                    Upload a profile image
                  </p>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={imageUploading}
                className="w-full mt-3 text-sm text-secondary-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:disabled:opacity-50"
              />
              {imageUploading && (
                <div className="mt-2 text-sm text-secondary-600 dark:text-secondary-300">
                  Uploading...
                </div>
              )}
            </div>

            {/* Resume */}
            <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Resume
              </h3>
              
              {formData.resume ? (
                <div className="space-y-3">
                  <div className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-md">
                    <p className="text-sm text-secondary-900 dark:text-white">
                      Resume uploaded
                    </p>
                    <div className="flex gap-2 mt-2">
                      <a
                        href={formData.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        View
                      </a>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, resume: '' }))}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600 dark:text-secondary-300">
                    Upload your resume
                  </p>
                </div>
              )}
              
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={resumeUploading}
                className="w-full mt-3 text-sm text-secondary-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:disabled:opacity-50"
              />
              {resumeUploading && (
                <div className="mt-2 text-sm text-secondary-600 dark:text-secondary-300">
                  Uploading...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}