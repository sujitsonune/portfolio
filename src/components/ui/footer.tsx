'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Heart, 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  ArrowUp,
  ExternalLink,
  Download,
  Code,
  Coffee,
  Zap,
  Globe,
  Calendar
} from 'lucide-react'
import type { PersonalInfo, SocialLink } from '@/types'
import { SocialLinks } from './social-media'
import { cn } from '@/lib/utils'

interface FooterProps {
  personalInfo?: PersonalInfo
  socialLinks?: SocialLink[]
  showNewsletterSignup?: boolean
  showBackToTop?: boolean
  className?: string
}

interface FooterSection {
  title: string
  links: Array<{
    label: string
    href: string
    external?: boolean
    download?: boolean
  }>
}

const footerSections: FooterSection[] = [
  {
    title: 'Navigation',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Experience', href: '#experience' },
      { label: 'Skills', href: '#skills' },
      { label: 'Projects', href: '#projects' },
      { label: 'Contact', href: '#contact' }
    ]
  },
  {
    title: 'Projects',
    links: [
      { label: 'Featured Work', href: '#projects' },
      { label: 'Open Source', href: 'https://github.com', external: true },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'GitHub Profile', href: 'https://github.com', external: true }
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Resume', href: '/resume.pdf', download: true },
      { label: 'Portfolio Guide', href: '/portfolio-guide.pdf', download: true },
      { label: 'Tech Blog', href: 'https://blog.example.com', external: true },
      { label: 'Speaking', href: '/speaking' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Sitemap', href: '/sitemap.xml', external: true }
    ]
  }
]

