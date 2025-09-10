import { MetadataRoute } from 'next'
import { seoConfig } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/_next/*',
          '/private',
          '/temp',
          '/tmp',
          '*.json',
          '*.xml',
        ],
      },
      // Allow specific crawlers for better indexing
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api/*'],
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api/*'],
      },
      // Block crawlers that might affect performance
      {
        userAgent: [
          'CCBot', // ChatGPT
          'ChatGPT-User',
          'GPTBot',
          'Google-Extended', // Bard
          'Claude-Web',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
    host: seoConfig.siteUrl,
  }
}