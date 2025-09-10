/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Enable server components optimizations
    serverComponentsExternalPackages: ['@firebase/app'],
    // Enable optimized package imports
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@firebase/firestore',
      '@firebase/auth',
      '@firebase/storage'
    ]
  },

  // Image optimization
  images: {
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    // Configure domains for external images
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'cdn.jsdelivr.net'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Configure image sizes for responsive images
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable image optimization
    minimumCacheTTL: 31536000, // 1 year
    // Disable image optimization for development
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // PWA Service Worker configuration
  async headers() {
    return [
      // Security headers
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          // PWA headers
          {
            key: 'X-Apple-Mobile-Web-App-Capable',
            value: 'yes'
          },
          {
            key: 'X-Apple-Mobile-Web-App-Status-Bar-Style',
            value: 'default'
          },
          {
            key: 'X-Apple-Mobile-Web-App-Title',
            value: 'Portfolio'
          }
        ]
      },
      // Cache headers for static assets
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      },
      {
        source: '/:path*\\.(css|js|ico|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // API headers
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      }
    ]
  },

  // Redirects for SEO
  async redirects() {
    return [
      // Redirect old URLs if any
      {
        source: '/portfolio',
        destination: '/projects',
        permanent: true
      },
      {
        source: '/work',
        destination: '/experience',
        permanent: true
      }
    ]
  },

  // Rewrites for clean URLs
  async rewrites() {
    return [
      // API rewrites
      {
        source: '/sitemap',
        destination: '/sitemap.xml'
      },
      {
        source: '/robots',
        destination: '/robots.txt'
      }
    ]
  },

  // Webpack configuration for optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Separate Firebase into its own chunk
          firebase: {
            test: /[\\/]node_modules[\\/](@firebase|firebase)[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 20,
          },
          // Separate Framer Motion into its own chunk
          framerMotion: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 19,
          },
          // Separate Chart.js into its own chunk
          charts: {
            test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2|chartjs-.*)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 18,
          },
          // Separate UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](lucide-react|@headlessui|@radix-ui)[\\/]/,
            name: 'ui-libs',
            chunks: 'all',
            priority: 17,
          },
          // Common vendor chunk
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
          }
        }
      }
    }

    // Add bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      try {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            openAnalyzer: true,
          })
        )
      } catch (err) {
        console.warn('Bundle analyzer not available')
      }
    }

    return config
  },

  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // TypeScript configuration
  typescript: {
    // Don't fail build on type errors in development
    ignoreBuildErrors: process.env.NODE_ENV === 'development'
  },

  // ESLint configuration
  eslint: {
    // Don't fail build on ESLint errors in development
    ignoreDuringBuilds: process.env.NODE_ENV === 'development'
  },

  // Optimize CSS
  swcMinify: true,

  // Enable React strict mode
  reactStrictMode: true,

  // Power by Next.js header
  poweredByHeader: false,

  // Compress responses
  compress: true,
}

module.exports = nextConfig