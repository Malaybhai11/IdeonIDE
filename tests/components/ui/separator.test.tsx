import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Separator } from '@/components/ui/separator'

describe('Separator', () => {
  it('renders correctly with default orientation', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('[data-slot="separator"]')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('renders correctly with vertical orientation', () => {
    const { container } = render(<Separator orientation="vertical" />)
    const separator = container.querySelector('[data-slot="separator"]')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveAttribute('data-orientation', 'vertical')
  })

  it('applies custom class names', () => {
    const { container } = render(<Separator className="custom-separator" />)
    const separator = container.querySelector('[data-slot="separator"]')
    expect(separator).toHaveClass('custom-separator')
  })
})
