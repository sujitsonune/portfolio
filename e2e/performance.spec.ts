import { test, expect } from './fixtures/base'

test.describe('Performance Tests', () => {
  test('should load homepage within acceptable time limits', async ({ page, homePage }) => {
    const startTime = Date.now()
    
    await homePage.goto()
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Homepage should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // Get detailed performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        domInteractive: navigation.domInteractive - navigation.navigationStart,
        domComplete: navigation.domComplete - navigation.navigationStart,
      }
    })
    
    console.log('Performance Metrics:', metrics)
    
    // Core Web Vitals thresholds
    expect(metrics.firstContentfulPaint).toBeLessThan(1800) // 1.8s
    expect(metrics.domContentLoaded).toBeLessThan(2000) // 2s
    expect(metrics.loadComplete).toBeLessThan(3000) // 3s
  })

  test('should have good Lighthouse performance score', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Simulate Lighthouse performance audit
    const performanceScore = await page.evaluate(async () => {
      // Create a simplified performance score based on key metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      const lcp = navigation.loadEventEnd - navigation.navigationStart
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart
      
      // Simplified scoring (0-100)
      let score = 100
      
      // Penalize slow FCP (target < 1.8s)
      if (fcp > 1800) score -= 20
      else if (fcp > 1200) score -= 10
      
      // Penalize slow LCP (target < 2.5s)
      if (lcp > 2500) score -= 20
      else if (lcp > 1800) score -= 10
      
      // Penalize slow DOM ready (target < 1.5s)
      if (domContentLoaded > 1500) score -= 15
      else if (domContentLoaded > 1000) score -= 5
      
      return Math.max(0, score)
    })
    
    console.log('Performance Score:', performanceScore)
    expect(performanceScore).toBeGreaterThan(80) // Target 80+ performance score
  })

  test('should efficiently load images and assets', async ({ page, homePage }) => {
    const resourceSizes: { [key: string]: number } = {}
    const resourceTypes: { [key: string]: number } = {}
    
    page.on('response', response => {
      const url = response.url()
      const size = parseInt(response.headers()['content-length'] || '0', 10)
      
      if (size > 0) {
        const type = getResourceType(url)
        resourceSizes[url] = size
        resourceTypes[type] = (resourceTypes[type] || 0) + size
      }
    })
    
    await homePage.goto()
    await page.waitForLoadState('networkidle')
    
    console.log('Resource sizes by type:', resourceTypes)
    
    // Check image optimization
    const imageUrls = Object.keys(resourceSizes).filter(url => 
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
    )
    
    for (const imageUrl of imageUrls) {
      const size = resourceSizes[imageUrl]
      // Images should generally be under 500KB unless they're hero images
      if (!imageUrl.includes('hero') && !imageUrl.includes('banner')) {
        expect(size).toBeLessThan(500 * 1024) // 500KB
      }
    }
    
    // Total page size should be reasonable
    const totalSize = Object.values(resourceSizes).reduce((sum, size) => sum + size, 0)
    expect(totalSize).toBeLessThan(3 * 1024 * 1024) // 3MB total
  })

  test('should handle multiple concurrent users', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ])
    
    const startTime = Date.now()
    
    // Simulate 5 concurrent users loading the homepage
    const results = await Promise.all(
      contexts.map(async (context, index) => {
        const page = await context.newPage()
        const start = Date.now()
        
        try {
          await page.goto('/')
          await page.waitForLoadState('networkidle')
          const loadTime = Date.now() - start
          
          return { user: index + 1, loadTime, success: true }
        } catch (error) {
          return { user: index + 1, loadTime: Date.now() - start, success: false, error }
        } finally {
          await context.close()
        }
      })
    )
    
    const totalTime = Date.now() - startTime
    console.log('Concurrent load test results:', results)
    console.log('Total test time:', totalTime)
    
    // All users should load successfully
    const failures = results.filter(r => !r.success)
    expect(failures.length).toBe(0)
    
    // Average load time should still be reasonable under concurrent load
    const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length
    expect(avgLoadTime).toBeLessThan(5000) // 5s average under load
  })

  test('should lazy load content efficiently', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Track when images start loading
    const imageLoadTimes: { [url: string]: number } = {}
    
    page.on('request', request => {
      if (request.resourceType() === 'image') {
        imageLoadTimes[request.url()] = Date.now()
      }
    })
    
    // Initially, only above-the-fold images should load
    await page.waitForLoadState('domcontentloaded')
    const initialImageCount = Object.keys(imageLoadTimes).length
    
    // Scroll to trigger lazy loading
    await homePage.scrollToSection('projects')
    await page.waitForTimeout(1000)
    
    const afterScrollImageCount = Object.keys(imageLoadTimes).length
    
    // More images should load after scrolling
    expect(afterScrollImageCount).toBeGreaterThan(initialImageCount)
    
    console.log(`Images loaded initially: ${initialImageCount}`)
    console.log(`Images loaded after scroll: ${afterScrollImageCount}`)
  })

  test('should handle memory usage efficiently', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null
    })
    
    if (!initialMemory) {
      console.log('Memory API not available, skipping memory test')
      return
    }
    
    // Perform various interactions that might cause memory leaks
    await homePage.toggleTheme()
    await homePage.scrollToSection('about')
    await homePage.scrollToSection('projects')
    await homePage.scrollToSection('contact')
    await homePage.scrollToTop()
    
    // Navigate through sections multiple times
    for (let i = 0; i < 3; i++) {
      await homePage.scrollToSection('projects')
      await homePage.scrollToSection('about')
      await page.waitForTimeout(500)
    }
    
    // Check memory usage after interactions
    const finalMemory = await page.evaluate(() => {
      return {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      }
    })
    
    console.log('Initial memory:', initialMemory)
    console.log('Final memory:', finalMemory)
    
    const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
    const memoryIncreasePercent = (memoryIncrease / initialMemory.usedJSHeapSize) * 100
    
    console.log(`Memory increase: ${memoryIncrease} bytes (${memoryIncreasePercent.toFixed(2)}%)`)
    
    // Memory usage shouldn't increase by more than 50% during normal interactions
    expect(memoryIncreasePercent).toBeLessThan(50)
  })

  test('should handle network throttling gracefully', async ({ page, homePage }) => {
    // Simulate slow 3G connection
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100) // Add 100ms delay to all requests
    })
    
    const startTime = Date.now()
    await homePage.goto()
    
    // Check that loading states are shown
    const hasLoadingState = await page.locator('[data-testid*="loading"], .animate-pulse, .loading').count()
    expect(hasLoadingState).toBeGreaterThan(0)
    
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    console.log(`Load time with throttling: ${loadTime}ms`)
    
    // Page should still be functional even with slow network
    expect(await homePage.isHeroVisible()).toBe(true)
  })

  test('should optimize JavaScript bundle size', async ({ page, homePage }) => {
    const bundleSizes: { [url: string]: number } = {}
    
    page.on('response', response => {
      const url = response.url()
      const contentLength = response.headers()['content-length']
      
      if (url.includes('.js') && contentLength) {
        bundleSizes[url] = parseInt(contentLength, 10)
      }
    })
    
    await homePage.goto()
    await page.waitForLoadState('networkidle')
    
    console.log('JavaScript bundle sizes:', bundleSizes)
    
    const totalJSSize = Object.values(bundleSizes).reduce((sum, size) => sum + size, 0)
    console.log(`Total JavaScript size: ${(totalJSSize / 1024).toFixed(2)} KB`)
    
    // Main JS bundle should be reasonably sized
    expect(totalJSSize).toBeLessThan(1024 * 1024) // 1MB total JS
    
    // Individual bundles shouldn't be too large
    Object.entries(bundleSizes).forEach(([url, size]) => {
      if (!url.includes('vendor') && !url.includes('chunk')) {
        expect(size).toBeLessThan(500 * 1024) // 500KB per bundle
      }
    })
  })

  test('should handle form submission performance', async ({ page, homePage }) => {
    await homePage.goto()
    await homePage.scrollToSection('contact')
    
    // Fill form
    await homePage.fillContactForm({
      name: 'Performance Test User',
      email: 'perf@test.com',
      subject: 'Performance Test',
      message: 'Testing form submission performance with a longer message to simulate real-world usage patterns.'
    })
    
    // Mock API endpoint with delay to test loading states
    await page.route('/api/contact', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1s delay
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Message sent!' })
      })
    })
    
    const submitStart = Date.now()
    await homePage.submitContactForm()
    
    // Should show loading state immediately
    const loadingVisible = await page.locator('[data-testid*="loading"], .loading').isVisible()
    expect(loadingVisible).toBe(true)
    
    // Wait for completion
    await expect(page.locator('[data-testid="contact-success"]')).toBeVisible({ timeout: 5000 })
    
    const submitTime = Date.now() - submitStart
    console.log(`Form submission handled in: ${submitTime}ms`)
    
    // Form should handle submission gracefully even with delays
    expect(submitTime).toBeGreaterThan(900) // Should have shown loading state
    expect(submitTime).toBeLessThan(3000) // But complete within reasonable time
  })
})

// Helper function to categorize resources
function getResourceType(url: string): string {
  if (/\.(js|jsx|ts|tsx)$/.test(url)) return 'javascript'
  if (/\.(css|scss|sass)$/.test(url)) return 'stylesheet'
  if (/\.(png|jpg|jpeg|gif|webp|svg|ico)$/.test(url)) return 'image'
  if (/\.(woff|woff2|ttf|eot)$/.test(url)) return 'font'
  if (/\.(mp4|webm|ogg|mp3|wav)$/.test(url)) return 'media'
  if (url.includes('api/')) return 'api'
  return 'other'
}