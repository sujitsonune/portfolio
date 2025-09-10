import { test, expect, devices, Browser } from '@playwright/test'

// Cloud testing configuration for BrowserStack/Sauce Labs integration
const cloudDevices = [
  {
    name: 'iPhone 14 Pro',
    platform: 'iOS',
    version: '16.0',
    browser: 'safari',
    resolution: '393x852'
  },
  {
    name: 'Samsung Galaxy S23',
    platform: 'Android',
    version: '13.0',
    browser: 'chrome',
    resolution: '384x854'
  },
  {
    name: 'Google Pixel 7',
    platform: 'Android', 
    version: '13.0',
    browser: 'chrome',
    resolution: '412x915'
  },
  {
    name: 'iPad Pro 12.9',
    platform: 'iOS',
    version: '16.0',
    browser: 'safari',
    resolution: '1024x1366'
  }
]

test.describe('Device-Specific Testing', () => {
  // Test critical functionality across device categories
  test('should work on budget Android devices', async ({ browser }) => {
    // Simulate lower-end Android device with limited resources
    const context = await browser.newContext({
      viewport: { width: 360, height: 640 },
      deviceScaleFactor: 2,
      userAgent: 'Mozilla/5.0 (Linux; Android 9; SM-A105F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
    })
    
    const page = await context.newPage()
    
    // Simulate slower CPU by throttling
    await page.evaluate(() => {
      // Add small delays to simulate slower processing
      const originalSetTimeout = window.setTimeout
      window.setTimeout = function(callback, delay) {
        return originalSetTimeout(callback, (delay || 0) + 50)
      }
    })
    
    await page.goto('/')
    
    // Core functionality should work even on budget devices
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()
    
    // Check memory usage
    const memory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null
    })
    
    if (memory) {
      console.log('Budget device memory usage:', memory)
      // Memory usage should be reasonable for low-end devices
      expect(memory.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024) // 50MB
    }
    
    await context.close()
  })

  test('should handle various screen densities', async ({ browser }) => {
    const densities = [1, 1.5, 2, 2.75, 3]
    
    for (const dpr of densities) {
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: dpr
      })
      
      const page = await context.newPage()
      
      await page.goto('/')
      
      // Check that images render appropriately for the DPR
      const images = await page.locator('img').all()
      
      for (const img of images.slice(0, 3)) {
        const imageInfo = await img.evaluate((element: HTMLImageElement, targetDpr) => {
          return {
            naturalWidth: element.naturalWidth,
            naturalHeight: element.naturalHeight,
            displayWidth: element.offsetWidth,
            displayHeight: element.offsetHeight,
            src: element.src,
            currentDpr: window.devicePixelRatio
          }
        }, dpr)
        
        if (imageInfo.naturalWidth > 0 && imageInfo.displayWidth > 0) {
          const imageScale = imageInfo.naturalWidth / imageInfo.displayWidth
          // Image should be appropriate for the device pixel ratio
          expect(imageScale).toBeGreaterThanOrEqual(dpr * 0.7) // Allow some compression tolerance
        }
        
        console.log(`DPR ${dpr}: Image scale ratio ${imageInfo.naturalWidth / imageInfo.displayWidth}`)
      }
      
      await context.close()
    }
  })

  test('should work with different network speeds', async ({ browser }) => {
    const networkProfiles = [
      { name: 'Fast 3G', downloadThroughput: 1.5 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 40 },
      { name: 'Slow 3G', downloadThroughput: 500 * 1024 / 8, uploadThroughput: 500 * 1024 / 8, latency: 400 },
      { name: '2G', downloadThroughput: 250 * 1024 / 8, uploadThroughput: 250 * 1024 / 8, latency: 800 }
    ]
    
    for (const profile of networkProfiles) {
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 }
      })
      
      const page = await context.newPage()
      
      // Simulate network throttling
      await page.route('**/*', async route => {
        const delay = profile.latency + Math.random() * 100
        await new Promise(resolve => setTimeout(resolve, delay))
        await route.continue()
      })
      
      const startTime = Date.now()
      await page.goto('/')
      
      // Should show loading states on slow networks
      const hasLoadingStates = await page.locator('[data-testid*="loading"], .animate-pulse, .loading').count()
      console.log(`${profile.name}: Found ${hasLoadingStates} loading indicators`)
      
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 })
      const loadTime = Date.now() - startTime
      
      console.log(`${profile.name}: Load time ${loadTime}ms`)
      
      // Critical content should be available even on slow networks
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible({ timeout: 45000 })
      
      // Performance expectations based on network speed
      if (profile.name === 'Fast 3G') {
        expect(loadTime).toBeLessThan(8000)
      } else if (profile.name === 'Slow 3G') {
        expect(loadTime).toBeLessThan(15000)
      } else {
        expect(loadTime).toBeLessThan(30000)
      }
      
      await context.close()
    }
  })

  test('should handle different operating system versions', async ({ browser }) => {
    const osVersions = [
      {
        name: 'iOS 15',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        viewport: { width: 390, height: 844 }
      },
      {
        name: 'iOS 16',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        viewport: { width: 393, height: 852 }
      },
      {
        name: 'Android 11',
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        viewport: { width: 393, height: 851 }
      },
      {
        name: 'Android 13',
        userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36',
        viewport: { width: 412, height: 915 }
      }
    ]
    
    for (const os of osVersions) {
      const context = await browser.newContext({
        userAgent: os.userAgent,
        viewport: os.viewport
      })
      
      const page = await context.newPage()
      
      await page.goto('/')
      
      // Check OS-specific behavior
      const osFeatures = await page.evaluate((osName) => {
        return {
          osName,
          hasTouch: 'ontouchstart' in window,
          devicePixelRatio: window.devicePixelRatio,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          userAgent: navigator.userAgent,
          // Check for OS-specific CSS features
          supportsSafeArea: CSS.supports('padding-top', 'env(safe-area-inset-top)'),
          supportsBackdropFilter: CSS.supports('backdrop-filter', 'blur(10px)')
        }
      }, os.name)
      
      console.log(`${os.name} features:`, osFeatures)
      
      // Core functionality should work across OS versions
      await expect(page.locator('main')).toBeVisible()
      
      // Test OS-specific features
      if (os.name.includes('iOS')) {
        // Test iOS-specific behavior
        const iosSupport = await page.evaluate(() => {
          return {
            safeAreaSupport: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top'),
            webkitFeatures: {
              backdropFilter: CSS.supports('-webkit-backdrop-filter', 'blur(10px)'),
              touchAction: CSS.supports('touch-action', 'manipulation')
            }
          }
        })
        
        console.log(`${os.name} specific features:`, iosSupport)
      } else if (os.name.includes('Android')) {
        // Test Android-specific behavior
        const androidSupport = await page.evaluate(() => {
          return {
            chromeFeatures: !!window.chrome,
            viewport: {
              scale: window.visualViewport?.scale || 1,
              width: window.visualViewport?.width || window.innerWidth
            }
          }
        })
        
        console.log(`${os.name} specific features:`, androidSupport)
      }
      
      await context.close()
    }
  })

  test('should handle browser-specific mobile features', async ({ browser }) => {
    const mobileBrowsers = [
      {
        name: 'Safari Mobile',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        features: ['webkit', 'safari']
      },
      {
        name: 'Chrome Mobile',
        userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36',
        features: ['chrome', 'blink']
      },
      {
        name: 'Samsung Internet',
        userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/19.0 Chrome/102.0.5005.125 Mobile Safari/537.36',
        features: ['samsung', 'blink']
      },
      {
        name: 'Firefox Mobile',
        userAgent: 'Mozilla/5.0 (Mobile; rv:109.0) Gecko/109.0 Firefox/109.0',
        features: ['firefox', 'gecko']
      }
    ]
    
    for (const browserConfig of mobileBrowsers) {
      const context = await browser.newContext({
        userAgent: browserConfig.userAgent,
        viewport: { width: 375, height: 667 }
      })
      
      const page = await context.newPage()
      
      await page.goto('/')
      
      // Test browser-specific features
      const browserFeatures = await page.evaluate((features) => {
        const supportTest = {
          browserName: features[0],
          features: {
            webgl: !!window.WebGLRenderingContext,
            workers: !!window.Worker,
            serviceWorker: 'serviceWorker' in navigator,
            pushManager: 'PushManager' in window,
            indexedDB: !!window.indexedDB,
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
            geolocation: !!navigator.geolocation,
            camera: !!navigator.mediaDevices
          },
          css: {
            grid: CSS.supports('display', 'grid'),
            flexbox: CSS.supports('display', 'flex'),
            customProperties: CSS.supports('--test', 'value'),
            backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)') || CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
          }
        }
        
        return supportTest
      }, browserConfig.features)
      
      console.log(`${browserConfig.name} features:`, browserFeatures)
      
      // Core functionality should work in all mobile browsers
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()
      
      // Test mobile-specific interactions
      const menuButton = page.locator('[data-testid="mobile-menu-toggle"]')
      if (await menuButton.isVisible()) {
        await menuButton.tap()
        await page.waitForTimeout(500)
        
        const menu = page.locator('[data-testid="mobile-menu"]')
        if (await menu.isVisible()) {
          await menu.tap() // Close menu
        }
      }
      
      await context.close()
    }
  })

  test('should handle device orientation changes', async ({ browser }) => {
    const orientations = [
      { name: 'Portrait', width: 375, height: 812 },
      { name: 'Landscape', width: 812, height: 375 }
    ]
    
    for (const orientation of orientations) {
      const context = await browser.newContext({
        viewport: orientation
      })
      
      const page = await context.newPage()
      
      await page.goto('/')
      
      // Check layout adaptation to orientation
      const layoutInfo = await page.evaluate(() => {
        return {
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
          documentDimensions: {
            scrollWidth: document.documentElement.scrollWidth,
            scrollHeight: document.documentElement.scrollHeight
          }
        }
      })
      
      console.log(`${orientation.name} layout:`, layoutInfo)
      
      // Content should fit the orientation
      expect(layoutInfo.documentDimensions.scrollWidth).toBeLessThanOrEqual(orientation.width + 10)
      
      // Core elements should be visible
      await expect(page.locator('main')).toBeVisible()
      
      // Navigation should work in both orientations
      const nav = page.locator('nav, [data-testid="navigation"]')
      await expect(nav).toBeVisible()
      
      await context.close()
    }
  })

  test('should work with accessibility features enabled', async ({ browser }) => {
    const a11yConfigs = [
      {
        name: 'High Contrast',
        features: { colorScheme: 'dark', forcedColors: 'active' }
      },
      {
        name: 'Reduced Motion',
        features: { reducedMotion: 'reduce' }
      },
      {
        name: 'Large Text',
        features: { fontSize: '24px' }
      }
    ]
    
    for (const config of a11yConfigs) {
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        colorScheme: config.features.colorScheme as any,
        reducedMotion: config.features.reducedMotion as any
      })
      
      const page = await context.newPage()
      
      // Apply accessibility settings
      if (config.features.fontSize) {
        await page.addStyleTag({
          content: `* { font-size: ${config.features.fontSize} !important; }`
        })
      }
      
      if (config.features.forcedColors) {
        await page.emulateMedia({ forcedColors: 'active' as any })
      }
      
      await page.goto('/')
      
      // Check that content is still accessible
      await expect(page.locator('main')).toBeVisible()
      
      // Test keyboard navigation
      await page.keyboard.press('Tab')
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBeTruthy()
      
      console.log(`${config.name}: Accessibility test passed`)
      
      await context.close()
    }
  })

  test('should handle memory constraints on mobile devices', async ({ browser }) => {
    const memoryConstraints = [
      { name: 'Low Memory (1GB)', heapLimit: 256 * 1024 * 1024 },
      { name: 'Medium Memory (2GB)', heapLimit: 512 * 1024 * 1024 },
      { name: 'High Memory (4GB+)', heapLimit: 1024 * 1024 * 1024 }
    ]
    
    for (const constraint of memoryConstraints) {
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 }
      })
      
      const page = await context.newPage()
      
      await page.goto('/')
      
      // Monitor memory usage during typical interactions
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        } : null
      })
      
      if (initialMemory) {
        // Perform memory-intensive operations
        await page.evaluate(() => {
          // Simulate user interactions that might cause memory usage
          for (let i = 0; i < 100; i++) {
            const div = document.createElement('div')
            div.innerHTML = 'Test content ' + i
            document.body.appendChild(div)
            document.body.removeChild(div)
          }
        })
        
        const finalMemory = await page.evaluate(() => {
          return {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize
          }
        })
        
        const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
        console.log(`${constraint.name}: Memory increase ${memoryIncrease} bytes`)
        
        // Memory usage should be reasonable for the device category
        expect(finalMemory.usedJSHeapSize).toBeLessThan(constraint.heapLimit)
      }
      
      await context.close()
    }
  })
})

