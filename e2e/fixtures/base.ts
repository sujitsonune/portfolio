import { test as base, expect, Page } from '@playwright/test'
import { HomePage } from '../pages/HomePage'
import { AboutPage } from '../pages/AboutPage'
import { ProjectsPage } from '../pages/ProjectsPage'
import { ContactPage } from '../pages/ContactPage'

// Extend base test with custom fixtures
type TestFixtures = {
  homePage: HomePage
  aboutPage: AboutPage
  projectsPage: ProjectsPage
  contactPage: ContactPage
}

export const test = base.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page))
  },

  aboutPage: async ({ page }, use) => {
    await use(new AboutPage(page))
  },

  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page))
  },

  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page))
  },
})

// Custom expect matchers
expect.extend({
  async toBeVisibleInViewport(page: Page, selector: string) {
    const element = page.locator(selector)
    const isVisible = await element.isVisible()
    const box = await element.boundingBox()
    const viewport = page.viewportSize()
    
    const isInViewport = box && viewport &&
      box.x >= 0 &&
      box.y >= 0 &&
      box.x + box.width <= viewport.width &&
      box.y + box.height <= viewport.height

    return {
      message: () => `Expected element to be visible in viewport`,
      pass: isVisible && isInViewport,
    }
  },

  async toHaveLoadedWithoutErrors(page: Page) {
    const errors: string[] = []
    
    // Collect console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Check for failed network requests
    page.on('response', response => {
      if (response.status() >= 400) {
        errors.push(`Failed request: ${response.url()} (${response.status()})`)
      }
    })

    await page.waitForLoadState('networkidle')

    return {
      message: () => `Expected page to load without errors. Found: ${errors.join(', ')}`,
      pass: errors.length === 0,
    }
  }
})

// Custom test utilities
export class TestUtils {
  constructor(private page: Page) {}

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
    // Wait for any animations to complete
    await this.page.waitForTimeout(500)
  }

  async takeFullPageScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    })
  }

  async checkAccessibility() {
    // Check for basic accessibility issues
    const missingAltImages = await this.page.locator('img:not([alt])').count()
    const missingLabels = await this.page.locator('input:not([aria-label]):not([aria-labelledby]):not([title])').count()
    const lowContrastElements = await this.page.evaluate(() => {
      // This is a simplified check - in real scenarios, use axe-core
      return document.querySelectorAll('[style*="color: #ccc"], [style*="color: #ddd"]').length
    })

    return {
      missingAltImages,
      missingLabels,
      lowContrastElements,
      hasAccessibilityIssues: missingAltImages > 0 || missingLabels > 0 || lowContrastElements > 0
    }
  }

  async checkPerformance() {
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0,
      }
    })

    return performanceMetrics
  }

  async checkSEO() {
    const seoInfo = await this.page.evaluate(() => {
      return {
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content'),
        h1Count: document.querySelectorAll('h1').length,
        imageCount: document.querySelectorAll('img').length,
        linkCount: document.querySelectorAll('a').length,
        hasStructuredData: !!document.querySelector('script[type="application/ld+json"]'),
      }
    })

    return seoInfo
  }

  async fillForm(formData: Record<string, string>) {
    for (const [fieldName, value] of Object.entries(formData)) {
      await this.page.fill(`[name="${fieldName}"], [id="${fieldName}"], [data-testid="${fieldName}"]`, value)
    }
  }

  async submitForm() {
    await this.page.click('[type="submit"], [role="button"]:has-text("Submit")')
  }

  async scrollToBottom() {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    await this.page.waitForTimeout(1000)
  }

  async mockApiResponse(url: string, response: any) {
    await this.page.route(url, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      })
    })
  }
}

export { expect }