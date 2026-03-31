import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

describe('Dialog', () => {
  it('renders trigger correctly', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
    
    expect(screen.getByRole('button', { name: /open dialog/i })).toBeInTheDocument()
    expect(screen.queryByText(/dialog title/i)).not.toBeInTheDocument()
  })

  it('opens dialog when trigger is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
    
    const trigger = screen.getByRole('button', { name: /open dialog/i })
    fireEvent.click(trigger)
    
    expect(await screen.findByText(/dialog title/i)).toBeInTheDocument()
  })
})
