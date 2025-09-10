import { RenderResult } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Accessibility testing utilities
export class AccessibilityTester {
  static async runAxeTest(container: Element, rules?: any) {
    const results = await axe(container, {
      rules: {
        // Custom rule configuration
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
        'aria-labels': { enabled: true },
        'heading-hierarchy': { enabled: true },
        'landmark-roles': { enabled: true },
        ...rules
      },
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
    })
    
    return results
  }

  static async testComponent(renderResult: RenderResult, customRules?: any) {
    const { container } = renderResult
    const results = await this.runAxeTest(container, customRules)
    
    expect(results).toHaveNoViolations()
    return results
  }

  static async testKeyboardNavigation(renderResult: RenderResult) {
    const { container } = renderResult
    
    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    )
    
    const issues = []
    
    // Test each focusable element
    focusableElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement
      
      // Check if element is actually focusable
      htmlElement.focus()
      if (document.activeElement !== htmlElement) {
        issues.push(`Element ${index} (${htmlElement.tagName}) is not focusable`)
      }
      
      // Check for visible focus indicator
      const computedStyle = window.getComputedStyle(htmlElement, ':focus')
      const hasOutline = computedStyle.outline !== 'none'
      const hasBoxShadow = computedStyle.boxShadow !== 'none'
      const hasBorder = computedStyle.border !== 'none'
      
      if (!hasOutline && !hasBoxShadow && !hasBorder) {
        issues.push(`Element ${index} (${htmlElement.tagName}) has no visible focus indicator`)
      }
    })
    
    return {
      focusableCount: focusableElements.length,
      issues,
      passed: issues.length === 0
    }
  }

  static async testScreenReaderContent(renderResult: RenderResult) {
    const { container } = renderResult
    const issues = []
    
    // Check for images without alt text
    const images = container.querySelectorAll('img')
    images.forEach((img, index) => {
      if (!img.alt && img.getAttribute('role') !== 'presentation') {
        issues.push(`Image ${index} missing alt text`)
      }
    })
    
    // Check for form inputs without labels
    const inputs = container.querySelectorAll('input, textarea, select')
    inputs.forEach((input, index) => {
      const htmlInput = input as HTMLInputElement
      const hasLabel = htmlInput.labels && htmlInput.labels.length > 0
      const hasAriaLabel = htmlInput.getAttribute('aria-label')
      const hasAriaLabelledBy = htmlInput.getAttribute('aria-labelledby')
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push(`Input ${index} (${htmlInput.type}) missing label`)
      }
    })
    
    // Check for buttons without accessible names
    const buttons = container.querySelectorAll('button')
    buttons.forEach((button, index) => {
      const hasText = button.textContent?.trim()
      const hasAriaLabel = button.getAttribute('aria-label')
      const hasAriaLabelledBy = button.getAttribute('aria-labelledby')
      const hasTitle = button.getAttribute('title')
      
      if (!hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
        issues.push(`Button ${index} missing accessible name`)
      }
    })
    
    // Check heading hierarchy
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    const headingLevels = headings.map(h => parseInt(h.tagName.substring(1)))
    
    for (let i = 1; i < headingLevels.length; i++) {
      const current = headingLevels[i]
      const previous = headingLevels[i - 1]
      
      if (current > previous + 1) {
        issues.push(`Heading hierarchy skip: h${previous} followed by h${current}`)
      }
    }
    
    return {
      issues,
      passed: issues.length === 0,
      stats: {
        images: images.length,
        inputs: inputs.length,
        buttons: buttons.length,
        headings: headings.length
      }
    }
  }

  static async testColorContrast(renderResult: RenderResult) {
    const { container } = renderResult
    const issues = []
    
    // Get all text elements
    const textElements = container.querySelectorAll('*')
    
    textElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement
      const style = window.getComputedStyle(htmlElement)
      const color = style.color
      const backgroundColor = style.backgroundColor
      
      // Simple contrast check (in real app, use a proper contrast calculation library)
      if (color && backgroundColor && color !== 'inherit' && backgroundColor !== 'transparent') {
        const colorRgb = this.parseRgb(color)
        const bgRgb = this.parseRgb(backgroundColor)
        
        if (colorRgb && bgRgb) {
          const contrast = this.calculateContrast(colorRgb, bgRgb)
          const fontSize = parseFloat(style.fontSize)
          const fontWeight = style.fontWeight
          
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700))
          const minContrast = isLargeText ? 3 : 4.5
          
          if (contrast < minContrast) {
            issues.push(`Element ${index} has insufficient color contrast: ${contrast.toFixed(2)} (min: ${minContrast})`)
          }
        }
      }
    })
    
    return {
      issues,
      passed: issues.length === 0
    }
  }

  private static parseRgb(color: string): [number, number, number] | null {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
    }
    return null
  }

  private static calculateContrast(rgb1: [number, number, number], rgb2: [number, number, number]): number {
    const luminance1 = this.getLuminance(rgb1)
    const luminance2 = this.getLuminance(rgb2)
    
    const lighter = Math.max(luminance1, luminance2)
    const darker = Math.min(luminance1, luminance2)
    
    return (lighter + 0.05) / (darker + 0.05)
  }

  private static getLuminance([r, g, b]: [number, number, number]): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  static async runFullAccessibilityAudit(renderResult: RenderResult) {
    console.log('🔍 Running full accessibility audit...')
    
    const results = {
      axe: await this.testComponent(renderResult),
      keyboard: await this.testKeyboardNavigation(renderResult),
      screenReader: await this.testScreenReaderContent(renderResult),
      colorContrast: await this.testColorContrast(renderResult)
    }
    
    const allPassed = results.keyboard.passed && 
                     results.screenReader.passed && 
                     results.colorContrast.passed
    
    if (!allPassed) {
      console.warn('❌ Accessibility issues found:')
      if (!results.keyboard.passed) {
        console.warn('  Keyboard navigation issues:', results.keyboard.issues)
      }
      if (!results.screenReader.passed) {
        console.warn('  Screen reader issues:', results.screenReader.issues)
      }
      if (!results.colorContrast.passed) {
        console.warn('  Color contrast issues:', results.colorContrast.issues)
      }
    } else {
      console.log('✅ All accessibility tests passed')
    }
    
    return {
      ...results,
      passed: allPassed,
      summary: {
        focusableElements: results.keyboard.focusableCount,
        totalIssues: results.keyboard.issues.length + 
                    results.screenReader.issues.length + 
                    results.colorContrast.issues.length
      }
    }
  }
}

