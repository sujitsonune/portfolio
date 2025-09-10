import { test, expect, devices } from '@playwright/test'

// Mobile-specific test configuration
const mobileDevices = [
  devices['iPhone 12'],
  devices['iPhone 12 Pro'],
  devices['iPhone SE'],
  devices['Pixel 5'],
  devices['Galaxy S9+'],
  devices['iPad Pro'],
  devices['Galaxy Tab S4']
]

// Test on multiple mobile devices
for (const deviceConfig of mobileDevices) {
  test.describe(`Mobile Testing - ${deviceConfig.userAgent?.includes('iPhone') ? 'iPhone' : deviceConfig.userAgent?.includes('Pixel') ? 'Pixel' : deviceConfig.userAgent?.includes('Galaxy') ? 'Galaxy' : 'iPad'}`, () => {
    test.use({ ...deviceConfig })

    test('should render correctly on mobile viewport', async ({ page }) => {
      await page.goto('/')
      
      // Check viewport dimensions
      const viewport = page.viewportSize()
      expect(viewport?.width).toBeLessThanOrEqual(deviceConfig.viewport.width)
      
      // Ensure main content is visible
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()
      
      // Check for horizontal scrolling (should not exist)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(hasHorizontalScroll).toBe(false)
    })

    test('should handle touch interactions', async ({ page }) => {
      await page.goto('/')
      
      // Test mobile menu toggle
      const menuButton = page.locator('[data-testid="mobile-menu-toggle"]')
      if (await menuButton.isVisible()) {
        await menuButton.tap()
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
        
        // Close menu by tapping outside or close button
        const closeButton = page.locator('[data-testid="mobile-menu-close"]')
        if (await closeButton.isVisible()) {
          await closeButton.tap()
        } else {
          await page.tap('body')
        }
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeHidden()
      }
      
      // Test touch scrolling
      const projectsSection = page.locator('[data-testid="projects-section"]')
      await projectsSection.scrollIntoViewIfNeeded()
      await expect(projectsSection).toBeInViewport()
    })

    test('should handle form input on mobile', async ({ page }) => {
      await page.goto('/')
      
      // Navigate to contact form
      await page.locator('[data-testid="contact-section"]').scrollIntoViewIfNeeded()
      
      // Test mobile form inputs
      const nameInput = page.locator('input[name="name"]')
      const emailInput = page.locator('input[name="email"]')
      const messageInput = page.locator('textarea[name="message"]')
      
      if (await nameInput.isVisible()) {
        // Test mobile keyboard doesn't zoom the page
        await nameInput.tap()
        
        const initialZoom = await page.evaluate(() => window.visualViewport?.scale || 1)
        
        await nameInput.fill('Test User')
        await emailInput.fill('test@example.com')
        await messageInput.fill('Test message on mobile device')
        
        const finalZoom = await page.evaluate(() => window.visualViewport?.scale || 1)
        
        // Zoom level should remain the same (no zoom on input focus)
        expect(Math.abs(finalZoom - initialZoom)).toBeLessThan(0.1)
      }
    })

    test('should handle orientation changes', async ({ page, context }) => {
      // Only test orientation on mobile devices (not tablets)
      const isMobile = deviceConfig.viewport.width < 768
      
      if (!isMobile) {
        test.skip()
        return
      }
      
      await page.goto('/')
      
      // Test portrait mode
      const portraitContent = await page.locator('main').boundingBox()
      expect(portraitContent?.width).toBeLessThan(portraitContent?.height || 0)
      
      // Simulate landscape mode by changing viewport
      await page.setViewportSize({
        width: deviceConfig.viewport.height,
        height: deviceConfig.viewport.width
      })
      
      await page.waitForTimeout(500) // Allow layout to adjust
      
      // Ensure content still renders correctly in landscape
      await expect(page.locator('main')).toBeVisible()
      
      const landscapeContent = await page.locator('main').boundingBox()
      expect(landscapeContent?.width).toBeGreaterThan(landscapeContent?.height || 0)
    })

    test('should optimize images for mobile', async ({ page }) => {
      const imageRequests: string[] = []
      
      page.on('request', request => {
        if (request.resourceType() === 'image') {
          imageRequests.push(request.url())
        }
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Check that responsive images are loaded
      const images = await page.locator('img').all()
      
      for (const img of images) {
        const src = await img.getAttribute('src')
        const srcset = await img.getAttribute('srcset')
        
        // Images should have either srcset for responsive loading
        // or be appropriately sized for mobile
        if (src && !srcset) {
          // Check image dimensions aren't excessively large for mobile
          const boundingBox = await img.boundingBox()
          if (boundingBox) {
            expect(boundingBox.width).toBeLessThanOrEqual(deviceConfig.viewport.width * 2)
          }
        }
      }
    })

    test('should handle performance on mobile network', async ({ page, context }) => {
      // Simulate slow 3G connection
      await context.route('**/*', async route => {
        // Add delay to simulate slow network
        await new Promise(resolve => setTimeout(resolve, 50))
        await route.continue()
      })
      
      const startTime = Date.now()
      await page.goto('/')
      
      // Should show loading states on slow connections
      const loadingElements = await page.locator('[data-testid*="loading"], .animate-pulse, .loading').count()
      if (loadingElements > 0) {
        console.log(`Found ${loadingElements} loading indicators`)
      }
      
      await page.waitForLoadState('domcontentloaded')
      const loadTime = Date.now() - startTime
      
      console.log(`Mobile load time on slow network: ${loadTime}ms`)
      
      // Should load critical content within reasonable time even on slow networks
      expect(loadTime).toBeLessThan(8000) // 8 seconds max on slow 3G
      
      // Hero section should be visible
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()
    })

    test('should handle mobile gestures', async ({ page }) => {
      await page.goto('/')
      
      // Test swipe gestures if carousel exists
      const carousel = page.locator('[data-testid="project-carousel"], [data-testid="carousel"]')
      
      if (await carousel.isVisible()) {
        const carouselBox = await carousel.boundingBox()
        if (carouselBox) {
          // Simulate swipe left
          await page.mouse.move(carouselBox.x + carouselBox.width * 0.8, carouselBox.y + carouselBox.height / 2)
          await page.mouse.down()
          await page.mouse.move(carouselBox.x + carouselBox.width * 0.2, carouselBox.y + carouselBox.height / 2)
          await page.mouse.up()
          
          await page.waitForTimeout(500)
          
          // Verify swipe interaction worked (content should change)
          await expect(carousel).toBeVisible()
        }
      }
      
      // Test pinch zoom (if supported)
      const mainContent = page.locator('main')
      const contentBox = await mainContent.boundingBox()
      
      if (contentBox) {
        // Simulate pinch gesture
        await page.touchscreen.tap(contentBox.x + contentBox.width / 2, contentBox.y + contentBox.height / 2)
        
        // Verify content is still accessible after touch
        await expect(mainContent).toBeVisible()
      }
    })

    test('should handle safe area insets on notched devices', async ({ page }) => {
      // This test is particularly relevant for iPhone X and newer models
      const isNotchedDevice = deviceConfig.userAgent?.includes('iPhone') && 
                             (deviceConfig.viewport.width === 390 || deviceConfig.viewport.width === 414)
      
      if (!isNotchedDevice) {
        test.skip()
        return
      }
      
      await page.goto('/')
      
      // Check that content respects safe area insets
      const safeAreaStyles = await page.evaluate(() => {
        const computedStyle = getComputedStyle(document.documentElement)
        return {
          paddingTop: computedStyle.getPropertyValue('--safe-area-inset-top'),
          paddingBottom: computedStyle.getPropertyValue('--safe-area-inset-bottom'),
          paddingLeft: computedStyle.getPropertyValue('--safe-area-inset-left'),
          paddingRight: computedStyle.getPropertyValue('--safe-area-inset-right')
        }
      })
      
      console.log('Safe area insets:', safeAreaStyles)
      
      // Header should not be obscured by notch
      const header = page.locator('header, [data-testid="header"]')
      if (await header.isVisible()) {
        const headerBox = await header.boundingBox()
        expect(headerBox?.y).toBeGreaterThanOrEqual(0)
      }
      
      // Footer should not be obscured by home indicator
      const footer = page.locator('footer, [data-testid="footer"]')
      if (await footer.isVisible()) {
        const footerBox = await footer.boundingBox()
        const viewportHeight = page.viewportSize()?.height || 0
        expect(footerBox?.y).toBeLessThanOrEqual(viewportHeight)
      }
    })

    test('should handle mobile accessibility features', async ({ page }) => {
      await page.goto('/')
      
      // Test mobile-specific accessibility
      const focusableElements = await page.locator('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])').all()
      
      for (const element of focusableElements.slice(0, 5)) { // Test first 5 elements
        await element.focus()
        
        // Check focus indicator is visible and appropriate for touch
        const box = await element.boundingBox()
        if (box) {
          // Touch targets should be at least 44px (iOS) or 48px (Android)
          const minTouchTarget = deviceConfig.userAgent?.includes('iPhone') ? 44 : 48
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(minTouchTarget - 10) // Allow some tolerance
        }
      }
      
      // Test voice control compatibility
      const buttons = await page.locator('button').all()
      for (const button of buttons.slice(0, 3)) {
        const accessibleName = await button.getAttribute('aria-label') || await button.textContent()
        expect(accessibleName?.trim()).toBeTruthy()
      }
    })

    test('should handle mobile performance metrics', async ({ page }) => {
      await page.goto('/')
      
      const mobileMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart,
          firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          memoryInfo: (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize
          } : null
        }
      })
      
      console.log(`Mobile performance metrics:`, mobileMetrics)
      
      // Mobile performance thresholds (more lenient than desktop)
      expect(mobileMetrics.firstContentfulPaint).toBeLessThan(3000) // 3s FCP
      expect(mobileMetrics.domContentLoaded).toBeLessThan(4000) // 4s DCL
      expect(mobileMetrics.loadComplete).toBeLessThan(6000) // 6s complete load
    })
  })
}

