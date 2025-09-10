'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Calendar,
  Copy,
  CheckCircle,
  ExternalLink,
  MessageCircle,
  Video,
  Globe,
  Download,
  QrCode
} from 'lucide-react'
import type { ContactInfo, SocialLink } from '@/types'
import { cn } from '@/lib/utils'

interface ContactMethodsProps {
  contactInfo: ContactInfo
  socialLinks?: SocialLink[]
  showAvailability?: boolean
  showResponseTime?: boolean
  expectedResponseTime?: string
  className?: string
  variant?: 'default' | 'compact' | 'cards'
}

interface ContactMethodProps {
  icon: React.ElementType
  title: string
  value: string
  description?: string
  action?: () => void
  actionLabel?: string
  copyable?: boolean
  external?: boolean
  availability?: 'available' | 'busy' | 'unavailable'
  responseTime?: string
}

function ContactMethod({ 
  icon: Icon, 
  title, 
  value, 
  description, 
  action, 
  actionLabel, 
  copyable = false,
  external = false,
  availability,
  responseTime
}: ContactMethodProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const availabilityColors = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    busy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    unavailable: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
  }

  const availabilityLabels = {
    available: 'Available',
    busy: 'Busy',
    unavailable: 'Unavailable'
  }

  return (
    <motion.div
      className="group relative bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700 hover:shadow-lg transition-all duration-300"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-secondary-900 dark:text-white">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Availability Badge */}
        {availability && (
          <span className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            availabilityColors[availability]
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full mr-1',
              availability === 'available' && 'bg-green-500',
              availability === 'busy' && 'bg-yellow-500',
              availability === 'unavailable' && 'bg-red-500'
            )} />
            {availabilityLabels[availability]}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mb-4">
        <p className="text-lg font-medium text-secondary-900 dark:text-white mb-1">
          {value}
        </p>
        {responseTime && (
          <div className="flex items-center gap-1 text-sm text-secondary-600 dark:text-secondary-400">
            <Clock className="h-3 w-3" />
            <span>Response time: {responseTime}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {action && (
          <motion.button
            onClick={action}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {actionLabel}
            {external && <ExternalLink className="h-3 w-3" />}
          </motion.button>
        )}

        {copyable && (
          <motion.button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {copied ? (
              <>
                <CheckCircle className="h-3 w-3 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export function ContactMethods({
  contactInfo,
  socialLinks = [],
  showAvailability = true,
  showResponseTime = true,
  expectedResponseTime = "24 hours",
  className,
  variant = 'default'
}: ContactMethodsProps) {
  const handleEmailClick = () => {
    window.location.href = `mailto:${contactInfo.email}`
  }

  const handlePhoneClick = () => {
    if (contactInfo.phone) {
      window.location.href = `tel:${contactInfo.phone}`
    }
  }

  const handleLocationClick = () => {
    const query = encodeURIComponent(`${contactInfo.location.city}, ${contactInfo.location.country}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Primary Contact Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.a
            href={`mailto:${contactInfo.email}`}
            className="flex items-center gap-3 p-4 bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:shadow-md transition-all duration-200"
            whileHover={{ y: -1 }}
          >
            <Mail className="h-5 w-5 text-primary-600" />
            <div>
              <div className="font-medium text-secondary-900 dark:text-white">Email</div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">{contactInfo.email}</div>
            </div>
          </motion.a>

          {contactInfo.phone && (
            <motion.a
              href={`tel:${contactInfo.phone}`}
              className="flex items-center gap-3 p-4 bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:shadow-md transition-all duration-200"
              whileHover={{ y: -1 }}
            >
              <Phone className="h-5 w-5 text-primary-600" />
              <div>
                <div className="font-medium text-secondary-900 dark:text-white">Phone</div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">{contactInfo.phone}</div>
              </div>
            </motion.a>
          )}
        </div>

        {/* Availability Status */}
        {showAvailability && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg border border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-3 h-3 rounded-full',
                contactInfo.availability === 'available' && 'bg-green-500',
                contactInfo.availability === 'busy' && 'bg-yellow-500',
                contactInfo.availability === 'unavailable' && 'bg-red-500'
              )} />
              <div>
                <span className="font-medium text-primary-900 dark:text-primary-100 capitalize">
                  {contactInfo.availability}
                </span>
                {showResponseTime && (
                  <div className="text-sm text-primary-700 dark:text-primary-300">
                    Response time: {expectedResponseTime}
                  </div>
                )}
              </div>
            </div>
            <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
        )}

        {/* Location */}
        <motion.button
          onClick={handleLocationClick}
          className="w-full flex items-center gap-3 p-4 bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:shadow-md transition-all duration-200"
          whileHover={{ y: -1 }}
        >
          <MapPin className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
          <div className="text-left">
            <div className="font-medium text-secondary-900 dark:text-white">Location</div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              {contactInfo.location.city}, {contactInfo.location.country}
              {contactInfo.location.timezone && (
                <span className="ml-2 text-xs">({contactInfo.location.timezone})</span>
              )}
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-secondary-400 ml-auto" />
        </motion.button>
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {/* Email */}
        <ContactMethod
          icon={Mail}
          title="Email"
          value={contactInfo.email}
          description="Send me a message"
          action={handleEmailClick}
          actionLabel="Send Email"
          copyable={true}
          availability={showAvailability ? contactInfo.availability : undefined}
          responseTime={showResponseTime ? expectedResponseTime : undefined}
        />

        {/* Phone */}
        {contactInfo.phone && (
          <ContactMethod
            icon={Phone}
            title="Phone"
            value={contactInfo.phone}
            description="Call or text me"
            action={handlePhoneClick}
            actionLabel="Call Now"
            copyable={true}
            availability={showAvailability ? contactInfo.availability : undefined}
          />
        )}

        {/* Location */}
        <ContactMethod
          icon={MapPin}
          title="Location"
          value={`${contactInfo.location.city}, ${contactInfo.location.country}`}
          description={contactInfo.location.timezone ? `Timezone: ${contactInfo.location.timezone}` : undefined}
          action={handleLocationClick}
          actionLabel="View on Map"
          external={true}
        />

        {/* Meeting */}
        <ContactMethod
          icon={Calendar}
          title="Schedule Meeting"
          value="Book a call"
          description="Let's discuss your project"
          action={() => window.open('https://calendly.com', '_blank')}
          actionLabel="Schedule"
          external={true}
        />

        {/* Video Call */}
        <ContactMethod
          icon={Video}
          title="Video Call"
          value="Available for calls"
          description="Face-to-face discussion"
          action={() => window.open('https://meet.google.com', '_blank')}
          actionLabel="Start Call"
          external={true}
        />

        {/* WhatsApp or Messaging */}
        {contactInfo.phone && (
          <ContactMethod
            icon={MessageCircle}
            title="WhatsApp"
            value="Quick messaging"
            description="Instant communication"
            action={() => window.open(`https://wa.me/${contactInfo.phone?.replace(/[^\d]/g, '')}`, '_blank')}
            actionLabel="Chat"
            external={true}
          />
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('space-y-6', className)}>
      {/* Primary Contact Info */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-8 border border-primary-200 dark:border-primary-800">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-2">
            Let's Connect
          </h3>
          <p className="text-primary-700 dark:text-primary-300">
            Choose your preferred way to get in touch
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <motion.div
            className="group relative bg-white dark:bg-secondary-900 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-secondary-900 dark:text-white">Email</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Primary contact method</p>
              </div>
              {showAvailability && (
                <div className={cn(
                  'ml-auto w-3 h-3 rounded-full',
                  contactInfo.availability === 'available' && 'bg-green-500',
                  contactInfo.availability === 'busy' && 'bg-yellow-500',
                  contactInfo.availability === 'unavailable' && 'bg-red-500'
                )} />
              )}
            </div>
            
            <div className="mb-4">
              <p className="text-lg font-medium text-secondary-900 dark:text-white mb-1">
                {contactInfo.email}
              </p>
              {showResponseTime && (
                <div className="flex items-center gap-1 text-sm text-secondary-600 dark:text-secondary-400">
                  <Clock className="h-3 w-3" />
                  <span>Usually responds within {expectedResponseTime}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <motion.button
                onClick={handleEmailClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail className="h-4 w-4" />
                Send Email
              </motion.button>
              <CopyButton text={contactInfo.email} />
            </div>
          </motion.div>

          {/* Phone */}
          {contactInfo.phone && (
            <motion.div
              className="group relative bg-white dark:bg-secondary-900 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900 dark:text-white">Phone</h4>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">Call or text</p>
                </div>
                {showAvailability && (
                  <div className={cn(
                    'ml-auto w-3 h-3 rounded-full',
                    contactInfo.availability === 'available' && 'bg-green-500',
                    contactInfo.availability === 'busy' && 'bg-yellow-500',
                    contactInfo.availability === 'unavailable' && 'bg-red-500'
                  )} />
                )}
              </div>
              
              <div className="mb-4">
                <p className="text-lg font-medium text-secondary-900 dark:text-white mb-1">
                  {contactInfo.phone}
                </p>
                <div className="flex items-center gap-1 text-sm text-secondary-600 dark:text-secondary-400">
                  <Globe className="h-3 w-3" />
                  <span>{contactInfo.location.timezone || 'Local time'}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <motion.button
                  onClick={handlePhoneClick}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </motion.button>
                <CopyButton text={contactInfo.phone} />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Secondary Contact Methods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Location */}
        <motion.button
          onClick={handleLocationClick}
          className="flex items-center gap-3 p-4 bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:shadow-md transition-all duration-200 text-left"
          whileHover={{ y: -1 }}
        >
          <MapPin className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
          <div>
            <div className="font-medium text-secondary-900 dark:text-white">Location</div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              {contactInfo.location.city}, {contactInfo.location.country}
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-secondary-400 ml-auto" />
        </motion.button>

        {/* Schedule Meeting */}
        <motion.button
          onClick={() => window.open('https://calendly.com', '_blank')}
          className="flex items-center gap-3 p-4 bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:shadow-md transition-all duration-200 text-left"
          whileHover={{ y: -1 }}
        >
          <Calendar className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
          <div>
            <div className="font-medium text-secondary-900 dark:text-white">Schedule Call</div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              Book a meeting
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-secondary-400 ml-auto" />
        </motion.button>

        {/* Download vCard */}
        <motion.button
          onClick={() => {
            // Generate vCard content
            const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contactInfo.email.split('@')[0]}
EMAIL:${contactInfo.email}
${contactInfo.phone ? `TEL:${contactInfo.phone}` : ''}
ADR:;;${contactInfo.location.city};${contactInfo.location.country};;;;
END:VCARD`
            
            const blob = new Blob([vcard], { type: 'text/vcard' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'contact.vcf'
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="flex items-center gap-3 p-4 bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:shadow-md transition-all duration-200 text-left"
          whileHover={{ y: -1 }}
        >
          <Download className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
          <div>
            <div className="font-medium text-secondary-900 dark:text-white">Save Contact</div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              Download vCard
            </div>
          </div>
        </motion.button>
      </div>

      {/* Availability Status */}
      {showAvailability && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'flex items-center justify-between p-6 rounded-xl border',
            contactInfo.availability === 'available' && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
            contactInfo.availability === 'busy' && 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
            contactInfo.availability === 'unavailable' && 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-4 h-4 rounded-full',
              contactInfo.availability === 'available' && 'bg-green-500',
              contactInfo.availability === 'busy' && 'bg-yellow-500',
              contactInfo.availability === 'unavailable' && 'bg-red-500'
            )} />
            <div>
              <div className={cn(
                'font-semibold capitalize',
                contactInfo.availability === 'available' && 'text-green-900 dark:text-green-100',
                contactInfo.availability === 'busy' && 'text-yellow-900 dark:text-yellow-100',
                contactInfo.availability === 'unavailable' && 'text-red-900 dark:text-red-100'
              )}>
                {contactInfo.availability === 'available' && 'Available for new projects'}
                {contactInfo.availability === 'busy' && 'Currently busy, limited availability'}
                {contactInfo.availability === 'unavailable' && 'Not available for new projects'}
              </div>
              {showResponseTime && (
                <div className={cn(
                  'text-sm',
                  contactInfo.availability === 'available' && 'text-green-700 dark:text-green-300',
                  contactInfo.availability === 'busy' && 'text-yellow-700 dark:text-yellow-300',
                  contactInfo.availability === 'unavailable' && 'text-red-700 dark:text-red-300'
                )}>
                  {contactInfo.availability === 'available' && `Typically responds within ${expectedResponseTime}`}
                  {contactInfo.availability === 'busy' && `Response time may be longer than usual`}
                  {contactInfo.availability === 'unavailable' && 'Will respond to important inquiries only'}
                </div>
              )}
            </div>
          </div>
          <Clock className={cn(
            'h-6 w-6',
            contactInfo.availability === 'available' && 'text-green-600 dark:text-green-400',
            contactInfo.availability === 'busy' && 'text-yellow-600 dark:text-yellow-400',
            contactInfo.availability === 'unavailable' && 'text-red-600 dark:text-red-400'
          )} />
        </motion.div>
      )}
    </div>
  )
}

// Copy Button Component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <motion.button
      onClick={handleCopy}
      className="px-3 py-2 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {copied ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </motion.button>
  )
}