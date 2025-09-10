import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { OptimizedAnimationProvider } from '@/providers/OptimizedAnimationProvider'
import { GlobalStateProvider } from '@/providers/GlobalStateProvider'
import { ToastProvider } from '@/providers/ToastProvider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { PWAInstaller, PWAStatus } from '@/components/pwa/PWAInstaller'
import { ErrorBoundary } from '@/lib/errorTracking'
import { DevPerformanceOverlay } from '@/components/debug/PerformanceMonitor'
import { LoadingProvider } from '@/providers/LoadingProvider'
import StructuredData from '@/components/seo/StructuredData'
import { seoConfig, generateWebsiteStructuredData, generateOrganizationStructuredData } from '@/lib/seo'

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  preload: true,
})

// Root metadata
export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: seoConfig.siteName,
    template: `%s | ${seoConfig.siteName}`,
  },
  description: seoConfig.siteDescription,
  keywords: seoConfig.keywords,
  authors: [{ name: seoConfig.author }],
  creator: seoConfig.author,
  publisher: seoConfig.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'technology',
  classification: 'portfolio',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: seoConfig.siteUrl,
    siteName: seoConfig.siteName,
    title: seoConfig.siteName,
    description: seoConfig.siteDescription,
    images: [
      {
        url: seoConfig.defaultImage,
        width: 1200,
        height: 630,
        alt: seoConfig.siteName,
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.siteName,
    description: seoConfig.siteDescription,
    site: seoConfig.twitterHandle,
    creator: seoConfig.twitterHandle,
    images: [seoConfig.defaultImage],
  },
  
  // Icons and PWA
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192x192.png',
  },
  
  // Manifest
  manifest: '/manifest.json',
  
  // Additional meta tags
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Portfolio',
    'application-name': 'Portfolio',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#3b82f6',
    'color-scheme': 'light dark',
  },
}

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  // Generate structured data
  const websiteStructuredData = generateWebsiteStructuredData()
  const organizationStructuredData = generateOrganizationStructuredData()

  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Structured Data */}
        <StructuredData data={websiteStructuredData} />
        <StructuredData data={organizationStructuredData} />
        
        {/* Register Service Worker */}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && 'PushManager' in window) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
        
        {/* Theme detection and persistence */}
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      
      <body className={`${inter.className} antialiased`}>
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        
        {/* Error Boundary */}
        <ErrorBoundary>
          <GlobalStateProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <OptimizedAnimationProvider
                enablePerformanceMonitoring={process.env.NODE_ENV === 'development'}
                fallbackToCSS={true}
              >
                <LoadingProvider>
                  <ToastProvider>
                    {/* PWA Status Indicators */}
                    <PWAStatus />
                    
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <main id="main-content" className="flex-1">
                        <Suspense 
                          fallback={
                            <div className="min-h-screen flex items-center justify-center" aria-label="Loading">
                              <div className="flex flex-col items-center space-y-4">
                                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-muted-foreground">Loading...</p>
                              </div>
                            </div>
                          }
                        >
                          {children}
                        </Suspense>
                      </main>
                      <Footer />
                    </div>
                    
                    {/* PWA Install Prompt */}
                    <PWAInstaller />
                    
                    {/* Development Performance Monitor */}
                    {process.env.NODE_ENV === 'development' && <DevPerformanceOverlay />}
                  </ToastProvider>
                </LoadingProvider>
              </OptimizedAnimationProvider>
            </ThemeProvider>
          </GlobalStateProvider>
        </ErrorBoundary>
        
        {/* Analytics and Monitoring */}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {process.env.NODE_ENV === 'production' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
        
        {/* No-script fallback */}
        <noscript>
          <div className="fixed top-0 left-0 w-full bg-yellow-100 border-b border-yellow-300 p-4 text-center text-yellow-800 z-50">
            This portfolio works best with JavaScript enabled. Some features may not work properly without it.
          </div>
        </noscript>
      </body>
    </html>
  )
}