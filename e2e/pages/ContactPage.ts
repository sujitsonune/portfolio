import { Page, Locator } from '@playwright/test'

export class ContactPage {
  private readonly page: Page
  private readonly contactForm: Locator
  private readonly nameInput: Locator
  private readonly emailInput: Locator
  private readonly subjectInput: Locator
  private readonly messageInput: Locator
  private readonly submitButton: Locator
  private readonly successMessage: Locator
  private readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.contactForm = page.locator('[data-testid="contact-form"]')
    this.nameInput = page.locator('[name="name"]')
    this.emailInput = page.locator('[name="email"]')
    this.subjectInput = page.locator('[name="subject"]')
    this.messageInput = page.locator('[name="message"]')
    this.submitButton = page.locator('[data-testid="contact-submit"]')
    this.successMessage = page.locator('[data-testid="contact-success"]')
    this.errorMessage = page.locator('[data-testid="contact-error"]')
  }

  async goto() {
    await this.page.goto('/contact')
    await this.page.waitForLoadState('networkidle')
  }

  async fillForm(data: {
    name: string
    email: string
    subject: string
    message: string
  }) {
    await this.nameInput.fill(data.name)
    await this.emailInput.fill(data.email)
    await this.subjectInput.fill(data.subject)
    await this.messageInput.fill(data.message)
  }

  async submitForm() {
    await this.submitButton.click()
  }

  async getSuccessMessage() {
    return await this.successMessage.textContent()
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent()
  }

  async validateRequiredFields() {
    await this.submitButton.click()
    
    const nameError = await this.page.locator('[data-testid="name-error"]').isVisible()
    const emailError = await this.page.locator('[data-testid="email-error"]').isVisible()
    const messageError = await this.page.locator('[data-testid="message-error"]').isVisible()

    return { nameError, emailError, messageError }
  }
}