'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Menu, X, Home, User, Briefcase, Code, FolderOpen, Mail, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSwipeGesture } from '@/hooks/useTouchGestures'
import { useBreakpoint } from '@/hooks/useMediaQuery'
import { useScrollAnimation } from '@/hooks/useAnimation'
import { cn } from '@/lib/utils'

interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
    description: 'Back to homepage'
  },
  {
    label: 'About',
    href: '/about',
    icon: User,
    description: 'Learn more about me'
  },
  {
    label: 'Experience',
    href: '/experience',
    icon: Briefcase,
    description: 'My work history'
  },
  {
    label: 'Skills',
    href: '/skills',
    icon: Code,
    description: 'Technical skills'
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    description: 'Portfolio projects',
    children: [
      { label: 'Web Applications', href: '/projects/web', icon: Code },
      { label: 'Mobile Apps', href: '/projects/mobile', icon: Code },
      { label: 'Open Source', href: '/projects/open-source', icon: Code }
    ]
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: Mail,
    description: 'Get in touch'
  }
]

interface ResponsiveNavigationProps {
  className?: string
}

export function ResponsiveNavigation({ className }: ResponsiveNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { isMobile, isTablet } = useBreakpoint()
  const navRef = useRef<HTMLElement>(null)

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
    setExpandedItems([])
  }, [pathname])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Swipe gesture for mobile menu
  const { panProps } = useSwipeGesture(
    (gesture) => {
      if (gesture.direction === 'right' && !isOpen) {
        setIsOpen(true)
      } else if (gesture.direction === 'left' && isOpen) {
        setIsOpen(false)
      }
    },
    100, // threshold
    0.3   // velocity threshold
  )

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // Desktop navigation
  const DesktopNavigation = () => (
    <motion.nav
      className={cn(
        'hidden lg:flex items-center space-x-8',
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {navigationItems.map((item) => (
        <div key={item.href} className="relative group">
          <Link
            href={item.href}
            className={cn(
              'relative px-3 py-2 text-sm font-medium transition-colors duration-200 hover:text-primary-600 dark:hover:text-primary-400',
              isActive(item.href)
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-secondary-700 dark:text-secondary-300'
            )}
          >
            {item.label}
            {/* Active indicator */}
            {isActive(item.href) && (
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                layoutId="activeIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </Link>

          {/* Dropdown for items with children */}
          {item.children && (
            <div className="absolute top-full left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <motion.div
                className="bg-white dark:bg-secondary-900 rounded-lg shadow-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden"
                initial={{ opacity: 0, y: -10 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="flex items-center px-4 py-3 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <child.icon className="h-4 w-4 mr-3 text-secondary-400" />
                    {child.label}
                  </Link>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      ))}
    </motion.nav>
  )

  // Mobile/Tablet navigation
  const MobileNavigation = () => (
    <>
      {/* Mobile menu button */}
      <motion.button
        onClick={toggleMenu}
        className="lg:hidden relative z-50 p-2 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Mobile menu panel */}
            <motion.div
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-secondary-900 shadow-xl z-50 lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 30 
              }}
              {...panProps}
            >
              <div className="flex flex-col h-full">
                {/* Menu header */}
                <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
                  <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                    Navigation
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 rounded-md"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Menu items */}
                <nav className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-2">
                    {navigationItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                      >
                        <div className="flex items-center">
                          <Link
                            href={item.href}
                            className={cn(
                              'flex items-center flex-1 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                              isActive(item.href)
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800'
                            )}
                            onClick={() => !item.children && setIsOpen(false)}
                          >
                            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="block">{item.label}</span>
                              {item.description && (
                                <span className="block text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </Link>

                          {/* Expand button for items with children */}
                          {item.children && (
                            <button
                              onClick={() => toggleExpanded(item.href)}
                              className="ml-2 p-2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 rounded-md"
                              aria-label={`${expandedItems.includes(item.href) ? 'Collapse' : 'Expand'} ${item.label}`}
                            >
                              <motion.div
                                animate={{ rotate: expandedItems.includes(item.href) ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </motion.div>
                            </button>
                          )}
                        </div>

                        {/* Submenu */}
                        <AnimatePresence>
                          {item.children && expandedItems.includes(item.href) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 ml-8 space-y-1">
                                {item.children.map((child) => (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    className={cn(
                                      'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                                      isActive(child.href)
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                        : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 hover:text-secondary-700 dark:hover:text-secondary-300'
                                    )}
                                    onClick={() => setIsOpen(false)}
                                  >
                                    <child.icon className="h-4 w-4 mr-2" />
                                    {child.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Menu footer */}
                <div className="p-6 border-t border-secondary-200 dark:border-secondary-700">
                  <div className="text-center">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      Swipe left to close menu
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )

  return (
    <motion.header
      ref={navRef}
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        isScrolled
          ? 'bg-white/80 dark:bg-secondary-900/80 backdrop-blur-lg border-b border-secondary-200/50 dark:border-secondary-700/50 shadow-sm'
          : 'bg-transparent'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="flex items-center space-x-2 font-bold text-xl text-secondary-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <motion.div
              className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold"
              whileHover={{ rotate: 5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              P
            </motion.div>
            <span className="hidden sm:block">Portfolio</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <DesktopNavigation />
            <MobileNavigation />
          </div>
        </div>
      </div>

      {/* Touch indicator for mobile */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-30 pointer-events-none">
          <motion.div
            className="text-xs text-secondary-500 dark:text-secondary-400 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm px-2 py-1 rounded"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.3 }}
          >
            Swipe right to open menu
          </motion.div>
        </div>
      )}
    </motion.header>
  )
}