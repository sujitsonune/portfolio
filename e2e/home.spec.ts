import { test, expect } from './fixtures/base'

test.describe('Home Page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto()
  })

  test('should load successfully', async ({ homePage, page }) => {
    await expect(page).toHaveTitle(/Sujit Portfolio/)
    expect(await homePage.isHeroVisible()).toBe(true)
  })

  test('should display hero section with correct content', async ({ homePage }) => {
    expect(await homePage.isHeroVisible()).toBe(true)
    
    const heroTitle = await homePage.getHeroTitle()
    expect(heroTitle).toBeTruthy()
    
    const heroSubtitle = await homePage.getHeroSubtitle()
    expect(heroSubtitle).toBeTruthy()
  })

  test('should navigate to different sections', async ({ homePage, page }) => {
    // Navigate to about section
    await homePage.navigateToSection('about')
    await expect(page.locator('#about')).toBeInViewport()

    // Navigate to skills section
    await homePage.navigateToSection('skills')
    await expect(page.locator('#skills')).toBeInViewport()

    // Navigate to projects section
    await homePage.navigateToSection('projects')
    await expect(page.locator('#projects')).toBeInViewport()

    // Navigate to contact section
    await homePage.navigateToSection('contact')
    await expect(page.locator('#contact')).toBeInViewport()
  })

  test('should toggle theme', async ({ homePage }) => {
    const initialTheme = await homePage.getCurrentTheme()
    
    await homePage.toggleTheme()
    await homePage.waitForAnimationsToComplete()
    
    const newTheme = await homePage.getCurrentTheme()
    expect(newTheme).not.toBe(initialTheme)
  })

  test('should display skills with correct data', async ({ homePage }) => {
    await homePage.scrollToSection('skills')
    
    const skillItems = await homePage.getSkillItems()
    expect(skillItems.length).toBeGreaterThan(0)
    
    // Check if specific skills are present
    const reactSkill = await homePage.getSkillByName('React')
    expect(await reactSkill.isVisible()).toBe(true)
  })

  test('should display projects', async ({ homePage }) => {
    await homePage.scrollToSection('projects')
    
    const projectCards = await homePage.getProjectCards()
    expect(projectCards.length).toBeGreaterThan(0)
    
    const featuredProjects = await homePage.getFeaturedProjects()
    expect(featuredProjects.length).toBeGreaterThan(0)
  })

  test('should handle contact form submission', async ({ homePage, page }) => {
    await homePage.scrollToSection('contact')
    
    // Fill out the contact form
    await homePage.fillContactForm({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message from Playwright'
    })
    
    // Mock the API response for form submission
    await page.route('/api/contact', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Message sent successfully!' })
      })
    })
    
    await homePage.submitContactForm()
    
    // Wait for success message
    await page.waitForTimeout(2000)
    
    const successMessage = await homePage.getContactFormSuccess()
    expect(successMessage).toContain('success')
  })

  test('should validate contact form fields', async ({ homePage }) => {
    await homePage.scrollToSection('contact')
    
    // Try to submit empty form
    await homePage.submitContactForm()
    
    // Check for validation errors
    const hasErrors = await homePage.hasErrorMessages()
    expect(hasErrors).toBe(true)
  })

  test('should be responsive on mobile', async ({ page, homePage }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await homePage.goto()
    
    // Check if mobile menu toggle is visible
    await homePage.toggleMobileMenu()
    expect(await homePage.isMobileMenuVisible()).toBe(true)
  })

  test('should load without console errors', async ({ page, homePage }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await homePage.goto()
    await homePage.waitForPageToLoad()
    
    // Filter out known harmless errors
    const significantErrors = errors.filter(error => 
      !error.includes('Warning:') &&
      !error.includes('Download the React DevTools')
    )
    
    expect(significantErrors).toEqual([])
  })

  test('should have good performance metrics', async ({ homePage }) => {
    await homePage.goto()
    
    const metrics = await homePage.getPerformanceMetrics()
    
    // Check that page loads within reasonable time (5 seconds)
    expect(metrics.loadTime).toBeLessThan(5000)
    expect(metrics.domContentLoaded).toBeLessThan(3000)
  })

  test('should have proper SEO metadata', async ({ homePage }) => {
    await homePage.goto()
    
    const seoInfo = await homePage.getPageSEOInfo()
    
    expect(seoInfo.title).toBeTruthy()
    expect(seoInfo.description).toBeTruthy()
    expect(seoInfo.ogTitle).toBeTruthy()
    expect(seoInfo.ogDescription).toBeTruthy()
    expect(seoInfo.structuredData).toBe(true)
  })

  test('should handle scroll animations', async ({ homePage, page }) => {
    // Scroll through all sections and verify animations trigger
    const sections = ['about', 'skills', 'projects', 'contact']
    
    for (const section of sections) {
      await homePage.scrollToSection(section)
      await page.waitForTimeout(1000) // Wait for animations
      
      const sectionElement = page.locator(`#${section}`)
      expect(await sectionElement.isVisible()).toBe(true)
    }
  })

  test('should work with keyboard navigation', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Test Tab navigation through interactive elements
    await page.keyboard.press('Tab') // Should focus first interactive element
    
    const activeElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'A', 'INPUT'].includes(activeElement || '')).toBe(true)
  })

  test('should handle social media links', async ({ homePage }) => {
    const socialLinks = await homePage.getSocialLinks()
    expect(socialLinks.length).toBeGreaterThan(0)
    
    // Each social link should have proper attributes
    for (const link of socialLinks) {
      const href = await link.getAttribute('href')
      const target = await link.getAttribute('target')
      
      expect(href).toBeTruthy()
      expect(target).toBe('_blank') // Should open in new tab
    }
  })

  test('should scroll smoothly between sections', async ({ homePage, page }) => {
    // Test smooth scrolling behavior
    await homePage.scrollToTop()
    
    await homePage.navigateToSection('contact')
    await page.waitForTimeout(1500) // Wait for smooth scroll animation
    
    const contactSection = page.locator('#contact')
    expect(await contactSection.isInViewport()).toBe(true)
  })
})