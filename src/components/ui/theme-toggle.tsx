'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className={cn(
          'relative inline-flex h-10 w-10 items-center justify-center rounded-lg',
          'bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700',
          'border border-secondary-200 dark:border-secondary-700',
          'transition-colors duration-200'
        )}
        disabled
      >
        <Sun className="h-4 w-4" />
      </button>
    )
  }

  return (
    <button
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-lg',
        'bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700',
        'border border-secondary-200 dark:border-secondary-700',
        'transition-all duration-200 hover:scale-105'
      )}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  )
}