import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...')

  // Set up any global state or data needed for tests
  const { baseURL } = config.projects[0].use
  
  if (baseURL) {
    console.log(`📍 Base URL: ${baseURL}`)
    
    // Warm up the server by making a request
    try {
      const browser = await chromium.launch()
      const context = await browser.newContext()
      const page = await context.newPage()
      
      console.log('🌡️ Warming up the server...')
      await page.goto(baseURL, { waitUntil: 'networkidle' })
      
      // Check if the app is running correctly
      const title = await page.title()
      console.log(`📄 Page title: ${title}`)
      
      await browser.close()
      console.log('✅ Server warmed up successfully')
    } catch (error) {
      console.error('❌ Failed to warm up server:', error)
    }
  }

  // Set environment variables for tests
  process.env.PLAYWRIGHT_TEST_MODE = 'true'
  
  console.log('✅ Global setup completed')
}

export default globalSetup