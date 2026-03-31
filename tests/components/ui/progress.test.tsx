import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Progress } from '@/components/ui/progress'

describe('Progress', () => {
  it('renders correctly', () => {
    const { container } = render(<Progress value={50} />)
    const indicator = container.querySelector('[data-slot="progress-indicator"]')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveStyle('transform: translateX(-50%)')
  })

  it('handles 0 value', () => {
    const { container } = render(<Progress value={0} />)
    const indicator = container.querySelector('[data-slot="progress-indicator"]')
    expect(indicator).toHaveStyle('transform: translateX(-100%)')
  })

  it('handles 100 value', () => {
    const { container } = render(<Progress value={100} />)
    const indicator = container.querySelector('[data-slot="progress-indicator"]')
    expect(indicator).toHaveStyle('transform: translateX(-0%)')
  })
})
