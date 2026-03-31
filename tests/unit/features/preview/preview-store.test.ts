import { describe, it, expect, beforeEach } from "vitest"
import { usePreviewStore } from "@/features/preview/store/use-preview-store"

describe("usePreviewStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    usePreviewStore.setState({
      status: "idle",
      previewUrl: null,
      error: null,
      terminalOutput: "",
      isTerminalOpen: true,
    })
  })

  it("should have initial state", () => {
    const state = usePreviewStore.getState()
    expect(state.status).toBe("idle")
    expect(state.previewUrl).toBeNull()
    expect(state.isTerminalOpen).toBe(true)
  })

  it("should set status", () => {
    usePreviewStore.getState().setStatus("running")
    expect(usePreviewStore.getState().status).toBe("running")
  })

  it("should set preview URL", () => {
    const url = "http://localhost:3000"
    usePreviewStore.getState().setPreviewUrl(url)
    expect(usePreviewStore.getState().previewUrl).toBe(url)
  })

  it("should append terminal output", () => {
    usePreviewStore.getState().appendOutput("line 1\n")
    usePreviewStore.getState().appendOutput("line 2\n")
    expect(usePreviewStore.getState().terminalOutput).toBe("line 1\nline 2\n")
  })

  it("should clear terminal output", () => {
    usePreviewStore.getState().appendOutput("some output")
    usePreviewStore.getState().clearOutput()
    expect(usePreviewStore.getState().terminalOutput).toBe("")
  })
})
