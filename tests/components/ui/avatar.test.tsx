import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

describe('Avatar', () => {
  it('renders correctly', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    )
    const avatar = container.querySelector('[data-slot="avatar"]')
    expect(avatar).toBeInTheDocument()
  })

  it('renders fallback when image is missing', () => {
    render(
      <Avatar>
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    )
    const fallback = screen.getByText('CN')
    expect(fallback).toBeInTheDocument()
  })

  it('applies custom class names', () => {
    const { container } = render(
      <Avatar className="custom-avatar">
        <AvatarFallback className="custom-fallback">CN</AvatarFallback>
      </Avatar>
    )
    const avatar = container.querySelector('[data-slot="avatar"]')
    const fallback = container.querySelector('[data-slot="avatar-fallback"]')

    expect(avatar).toHaveClass('custom-avatar')
    expect(fallback).toHaveClass('custom-fallback')
  })
})
