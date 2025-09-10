import { render, screen } from '@/test-utils'
import { AccessibilityTester } from '@/test-utils/accessibility'
import { Button } from '@/components/ui/button'

describe('Button Accessibility', () => {
  it('should be accessible with text content', async () => {
    const result = render(<Button>Click me</Button>)
    await expect(result).toBeAccessible()
  })

  it('should be accessible with aria-label', async () => {
    const result = render(<Button aria-label="Close dialog">×</Button>)
    await expect(result).toBeAccessible()
  })

  it('should be accessible when disabled', async () => {
    const result = render(<Button disabled>Disabled button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
    
    await expect(result).toBeAccessible()
  })

  it('should handle keyboard navigation properly', async () => {
    const mockClick = jest.fn()
    const result = render(<Button onClick={mockClick}>Test Button</Button>)
    
    const keyboardTest = await AccessibilityTester.testKeyboardNavigation(result)
    expect(keyboardTest.passed).toBe(true)
    expect(keyboardTest.focusableCount).toBe(1)
  })

  it('should have sufficient color contrast', async () => {
    const result = render(<Button>Test Button</Button>)
    await expect(result).toHaveNoColorContrastIssues()
  })

  it('should work with screen readers', async () => {
    const result = render(<Button>Screen Reader Test</Button>)
    await expect(result).toHaveProperScreenReaderContent()
  })

  it('should support ARIA attributes', async () => {
    const result = render(
      <Button 
        aria-expanded={false}
        aria-haspopup="menu"
        aria-controls="menu-1"
      >
        Menu Button
      </Button>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-haspopup', 'menu')
    expect(button).toHaveAttribute('aria-controls', 'menu-1')
    
    await expect(result).toBeAccessible()
  })

  it('should handle loading state accessibly', async () => {
    const result = render(
      <Button disabled aria-busy="true">
        <span aria-hidden="true">Loading...</span>
        <span className="sr-only">Please wait while we process your request</span>
      </Button>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
    
    await expect(result).toBeAccessible()
  })

  it('should work with different variants', async () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
    
    for (const variant of variants) {
      const result = render(<Button variant={variant}>Test {variant}</Button>)
      await expect(result).toBeAccessible()
    }
  })

  it('should handle icon buttons properly', async () => {
    const result = render(
      <Button size="sm" variant="ghost" aria-label="Delete item">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 4l8 8m-8 0l8-8" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </Button>
    )
    
    const button = screen.getByRole('button', { name: 'Delete item' })
    expect(button).toBeInTheDocument()
    
    const icon = button.querySelector('svg')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    
    await expect(result).toBeAccessible()
  })
})