'use client'

import { Code, Database, Globe, Smartphone, Server, Tool } from 'lucide-react'
import type { Skill } from '@/types'

const skillCategories = [
  {
    title: 'Frontend',
    icon: Globe,
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vue.js', 'HTML/CSS'],
  },
  {
    title: 'Backend',
    icon: Server,
    skills: ['Node.js', 'Python', 'Express.js', 'FastAPI', 'GraphQL', 'REST APIs'],
  },
  {
    title: 'Database',
    icon: Database,
    skills: ['PostgreSQL', 'MongoDB', 'Firebase', 'Redis', 'Prisma', 'SQL'],
  },
  {
    title: 'Mobile',
    icon: Smartphone,
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Expo', 'PWA'],
  },
  {
    title: 'DevOps',
    icon: Tool,
    skills: ['Docker', 'AWS', 'Vercel', 'GitHub Actions', 'Linux', 'Nginx'],
  },
  {
    title: 'Languages',
    icon: Code,
    skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust'],
  },
]

export function SkillsSection() {
  return (
    <section id="skills" className="section-padding bg-secondary-50 dark:bg-secondary-800">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-white mb-4">
              Skills & Technologies
            </h2>
            <p className="text-lg text-secondary-600 dark:text-secondary-300">
              Technologies I work with
            </p>
          </div>

          {/* Skills grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skillCategories.map((category, index) => (
              <div
                key={category.title}
                className="bg-white dark:bg-secondary-900 rounded-xl p-6 card-hover"
              >
                <div className="flex items-center mb-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mr-4">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
                    {category.title}
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {category.skills.map((skill) => (
                    <div
                      key={skill}
                      className="px-3 py-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg text-center text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Additional skills section */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-semibold text-secondary-900 dark:text-white mb-8">
              Always Learning
            </h3>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {[
                'Machine Learning',
                'AI/ML',
                'Blockchain',
                'Web3',
                'Cybersecurity',
                'Cloud Architecture',
                'Microservices',
                'Performance Optimization',
              ].map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-sm font-medium hover:scale-105 transition-transform"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}