// Device-specific regression tests
test.describe('Device Regression Tests', () => {
  test('should handle common mobile device quirks', async ({ browser }) => {
    const deviceQuirks = [
      {
        name: 'iPhone X/11/12 Notch',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        viewport: { width: 390, height: 844 },
        quirks: ['notch', 'safeArea']
      },
      {
        name: 'Small Android',
        userAgent: 'Mozilla/5.0 (Linux; Android 9; SM-A105F) AppleWebKit/537.36',
        viewport: { width: 320, height: 568 },
        quirks: ['smallScreen', 'lowDpi']
      },
      {
        name: 'Android Foldable',
        userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-F926B) AppleWebKit/537.36',
        viewport: { width: 384, height: 832 },
        quirks: ['foldable', 'aspectRatio']
      }
    ]
    
    for (const device of deviceQuirks) {
      const context = await browser.newContext({
        userAgent: device.userAgent,
        viewport: device.viewport
      })
      
      const page = await context.newPage()
      
      await page.goto('/')
      
      // Test device-specific quirks
      if (device.quirks.includes('notch')) {
        // Check safe area handling
        const safeAreaHandling = await page.evaluate(() => {
          const computed = getComputedStyle(document.documentElement)
          return {
            safeAreaTop: computed.getPropertyValue('env(safe-area-inset-top)'),
            safeAreaBottom: computed.getPropertyValue('env(safe-area-inset-bottom)')
          }
        })
        
        console.log(`${device.name} safe area:`, safeAreaHandling)
      }
      
      if (device.quirks.includes('smallScreen')) {
        // Ensure content is readable on small screens
        const textReadability = await page.evaluate(() => {
          const elements = document.querySelectorAll('p, span, div')
          let smallTextCount = 0
          
          elements.forEach(el => {
            const style = getComputedStyle(el)
            const fontSize = parseFloat(style.fontSize)
            if (fontSize < 14) smallTextCount++
          })
          
          return { totalElements: elements.length, smallTextCount }
        })
        
        // Most text should be readable (14px+ on small screens)
        expect(textReadability.smallTextCount / textReadability.totalElements).toBeLessThan(0.1)
      }
      
      if (device.quirks.includes('foldable')) {
        // Test unusual aspect ratios
        const aspectRatio = device.viewport.width / device.viewport.height
        expect(aspectRatio).toBeGreaterThan(0.3) // Should handle extreme ratios
        expect(aspectRatio).toBeLessThan(3)
      }
      
      // Core functionality should work regardless of quirks
      await expect(page.locator('main')).toBeVisible()
      
      await context.close()
    }
  })
})