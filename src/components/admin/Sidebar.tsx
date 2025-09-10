'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  User,
  Briefcase,
  Code,
  FolderOpen,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users,
  FileText,
  Image,
  Palette,
  Database,
  Download,
  Eye
} from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  permission?: string
  children?: NavigationItem[]
}

interface SidebarProps {
  className?: string
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    title: 'Content Management',
    href: '/admin/content',
    icon: FileText,
    permission: 'canEditContent',
    children: [
      { title: 'Personal Info', href: '/admin/content/personal', icon: User },
      { title: 'Experience', href: '/admin/content/experience', icon: Briefcase },
      { title: 'Skills', href: '/admin/content/skills', icon: Code },
      { title: 'Projects', href: '/admin/content/projects', icon: FolderOpen },
      { title: 'Contact Info', href: '/admin/content/contact', icon: Mail },
    ]
  },
  {
    title: 'Media Library',
    href: '/admin/media',
    icon: Image,
    permission: 'canEditContent',
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    permission: 'canAccessAnalytics',
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    permission: 'canManageUsers',
  },
  {
    title: 'Theme & Design',
    href: '/admin/theme',
    icon: Palette,
    permission: 'canManageSettings',
  },
  {
    title: 'Data Management',
    href: '/admin/data',
    icon: Database,
    permission: 'canExportData',
    children: [
      { title: 'Import/Export', href: '/admin/data/import-export', icon: Download },
      { title: 'Backup', href: '/admin/data/backup', icon: Shield },
    ]
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'canManageSettings',
  }
]

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const { user, signOut, hasPermission } = useAuthContext()
  const pathname = usePathname()
  const router = useRouter()

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      router.push('/admin/login')
    }
  }

  const isActive = (href: string): boolean => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const hasNavPermission = (item: NavigationItem): boolean => {
    if (!item.permission) return true
    return hasPermission(item.permission as any)
  }

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    if (!hasNavPermission(item)) return null

    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.href)
    const active = isActive(item.href)

    return (
      <div key={item.href}>
        <motion.div
          whileHover={{ x: isCollapsed ? 0 : 4 }}
          whileTap={{ scale: 0.95 }}
        >
          <button
            onClick={() => {
              if (hasChildren) {
                toggleExpanded(item.href)
              } else {
                router.push(item.href)
              }
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group",
              level > 0 && "ml-4 pl-6",
              active
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                : "text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 hover:text-secondary-900 dark:hover:text-white"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 flex-shrink-0",
              active ? "text-primary-600 dark:text-primary-400" : ""
            )} />
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center justify-between flex-1 min-w-0"
                >
                  <span className="truncate text-sm font-medium">
                    {item.title}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    
                    {hasChildren && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.div>

        {/* Submenu */}
        <AnimatePresence>
          {hasChildren && isExpanded && !isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-2 space-y-1">
                {item.children?.map(child => renderNavigationItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.aside
      animate={{
        width: isCollapsed ? 80 : 280
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-800 shadow-lg",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-800">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h1 className="font-bold text-secondary-900 dark:text-white">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">
                    Content Management
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-300 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {navigationItems.map(item => renderNavigationItem(item))}
          </nav>
        </div>

        {/* User Profile & Actions */}
        <div className="border-t border-secondary-200 dark:border-secondary-800 p-4">
          <div className="space-y-3">
            {/* Preview Site Link */}
            <motion.button
              onClick={() => window.open('/', '_blank')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 hover:text-secondary-900 dark:hover:text-white transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Eye className="h-5 w-5" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    Preview Site
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* User Info */}
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg bg-secondary-50 dark:bg-secondary-800",
              isCollapsed && "justify-center"
            )}>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.displayName?.charAt(0) || 'A'}
                </span>
              </div>
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                      {user?.displayName || 'Admin User'}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                      {user?.role?.replace('_', ' ').toUpperCase()}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sign Out */}
            <motion.button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="h-5 w-5" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    Sign Out
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}