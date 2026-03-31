import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Shimmer } from "@/components/ai-elements/shimmer"

describe("Shimmer", () => {
  it("renders the children text", () => {
    render(<Shimmer>Loading content...</Shimmer>)
    expect(screen.getByText("Loading content...")).toBeInTheDocument()
  })

  it("renders with a custom component tag", () => {
    const { container } = render(<Shimmer as="h1">Heading Shimmer</Shimmer>)
    const h1 = container.querySelector("h1")
    expect(h1).toBeInTheDocument()
    expect(h1).toHaveTextContent("Heading Shimmer")
  })

  it("applies the correct classes for shimmer effect", () => {
    const { container } = render(<Shimmer className="extra-class">Shimmer</Shimmer>)
    const element = container.firstChild as HTMLElement
    expect(element).toHaveClass("relative", "inline-block", "bg-clip-text", "text-transparent", "extra-class")
  })

  it("calculates dynamic spread based on children length", () => {
    const text = "long text"
    const spread = 2
    const expectedSpread = text.length * spread
    
    const { container } = render(<Shimmer spread={spread}>{text}</Shimmer>)
    const element = container.firstChild as HTMLElement
    
    // Check if the style contains the expected spread value
    // Note: React might format the style string differently
    const style = element.getAttribute("style")
    expect(style).toContain(`--spread: ${expectedSpread}px`)
  })
})
