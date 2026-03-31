import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

describe("Accordion", () => {
  it("renders correctly and expands when clicked", async () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that matches the other
            components&apos; aesthetic.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByText("Is it accessible?")
    expect(trigger).toBeInTheDocument()

    // Check aria-expanded
    expect(trigger).toHaveAttribute("aria-expanded", "false")

    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText(/Yes. It adheres to the WAI-ARIA design pattern./i)).toBeInTheDocument()
  })

  it("handles multiple items in single mode", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger1 = screen.getByText("Trigger 1")
    const trigger2 = screen.getByText("Trigger 2")

    fireEvent.click(trigger1)
    expect(trigger1).toHaveAttribute("aria-expanded", "true")
    expect(trigger2).toHaveAttribute("aria-expanded", "false")

    fireEvent.click(trigger2)
    expect(trigger1).toHaveAttribute("aria-expanded", "false")
    expect(trigger2).toHaveAttribute("aria-expanded", "true")
  })
})
