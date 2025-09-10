import { Page, Locator } from '@playwright/test'

export class ProjectsPage {
  private readonly page: Page
  private readonly projectsSection: Locator
  private readonly projectGrid: Locator
  private readonly filterButtons: Locator
  private readonly searchInput: Locator

  constructor(page: Page) {
    this.page = page
    this.projectsSection = page.locator('#projects')
    this.projectGrid = page.locator('[data-testid="projects-grid"]')
    this.filterButtons = page.locator('[data-testid="filter-button"]')
    this.searchInput = page.locator('[data-testid="projects-search"]')
  }

  async goto() {
    await this.page.goto('/projects')
    await this.page.waitForLoadState('networkidle')
  }

  async filterByCategory(category: string) {
    await this.page.click(`[data-testid="filter-button"][data-filter="${category}"]`)
    await this.page.waitForTimeout(500)
  }

  async searchProjects(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(500)
  }

  async getVisibleProjects() {
    const projects = this.page.locator('[data-testid="project-card"]:visible')
    return await projects.all()
  }
}