import type { Metadata } from 'next'
import type { PersonalInfo, Project, Experience, Skill } from '@/types'

interface SEOConfig {
  siteUrl: string
  siteName: string
  siteDescription: string
  defaultImage: string
  twitterHandle: string
  linkedinProfile: string
  githubProfile: string
  author: string
  keywords: string[]
}

// Default SEO configuration
export const seoConfig: SEOConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-portfolio.com',
  siteName: 'Portfolio | Full Stack Developer',
  siteDescription: 'Professional portfolio showcasing full-stack development projects, skills, and experience. Specialized in React, Node.js, TypeScript, and modern web technologies.',
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@yourhandle',
  linkedinProfile: 'https://linkedin.com/in/yourprofile',
  githubProfile: 'https://github.com/yourprofile',
  author: 'Your Name',
  keywords: [
    'full stack developer',
    'react developer',
    'nodejs developer',
    'typescript',
    'web development',
    'software engineer',
    'frontend developer',
    'backend developer',
    'javascript',
    'portfolio'
  ]
}

interface MetadataOptions {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  keywords?: string[]
  noIndex?: boolean
}

export function generateMetadata(options: MetadataOptions = {}): Metadata {
  const {
    title,
    description = seoConfig.siteDescription,
    image = seoConfig.defaultImage,
    url = seoConfig.siteUrl,
    type = 'website',
    publishedTime,
    modifiedTime,
    keywords = seoConfig.keywords,
    noIndex = false
  } = options

  const metaTitle = title 
    ? `${title} | ${seoConfig.siteName}`
    : seoConfig.siteName

  const imageUrl = image.startsWith('http') ? image : `${seoConfig.siteUrl}${image}`

  return {
    title: metaTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: seoConfig.author }],
    creator: seoConfig.author,
    publisher: seoConfig.author,
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    canonical: url,
    
    // Open Graph
    openGraph: {
      type,
      title: metaTitle,
      description,
      url,
      siteName: seoConfig.siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title || seoConfig.siteName,
        }
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description,
      site: seoConfig.twitterHandle,
      creator: seoConfig.twitterHandle,
      images: [imageUrl],
    },
    
    // Additional meta tags
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no',
      'mobile-web-app-capable': 'yes',
      'theme-color': '#3b82f6',
      'color-scheme': 'light dark',
    },
  }
}

// Generate structured data for different content types
export function generatePersonStructuredData(personalInfo: PersonalInfo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: personalInfo.name,
    jobTitle: personalInfo.title,
    description: personalInfo.bio,
    url: seoConfig.siteUrl,
    image: personalInfo.profileImage,
    email: personalInfo.contact.email,
    telephone: personalInfo.contact.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: personalInfo.contact.location.city,
      addressCountry: personalInfo.contact.location.country,
    },
    sameAs: personalInfo.socialLinks.map(link => link.url).filter(Boolean),
    knowsAbout: [
      'Web Development',
      'Software Engineering',
      'Full Stack Development',
      'React',
      'Node.js',
      'TypeScript',
      'JavaScript'
    ]
  }
}

export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    description: seoConfig.siteDescription,
    url: seoConfig.siteUrl,
    author: {
      '@type': 'Person',
      name: seoConfig.author,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${seoConfig.siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateProjectStructuredData(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${seoConfig.siteUrl}/projects/${project.id}`,
    name: project.title,
    description: project.description,
    url: project.liveUrl || project.githubUrl,
    image: project.images?.[0],
    dateCreated: project.startDate?.toISOString(),
    dateModified: project.endDate?.toISOString(),
    author: {
      '@type': 'Person',
      name: seoConfig.author,
    },
    keywords: project.technologies?.join(', '),
    programmingLanguage: project.technologies?.map(tech => ({
      '@type': 'ComputerLanguage',
      name: tech
    })),
  }
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: `${seoConfig.siteUrl}${breadcrumb.url}`,
    })),
  }
}

export function generateOrganizationStructuredData(personalInfo?: PersonalInfo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': seoConfig.siteUrl,
    name: personalInfo?.name || seoConfig.author,
    url: seoConfig.siteUrl,
    logo: personalInfo?.profileImage || seoConfig.defaultImage,
    description: personalInfo?.bio || seoConfig.siteDescription,
    contactPoint: {
      '@type': 'ContactPoint',
      email: personalInfo?.contact.email,
      contactType: 'professional inquiry',
      availableLanguage: 'English',
    },
    sameAs: personalInfo?.socialLinks.map(link => link.url).filter(Boolean) || [],
  }
}

export function generateSkillsStructuredData(skills: Skill[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Technical Skills',
    description: 'Professional technical skills and competencies',
    numberOfItems: skills.length,
    itemListElement: skills.map((skill, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: skill.name,
      description: `${skill.proficiency}% proficiency in ${skill.name}`,
    })),
  }
}

export function generateExperienceStructuredData(experiences: Experience[]) {
  return experiences.map(experience => ({
    '@context': 'https://schema.org',
    '@type': 'WorkExperience',
    '@id': `${seoConfig.siteUrl}/experience/${experience.id}`,
    name: experience.position,
    description: experience.description,
    startDate: experience.startDate?.toISOString(),
    endDate: experience.current ? undefined : experience.endDate?.toISOString(),
    employer: {
      '@type': 'Organization',
      name: experience.company,
      url: experience.companyUrl,
    },
    jobLocation: {
      '@type': 'Place',
      address: experience.location,
    },
    skills: experience.technologies?.join(', '),
  }))
}

// SEO-friendly URL slug generator
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Meta tags for specific pages
export const pageMetadata = {
  home: () => generateMetadata({
    title: 'Home',
    description: `${seoConfig.author} - ${seoConfig.siteDescription}`,
    keywords: [...seoConfig.keywords, 'portfolio', 'developer', 'hire']
  }),
  
  about: (personalInfo?: PersonalInfo) => generateMetadata({
    title: 'About',
    description: personalInfo?.bio || `Learn more about ${seoConfig.author}, a passionate full-stack developer with expertise in modern web technologies.`,
    keywords: [...seoConfig.keywords, 'about', 'biography', 'background']
  }),
  
  projects: () => generateMetadata({
    title: 'Projects',
    description: 'Explore my portfolio of web applications, mobile apps, and software projects built with modern technologies.',
    keywords: [...seoConfig.keywords, 'projects', 'portfolio', 'web applications', 'mobile apps']
  }),
  
  project: (project: Project) => generateMetadata({
    title: project.title,
    description: project.description,
    image: project.images?.[0],
    type: 'article',
    publishedTime: project.startDate?.toISOString(),
    modifiedTime: project.endDate?.toISOString(),
    keywords: [...seoConfig.keywords, ...(project.technologies || []), 'project', 'case study']
  }),
  
  experience: () => generateMetadata({
    title: 'Experience',
    description: 'Professional work experience, roles, and career progression in software development.',
    keywords: [...seoConfig.keywords, 'experience', 'career', 'work history', 'professional']
  }),
  
  skills: () => generateMetadata({
    title: 'Skills',
    description: 'Technical skills, programming languages, frameworks, and tools I work with.',
    keywords: [...seoConfig.keywords, 'skills', 'technical skills', 'programming languages', 'frameworks']
  }),
  
  contact: () => generateMetadata({
    title: 'Contact',
    description: 'Get in touch for collaboration opportunities, project inquiries, or professional connections.',
    keywords: [...seoConfig.keywords, 'contact', 'hire', 'collaboration', 'inquiry']
  }),
}