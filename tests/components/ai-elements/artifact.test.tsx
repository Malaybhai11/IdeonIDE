import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { 
  Artifact, 
  ArtifactHeader, 
  ArtifactTitle, 
  ArtifactDescription, 
  ArtifactContent,
  ArtifactActions,
  ArtifactAction,
  ArtifactClose
} from '@/components/ai-elements/artifact'
import { DownloadIcon } from 'lucide-react'

describe('Artifact', () => {
  it('renders correctly', () => {
    render(
      <Artifact>
        <ArtifactHeader>
          <ArtifactTitle>Test Artifact</ArtifactTitle>
          <ArtifactActions>
            <ArtifactAction tooltip="Download" icon={DownloadIcon} />
            <ArtifactClose />
          </ArtifactActions>
        </ArtifactHeader>
        <ArtifactContent>
          <ArtifactDescription>Test Description</ArtifactDescription>
          <div>Test Content</div>
        </ArtifactContent>
      </Artifact>
    )

    expect(screen.getByText('Test Artifact')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('renders ArtifactAction with tooltip', async () => {
    render(
      <ArtifactAction tooltip="Download Tooltip" icon={DownloadIcon} />
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    // Tooltip usually requires interaction to show up in DOM, but we can check the accessible name
    expect(screen.getByText('Download Tooltip')).toBeInTheDocument() // sr-only span
  })
})
