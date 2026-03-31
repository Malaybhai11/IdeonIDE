import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Message, MessageContent } from '@/components/ai-elements/message'

describe('Message', () => {
  it('renders correctly for user', () => {
    render(
      <Message from="user">
        <MessageContent>Hello assistant</MessageContent>
      </Message>
    )

    const message = screen.getByText('Hello assistant').closest('.is-user')
    expect(message).toBeInTheDocument()
    expect(message).toHaveClass('ml-auto')
  })

  it('renders correctly for assistant', () => {
    render(
      <Message from="assistant">
        <MessageContent>Hello user</MessageContent>
      </Message>
    )

    const message = screen.getByText('Hello user').closest('.is-assistant')
    expect(message).toBeInTheDocument()
    expect(message).not.toHaveClass('ml-auto')
  })
})
