'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowDown, Sparkles, Code, Palette } from 'lucide-react'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { ParticleBackground } from '@/components/ui/particle-background'
import { SocialLinks, FloatingSocialBar } from '@/components/ui/social-links'
import { CTAButtonGroup, ContactButton, ResumeButton, FloatingActionButton } from '@/components/ui/cta-buttons'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  personalInfo?: {
    name?: string
    title?: string
    bio?: string
    profileImage?: string
    socialLinks?: Record<string, string>
  }
}

export function HeroSection({ personalInfo }: HeroSectionProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  // Dynamic titles for typing animation
  const titles = [
    'Full-Stack Developer',
    'UI/UX Designer', 
    'Problem Solver',
    'Code Architect',
    'Digital Creator',
  ]

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
    setIsVisible(true)
  }, [])

  const scrollToNext = () => {
    const nextSection = document.querySelector('#about')
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground
        particleCount={80}
        colors={['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981']}
        className="opacity-30"
      />

      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white/90 to-accent-50/80 dark:from-secondary-900/90 dark:via-secondary-900/95 dark:to-secondary-800/90" />
        
        {/* Animated gradient orbs */}
        <div 
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-primary-400/30 to-accent-400/30 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          }}
        />
        <div 
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-accent-400/30 to-primary-400/30 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`,
            animationDelay: '1s'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container-custom section-padding">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left Side - Text Content */}
          <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
            
            {/* Greeting with animation */}
            <div className={cn(
              'transition-all duration-1000 transform',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-secondary-800/60 backdrop-blur-sm rounded-full border border-primary-200/50 dark:border-primary-700/50 mb-6">
                <Sparkles className="h-4 w-4 text-primary-600 animate-pulse" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  Available for new opportunities
                </span>
              </div>
              
              <p className="text-lg text-secondary-600 dark:text-secondary-300 mb-2">
                👋 Hello there! I'm
              </p>
            </div>

            {/* Name */}
            <div className={cn(
              'transition-all duration-1000 transform delay-200',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold">
                <span className="gradient-text bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 bg-clip-text text-transparent animate-gradient">
                  {personalInfo?.name || 'Sujit'}
                </span>
              </h1>
            </div>

            {/* Dynamic Title with Typing Effect */}
            <div className={cn(
              'transition-all duration-1000 transform delay-300',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              <div className="text-2xl md:text-4xl font-semibold text-secondary-700 dark:text-secondary-300 h-16 flex items-center justify-center lg:justify-start">
                <span className="mr-3">I'm a</span>
                <TypingAnimation 
                  texts={titles}
                  className="text-primary-600 dark:text-primary-400"
                  typingSpeed={80}
                  deletingSpeed={40}
                  pauseDuration={2000}
                />
              </div>
            </div>

            {/* Description */}
            <div className={cn(
              'transition-all duration-1000 transform delay-500',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              <p className="text-lg md:text-xl text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {personalInfo?.bio || "Passionate about crafting beautiful, functional, and user-centered digital experiences. I bring ideas to life through clean code and thoughtful design."}
              </p>
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
                    className="shadow-xl hover:shadow-2xl"
                  />
                }
                secondaryButton={
                  <ResumeButton
                    href="/resume.pdf"
                    size="lg"
                  />
                }
                direction="horizontal"
                className="justify-center lg:justify-start"
              />
            </div>

            {/* Social Links */}
            <div className={cn(
              'transition-all duration-1000 transform delay-900',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              <SocialLinks
                links={personalInfo?.socialLinks || {
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

          {/* Right Side - Profile Image */}
          <div className="order-1 lg:order-2">
            <div className={cn(
              'relative transition-all duration-1000 transform delay-400',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}>
              
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-2xl animate-pulse" />
              <div 
                className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl opacity-80 animate-float"
                style={{ transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)` }}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Code className="h-8 w-8 text-white" />
                </div>
              </div>
              <div 
                className="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-r from-accent-500 to-primary-500 rounded-xl opacity-80 animate-float"
                style={{ 
                  transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`,
                  animationDelay: '2s' 
                }}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Palette className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Profile Image Container */}
              <div className="relative w-80 h-80 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 rounded-full p-1 animate-spin-slow">
                  <div className="w-full h-full bg-white dark:bg-secondary-900 rounded-full p-2">
                    {personalInfo?.profileImage ? (
                      <Image
                        src={personalInfo.profileImage}
                        alt={personalInfo.name || 'Profile'}
                        width={320}
                        height={320}
                        className="w-full h-full object-cover rounded-full"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 rounded-full flex items-center justify-center">
                        <span className="text-8xl font-bold gradient-text">
                          {(personalInfo?.name || 'Sujit')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="text-white dark:text-secondary-200 text-center">
                    <p className="font-semibold">Available for work</p>
                    <p className="text-sm opacity-80">Let's create together</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className={cn(
            'transition-all duration-1000 transform delay-1000',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          )}>
            <button
              onClick={scrollToNext}
              className="flex flex-col items-center gap-2 text-secondary-400 hover:text-primary-600 transition-colors group"
              aria-label="Scroll to next section"
            >
              <span className="text-sm font-medium">Scroll down</span>
              <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center">
                <div className="w-1 h-3 bg-current rounded-full mt-2 animate-bounce" />
              </div>
              <ArrowDown className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Social Bar for Desktop */}
      <FloatingSocialBar
        position="left"
        links={personalInfo?.socialLinks}
      />

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <FloatingActionButton
          icon={ArrowDown}
          label="Scroll to next section"
          onClick={scrollToNext}
        />
      </div>
    </section>
  )
}