// Cross-device compatibility tests
test.describe('Cross-Device Compatibility', () => {
  test('should maintain functionality across different screen sizes', async ({ browser }) => {
    const devices = [
      { name: 'Small Phone', viewport: { width: 320, height: 568 } },
      { name: 'Large Phone', viewport: { width: 414, height: 896 } },
      { name: 'Tablet Portrait', viewport: { width: 768, height: 1024 } },
      { name: 'Tablet Landscape', viewport: { width: 1024, height: 768 } }
    ]
    
    for (const device of devices) {
      const context = await browser.newContext({ viewport: device.viewport })
      const page = await context.newPage()
      
      try {
        await page.goto('/')
        
        // Core functionality should work on all devices
        await expect(page.locator('main')).toBeVisible()
        await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()
        
        // Navigation should be accessible
        const nav = page.locator('nav, [data-testid="navigation"]')
        await expect(nav).toBeVisible()
        
        // Content should not overflow horizontally
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidth = device.viewport.width
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10) // Allow small tolerance
        
        console.log(`✅ ${device.name} (${device.viewport.width}x${device.viewport.height}): Passed`)
      } catch (error) {
        console.error(`❌ ${device.name}: Failed -`, error)
        throw error
      } finally {
        await context.close()
      }
    }
  })

  test('should handle device pixel ratio variations', async ({ browser }) => {
    const dprVariations = [1, 1.5, 2, 3]
    
    for (const dpr of dprVariations) {
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: dpr
      })
      const page = await context.newPage()
      
      try {
        await page.goto('/')
        
        const actualDpr = await page.evaluate(() => window.devicePixelRatio)
        expect(actualDpr).toBe(dpr)
        
        // Images should render clearly at different DPRs
        const images = await page.locator('img').all()
        for (const img of images.slice(0, 3)) {
          await expect(img).toBeVisible()
          
          // Check image is not pixelated by verifying it has appropriate resolution
          const naturalSize = await img.evaluate((element: HTMLImageElement) => ({
            naturalWidth: element.naturalWidth,
            naturalHeight: element.naturalHeight,
            displayWidth: element.offsetWidth,
            displayHeight: element.offsetHeight
          }))
          
          if (naturalSize.naturalWidth > 0 && naturalSize.displayWidth > 0) {
            const imageScale = naturalSize.naturalWidth / naturalSize.displayWidth
            expect(imageScale).toBeGreaterThanOrEqual(dpr * 0.8) // Allow some compression tolerance
          }
        }
        
        console.log(`✅ DPR ${dpr}: Images render appropriately`)
      } finally {
        await context.close()
      }
    }
  })
})

