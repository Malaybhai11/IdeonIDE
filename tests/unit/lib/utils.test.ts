import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("should handle conditional class names", () => {
    expect(cn("a", true && "b", false && "c")).toBe("a b");
  });

  it("should merge tailwind classes correctly", () => {
    expect(cn("px-2 py-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle undefined and null", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });
});
