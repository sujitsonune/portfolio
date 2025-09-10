'use client'

import { ProjectsSection as ComprehensiveProjectsSection } from '@/components/ui/projects-section'
import type { Project } from '@/types'
import { Timestamp } from 'firebase/firestore'

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with modern design, payment integration, and admin dashboard. Built with Next.js, Node.js, and PostgreSQL for high performance and scalability.',
    longDescription: 'A comprehensive e-commerce platform built from the ground up featuring user authentication, product management, shopping cart functionality, payment processing with Stripe, order management, and an administrative dashboard. The platform handles thousands of products and processes payments securely while providing an excellent user experience.',
    technologies: [
      { name: 'Next.js', category: 'frontend' },
      { name: 'Node.js', category: 'backend' },
      { name: 'PostgreSQL', category: 'database' },
      { name: 'Stripe', category: 'tools' },
      { name: 'Tailwind CSS', category: 'frontend' },
      { name: 'TypeScript', category: 'frontend' }
    ],
    images: [
      { url: '/api/placeholder/800/600', caption: 'Homepage with featured products', isMain: true, order: 1 },
      { url: '/api/placeholder/800/600', caption: 'Product detail page', order: 2 },
      { url: '/api/placeholder/800/600', caption: 'Shopping cart and checkout', order: 3 },
      { url: '/api/placeholder/800/600', caption: 'Admin dashboard', order: 4 }
    ],
    links: [
      { type: 'live', url: 'https://example.com', label: 'Live Demo' },
      { type: 'github', url: 'https://github.com', label: 'Source Code' }
    ],
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2024-01-15')),
      endDate: Timestamp.fromDate(new Date('2024-04-30')),
      duration: '3.5 months'
    },
    metrics: {
      visitors: 12500,
      users: 3200,
      performance: '95/100 Lighthouse',
      impact: '40% conversion rate'
    },
    tags: ['full-stack', 'e-commerce', 'payment-processing'],
    isFeatured: true,
    team: [
      { name: 'John Doe', role: 'UI/UX Designer', avatar: '/api/placeholder/40/40' },
      { name: 'Jane Smith', role: 'Backend Developer', avatar: '/api/placeholder/40/40' }
    ],
    challenges: [
      'Implementing secure payment processing',
      'Optimizing database queries for large product catalogs',
      'Building responsive design for all devices'
    ],
    achievements: [
      'Successfully handled 1000+ concurrent users',
      'Achieved 99.9% uptime in production',
      'Reduced page load times by 60%'
    ]
  },
  {
    id: '2',
    title: 'Task Management App',
    description: 'Collaborative task management application with real-time updates, team collaboration features, and intuitive drag-and-drop interface.',
    longDescription: 'A modern task management application that enables teams to collaborate effectively with real-time updates, drag-and-drop task organization, project timelines, and comprehensive reporting. Built with React and Firebase for seamless real-time collaboration.',
    technologies: [
      { name: 'React', category: 'frontend' },
      { name: 'Firebase', category: 'database' },
      { name: 'Material-UI', category: 'frontend' },
      { name: 'Socket.io', category: 'backend' },
      { name: 'Node.js', category: 'backend' }
    ],
    images: [
      { url: '/api/placeholder/800/600', caption: 'Task board with drag-and-drop', isMain: true, order: 1 },
      { url: '/api/placeholder/800/600', caption: 'Project timeline view', order: 2 },
      { url: '/api/placeholder/800/600', caption: 'Team collaboration features', order: 3 }
    ],
    links: [
      { type: 'live', url: 'https://example.com', label: 'Live Demo' },
      { type: 'github', url: 'https://github.com', label: 'Source Code' }
    ],
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2023-09-01')),
      endDate: Timestamp.fromDate(new Date('2023-12-15')),
      duration: '3.5 months'
    },
    metrics: {
      users: 850,
      performance: '92/100 Lighthouse'
    },
    tags: ['collaboration', 'real-time', 'productivity'],
    isFeatured: true
  },
  {
    id: '3',
    title: 'Weather Dashboard',
    description: 'Beautiful weather application with location-based forecasts, interactive maps, and detailed weather analytics.',
    longDescription: 'A comprehensive weather dashboard providing accurate forecasts, interactive weather maps, historical data analysis, and weather alerts. Features a beautiful, intuitive interface with detailed weather metrics and visualizations.',
    technologies: [
      { name: 'Vue.js', category: 'frontend' },
      { name: 'Express.js', category: 'backend' },
      { name: 'Chart.js', category: 'frontend' },
      { name: 'Node.js', category: 'backend' }
    ],
    images: [
      { url: '/api/placeholder/800/600', caption: 'Main weather dashboard', isMain: true, order: 1 },
      { url: '/api/placeholder/800/600', caption: 'Interactive weather map', order: 2 }
    ],
    links: [
      { type: 'live', url: 'https://example.com', label: 'Live Demo' },
      { type: 'github', url: 'https://github.com', label: 'Source Code' }
    ],
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2023-06-01')),
      endDate: Timestamp.fromDate(new Date('2023-08-30')),
      duration: '3 months'
    },
    tags: ['weather', 'visualization', 'api-integration'],
    isFeatured: false
  },
  {
    id: '4',
    title: 'Portfolio Website',
    description: 'Personal portfolio website showcasing projects, skills, and experience. Built with modern technologies and best practices.',
    longDescription: 'A modern, responsive portfolio website built with Next.js and TypeScript, featuring smooth animations, dark/light theme toggle, and optimized performance. Showcases projects, skills, and professional experience with an elegant design.',
    technologies: [
      { name: 'Next.js', category: 'frontend' },
      { name: 'TypeScript', category: 'frontend' },
      { name: 'Tailwind CSS', category: 'frontend' },
      { name: 'Firebase', category: 'database' }
    ],
    images: [
      { url: '/api/placeholder/800/600', caption: 'Homepage hero section', isMain: true, order: 1 },
      { url: '/api/placeholder/800/600', caption: 'Projects showcase', order: 2 }
    ],
    links: [
      { type: 'live', url: 'https://example.com', label: 'Live Demo' },
      { type: 'github', url: 'https://github.com', label: 'Source Code' }
    ],
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2024-05-01')),
      endDate: Timestamp.fromDate(new Date('2024-06-15')),
      duration: '1.5 months'
    },
    tags: ['portfolio', 'responsive', 'modern-design'],
    isFeatured: false
  },
  {
    id: '5',
    title: 'Social Media Analytics',
    description: 'Analytics dashboard for social media performance tracking with data visualization and automated reporting features.',
    longDescription: 'A comprehensive social media analytics platform that aggregates data from multiple social platforms, provides detailed insights through interactive visualizations, and generates automated reports for marketing teams.',
    technologies: [
      { name: 'React', category: 'frontend' },
      { name: 'Python', category: 'backend' },
      { name: 'FastAPI', category: 'backend' },
      { name: 'PostgreSQL', category: 'database' },
      { name: 'D3.js', category: 'frontend' }
    ],
    images: [
      { url: '/api/placeholder/800/600', caption: 'Analytics dashboard overview', isMain: true, order: 1 }
    ],
    links: [
      { type: 'live', url: 'https://example.com', label: 'Live Demo' },
      { type: 'github', url: 'https://github.com', label: 'Source Code' }
    ],
    status: 'in-progress',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2024-03-01')),
      duration: '4 months (ongoing)'
    },
    tags: ['analytics', 'data-visualization', 'social-media'],
    isFeatured: false
  },
  {
    id: '6',
    title: 'Chat Application',
    description: 'Real-time chat application with user authentication, group chats, file sharing, and modern messaging features.',
    longDescription: 'A modern real-time chat application built with React Native, featuring end-to-end encryption, group messaging, file sharing, push notifications, and cross-platform compatibility for iOS and Android.',
    technologies: [
      { name: 'React Native', category: 'mobile' },
      { name: 'Socket.io', category: 'backend' },
      { name: 'Node.js', category: 'backend' },
      { name: 'MongoDB', category: 'database' }
    ],
    images: [
      { url: '/api/placeholder/800/600', caption: 'Chat interface', isMain: true, order: 1 }
    ],
    links: [
      { type: 'github', url: 'https://github.com', label: 'Source Code' }
    ],
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2023-10-01')),
      endDate: Timestamp.fromDate(new Date('2024-01-30')),
      duration: '4 months'
    },
    tags: ['mobile', 'real-time', 'messaging'],
    isFeatured: false
  }
]

export function ProjectsSection() {
  return (
    <section id="projects" className="section-padding bg-secondary-50 dark:bg-secondary-800">
      <ComprehensiveProjectsSection 
        projects={mockProjects}
        title="Featured Projects"
        subtitle="Some of my recent work showcasing various technologies and problem-solving approaches"
      />
    </section>
  )
}