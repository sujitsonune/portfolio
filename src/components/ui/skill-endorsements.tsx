'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Award, 
  Star, 
  Quote, 
  ExternalLink, 
  Calendar,
  CheckCircle,
  Shield,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  LinkedinIcon as LinkedIn
} from 'lucide-react'
import type { Skill, SkillEndorsement, SkillCertification } from '@/types'
import { cn } from '@/lib/utils'

interface SkillEndorsementsProps {
  skill: Skill
  className?: string
  showCertifications?: boolean
  maxEndorsements?: number
  variant?: 'default' | 'compact' | 'detailed'
}

export function SkillEndorsements({
  skill,
  className,
  showCertifications = true,
  maxEndorsements = 5,
  variant = 'default'
}: SkillEndorsementsProps) {
  const [showAllEndorsements, setShowAllEndorsements] = useState(false)
  const [showAllCertifications, setShowAllCertifications] = useState(false)

  const visibleEndorsements = showAllEndorsements 
    ? skill.endorsements 
    : skill.endorsements.slice(0, maxEndorsements)

  const activeCertifications = skill.certifications.filter(cert => cert.isActive)
  const expiredCertifications = skill.certifications.filter(cert => !cert.isActive)

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Endorsements Summary */}
        {skill.endorsements.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                {skill.endorsements.length} Endorsement{skill.endorsements.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex -space-x-2">
              {skill.endorsements.slice(0, 3).map((endorsement, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-700 border-2 border-white dark:border-secondary-900 flex items-center justify-center text-xs font-medium text-primary-800 dark:text-primary-200"
                  title={endorsement.endorserName}
                >
                  {endorsement.endorserName.charAt(0)}
                </div>
              ))}
              {skill.endorsements.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-secondary-300 dark:bg-secondary-600 border-2 border-white dark:border-secondary-900 flex items-center justify-center text-xs font-medium text-secondary-700 dark:text-secondary-200">
                  +{skill.endorsements.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Certifications Summary */}
        {showCertifications && activeCertifications.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                {activeCertifications.length} Active Certificate{activeCertifications.length !== 1 ? 's' : ''}
              </span>
            </div>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Endorsements Section */}
      {skill.endorsements.length > 0 && (
        <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" />
              Endorsements ({skill.endorsements.length})
            </h3>
            
            {skill.endorsements.length > maxEndorsements && (
              <button
                onClick={() => setShowAllEndorsements(!showAllEndorsements)}
                className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                {showAllEndorsements ? (
                  <>Show less <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>Show all <ChevronDown className="h-4 w-4" /></>
                )}
              </button>
            )}
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {visibleEndorsements.map((endorsement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                      {endorsement.endorserImage ? (
                        <img 
                          src={endorsement.endorserImage} 
                          alt={endorsement.endorserName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        endorsement.endorserName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-secondary-900 dark:text-white">
                            {endorsement.endorserName}
                          </h4>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">
                            {endorsement.endorserRole}
                            {endorsement.endorserCompany && (
                              <span> at {endorsement.endorserCompany}</span>
                            )}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                          <Calendar className="h-3 w-3" />
                          <span>{endorsement.date.toDate().toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Relationship badge */}
                      <div className="mb-3">
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          endorsement.relationship === 'manager' && 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
                          endorsement.relationship === 'colleague' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
                          endorsement.relationship === 'client' && 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
                          endorsement.relationship === 'peer' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
                          endorsement.relationship === 'other' && 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                        )}>
                          {endorsement.relationship}
                        </span>
                      </div>

                      {/* Message */}
                      {endorsement.message && (
                        <div className="relative">
                          <Quote className="absolute -top-1 -left-1 h-4 w-4 text-secondary-300 dark:text-secondary-600" />
                          <p className="text-sm text-secondary-700 dark:text-secondary-300 italic pl-4">
                            {endorsement.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Certifications Section */}
      {showCertifications && skill.certifications.length > 0 && (
        <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Certifications ({skill.certifications.length})
            </h3>
            
            {skill.certifications.length > 3 && (
              <button
                onClick={() => setShowAllCertifications(!showAllCertifications)}
                className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                {showAllCertifications ? (
                  <>Show less <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>Show all <ChevronDown className="h-4 w-4" /></>
                )}
              </button>
            )}
          </div>

          {/* Active Certifications */}
          {activeCertifications.length > 0 && (
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Active Certifications
              </h4>
              
              <div className="grid gap-3">
                {(showAllCertifications ? activeCertifications : activeCertifications.slice(0, 3)).map((cert, index) => (
                  <CertificationCard key={index} certification={cert} />
                ))}
              </div>
            </div>
          )}

          {/* Expired Certifications */}
          {showAllCertifications && expiredCertifications.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-secondary-500" />
                Previous Certifications
              </h4>
              
              <div className="grid gap-3">
                {expiredCertifications.map((cert, index) => (
                  <CertificationCard key={index} certification={cert} expired />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {skill.endorsements.length === 0 && skill.certifications.length === 0 && (
        <div className="bg-white dark:bg-secondary-900 rounded-xl p-8 border border-secondary-200 dark:border-secondary-700 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-secondary-600 dark:text-secondary-400 mb-2">
            No endorsements or certifications yet
          </p>
          <p className="text-secondary-500 dark:text-secondary-500 text-sm">
            Endorsements and certifications will appear here as they are added
          </p>
        </div>
      )}
    </div>
  )
}

// Certification Card Component
interface CertificationCardProps {
  certification: SkillCertification
  expired?: boolean
}

function CertificationCard({ certification, expired = false }: CertificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const isExpiringSoon = certification.expiryDate && 
    certification.expiryDate.toDate() < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  return (
    <motion.div
      layout
      className={cn(
        'border rounded-lg p-4 transition-all duration-200',
        expired 
          ? 'border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 opacity-75'
          : 'border-secondary-200 dark:border-secondary-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Badge/Icon */}
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center shrink-0',
          expired 
            ? 'bg-secondary-200 dark:bg-secondary-700'
            : 'bg-green-100 dark:bg-green-900/20'
        )}>
          {certification.badgeUrl ? (
            <img 
              src={certification.badgeUrl} 
              alt={certification.name}
              className="w-8 h-8 object-contain"
            />
          ) : (
            <Award className={cn(
              'h-6 w-6',
              expired 
                ? 'text-secondary-500 dark:text-secondary-400'
                : 'text-green-600 dark:text-green-400'
            )} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className={cn(
                'font-semibold',
                expired 
                  ? 'text-secondary-600 dark:text-secondary-400'
                  : 'text-secondary-900 dark:text-white'
              )}>
                {certification.name}
              </h4>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {certification.issuer}
              </p>
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-2">
              {expired && (
                <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 text-xs rounded-full">
                  Expired
                </span>
              )}
              {!expired && isExpiringSoon && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 text-xs rounded-full">
                  Expiring Soon
                </span>
              )}
              {!expired && !isExpiringSoon && (
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-xs rounded-full flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Active
                </span>
              )}
            </div>
          </div>

          {/* Dates and Score */}
          <div className="flex items-center gap-4 text-xs text-secondary-500 dark:text-secondary-400 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Issued: {certification.date.toDate().toLocaleDateString()}</span>
            </div>
            
            {certification.expiryDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Expires: {certification.expiryDate.toDate().toLocaleDateString()}</span>
              </div>
            )}
            
            {certification.score && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>Score: {certification.score}</span>
              </div>
            )}
          </div>

          {/* Level */}
          {certification.level && (
            <div className="mb-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 text-xs rounded-full">
                {certification.level}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {certification.credentialUrl && (
              <a
                href={certification.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-1 text-xs font-medium hover:underline',
                  expired 
                    ? 'text-secondary-500 dark:text-secondary-400'
                    : 'text-primary-600 dark:text-primary-400'
                )}
              >
                <Eye className="h-3 w-3" />
                View Certificate
              </a>
            )}
            
            {certification.credentialId && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300"
              >
                ID: {certification.credentialId}
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 pt-3 border-t border-secondary-200 dark:border-secondary-700"
              >
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-secondary-500 dark:text-secondary-400">Credential ID</dt>
                    <dd className="text-secondary-900 dark:text-white font-mono">{certification.credentialId}</dd>
                  </div>
                  {certification.score && (
                    <div>
                      <dt className="text-secondary-500 dark:text-secondary-400">Score</dt>
                      <dd className="text-secondary-900 dark:text-white">{certification.score}</dd>
                    </div>
                  )}
                </dl>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// Endorsement Statistics Component
interface EndorsementStatsProps {
  skills: Skill[]
  className?: string
}

export function EndorsementStats({ skills, className }: EndorsementStatsProps) {
  const totalEndorsements = skills.reduce((sum, skill) => sum + skill.endorsements.length, 0)
  const totalCertifications = skills.reduce((sum, skill) => 
    sum + skill.certifications.filter(cert => cert.isActive).length, 0
  )
  const skillsWithEndorsements = skills.filter(skill => skill.endorsements.length > 0)
  const skillsWithCertifications = skills.filter(skill => 
    skill.certifications.some(cert => cert.isActive)
  )

  // Most endorsed skills
  const mostEndorsedSkills = skills
    .filter(skill => skill.endorsements.length > 0)
    .sort((a, b) => b.endorsements.length - a.endorsements.length)
    .slice(0, 3)

  return (
    <div className={cn('bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-700', className)}>
      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-6">
        Validation Summary
      </h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {totalEndorsements}
          </div>
          <div className="text-sm text-primary-700 dark:text-primary-300">
            Total Endorsements
          </div>
        </div>

        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalCertifications}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            Active Certificates
          </div>
        </div>

        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {skillsWithEndorsements.length}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            Endorsed Skills
          </div>
        </div>

        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {skillsWithCertifications.length}
          </div>
          <div className="text-sm text-purple-700 dark:text-purple-300">
            Certified Skills
          </div>
        </div>
      </div>

      {/* Most Endorsed Skills */}
      {mostEndorsedSkills.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
            Most Endorsed Skills
          </h4>
          <div className="space-y-2">
            {mostEndorsedSkills.map((skill, index) => (
              <div key={skill.id} className="flex items-center justify-between p-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-secondary-900 dark:text-white">
                    {skill.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-secondary-600 dark:text-secondary-400">
                  <Users className="h-3 w-3" />
                  <span>{skill.endorsements.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}