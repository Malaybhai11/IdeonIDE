import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  showTokenUsage: boolean;
  setShowTokenUsage: (show: boolean) => void;
  activeProvider: "anthropic" | "google";
  setActiveProvider: (provider: "anthropic" | "google") => void;
  apiKeys: {
    anthropic?: string;
    google?: string;
  };
  setApiKey: (provider: "anthropic" | "google", key: string) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      showTokenUsage: true,
      setShowTokenUsage: (showTokenUsage) => set({ showTokenUsage }),
      activeProvider: "anthropic",
      setActiveProvider: (activeProvider) => set({ activeProvider }),
      apiKeys: {},
      setApiKey: (provider, key) => 
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: key,
          },
        })),
    }),
    {
      name: "ideon-settings",
    }
  )
);
