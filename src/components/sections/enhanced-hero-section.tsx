'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowDown, Sparkles, Code, Palette, Star, MapPin } from 'lucide-react'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { ParticleBackground } from '@/components/ui/particle-background'
import { SocialLinks, FloatingSocialBar } from '@/components/ui/social-links'
import { CTAButtonGroup, ContactButton, ResumeButton, FloatingActionButton } from '@/components/ui/cta-buttons'
import { usePersonalInfo } from '@/hooks/use-firestore'
import { cn } from '@/lib/utils'

export function EnhancedHeroSection() {
  const { data: personalInfo, loading } = usePersonalInfo()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Dynamic titles for typing animation
  const titles = [
    'Full-Stack Developer',
    'UI/UX Designer', 
    'Problem Solver',
    'Code Architect',
    'Digital Creator',
    'Tech Enthusiast',
  ]

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Intersection observer for animations
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const scrollToNext = () => {
    const nextSection = document.querySelector('#about')
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Format time with timezone
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: personalInfo?.contact?.location?.timezone || 'UTC',
      hour12: true,
    })
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-500'
      case 'busy': return 'text-yellow-500'
      case 'unavailable': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getAvailabilityDot = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500 animate-pulse'
      case 'busy': return 'bg-yellow-500'
      case 'unavailable': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-secondary-900 dark:via-secondary-900 dark:to-secondary-800" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
          <span className="text-lg font-medium text-secondary-600 dark:text-secondary-300">
            Loading...
          </span>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground
        particleCount={60}
        colors={['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981']}
        className="opacity-20"
      />

      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/90 via-white/95 to-accent-50/90 dark:from-secondary-900/95 dark:via-secondary-900/98 dark:to-secondary-800/95" />
        
        {/* Animated gradient orbs with mouse parallax */}
        <div 
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-primary-400/20 to-accent-400/20 rounded-full blur-3xl animate-pulse-slow"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          }}
        />
        <div 
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-accent-400/20 to-primary-400/20 rounded-full blur-3xl animate-pulse-slow"
          style={{
            transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`,
            animationDelay: '2s'
          }}
        />
        
        {/* Floating geometric shapes */}
        <div 
          className="absolute top-1/4 right-1/4 w-8 h-8 bg-primary-500/30 rotate-45 animate-bounce-slow"
          style={{
            transform: `translate(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px) rotate(45deg)`,
            animationDelay: '0.5s'
          }}
        />
        <div 
          className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-accent-500/30 rounded-full animate-bounce-slow"
          style={{
            transform: `translate(${-mousePosition.x * 0.6}px, ${-mousePosition.y * 0.6}px)`,
            animationDelay: '1.5s'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container-custom section-padding">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          
          {/* Left Side - Text Content */}
          <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
            
            {/* Status Badge */}
            <div className={cn(
              'transition-all duration-1000 transform',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              <div className="inline-flex items-center gap-3 px-4 py-2 glass rounded-full border border-primary-200/50 dark:border-primary-700/50 mb-6">
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', getAvailabilityDot(personalInfo?.contact?.availability || 'available'))} />
                  <span className={cn('text-sm font-medium', getAvailabilityColor(personalInfo?.contact?.availability || 'available'))}>
                    {personalInfo?.contact?.availability === 'available' ? 'Available for opportunities' :
                     personalInfo?.contact?.availability === 'busy' ? 'Currently busy' : 'Unavailable'}
                  </span>
                </div>
                
                {/* Location and time */}
                {personalInfo?.contact?.location && (
                  <div className="flex items-center gap-1 text-xs text-secondary-600 dark:text-secondary-400 border-l border-secondary-300 dark:border-secondary-600 pl-3">
                    <MapPin className="h-3 w-3" />
                    <span>{personalInfo.contact.location.city}, {personalInfo.contact.location.country}</span>
                    <span className="mx-1">•</span>
                    <span>{formatTime(currentTime)}</span>
                  </div>
                )}
              </div>
              
              <p className="text-lg text-secondary-600 dark:text-secondary-300 mb-2">
                👋 Hello there! I'm
              </p>
            </div>

            {/* Name with enhanced styling */}
            <div className={cn(
              'transition-all duration-1000 transform delay-200',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-none mb-2">
                <span className="relative inline-block">
                  <span className="gradient-text bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 bg-clip-text text-transparent animate-gradient">
                    {personalInfo?.name || 'Sujit'}
                  </span>
                  {/* Text glow effect */}
                  <span className="absolute inset-0 gradient-text bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 bg-clip-text text-transparent blur-sm opacity-50 animate-gradient" />
                </span>
              </h1>
            </div>

            {/* Dynamic Title with Typing Effect */}
            <div className={cn(
              'transition-all duration-1000 transform delay-300',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              <div className="text-2xl md:text-4xl lg:text-5xl font-semibold text-secondary-700 dark:text-secondary-300 h-16 lg:h-20 flex items-center justify-center lg:justify-start">
                <span className="mr-3">I'm a</span>
                <TypingAnimation 
                  texts={titles}
                  className="text-primary-600 dark:text-primary-400 font-bold"
                  typingSpeed={80}
                  deletingSpeed={40}
                  pauseDuration={2500}
                />
              </div>
            </div>

            {/* Description with enhanced typography */}
            <div className={cn(
              'transition-all duration-1000 transform delay-500',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              <p className="text-lg md:text-xl lg:text-2xl text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-balance">
                {personalInfo?.bio || "Passionate about crafting beautiful, functional, and user-centered digital experiences. I bring ideas to life through clean code and thoughtful design."}
              </p>
            </div>

            {/* Enhanced Stats */}
            <div className={cn(
              'transition-all duration-1000 transform delay-600',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-secondary-600 dark:text-secondary-400">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>5+ Years Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  <span>50+ Projects Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Award Winner</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className={cn(
              'transition-all duration-1000 transform delay-700',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              <CTAButtonGroup
                primaryButton={
                  <ContactButton 
                    href="#contact"
                    size="lg"
                    className="shadow-2xl hover:shadow-3xl hover-lift"
                  />
                }
                secondaryButton={
                  <ResumeButton
                    href={personalInfo?.resume || '/resume.pdf'}
                    size="lg"
                    className="hover-lift"
                  />
                }
                direction="horizontal"
                className="justify-center lg:justify-start"
              />
            </div>

            {/* Enhanced Social Links */}
            <div className={cn(
              'transition-all duration-1000 transform delay-900',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              <SocialLinks
                links={personalInfo?.socialLinks?.reduce((acc, link) => {
                  if (link.isVisible) {
                    acc[link.platform.toLowerCase()] = link.url
                  }
                  return acc
                }, {} as Record<string, string>) || {
                  github: 'https://github.com',
                  linkedin: 'https://linkedin.com',
                  twitter: 'https://twitter.com',
                  email: 'mailto:hello@example.com'
                }}
                variant="floating"
                size="md"
                className="justify-center lg:justify-start"
              />
            </div>
          </div>

          {/* Right Side - Enhanced Profile Image */}
          <div className="order-1 lg:order-2">
            <div className={cn(
              'relative transition-all duration-1000 transform delay-400',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              
              {/* Background glow effects */}
              <div className="absolute -inset-8 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute -inset-4 bg-gradient-to-r from-accent-500/10 to-primary-500/10 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
              
              {/* Floating decorative elements with physics */}
              <div 
                className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl opacity-80 animate-float hover-lift"
                style={{ 
                  transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px) rotate(15deg)`,
                  filter: 'drop-shadow(0 10px 20px rgba(59, 130, 246, 0.3))'
                }}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Code className="h-10 w-10 text-white" />
                </div>
              </div>
              
              <div 
                className="absolute -bottom-12 -left-12 w-20 h-20 bg-gradient-to-r from-accent-500 to-primary-500 rounded-2xl opacity-80 animate-float hover-lift"
                style={{ 
                  transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px) rotate(-10deg)`,
                  animationDelay: '2s',
                  filter: 'drop-shadow(0 10px 20px rgba(236, 72, 153, 0.3))'
                }}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Palette className="h-8 w-8 text-white" />
                </div>
              </div>

              <div 
                className="absolute top-1/4 -left-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-60 animate-float"
                style={{ 
                  transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.4}px) rotate(45deg)`,
                  animationDelay: '3s'
                }}
              />

              {/* Main Profile Image Container */}
              <div className="relative w-80 h-80 lg:w-96 lg:h-96 mx-auto perspective-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 rounded-full p-1 animate-spin-slow">
                  <div className="w-full h-full bg-white dark:bg-secondary-900 rounded-full p-3 relative overflow-hidden">
                    {personalInfo?.profileImage ? (
                      <Image
                        src={personalInfo.profileImage}
                        alt={personalInfo.name || 'Profile'}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover rounded-full hover-lift transition-transform duration-500"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 via-white to-accent-100 dark:from-primary-900 dark:via-secondary-800 dark:to-accent-900 rounded-full flex items-center justify-center">
                        <span className="text-8xl lg:text-9xl font-bold gradient-text">
                          {(personalInfo?.name || 'Sujit')[0]}
                        </span>
                      </div>
                    )}

                    {/* Animated border overlay */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>

                {/* Enhanced Glassmorphism overlay */}
                <div className="absolute inset-0 glass rounded-full opacity-0 hover:opacity-100 transition-all duration-700 flex items-center justify-center group">
                  <div className="text-white dark:text-secondary-200 text-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <div className="flex items-center justify-center mb-2">
                      <div className={cn('w-3 h-3 rounded-full mr-2', getAvailabilityDot(personalInfo?.contact?.availability || 'available'))} />
                      <p className="font-semibold text-lg">Available for work</p>
                    </div>
                    <p className="text-sm opacity-80">Let's create something amazing together</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className={cn(
            'transition-all duration-1000 transform delay-1000',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          )}>
            <button
              onClick={scrollToNext}
              className="flex flex-col items-center gap-2 text-secondary-400 hover:text-primary-600 transition-all duration-300 group hover-lift"
              aria-label="Scroll to next section"
            >
              <span className="text-sm font-medium">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center relative overflow-hidden">
                <div className="w-1 h-3 bg-current rounded-full mt-2 animate-bounce" />
                <div className="absolute inset-0 bg-current/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </div>
              <ArrowDown className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Social Bar for Desktop */}
      <FloatingSocialBar
        position="left"
        links={personalInfo?.socialLinks?.reduce((acc, link) => {
          if (link.isVisible) {
            acc[link.platform.toLowerCase()] = link.url
          }
          return acc
        }, {} as Record<string, string>)}
      />

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <FloatingActionButton
          icon={ArrowDown}
          label="Explore portfolio"
          onClick={scrollToNext}
        />
      </div>
    </section>
  )
}