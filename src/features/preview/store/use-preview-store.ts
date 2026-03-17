import { create } from "zustand";

export type WebContainerStatus = "idle" | "booting" | "installing" | "running" | "error";

interface PreviewStore {
  status: WebContainerStatus;
  previewUrl: string | null;
  error: string | null;
  terminalOutput: string;
  isTerminalOpen: boolean;
  
  setStatus: (status: WebContainerStatus) => void;
  setPreviewUrl: (url: string | null) => void;
  setError: (error: string | null) => void;
  setIsTerminalOpen: (open: boolean) => void;
  appendOutput: (data: string) => void;
  clearOutput: () => void;
};

export const usePreviewStore = create<PreviewStore>((set) => ({
  status: "idle",
  previewUrl: null,
  error: null,
  terminalOutput: "",
  isTerminalOpen: true,

  setStatus: (status) => set({ status }),
  setPreviewUrl: (previewUrl) => set({ previewUrl }),
  setError: (error) => set({ error }),
  setIsTerminalOpen: (isTerminalOpen) => set({ isTerminalOpen }),
  appendOutput: (data) => set((state) => ({ 
    terminalOutput: state.terminalOutput + data 
  })),
  clearOutput: () => set({ terminalOutput: "" }),
}));
