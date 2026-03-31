import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Loader } from "@/components/ai-elements/loader"

describe("Loader", () => {
  it("renders with default size", () => {
    render(<Loader data-testid="loader" />)
    const loader = screen.getByTestId("loader")
    expect(loader).toBeInTheDocument()
    expect(loader).toHaveClass("animate-spin")
    
    const svg = loader.querySelector("svg")
    expect(svg).toHaveAttribute("width", "16")
    expect(svg).toHaveAttribute("height", "16")
  })

  it("renders with custom size", () => {
    render(<Loader data-testid="loader" size={24} />)
    const loader = screen.getByTestId("loader")
    const svg = loader.querySelector("svg")
    expect(svg).toHaveAttribute("width", "24")
    expect(svg).toHaveAttribute("height", "24")
  })

  it("applies custom className", () => {
    render(<Loader className="custom-class" data-testid="loader" />)
    const loader = screen.getByTestId("loader")
    expect(loader).toHaveClass("custom-class")
  })
})