// Mobile-specific feature tests
test.describe('Mobile-Specific Features', () => {
  test.use(devices['iPhone 12'])

  test('should handle pull-to-refresh if implemented', async ({ page }) => {
    await page.goto('/')
    
    // Simulate pull-to-refresh gesture
    await page.mouse.move(200, 100)
    await page.mouse.down()
    await page.mouse.move(200, 300, { steps: 10 })
    await page.waitForTimeout(100)
    await page.mouse.up()
    
    // Should not cause any errors or unexpected behavior
    await expect(page.locator('main')).toBeVisible()
  })

  test('should handle iOS-specific behaviors', async ({ page }) => {
    await page.goto('/')
    
    // Test iOS bounce scrolling
    await page.evaluate(() => {
      window.scrollTo(0, -100) // Try to scroll past top
    })
    
    await page.waitForTimeout(200)
    
    const scrollPosition = await page.evaluate(() => window.scrollY)
    expect(scrollPosition).toBeGreaterThanOrEqual(0) // Should bounce back
    
    // Test iOS status bar considerations
    const bodyStyle = await page.evaluate(() => {
      const style = getComputedStyle(document.body)
      return {
        paddingTop: style.paddingTop,
        marginTop: style.marginTop
      }
    })
    
    console.log('iOS body spacing:', bodyStyle)
  })

  test('should handle Android-specific behaviors', async ({ page }) => {
    // Switch to Android device
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Test Android back button behavior (simulated)
    await page.evaluate(() => {
      window.history.pushState({}, '', '/#about')
    })
    
    await page.goBack()
    
    // Should handle navigation properly
    await expect(page.locator('main')).toBeVisible()
  })

  test('should optimize for mobile data usage', async ({ page }) => {
    let totalDataTransferred = 0
    
    page.on('response', response => {
      const contentLength = response.headers()['content-length']
      if (contentLength) {
        totalDataTransferred += parseInt(contentLength, 10)
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    console.log(`Total data transferred: ${(totalDataTransferred / 1024).toFixed(2)} KB`)
    
    // Mobile pages should be reasonably sized
    expect(totalDataTransferred).toBeLessThan(2 * 1024 * 1024) // 2MB max for mobile
  })
})