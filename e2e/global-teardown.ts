import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...')

  // Clean up any global state or resources
  if (process.env.PLAYWRIGHT_TEST_MODE) {
    delete process.env.PLAYWRIGHT_TEST_MODE
  }

  // Additional cleanup can be added here:
  // - Database cleanup
  // - File system cleanup
  // - External service cleanup

  console.log('✅ Global teardown completed')
}

export default globalTeardown