import { MetadataRoute } from 'next'
import { seoConfig } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seoConfig.siteName,
    short_name: 'Portfolio',
    description: seoConfig.siteDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    scope: '/',
    categories: ['portfolio', 'professional', 'developer'],
    lang: 'en-US',
    dir: 'ltr',
    
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    
    screenshots: [
      {
        src: '/screenshots/desktop-screenshot.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Desktop view of the portfolio'
      },
      {
        src: '/screenshots/mobile-screenshot.png',
        sizes: '360x800',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Mobile view of the portfolio'
      }
    ],
    
    shortcuts: [
      {
        name: 'Projects',
        short_name: 'Projects',
        description: 'View my portfolio projects',
        url: '/projects',
        icons: [
          {
            src: '/icons/projects-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Contact',
        short_name: 'Contact',
        description: 'Get in touch',
        url: '/contact',
        icons: [
          {
            src: '/icons/contact-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Resume',
        short_name: 'Resume',
        description: 'Download my resume',
        url: '/resume',
        icons: [
          {
            src: '/icons/resume-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      }
    ],

    // Enhanced PWA features
    edge_side_panel: {
      preferred_width: 400
    },
    
    // Launch handler for better user experience
    launch_handler: {
      client_mode: 'focus-existing'
    },

    // File handlers for opening files with the app
    file_handlers: [
      {
        action: '/open-file',
        accept: {
          'application/pdf': ['.pdf'],
          'text/plain': ['.txt', '.md'],
        },
      },
    ],

    // Share target for sharing content to the app
    share_target: {
      action: '/share',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
        files: [
          {
            name: 'files',
            accept: ['image/*', 'application/pdf']
          }
        ]
      }
    },

    // Related applications
    related_applications: [
      {
        platform: 'webapp',
        url: `${seoConfig.siteUrl}/manifest.json`
      }
    ],
    
    prefer_related_applications: false,
  }
}