'use client'

import Link from 'next/link'
import { Github, Linkedin, Mail, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

const socialLinks = [
  {
    href: 'https://github.com',
    icon: Github,
    label: 'GitHub',
  },
  {
    href: 'https://linkedin.com',
    icon: Linkedin,
    label: 'LinkedIn',
  },
  {
    href: 'mailto:hello@example.com',
    icon: Mail,
    label: 'Email',
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-secondary-50 dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-700">
      <div className="container-custom section-padding !py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold gradient-text">Sujit</h3>
            <p className="text-secondary-600 dark:text-secondary-400 max-w-sm">
              Full-stack developer passionate about creating innovative web solutions
              and building meaningful user experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-secondary-900 dark:text-white">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { href: '#about', label: 'About' },
                { href: '#projects', label: 'Projects' },
                { href: '#experience', label: 'Experience' },
                { href: '#contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => {
                      const element = document.querySelector(link.href)
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                    className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-secondary-900 dark:text-white">
              Connect With Me
            </h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex h-10 w-10 items-center justify-center rounded-lg',
                    'bg-secondary-100 hover:bg-primary-600 dark:bg-secondary-800 dark:hover:bg-primary-600',
                    'text-secondary-600 hover:text-white dark:text-secondary-400 dark:hover:text-white',
                    'transition-all duration-200 hover:scale-105'
                  )}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-secondary-200 dark:border-secondary-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-secondary-600 dark:text-secondary-400 text-sm">
              © {currentYear} Sujit. All rights reserved.
            </p>
            <p className="flex items-center text-secondary-600 dark:text-secondary-400 text-sm">
              Made with{' '}
              <Heart className="h-4 w-4 mx-1 text-red-500" fill="currentColor" />{' '}
              and Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}