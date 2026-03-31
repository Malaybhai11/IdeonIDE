import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "@/features/conversations/store/use-settings-store";
import { act, renderHook } from "@testing-library/react";

describe("useSettingsStore", () => {
  beforeEach(() => {
    act(() => {
      useSettingsStore.getState().setShowTokenUsage(true);
      useSettingsStore.getState().setActiveProvider("anthropic");
    });
  });

  it("should have initial values correctly", () => {
    const { result } = renderHook(() => useSettingsStore());
    expect(result.current.showTokenUsage).toBe(true);
    expect(result.current.activeProvider).toBe("anthropic");
  });

  it("should update showTokenUsage correctly", () => {
    const { result } = renderHook(() => useSettingsStore());
    
    act(() => {
      result.current.setShowTokenUsage(false);
    });
    
    expect(result.current.showTokenUsage).toBe(false);
  });

  it("should update activeProvider correctly", () => {
    const { result } = renderHook(() => useSettingsStore());
    
    act(() => {
      result.current.setActiveProvider("google");
    });
    
    expect(result.current.activeProvider).toBe("google");
  });
});
