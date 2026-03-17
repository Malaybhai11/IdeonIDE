import { create } from "zustand";

export type ProjectView = "editor" | "preview";

interface LayoutStore {
  activeView: ProjectView;
  setActiveView: (view: ProjectView) => void;
};

export const useLayoutStore = create<LayoutStore>((set) => ({
  activeView: "editor",
  setActiveView: (activeView) => set({ activeView }),
}));
