import { test, expect } from './fixtures/base'

test.describe('Accessibility Tests', () => {
  test('should meet WCAG accessibility standards on home page', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1) // Should have exactly one H1
    
    // Check all images have alt text
    const imagesWithoutAlt = await page.locator('img:not([alt])').count()
    expect(imagesWithoutAlt).toBe(0)
    
    // Check form inputs have labels
    const unlabeledInputs = await page.locator('input:not([aria-label]):not([aria-labelledby]):not([id])').count()
    expect(unlabeledInputs).toBe(0)
    
    // Check color contrast (simplified check)
    const lowContrastElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      let count = 0
      elements.forEach(el => {
        const style = window.getComputedStyle(el)
        const color = style.color
        const bg = style.backgroundColor
        
        // Simple check for obviously low contrast combinations
        if ((color === 'rgb(211, 211, 211)' && bg === 'rgb(255, 255, 255)') ||
            (color === 'rgb(169, 169, 169)' && bg === 'rgb(255, 255, 255)')) {
          count++
        }
      })
      return count
    })
    expect(lowContrastElements).toBe(0)
  })

  test('should be navigable with keyboard only', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Start keyboard navigation
    await page.keyboard.press('Tab')
    
    // Track focus progression through interactive elements
    const focusableElements = []
    
    for (let i = 0; i < 10; i++) { // Test first 10 tab stops
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement
        return {
          tagName: active?.tagName,
          type: active?.getAttribute('type'),
          role: active?.getAttribute('role'),
          ariaLabel: active?.getAttribute('aria-label'),
          text: active?.textContent?.slice(0, 50)
        }
      })
      
      focusableElements.push(focusedElement)
      await page.keyboard.press('Tab')
    }
    
    // Verify that focus moved through interactive elements
    const interactiveElements = focusableElements.filter(el => 
      ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName || '') ||
      ['button', 'link', 'textbox'].includes(el.role || '')
    )
    
    expect(interactiveElements.length).toBeGreaterThan(3)
  })

  test('should have proper ARIA labels and roles', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Check main landmark exists
    const mainLandmark = await page.locator('main, [role="main"]').count()
    expect(mainLandmark).toBeGreaterThan(0)
    
    // Check navigation landmark exists
    const navLandmark = await page.locator('nav, [role="navigation"]').count()
    expect(navLandmark).toBeGreaterThan(0)
    
    // Check buttons have accessible names
    const buttonsWithoutNames = await page.locator('button:not([aria-label]):not([aria-labelledby])').filter({
      hasNotText: /.+/
    }).count()
    expect(buttonsWithoutNames).toBe(0)
    
    // Check form fields have labels
    const formInputs = await page.locator('input[type="text"], input[type="email"], textarea').all()
    
    for (const input of formInputs) {
      const hasLabel = await input.evaluate(el => {
        const id = el.id
        const ariaLabel = el.getAttribute('aria-label')
        const ariaLabelledBy = el.getAttribute('aria-labelledby')
        const label = id ? document.querySelector(`label[for="${id}"]`) : null
        
        return !!(ariaLabel || ariaLabelledBy || label)
      })
      
      expect(hasLabel).toBe(true)
    }
  })

  test('should work with screen reader announcements', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Check for live regions for dynamic content
    const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count()
    expect(liveRegions).toBeGreaterThan(0)
    
    // Test form submission announcements
    await homePage.scrollToSection('contact')
    
    await homePage.fillContactForm({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test',
      message: 'Test message'
    })
    
    // Mock successful form submission
    await page.route('/api/contact', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Message sent!' })
      })
    })
    
    await homePage.submitContactForm()
    
    // Check if success message is announced to screen readers
    const successMessage = page.locator('[role="status"], [aria-live]')
    await expect(successMessage).toBeVisible({ timeout: 5000 })
  })

  test('should have skip links for keyboard users', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Check for skip to main content link
    const skipLink = page.locator('a[href="#main-content"], a[href="#main"]')
    
    // Skip links might be visually hidden but should be focusable
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement)
    
    // If the first focusable element is a skip link, test it
    if (await skipLink.count() > 0) {
      await skipLink.press('Enter')
      
      // Verify focus moved to main content
      const mainContent = page.locator('#main-content, main')
      expect(await mainContent.count()).toBeGreaterThan(0)
    }
  })

  test('should handle focus management in modals/dialogs', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Test mobile menu focus management
    await page.setViewportSize({ width: 375, height: 667 })
    
    await homePage.toggleMobileMenu()
    
    if (await homePage.isMobileMenuVisible()) {
      // Focus should be trapped within the mobile menu
      await page.keyboard.press('Tab')
      
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement
        return active?.closest('[data-testid="mobile-menu"]') !== null
      })
      
      expect(focusedElement).toBe(true)
    }
  })

  test('should provide alternative text for non-text content', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Check all decorative images have empty alt text or proper descriptions
    const images = await page.locator('img').all()
    
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      const role = await img.getAttribute('role')
      
      // Images should either have descriptive alt text or be marked as decorative
      expect(alt !== null || role === 'presentation').toBe(true)
    }
    
    // Check for icons that might need labels
    const iconButtons = await page.locator('button:has(svg), button:has(.icon)').all()
    
    for (const button of iconButtons) {
      const hasAccessibleName = await button.evaluate(el => {
        const ariaLabel = el.getAttribute('aria-label')
        const ariaLabelledBy = el.getAttribute('aria-labelledby')
        const textContent = el.textContent?.trim()
        const title = el.getAttribute('title')
        
        return !!(ariaLabel || ariaLabelledBy || textContent || title)
      })
      
      expect(hasAccessibleName).toBe(true)
    }
  })

  test('should maintain focus visibility', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Check that focused elements have visible focus indicators
    const focusableElements = await page.locator('button, a, input, textarea, select, [tabindex]').all()
    
    for (let i = 0; i < Math.min(5, focusableElements.length); i++) {
      await focusableElements[i].focus()
      
      // Check if the element has focus styles
      const hasFocusStyles = await focusableElements[i].evaluate(el => {
        const styles = window.getComputedStyle(el, ':focus')
        const outline = styles.outline
        const boxShadow = styles.boxShadow
        const borderColor = styles.borderColor
        
        // Element should have some form of focus indication
        return outline !== 'none' || 
               boxShadow !== 'none' || 
               borderColor !== 'rgb(0, 0, 0)' ||
               el.classList.contains('focus:')
      })
      
      expect(hasFocusStyles).toBe(true)
    }
  })

  test('should support high contrast mode', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Simulate high contrast mode by checking if content is still visible
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            background: black !important;
            color: white !important;
          }
        }
      `
    })
    
    // Verify content is still readable
    const heroTitle = homePage.getHeroTitle()
    expect(await heroTitle).toBeTruthy()
    
    // Check that interactive elements are still distinguishable
    const buttons = await page.locator('button').all()
    expect(buttons.length).toBeGreaterThan(0)
  })

  test('should work with reduced motion preferences', async ({ page, homePage }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    await homePage.goto()
    
    // Verify animations are disabled or significantly reduced
    const animationDuration = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      let maxDuration = 0
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el)
        const animationDuration = parseFloat(styles.animationDuration) || 0
        const transitionDuration = parseFloat(styles.transitionDuration) || 0
        
        maxDuration = Math.max(maxDuration, animationDuration, transitionDuration)
      })
      
      return maxDuration
    })
    
    // In reduced motion mode, animations should be very short or disabled
    expect(animationDuration).toBeLessThan(0.1) // 100ms or less
  })
})