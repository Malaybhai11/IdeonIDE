import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../../../../../src/features/editor/store/use-editor-store";
import { Id } from "../../../../../convex/_generated/dataModel";

describe("useEditorStore", () => {
  const projectId = "project1" as Id<"projects">;
  const file1 = "file1" as Id<"files">;
  const file2 = "file2" as Id<"files">;

  beforeEach(() => {
    useEditorStore.setState({ tabs: new Map() });
  });

  it("should have initial empty state", () => {
    const state = useEditorStore.getState().getTabState(projectId);
    expect(state.openTabs).toEqual([]);
    expect(state.activeTabId).toBeNull();
  });

  it("should open a file as preview", () => {
    useEditorStore.getState().openFile(projectId, file1, { pinned: false });
    
    const state = useEditorStore.getState().getTabState(projectId);
    expect(state.openTabs).toEqual([file1]);
    expect(state.activeTabId).toBe(file1);
    expect(state.previewTabId).toBe(file1);
  });

  it("should replace preview tab when opening another file as preview", () => {
    useEditorStore.getState().openFile(projectId, file1, { pinned: false });
    useEditorStore.getState().openFile(projectId, file2, { pinned: false });

    const state = useEditorStore.getState().getTabState(projectId);
    expect(state.openTabs).toEqual([file2]);
    expect(state.activeTabId).toBe(file2);
    expect(state.previewTabId).toBe(file2);
  });

  it("should open a file as pinned", () => {
    useEditorStore.getState().openFile(projectId, file1, { pinned: true });

    const state = useEditorStore.getState().getTabState(projectId);
    expect(state.openTabs).toEqual([file1]);
    expect(state.activeTabId).toBe(file1);
    expect(state.previewTabId).toBeNull();
  });

  it("should pin an open preview tab", () => {
    useEditorStore.getState().openFile(projectId, file1, { pinned: false });
    useEditorStore.getState().openFile(projectId, file1, { pinned: true });

    const state = useEditorStore.getState().getTabState(projectId);
    expect(state.openTabs).toEqual([file1]);
    expect(state.previewTabId).toBeNull();
  });

  it("should close a tab and update active tab", () => {
    useEditorStore.getState().openFile(projectId, file1, { pinned: true });
    useEditorStore.getState().openFile(projectId, file2, { pinned: true });
    
    useEditorStore.getState().closeTab(projectId, file1);

    const state = useEditorStore.getState().getTabState(projectId);
    expect(state.openTabs).toEqual([file2]);
    expect(state.activeTabId).toBe(file2);
  });

  it("should close all tabs", () => {
    useEditorStore.getState().openFile(projectId, file1, { pinned: true });
    useEditorStore.getState().closeAllTabs(projectId);

    const state = useEditorStore.getState().getTabState(projectId);
    expect(state.openTabs).toEqual([]);
    expect(state.activeTabId).toBeNull();
  });
});
