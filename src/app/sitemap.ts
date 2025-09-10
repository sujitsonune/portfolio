import { MetadataRoute } from 'next'
import { portfolioService } from '@/lib/portfolio-service'
import { seoConfig } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base pages
  const baseUrls = [
    {
      url: seoConfig.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${seoConfig.siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${seoConfig.siteUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${seoConfig.siteUrl}/experience`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${seoConfig.siteUrl}/skills`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${seoConfig.siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
  ]

  try {
    // Get dynamic content
    const [projects, experiences] = await Promise.all([
      portfolioService.getProjects().catch(() => []),
      portfolioService.getExperiences().catch(() => []),
    ])

    // Project pages
    const projectUrls = projects.map((project) => ({
      url: `${seoConfig.siteUrl}/projects/${project.id}`,
      lastModified: project.updatedAt?.toDate() || new Date(),
      changeFrequency: 'monthly' as const,
      priority: project.featured ? 0.8 : 0.6,
    }))

    // Experience pages (if individual pages exist)
    const experienceUrls = experiences.map((experience) => ({
      url: `${seoConfig.siteUrl}/experience/${experience.id}`,
      lastModified: experience.updatedAt?.toDate() || new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    }))

    // Blog pages (if blog exists)
    const blogUrls = [
      {
        url: `${seoConfig.siteUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
    ]

    return [...baseUrls, ...projectUrls, ...experienceUrls, ...blogUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return baseUrls
  }
}