// Jest custom matchers for accessibility
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): R
      toHaveNoColorContrastIssues(): R
      toHaveProperKeyboardNavigation(): R
      toHaveProperScreenReaderContent(): R
    }
  }
}

// Custom Jest matchers
expect.extend({
  async toBeAccessible(renderResult: RenderResult) {
    const audit = await AccessibilityTester.runFullAccessibilityAudit(renderResult)
    
    return {
      pass: audit.passed,
      message: () => audit.passed 
        ? 'Component passed all accessibility tests'
        : `Component failed accessibility tests. Issues found: ${audit.summary.totalIssues}`
    }
  },

  async toHaveNoColorContrastIssues(renderResult: RenderResult) {
    const result = await AccessibilityTester.testColorContrast(renderResult)
    
    return {
      pass: result.passed,
      message: () => result.passed
        ? 'Component has sufficient color contrast'
        : `Color contrast issues: ${result.issues.join(', ')}`
    }
  },

  async toHaveProperKeyboardNavigation(renderResult: RenderResult) {
    const result = await AccessibilityTester.testKeyboardNavigation(renderResult)
    
    return {
      pass: result.passed,
      message: () => result.passed
        ? 'Component has proper keyboard navigation'
        : `Keyboard navigation issues: ${result.issues.join(', ')}`
    }
  },

  async toHaveProperScreenReaderContent(renderResult: RenderResult) {
    const result = await AccessibilityTester.testScreenReaderContent(renderResult)
    
    return {
      pass: result.passed,
      message: () => result.passed
        ? 'Component has proper screen reader content'
        : `Screen reader issues: ${result.issues.join(', ')}`
    }
  }
})

export default AccessibilityTester