export function Footer({
  personalInfo,
  socialLinks = [],
  showNewsletterSignup = false,
  showBackToTop = true,
  className
}: FooterProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Show/hide back to top button based on scroll
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Current year for copyright
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn(
      'relative bg-secondary-900 dark:bg-secondary-950 text-white',
      className
    )}>
      {/* Main Footer Content */}
      <div className="container-custom py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* About Section */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  {personalInfo?.name || 'Your Name'}
                </h3>
                <p className="text-secondary-300 leading-relaxed">
                  {personalInfo?.bio || 'A passionate developer creating amazing digital experiences and solving complex problems through code.'}
                </p>
              </div>

              {/* Contact Info */}
              {personalInfo && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary-400" />
                    <a 
                      href={`mailto:${personalInfo.contact.email}`}
                      className="text-secondary-300 hover:text-white transition-colors"
                    >
                      {personalInfo.contact.email}
                    </a>
                  </div>
                  
                  {personalInfo.contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary-400" />
                      <a 
                        href={`tel:${personalInfo.contact.phone}`}
                        className="text-secondary-300 hover:text-white transition-colors"
                      >
                        {personalInfo.contact.phone}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary-400 mt-0.5" />
                    <div className="text-secondary-300">
                      <div>{personalInfo.contact.location.city}, {personalInfo.contact.location.country}</div>
                      {personalInfo.contact.location.timezone && (
                        <div className="text-sm opacity-75">
                          {personalInfo.contact.location.timezone}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Availability Status */}
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary-400" />
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        personalInfo.contact.availability === 'available' && 'bg-green-500',
                        personalInfo.contact.availability === 'busy' && 'bg-yellow-500',
                        personalInfo.contact.availability === 'unavailable' && 'bg-red-500'
                      )} />
                      <span className="text-secondary-300 capitalize">
                        {personalInfo.contact.availability === 'available' && 'Available for work'}
                        {personalInfo.contact.availability === 'busy' && 'Limited availability'}
                        {personalInfo.contact.availability === 'unavailable' && 'Not available'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Media */}
              {socialLinks.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Follow Me</h4>
                  <SocialLinks 
                    socialLinks={socialLinks}
                    variant="minimal"
                    animate={false}
                  />
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {footerSections.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <h4 className="text-lg font-semibold mb-4 text-white">
                      {section.title}
                    </h4>
                    <ul className="space-y-3">
                      {section.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            target={link.external ? '_blank' : undefined}
                            rel={link.external ? 'noopener noreferrer' : undefined}
                            download={link.download ? link.label : undefined}
                            className="group flex items-center gap-2 text-secondary-300 hover:text-white transition-colors"
                          >
                            <span>{link.label}</span>
                            {link.external && (
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                            {link.download && (
                              <Download className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          {showNewsletterSignup && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 pt-12 border-t border-secondary-800"
            >
              <div className="max-w-2xl mx-auto text-center">
                <h4 className="text-2xl font-bold mb-4">Stay Updated</h4>
                <p className="text-secondary-300 mb-6">
                  Get notified about new projects, articles, and opportunities. No spam, unsubscribe anytime.
                </p>
                
                <form className="flex gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-secondary-400"
                  />
                  <motion.button
                    type="submit"
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Subscribe
                  </motion.button>
                </form>
                
                <p className="text-xs text-secondary-400 mt-3">
                  By subscribing, you agree to our Privacy Policy and Terms of Service.
                </p>
              </div>
            </motion.div>
          )}

          {/* Divider */}
          <div className="mt-12 pt-8 border-t border-secondary-800">
            {/* Bottom Footer */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              {/* Copyright */}
              <div className="text-center lg:text-left">
                <p className="text-secondary-300 flex items-center justify-center lg:justify-start gap-2">
                  <span>© {currentYear} {personalInfo?.name || 'Your Name'}.</span>
                  <span className="flex items-center gap-1">
                    Built with <Heart className="h-4 w-4 text-red-500" /> and
                    <Coffee className="h-4 w-4 text-yellow-600" />
                  </span>
                </p>
                <p className="text-secondary-400 text-sm mt-1">
                  Crafted with Next.js, TypeScript, and Tailwind CSS
                </p>
              </div>

              {/* Additional Info */}
              <div className="flex items-center gap-6 text-sm text-secondary-400">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>v2.0.1</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>Fast & Accessible</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <a 
                    href="https://github.com/your-repo" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Open Source
                  </a>
                </div>
              </div>
            </div>

            {/* Fun Footer Message */}
            <div className="mt-6 text-center">
              <p className="text-secondary-400 text-sm">
                🚀 Thanks for scrolling this far! You're awesome. 
                <Link 
                  href="#contact"
                  className="text-primary-400 hover:text-primary-300 ml-1"
                >
                  Let's build something amazing together.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}
        />
      </div>
    </footer>
  )
}

// Compact Footer Variant
interface CompactFooterProps {
  personalInfo?: PersonalInfo
  socialLinks?: SocialLink[]
  className?: string
}

export function CompactFooter({ personalInfo, socialLinks = [], className }: CompactFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn(
      'bg-secondary-100 dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-800',
      className
    )}>
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Left Side */}
          <div className="text-center md:text-left">
            <p className="text-secondary-600 dark:text-secondary-300 flex items-center justify-center md:justify-start gap-2">
              <span>© {currentYear} {personalInfo?.name || 'Your Name'}.</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="h-4 w-4 text-red-500" />
              </span>
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-secondary-500 dark:text-secondary-400">
              <Link href="/privacy" className="hover:text-secondary-700 dark:hover:text-secondary-300">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-secondary-700 dark:hover:text-secondary-300">
                Terms
              </Link>
              <Link href="/sitemap.xml" className="hover:text-secondary-700 dark:hover:text-secondary-300">
                Sitemap
              </Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-6">
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <SocialLinks 
                socialLinks={socialLinks.slice(0, 4)}
                variant="minimal"
                animate={false}
              />
            )}
            
            {/* Contact Info */}
            {personalInfo && (
              <div className="hidden md:flex items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400">
                <a 
                  href={`mailto:${personalInfo.contact.email}`}
                  className="flex items-center gap-1 hover:text-secondary-700 dark:hover:text-secondary-300"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </a>
                
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{personalInfo.contact.location.city}</span>
                </div>
                
                <div className={cn(
                  'flex items-center gap-1',
                  personalInfo.contact.availability === 'available' && 'text-green-600 dark:text-green-400',
                  personalInfo.contact.availability === 'busy' && 'text-yellow-600 dark:text-yellow-400',
                  personalInfo.contact.availability === 'unavailable' && 'text-red-600 dark:text-red-400'
                )}>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    personalInfo.contact.availability === 'available' && 'bg-green-500',
                    personalInfo.contact.availability === 'busy' && 'bg-yellow-500',
                    personalInfo.contact.availability === 'unavailable' && 'bg-red-500'
                  )} />
                  <span className="capitalize">{personalInfo.contact.availability}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}