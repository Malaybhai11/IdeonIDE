import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Textarea } from "@/components/ui/textarea";

describe("Textarea", () => {
  it("renders correctly", () => {
    render(<Textarea placeholder="Enter description" />);
    const textarea = screen.getByPlaceholderText("Enter description");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute("data-slot", "textarea");
  });

  it("handles value changes", () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);
    const textarea = screen.getByRole("textbox");
    
    fireEvent.change(textarea, { target: { value: "new description" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("is disabled when the disabled prop is passed", () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Textarea className="custom-textarea" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea.className).toContain("custom-textarea");
  });
});
