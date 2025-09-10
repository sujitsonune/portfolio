import { render, screen } from '@/test-utils'
import { 
  Spinner, 
  Skeleton, 
  CardSkeleton, 
  LoadingOverlay, 
  ProgressiveLoading,
  LoadingButton 
} from '../LoadingStates'

describe('LoadingStates Components', () => {
  describe('Spinner', () => {
    it('renders with default props', () => {
      render(<Spinner />)
      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveAttribute('aria-label', 'Loading')
    })

    it('renders with different sizes', () => {
      const { rerender } = render(<Spinner size="sm" />)
      expect(screen.getByRole('status')).toHaveClass('h-4 w-4')

      rerender(<Spinner size="lg" />)
      expect(screen.getByRole('status')).toHaveClass('h-8 w-8')
    })

    it('applies custom className', () => {
      render(<Spinner className="custom-class" />)
      expect(screen.getByRole('status')).toHaveClass('custom-class')
    })
  })

  describe('Skeleton', () => {
    it('renders single skeleton', () => {
      render(<Skeleton />)
      const skeleton = screen.getByRole('status')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('animate-pulse bg-muted')
    })

    it('renders multiple text lines', () => {
      render(<Skeleton variant="text" lines={3} />)
      // Should render a container with 3 skeleton lines
      const container = screen.getByRole('status').parentElement
      expect(container?.children).toHaveLength(3)
    })

    it('applies variant classes correctly', () => {
      const { rerender } = render(<Skeleton variant="circular" />)
      expect(screen.getByRole('status')).toHaveClass('rounded-full')

      rerender(<Skeleton variant="rectangular" />)
      expect(screen.getByRole('status')).toHaveClass('rounded-md')
    })
  })

  describe('CardSkeleton', () => {
    it('renders card skeleton structure', () => {
      render(<CardSkeleton />)
      
      // Check for circular avatar skeleton
      const avatarSkeleton = document.querySelector('.rounded-full')
      expect(avatarSkeleton).toBeInTheDocument()

      // Check for text skeletons
      const textSkeletons = document.querySelectorAll('.animate-pulse')
      expect(textSkeletons.length).toBeGreaterThan(1)
    })
  })

  describe('LoadingOverlay', () => {
    it('shows content when not loading', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div>Content</div>
        </LoadingOverlay>
      )
      
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('shows loading overlay when loading', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      )
      
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('replaces content when variant is replace', () => {
      render(
        <LoadingOverlay isLoading={true} variant="replace">
          <div>Content</div>
        </LoadingOverlay>
      )
      
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('shows custom loading message', () => {
      render(
        <LoadingOverlay isLoading={true} message="Custom loading...">
          <div>Content</div>
        </LoadingOverlay>
      )
      
      expect(screen.getByText('Custom loading...')).toBeInTheDocument()
    })
  })

  describe('ProgressiveLoading', () => {
    it('shows content when loaded', () => {
      render(
        <ProgressiveLoading isLoading={false}>
          <div>Loaded content</div>
        </ProgressiveLoading>
      )
      
      expect(screen.getByText('Loaded content')).toBeInTheDocument()
    })

    it('shows skeleton when loading', () => {
      render(
        <ProgressiveLoading isLoading={true}>
          <div>Content</div>
        </ProgressiveLoading>
      )
      
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
      // Should show default skeleton cards
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('shows error state', () => {
      render(
        <ProgressiveLoading 
          isLoading={false} 
          error="Something went wrong"
          errorAction={{ label: 'Retry', onClick: jest.fn() }}
        >
          <div>Content</div>
        </ProgressiveLoading>
      )
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })

    it('shows empty state', () => {
      render(
        <ProgressiveLoading 
          isLoading={false} 
          isEmpty={true}
          emptyMessage="No data found"
        >
          <div>Content</div>
        </ProgressiveLoading>
      )
      
      expect(screen.getByText('No data found')).toBeInTheDocument()
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })

    it('calls error action when retry clicked', async () => {
      const mockRetry = jest.fn()
      const { user } = render(
        <ProgressiveLoading 
          isLoading={false} 
          error="Error occurred"
          errorAction={{ label: 'Retry', onClick: mockRetry }}
        >
          <div>Content</div>
        </ProgressiveLoading>
      )
      
      const retryButton = screen.getByText('Retry')
      await user.click(retryButton)
      
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('LoadingButton', () => {
    it('renders children when not loading', () => {
      render(
        <LoadingButton isLoading={false}>
          Click me
        </LoadingButton>
      )
      
      expect(screen.getByText('Click me')).toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('shows loading state', () => {
      render(
        <LoadingButton isLoading={true}>
          Click me
        </LoadingButton>
      )
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByText('Click me')).not.toBeInTheDocument()
    })

    it('shows custom loading text', () => {
      render(
        <LoadingButton isLoading={true} loadingText="Processing...">
          Submit
        </LoadingButton>
      )
      
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })

    it('disables button when loading', () => {
      render(
        <LoadingButton isLoading={true}>
          Click me
        </LoadingButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('handles click when not loading', async () => {
      const mockClick = jest.fn()
      const { user } = render(
        <LoadingButton isLoading={false} onClick={mockClick}>
          Click me
        </LoadingButton>
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockClick).toHaveBeenCalledTimes(1)
    })

    it('does not handle click when loading', async () => {
      const mockClick = jest.fn()
      const { user } = render(
        <LoadingButton isLoading={true} onClick={mockClick}>
          Click me
        </LoadingButton>
      )
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockClick).not.toHaveBeenCalled()
    })
  })
})