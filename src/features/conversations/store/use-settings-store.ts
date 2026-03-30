import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  showTokenUsage: boolean;
  setShowTokenUsage: (show: boolean) => void;
  activeProvider: "anthropic" | "google";
  setActiveProvider: (provider: "anthropic" | "google") => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      showTokenUsage: true,
      setShowTokenUsage: (showTokenUsage) => set({ showTokenUsage }),
      activeProvider: "anthropic",
      setActiveProvider: (activeProvider) => set({ activeProvider }),
    }),
    {
      name: "ideon-settings",
    }
  )
);
