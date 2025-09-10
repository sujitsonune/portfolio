import { Metadata } from 'next'
import { Suspense } from 'react'
import { HeroSection } from '@/components/sections/hero-section'
import { AboutSection } from '@/components/sections/about-section'
import { SkillsSection } from '@/components/sections/skills-section'
import { ProjectsSection } from '@/components/sections/projects-section'
import { ExperienceSection } from '@/components/sections/experience-section'
import { ContactSection } from '@/components/sections/contact-section'
import { AnimatedContainer } from '@/components/ui/AnimatedContainer'
import { PageTransition } from '@/components/ui/PageTransition'
import { generatePageMetadata } from '@/lib/seo'

export const metadata: Metadata = generatePageMetadata({
  title: 'Home',
  description: 'Full Stack Developer specializing in React, Node.js, and modern web technologies.',
  path: '/',
})

// Loading fallback component
function SectionSkeleton({ height = 'h-96' }: { height?: string }) {
  return (
    <div className={`${height} animate-pulse bg-muted rounded-lg mb-8`}>
      <div className="p-8 space-y-4">
        <div className="h-8 bg-muted-foreground/20 rounded w-1/3"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-2/3"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section id="hero" className="relative">
          <Suspense fallback={<SectionSkeleton height="min-h-screen" />}>
            <HeroSection />
          </Suspense>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-muted/30">
          <AnimatedContainer>
            <Suspense fallback={<SectionSkeleton />}>
              <AboutSection />
            </Suspense>
          </AnimatedContainer>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-20">
          <AnimatedContainer>
            <Suspense fallback={<SectionSkeleton />}>
              <SkillsSection />
            </Suspense>
          </AnimatedContainer>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-20 bg-muted/30">
          <AnimatedContainer>
            <Suspense fallback={<SectionSkeleton />}>
              <ExperienceSection />
            </Suspense>
          </AnimatedContainer>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-20">
          <AnimatedContainer>
            <Suspense fallback={<SectionSkeleton />}>
              <ProjectsSection />
            </Suspense>
          </AnimatedContainer>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-muted/30">
          <AnimatedContainer>
            <Suspense fallback={<SectionSkeleton />}>
              <ContactSection />
            </Suspense>
          </AnimatedContainer>
        </section>
      </div>
    </PageTransition>
  )
}