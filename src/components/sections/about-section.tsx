'use client'

import { Code, Coffee, Heart, Users } from 'lucide-react'

const stats = [
  { icon: Code, label: 'Projects Completed', value: '50+' },
  { icon: Coffee, label: 'Cups of Coffee', value: '1000+' },
  { icon: Users, label: 'Happy Clients', value: '25+' },
  { icon: Heart, label: 'Years Experience', value: '3+' },
]

export function AboutSection() {
  return (
    <section id="about" className="section-padding bg-white dark:bg-secondary-900">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-white mb-4">
              About Me
            </h2>
            <p className="text-lg text-secondary-600 dark:text-secondary-300">
              Get to know me better
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-secondary-900 dark:text-white">
                  Passionate Developer & Problem Solver
                </h3>
                <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
                  I'm a full-stack developer with a passion for creating beautiful, 
                  functional, and user-friendly applications. With expertise in modern 
                  web technologies, I enjoy turning complex problems into simple, 
                  beautiful, and intuitive solutions.
                </p>
                <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
                  When I'm not coding, you can find me exploring new technologies, 
                  contributing to open-source projects, or sharing knowledge with 
                  the developer community. I believe in continuous learning and 
                  staying up-to-date with the latest industry trends.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-secondary-900 dark:text-white">
                  What I'm passionate about:
                </h4>
                <ul className="space-y-2 text-secondary-600 dark:text-secondary-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-3" />
                    Building scalable web applications
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-3" />
                    User experience and interface design
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-3" />
                    Open source contribution
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-3" />
                    Mentoring other developers
                  </li>
                </ul>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center p-6 bg-secondary-50 dark:bg-secondary-800 rounded-xl card-hover"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mb-4">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}