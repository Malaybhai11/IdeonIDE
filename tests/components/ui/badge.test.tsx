import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders correctly with default variant", () => {
    render(<Badge>Test Badge</Badge>);
    const badge = screen.getByText("Test Badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("data-slot", "badge");
  });

  it("applies variant classes correctly", () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);
    const badge = screen.getByText("Destructive Badge");
    expect(badge.className).toContain("bg-destructive");
  });

  it("renders as a different element when asChild is true", () => {
    render(
      <Badge asChild>
        <a href="#">Link Badge</a>
      </Badge>
    );
    const badge = screen.getByRole("link");
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("A");
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    const badge = screen.getByText("Custom Badge");
    expect(badge.className).toContain("custom-class");
  });
});
