'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Bell,
  Search,
  Sun,
  Moon,
  Monitor,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Breadcrumb
} from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface HeaderProps {
  sidebarCollapsed?: boolean
  className?: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  timestamp: Date
  read: boolean
}

// Mock notifications - in real app, fetch from API
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Contact Form Submission',
    message: 'You have received a new message from your portfolio contact form.',
    type: 'info',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false
  },
  {
    id: '2',
    title: 'Weekly Analytics Report',
    message: 'Your portfolio had 234 visitors this week (+15% from last week).',
    type: 'success',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false
  },
  {
    id: '3',
    title: 'Backup Completed',
    message: 'Your portfolio data has been successfully backed up.',
    type: 'success',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true
  }
]

export function Header({ sidebarCollapsed = false, className }: HeaderProps) {
  const { user, signOut } = useAuthContext()
  const pathname = usePathname()
  
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [searchQuery, setSearchQuery] = useState('')

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: { label: string; href: string }[] = []
    
    let currentPath = ''
    paths.forEach(path => {
      currentPath += `/${path}`
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
      breadcrumbs.push({ label, href: currentPath })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()
  const unreadCount = notifications.filter(n => !n.read).length

  const handleSignOut = async () => {
    await signOut()
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <header
      className={cn(
        "bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 shadow-sm transition-all duration-300",
        className
      )}
      style={{
        marginLeft: sidebarCollapsed ? 80 : 280,
        width: `calc(100% - ${sidebarCollapsed ? 80 : 280}px)`
      }}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Breadcrumbs */}
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-2">
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href} className="flex items-center">
                  {index > 0 && (
                    <span className="mx-2 text-secondary-400">/</span>
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      index === breadcrumbs.length - 1
                        ? "font-medium text-secondary-900 dark:text-white"
                        : "text-secondary-600 dark:text-secondary-300"
                    )}
                  >
                    {breadcrumb.label}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          {/* Right Section - Search, Notifications, User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-secondary-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-64 pl-9 pr-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md leading-5 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Theme Toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
                  const currentIndex = themes.indexOf(theme)
                  const nextTheme = themes[(currentIndex + 1) % themes.length]
                  setTheme(nextTheme)
                }}
                className="p-2 text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-md transition-colors"
                title={`Current theme: ${theme}`}
              >
                {theme === 'light' && <Sun className="h-5 w-5" />}
                {theme === 'dark' && <Moon className="h-5 w-5" />}
                {theme === 'system' && <Monitor className="h-5 w-5" />}
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-md transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 z-50"
                >
                  <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
                    <h3 className="text-sm font-semibold text-secondary-900 dark:text-white">
                      Notifications ({unreadCount} unread)
                    </h3>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-secondary-500 dark:text-secondary-400">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          onClick={() => markNotificationAsRead(notification.id)}
                          className={cn(
                            "p-4 border-b border-secondary-100 dark:border-secondary-700 last:border-b-0 hover:bg-secondary-50 dark:hover:bg-secondary-700 cursor-pointer",
                            !notification.read && "bg-blue-50 dark:bg-blue-900/20"
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-secondary-900 dark:text-white">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                                {notification.message}
                              </p>
                            </div>
                            <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-2">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-secondary-200 dark:border-secondary-700">
                    <button className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-md transition-colors"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.displayName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-secondary-900 dark:text-white">
                    {user?.displayName || 'Admin User'}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">
                    {user?.role?.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-secondary-600 dark:text-secondary-300" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 z-50"
                >
                  <div className="py-2">
                    <button className="w-full flex items-center px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700">
                      <User className="h-4 w-4 mr-3" />
                      Profile Settings
                    </button>
                    <button className="w-full flex items-center px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700">
                      <Settings className="h-4 w-4 mr-3" />
                      Preferences
                    </button>
                    <button className="w-full flex items-center px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700">
                      <HelpCircle className="h-4 w-4 mr-3" />
                      Help & Support
                    </button>
                    <div className="border-t border-secondary-200 dark:border-secondary-700 my-2" />
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}