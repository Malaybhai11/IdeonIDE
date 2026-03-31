import { describe, it, expect, beforeEach } from "vitest";
import { useLayoutStore } from "../../../../../src/features/projects/store/use-layout-store";

describe("useLayoutStore", () => {
  beforeEach(() => {
    useLayoutStore.setState({ activeView: "editor" });
  });

  it("should have initial state 'editor'", () => {
    expect(useLayoutStore.getState().activeView).toBe("editor");
  });

  it("should update active view", () => {
    useLayoutStore.getState().setActiveView("preview");
    expect(useLayoutStore.getState().activeView).toBe("preview");
  });
});
