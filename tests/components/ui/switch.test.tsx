import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Switch } from '@/components/ui/switch'

describe('Switch', () => {
  it('renders correctly', () => {
    render(<Switch />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')
  })

  it('can be toggled', () => {
    render(<Switch />)
    const switchElement = screen.getByRole('switch')
    
    fireEvent.click(switchElement)
    expect(switchElement).toHaveAttribute('data-state', 'checked')
    
    fireEvent.click(switchElement)
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')
  })

  it('calls onCheckedChange when toggled', () => {
    const handleChange = vi.fn()
    render(<Switch onCheckedChange={handleChange} />)
    const switchElement = screen.getByRole('switch')
    
    fireEvent.click(switchElement)
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Switch disabled />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeDisabled()
  })
})
