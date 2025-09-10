'use client'

import { WorkExperienceTimeline } from '@/components/ui/work-experience-timeline'

export function ExperienceSection() {
  return (
    <section id="experience" className="section-padding bg-white dark:bg-secondary-900">
      <div className="container-custom">
        <WorkExperienceTimeline
          variant="timeline"
          showFilters={true}
          showStats={true}
        />
      </div>
    </section>
  )
}