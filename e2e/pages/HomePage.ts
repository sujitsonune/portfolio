import { Page, Locator } from '@playwright/test'

export class HomePage {
  private readonly page: Page

  // Selectors
  private readonly heroSection: Locator
  private readonly heroTitle: Locator
  private readonly heroSubtitle: Locator
  private readonly ctaButton: Locator
  private readonly aboutSection: Locator
  private readonly skillsSection: Locator
  private readonly projectsSection: Locator
  private readonly contactSection: Locator
  private readonly navigationMenu: Locator
  private readonly themeToggle: Locator
  private readonly mobileMenuToggle: Locator

  constructor(page: Page) {
    this.page = page

    // Initialize locators
    this.heroSection = page.locator('#hero')
    this.heroTitle = page.locator('[data-testid="hero-title"]')
    this.heroSubtitle = page.locator('[data-testid="hero-subtitle"]')
    this.ctaButton = page.locator('[data-testid="hero-cta"]')
    this.aboutSection = page.locator('#about')
    this.skillsSection = page.locator('#skills')
    this.projectsSection = page.locator('#projects')
    this.contactSection = page.locator('#contact')
    this.navigationMenu = page.locator('[data-testid="main-nav"]')
    this.themeToggle = page.locator('[data-testid="theme-toggle"]')
    this.mobileMenuToggle = page.locator('[data-testid="mobile-menu-toggle"]')
  }

  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  async getTitle() {
    return await this.page.title()
  }

  // Hero section interactions
  async isHeroVisible() {
    return await this.heroSection.isVisible()
  }

  async getHeroTitle() {
    return await this.heroTitle.textContent()
  }

  async getHeroSubtitle() {
    return await this.heroSubtitle.textContent()
  }

  async clickCTA() {
    await this.ctaButton.click()
  }

  // Navigation interactions
  async navigateToSection(sectionName: string) {
    const navLink = this.page.locator(`[href="#${sectionName}"]`)
    await navLink.click()
    await this.page.waitForTimeout(1000) // Wait for smooth scroll
  }

  async toggleTheme() {
    await this.themeToggle.click()
    await this.page.waitForTimeout(500) // Wait for theme transition
  }

  async toggleMobileMenu() {
    await this.mobileMenuToggle.click()
  }

  async isMobileMenuVisible() {
    const mobileMenu = this.page.locator('[data-testid="mobile-menu"]')
    return await mobileMenu.isVisible()
  }

  // Section visibility checks
  async isAboutSectionVisible() {
    return await this.aboutSection.isVisible()
  }

  async isSkillsSectionVisible() {
    return await this.skillsSection.isVisible()
  }

  async isProjectsSectionVisible() {
    return await this.projectsSection.isVisible()
  }

  async isContactSectionVisible() {
    return await this.contactSection.isVisible()
  }

  // Skills section interactions
  async getSkillItems() {
    const skillItems = this.page.locator('[data-testid="skill-item"]')
    return await skillItems.all()
  }

  async getSkillByName(skillName: string) {
    return this.page.locator(`[data-testid="skill-item"]:has-text("${skillName}")`)
  }

  // Projects section interactions
  async getProjectCards() {
    const projectCards = this.page.locator('[data-testid="project-card"]')
    return await projectCards.all()
  }

  async clickProject(projectTitle: string) {
    const projectCard = this.page.locator(`[data-testid="project-card"]:has-text("${projectTitle}")`)
    await projectCard.click()
  }

  async getFeaturedProjects() {
    const featuredProjects = this.page.locator('[data-testid="project-card"][data-featured="true"]')
    return await featuredProjects.all()
  }

  // Contact section interactions
  async fillContactForm(data: {
    name: string
    email: string
    subject: string
    message: string
  }) {
    await this.page.fill('[name="name"]', data.name)
    await this.page.fill('[name="email"]', data.email)
    await this.page.fill('[name="subject"]', data.subject)
    await this.page.fill('[name="message"]', data.message)
  }

  async submitContactForm() {
    await this.page.click('[data-testid="contact-submit"]')
  }

  async getContactFormError() {
    const errorMessage = this.page.locator('[data-testid="contact-error"]')
    return await errorMessage.textContent()
  }

  async getContactFormSuccess() {
    const successMessage = this.page.locator('[data-testid="contact-success"]')
    return await successMessage.textContent()
  }

  // Scroll interactions
  async scrollToSection(sectionName: string) {
    const section = this.page.locator(`#${sectionName}`)
    await section.scrollIntoViewIfNeeded()
    await this.page.waitForTimeout(500)
  }

  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0))
    await this.page.waitForTimeout(500)
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await this.page.waitForTimeout(500)
  }

  // Animation and loading checks
  async waitForAnimationsToComplete() {
    // Wait for any CSS animations or transitions to complete
    await this.page.waitForTimeout(1000)
  }

  async isLoading() {
    const loadingSpinner = this.page.locator('[data-testid="loading-spinner"]')
    return await loadingSpinner.isVisible()
  }

  async waitForPageToLoad() {
    await this.page.waitForLoadState('networkidle')
    await this.waitForAnimationsToComplete()
  }

  // Dark/Light theme checks
  async getCurrentTheme() {
    return await this.page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    })
  }

  // Social links
  async clickSocialLink(platform: string) {
    const socialLink = this.page.locator(`[data-testid="social-${platform}"]`)
    await socialLink.click()
  }

  async getSocialLinks() {
    const socialLinks = this.page.locator('[data-testid^="social-"]')
    return await socialLinks.all()
  }

  // Performance and SEO helpers
  async getPerformanceMetrics() {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      }
    })
  }

  async getPageSEOInfo() {
    return await this.page.evaluate(() => {
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
        keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content'),
        canonicalUrl: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
        ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
        structuredData: !!document.querySelector('script[type="application/ld+json"]'),
      }
    })
  }

  // Error handling
  async hasErrorMessages() {
    const errorElements = this.page.locator('[data-testid*="error"], .error, [role="alert"]')
    return await errorElements.count() > 0
  }

  async getErrorMessages() {
    const errorElements = this.page.locator('[data-testid*="error"], .error, [role="alert"]')
    const messages = []
    
    for (const element of await errorElements.all()) {
      const text = await element.textContent()
      if (text) messages.push(text)
    }
    
    return messages
  }
}