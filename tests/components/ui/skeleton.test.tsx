import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton', () => {
  it('renders correctly', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.querySelector('[data-slot="skeleton"]')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('animate-pulse')
  })

  it('applies custom class names', () => {
    const { container } = render(<Skeleton className="w-[100px] h-[20px]" />)
    const skeleton = container.querySelector('[data-slot="skeleton"]')
    expect(skeleton).toHaveClass('w-[100px]')
    expect(skeleton).toHaveClass('h-[20px]')
  })
})
