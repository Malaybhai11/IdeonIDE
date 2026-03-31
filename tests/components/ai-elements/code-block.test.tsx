import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CodeBlock, CodeBlockCopyButton } from '@/components/ai-elements/code-block'

// Mock shiki
vi.mock('shiki', () => ({
  codeToHtml: vi.fn().mockResolvedValue('<pre>mocked html</pre>'),
}))

describe('CodeBlock', () => {
  const code = 'const x = 1;'
  const language = 'typescript'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', async () => {
    render(<CodeBlock code={code} language={language} />)
    
    // It should initially be empty or show nothing until shiki resolves
    // Wait for the mocked html to appear
    await waitFor(() => {
      const elements = screen.getAllByText(/mocked html/i)
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  it('copies code to clipboard', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    }
    vi.stubGlobal('navigator', { clipboard: mockClipboard })

    render(
      <CodeBlock code={code} language={language}>
        <CodeBlockCopyButton />
      </CodeBlock>
    )

    const copyButton = screen.getByRole('button')
    fireEvent.click(copyButton)

    expect(mockClipboard.writeText).toHaveBeenCalledWith(code)
    
    // Check if icon changes (using data-testid or just checking if CheckIcon is rendered)
    // Since we don't have easy way to check lucide icons without extra setup, 
    // we can just check if the button was clicked.
  })
})
