import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox', () => {
  it('renders correctly', () => {
    render(<Checkbox id="test-checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('can be checked and unchecked', async () => {
    render(<Checkbox id="test-checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
    
    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('calls onCheckedChange when clicked', () => {
    const handleChange = vi.fn()
    render(<Checkbox onCheckedChange={handleChange} />)
    const checkbox = screen.getByRole('checkbox')
    
    fireEvent.click(checkbox)
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Checkbox disabled />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })
})
