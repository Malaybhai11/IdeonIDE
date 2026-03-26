import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  showTokenUsage: boolean;
  setShowTokenUsage: (show: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      showTokenUsage: true,
      setShowTokenUsage: (showTokenUsage) => set({ showTokenUsage }),
    }),
    {
      name: "ideon-settings",
    }
  )
);
