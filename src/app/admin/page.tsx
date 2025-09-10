'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  Eye,
  MessageSquare,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react'
import { DashboardLayout } from '@/components/admin/DashboardLayout'
import { useAuthContext } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalViews: number
  totalContacts: number
  totalProjects: number
  averageSessionTime: string
  bounceRate: string
  topReferrers: Array<{ name: string; count: number }>
  recentActivity: Array<{
    id: string
    type: 'contact' | 'view' | 'update'
    message: string
    timestamp: Date
  }>
  deviceStats: {
    desktop: number
    mobile: number
    tablet: number
  }
  weeklyViews: number[]
}

// Mock data - in real app, fetch from analytics API
const mockStats: DashboardStats = {
  totalViews: 1234,
  totalContacts: 56,
  totalProjects: 12,
  averageSessionTime: '2m 45s',
  bounceRate: '32%',
  topReferrers: [
    { name: 'Google', count: 450 },
    { name: 'LinkedIn', count: 234 },
    { name: 'GitHub', count: 123 },
    { name: 'Direct', count: 427 }
  ],
  recentActivity: [
    {
      id: '1',
      type: 'contact',
      message: 'New contact form submission from John Doe',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '2',
      type: 'view',
      message: 'Portfolio viewed by someone from San Francisco',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: '3',
      type: 'update',
      message: 'Skills section was updated',
      timestamp: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      id: '4',
      type: 'contact',
      message: 'New contact form submission from Sarah Smith',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ],
  deviceStats: {
    desktop: 65,
    mobile: 28,
    tablet: 7
  },
  weeklyViews: [45, 52, 38, 61, 73, 49, 67] // Last 7 days
}

export default function AdminDashboard() {
  const { user, hasPermission } = useAuthContext()
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStats(mockStats)
      setLoading(false)
    }

    loadDashboardData()
  }, [])

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact': return <MessageSquare className="h-4 w-4" />
      case 'view': return <Eye className="h-4 w-4" />
      case 'update': return <FileText className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'contact': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'view': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'update': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-secondary-200 dark:bg-secondary-800 rounded w-1/4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-secondary-200 dark:bg-secondary-800 rounded-lg" />
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-80 bg-secondary-200 dark:bg-secondary-800 rounded-lg" />
              <div className="h-80 bg-secondary-200 dark:bg-secondary-800 rounded-lg" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.displayName || 'Admin'}!
              </h1>
              <p className="text-primary-100 mt-1">
                Here's what's happening with your portfolio today.
              </p>
            </div>
            <div className="text-right">
              <p className="text-primary-100 text-sm">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-primary-200 text-xs mt-1">
                Last login: {user?.lastLogin?.toLocaleTimeString() || 'First time'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                  Total Views
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {stats.totalViews.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    +12% from last month
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                  Contact Forms
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {stats.totalContacts}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    +8 this week
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                  Projects
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {stats.totalProjects}
                </p>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">
                    Updated yesterday
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                  Avg. Session
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {stats.averageSessionTime}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    -5% from last week
                  </span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {stats.recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    getActivityColor(activity.type)
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Device Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Device Usage
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-secondary-900 dark:text-white">Desktop</span>
                </div>
                <span className="text-sm font-medium text-secondary-900 dark:text-white">
                  {stats.deviceStats.desktop}%
                </span>
              </div>
              <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${stats.deviceStats.desktop}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-secondary-900 dark:text-white">Mobile</span>
                </div>
                <span className="text-sm font-medium text-secondary-900 dark:text-white">
                  {stats.deviceStats.mobile}%
                </span>
              </div>
              <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${stats.deviceStats.mobile}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-secondary-900 dark:text-white">Tablet</span>
                </div>
                <span className="text-sm font-medium text-secondary-900 dark:text-white">
                  {stats.deviceStats.tablet}%
                </span>
              </div>
              <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${stats.deviceStats.tablet}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* Top Referrers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Top Referrers
            </h3>
            <div className="space-y-3">
              {stats.topReferrers.map((referrer, index) => (
                <div key={referrer.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-xs font-medium text-primary-600 dark:text-primary-400">
                      {index + 1}
                    </div>
                    <span className="text-sm text-secondary-900 dark:text-white">
                      {referrer.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                    {referrer.count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        {hasPermission('canEditContent') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-800 p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-left">
                <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400 mb-2" />
                <h4 className="font-medium text-secondary-900 dark:text-white">Add Project</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">Create a new portfolio project</p>
              </button>

              <button className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
                <h4 className="font-medium text-secondary-900 dark:text-white">Update Skills</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">Manage your skill set</p>
              </button>

              <button className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
                <h4 className="font-medium text-secondary-900 dark:text-white">View Messages</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">Check contact form submissions</p>
              </button>

              <button className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
                <h4 className="font-medium text-secondary-900 dark:text-white">View Analytics</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">Detailed performance insights</p>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}