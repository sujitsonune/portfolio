import { Page, Locator } from '@playwright/test'

export class AboutPage {
  private readonly page: Page
  private readonly aboutSection: Locator
  private readonly profileImage: Locator
  private readonly aboutText: Locator
  private readonly experienceSection: Locator
  private readonly educationSection: Locator
  private readonly downloadResumeButton: Locator

  constructor(page: Page) {
    this.page = page
    this.aboutSection = page.locator('#about')
    this.profileImage = page.locator('[data-testid="profile-image"]')
    this.aboutText = page.locator('[data-testid="about-text"]')
    this.experienceSection = page.locator('[data-testid="experience-section"]')
    this.educationSection = page.locator('[data-testid="education-section"]')
    this.downloadResumeButton = page.locator('[data-testid="download-resume"]')
  }

  async goto() {
    await this.page.goto('/about')
    await this.page.waitForLoadState('networkidle')
  }

  async isVisible() {
    return await this.aboutSection.isVisible()
  }

  async getAboutText() {
    return await this.aboutText.textContent()
  }

  async downloadResume() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadResumeButton.click()
    ])
    return download
  }

  async getExperienceItems() {
    const items = this.page.locator('[data-testid="experience-item"]')
    return await items.all()
  }

  async getEducationItems() {
    const items = this.page.locator('[data-testid="education-item"]')
    return await items.all()
  }
}