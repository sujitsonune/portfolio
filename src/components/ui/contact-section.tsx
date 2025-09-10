'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle,
  Calendar,
  Send
} from 'lucide-react'
import type { PersonalInfo, SocialLink, ContactForm } from '@/types'
import { ContactForm as ContactFormComponent } from './contact-form'
import { ContactMethods } from './contact-methods'
import { SocialLinks } from './social-media'
import { NewsletterSignup } from './newsletter-signup'
import { cn } from '@/lib/utils'

interface ContactSectionProps {
  personalInfo?: PersonalInfo
  socialLinks?: SocialLink[]
  title?: string
  subtitle?: string
  showContactForm?: boolean
  showContactMethods?: boolean
  showSocialLinks?: boolean
  showNewsletter?: boolean
  expectedResponseTime?: string
  className?: string
  variant?: 'default' | 'split' | 'centered' | 'minimal'
}

export function ContactSection({
  personalInfo,
  socialLinks = [],
  title = "Let's Work Together",
  subtitle = "Have a project in mind or just want to chat? I'd love to hear from you.",
  showContactForm = true,
  showContactMethods = true,
  showSocialLinks = true,
  showNewsletter = false,
  expectedResponseTime = "24 hours",
  className,
  variant = 'default'
}: ContactSectionProps) {
  // Mock contact form submission
  const handleContactSubmit = async (formData: ContactForm) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Contact form submission error:', error)
      return {
        success: false,
        message: 'Failed to send message. Please try again later.'
      }
    }
  }

  // Mock newsletter subscription
  const handleNewsletterSubscribe = async (email: string) => {
    try {
      // Replace with actual newsletter API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        success: true,
        message: 'Successfully subscribed! Check your email for confirmation.'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to subscribe. Please try again later.'
      }
    }
  }

  // Contact info from personalInfo
  const contactInfo = personalInfo?.contact || {
    email: 'hello@example.com',
    phone: '+1 (555) 123-4567',
    location: {
      city: 'San Francisco',
      country: 'USA',
      timezone: 'PST'
    },
    availability: 'available' as const
  }

  if (variant === 'minimal') {
    return (
      <section id="contact" className={cn('section-padding', className)}>
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-white mb-4">
                {title}
              </h2>
              <p className="text-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
                {subtitle}
              </p>
            </motion.div>

            {/* Simple Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.a
                href={`mailto:${contactInfo.email}`}
                className="group flex flex-col items-center p-6 bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:shadow-lg transition-all duration-300"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Mail className="h-8 w-8 text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Email</h3>
                <p className="text-secondary-600 dark:text-secondary-400 text-center">
                  {contactInfo.email}
                </p>
              </motion.a>

              {contactInfo.phone && (
                <motion.a
                  href={`tel:${contactInfo.phone}`}
                  className="group flex flex-col items-center p-6 bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Phone className="h-8 w-8 text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Phone</h3>
                  <p className="text-secondary-600 dark:text-secondary-400 text-center">
                    {contactInfo.phone}
                  </p>
                </motion.a>
              )}

              <motion.div
                className="group flex flex-col items-center p-6 bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <MapPin className="h-8 w-8 text-primary-600 mb-4" />
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Location</h3>
                <p className="text-secondary-600 dark:text-secondary-400 text-center">
                  {contactInfo.location.city}, {contactInfo.location.country}
                </p>
              </motion.div>
            </div>

            {/* Social Links */}
            {showSocialLinks && socialLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-center"
              >
                <SocialLinks 
                  socialLinks={socialLinks}
                  variant="minimal"
                  className="justify-center"
                />
              </motion.div>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'split') {
    return (
      <section id="contact" className={cn('section-padding bg-secondary-50 dark:bg-secondary-800', className)}>
        <div className="container-custom">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-white mb-4">
                {title}
              </h2>
              <p className="text-lg text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
                {subtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Side - Contact Form */}
              {showContactForm && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <ContactFormComponent
                    onSubmit={handleContactSubmit}
                    expectedResponseTime={expectedResponseTime}
                  />
                </motion.div>
              )}

              {/* Right Side - Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-8"
              >
                {/* Contact Methods */}
                {showContactMethods && (
                  <ContactMethods
                    contactInfo={contactInfo}
                    variant="compact"
                    expectedResponseTime={expectedResponseTime}
                  />
                )}

                {/* Social Media */}
                {showSocialLinks && socialLinks.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                      Connect With Me
                    </h3>
                    <SocialLinks 
                      socialLinks={socialLinks}
                      variant="compact"
                    />
                  </div>
                )}

                {/* Response Time & Availability */}
                <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700">
                  <div className="flex items-center gap-4 mb-4">
                    <Clock className="h-8 w-8 text-primary-600" />
                    <div>
                      <h3 className="font-semibold text-secondary-900 dark:text-white">
                        Response Time
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-400">
                        Usually within {expectedResponseTime}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      contactInfo.availability === 'available' && 'bg-green-500',
                      contactInfo.availability === 'busy' && 'bg-yellow-500',
                      contactInfo.availability === 'unavailable' && 'bg-red-500'
                    )} />
                    <span className="text-sm text-secondary-600 dark:text-secondary-400 capitalize">
                      Currently {contactInfo.availability}
                      {contactInfo.availability === 'available' && ' for new projects'}
                      {contactInfo.availability === 'busy' && ', limited availability'}
                      {contactInfo.availability === 'unavailable' && ' for new work'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'centered') {
    return (
      <section id="contact" className={cn('section-padding', className)}>
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-white mb-4">
                {title}
              </h2>
              <p className="text-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto mb-8">
                {subtitle}
              </p>
              
              {/* Quick Contact Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <motion.a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </motion.a>
                
                {contactInfo.phone && (
                  <motion.a
                    href={`tel:${contactInfo.phone}`}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 font-medium rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Phone className="h-4 w-4" />
                    Call Now
                  </motion.a>
                )}
                
                <motion.a
                  href="https://calendly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 font-medium rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Calendar className="h-4 w-4" />
                  Schedule Call
                </motion.a>
              </div>
            </motion.div>

            {/* Contact Form */}
            {showContactForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-12"
              >
                <ContactFormComponent
                  onSubmit={handleContactSubmit}
                  expectedResponseTime={expectedResponseTime}
                  className="mx-auto"
                />
              </motion.div>
            )}

            {/* Social Links */}
            {showSocialLinks && socialLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <SocialLinks 
                  socialLinks={socialLinks}
                  variant="minimal"
                  className="justify-center"
                />
              </motion.div>
            )}
          </div>
        </div>
      </section>
    )
  }

  // Default variant
  return (
    <section id="contact" className={cn('section-padding', className)}>
      <div className="container-custom">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-white mb-4">
              {title}
            </h2>
            <p className="text-lg text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
              {subtitle}
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-16">
            {/* Contact Methods */}
            {showContactMethods && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <ContactMethods
                  contactInfo={contactInfo}
                  variant="cards"
                  expectedResponseTime={expectedResponseTime}
                />
              </motion.div>
            )}

            {/* Contact Form */}
            {showContactForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                    <MessageCircle className="h-6 w-6 text-primary-600" />
                    Send Me a Message
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    Prefer to reach out directly? Use the form below.
                  </p>
                </div>

                <ContactFormComponent
                  onSubmit={handleContactSubmit}
                  expectedResponseTime={expectedResponseTime}
                  className="mx-auto"
                />
              </motion.div>
            )}

            {/* Social Media */}
            {showSocialLinks && socialLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                <SocialLinks 
                  socialLinks={socialLinks}
                  variant="default"
                />
              </motion.div>
            )}

            {/* Newsletter Signup */}
            {showNewsletter && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                    <Send className="h-6 w-6 text-primary-600" />
                    Stay Updated
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    Get the latest updates on projects and articles.
                  </p>
                </div>

                <NewsletterSignup
                  onSubscribe={handleNewsletterSubscribe}
                  className="mx-auto"
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Specialized contact section variants
export function MinimalContactSection({ personalInfo, socialLinks, className }: {
  personalInfo?: PersonalInfo
  socialLinks?: SocialLink[]
  className?: string
}) {
  return (
    <ContactSection
      personalInfo={personalInfo}
      socialLinks={socialLinks}
      variant="minimal"
      showContactForm={false}
      showNewsletter={false}
      className={className}
    />
  )
}

export function FullContactSection({ personalInfo, socialLinks, className }: {
  personalInfo?: PersonalInfo
  socialLinks?: SocialLink[]
  className?: string
}) {
  return (
    <ContactSection
      personalInfo={personalInfo}
      socialLinks={socialLinks}
      variant="default"
      showContactForm={true}
      showContactMethods={true}
      showSocialLinks={true}
      showNewsletter={true}
      className={className}
    />
  )
}