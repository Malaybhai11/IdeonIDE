import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

describe('Alert', () => {
  it('renders correctly with default variant', () => {
    render(
      <Alert>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </Alert>
    )
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass('bg-card')
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('renders correctly with destructive variant', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Destructive Title</AlertTitle>
        <AlertDescription>Destructive Description</AlertDescription>
      </Alert>
    )
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass('text-destructive')
    expect(screen.getByText('Destructive Title')).toBeInTheDocument()
    expect(screen.getByText('Destructive Description')).toBeInTheDocument()
  })

  it('renders correctly with custom class name', () => {
    render(<Alert className="custom-class">Content</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('custom-class')
  })
})
