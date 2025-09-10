// Service Worker for PWA functionality
const CACHE_NAME = 'portfolio-v1'
const STATIC_CACHE = 'portfolio-static-v1'
const DYNAMIC_CACHE = 'portfolio-dynamic-v1'
const IMAGE_CACHE = 'portfolio-images-v1'

// Define what to cache
const STATIC_ASSETS = [
  '/',
  '/about',
  '/projects',
  '/experience', 
  '/skills',
  '/contact',
  '/offline',
  '/manifest.json',
  // Add critical CSS and JS files
  '/_next/static/css/',
  '/_next/static/js/',
  // Add font files
  '/fonts/',
  // Add critical images
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error)
      })
  )
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== IMAGE_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // Take control of all pages
  self.clients.claim()
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return
  }
  
  // Skip admin routes
  if (url.pathname.startsWith('/admin')) {
    return
  }
  
  event.respondWith(
    handleRequest(request)
  )
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Strategy 1: Cache First for static assets (images, fonts, icons)
    if (isStaticAsset(request)) {
      return await cacheFirst(request, IMAGE_CACHE)
    }
    
    // Strategy 2: Network First for API calls and dynamic content
    if (isAPICall(request) || isDynamicContent(request)) {
      return await networkFirst(request, DYNAMIC_CACHE)
    }
    
    // Strategy 3: Stale While Revalidate for pages
    if (isPageRequest(request)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE)
    }
    
    // Default: Network with cache fallback
    return await networkWithCacheFallback(request)
    
  } catch (error) {
    console.error('[SW] Fetch error:', error)
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline') || 
             new Response('You are offline', { status: 200 })
    }
    
    return new Response('Network error', { 
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

// Caching Strategies

// Cache First - for static assets that rarely change
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  const networkResponse = await fetch(request)
  if (networkResponse && networkResponse.status === 200) {
    const cache = await caches.open(cacheName)
    // Clone the response because it can only be consumed once
    cache.put(request, networkResponse.clone())
  }
  
  return networkResponse
}

// Network First - for API calls and frequently changing content
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Stale While Revalidate - serve from cache, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    // Silently fail background updates
  })
  
  // Return cached version immediately, or wait for network
  return cachedResponse || fetchPromise
}

// Network with cache fallback
async function networkWithCacheFallback(request) {
  try {
    return await fetch(request)
  } catch (error) {
    return await caches.match(request)
  }
}

// Helper functions to categorize requests
function isStaticAsset(request) {
  const url = new URL(request.url)
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js)$/i) ||
         url.pathname.includes('/_next/static/') ||
         url.pathname.includes('/icons/') ||
         url.pathname.includes('/images/') ||
         url.pathname.includes('/fonts/')
}

function isAPICall(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/api/') ||
         url.hostname !== self.location.hostname
}

function isDynamicContent(request) {
  const url = new URL(request.url)
  return url.searchParams.has('q') || // Search queries
         url.pathname.includes('/search') ||
         url.pathname.includes('/dynamic/')
}

function isPageRequest(request) {
  return request.destination === 'document' ||
         (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))
}

// Background Sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForms())
  }
})

async function syncContactForms() {
  try {
    const cache = await caches.open('offline-forms')
    const requests = await cache.keys()
    
    for (const request of requests) {
      if (request.url.includes('/api/contact')) {
        try {
          const response = await fetch(request)
          if (response.status === 200) {
            await cache.delete(request)
            console.log('[SW] Synced offline form submission')
          }
        } catch (error) {
          console.log('[SW] Failed to sync form, will retry later')
        }
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return
  
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.data,
    actions: data.actions,
    requireInteraction: true,
    tag: data.tag || 'portfolio-notification'
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  const url = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME })
      break
      
    case 'CLEAR_CACHE':
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        )
      }).then(() => {
        event.ports[0].postMessage({ success: true })
      })
      break
      
    default:
      console.log('[SW] Unknown message type:', type)
  }
})

// Periodic background sync for cache cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupOldCache())
  }
})

async function cleanupOldCache() {
  const cache = await caches.open(DYNAMIC_CACHE)
  const requests = await cache.keys()
  const now = Date.now()
  const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
  
  for (const request of requests) {
    const response = await cache.match(request)
    if (response) {
      const dateHeader = response.headers.get('date')
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime()
        if (now - responseDate > maxAge) {
          await cache.delete(request)
        }
      }
    }
  }
}

console.log('[SW] Service Worker loaded')