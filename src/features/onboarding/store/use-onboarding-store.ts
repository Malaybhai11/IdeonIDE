"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OnboardingStatus =
  | "not_started"
  | "welcome_seen"
  | "workspace_started"
  | "completed"
  | "dismissed";

export interface OnboardingEntry {
  pendingProjectId: string | null;
  status: OnboardingStatus;
}

export const defaultOnboardingEntry: OnboardingEntry = {
  pendingProjectId: null,
  status: "not_started",
};

interface OnboardingStore {
  entries: Record<string, OnboardingEntry>;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  dismissOnboarding: (userId: string) => void;
  markWelcomeSeen: (userId: string) => void;
  markWorkspaceStarted: (userId: string, projectId: string) => void;
  queueWorkspaceTour: (userId: string, projectId: string) => void;
  completeOnboarding: (userId: string) => void;
}

const getEntry = (
  entries: Record<string, OnboardingEntry>,
  userId: string,
): OnboardingEntry => entries[userId] ?? defaultOnboardingEntry;

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      entries: {},
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      dismissOnboarding: (userId) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [userId]: {
              pendingProjectId: null,
              status: "dismissed",
            },
          },
        })),
      markWelcomeSeen: (userId) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [userId]: {
              ...getEntry(state.entries, userId),
              status: "welcome_seen",
            },
          },
        })),
      markWorkspaceStarted: (userId, projectId) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [userId]: {
              pendingProjectId: projectId,
              status: "workspace_started",
            },
          },
        })),
      queueWorkspaceTour: (userId, projectId) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [userId]: {
              ...getEntry(state.entries, userId),
              pendingProjectId: projectId,
              status: "welcome_seen",
            },
          },
        })),
      completeOnboarding: (userId) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [userId]: {
              pendingProjectId: null,
              status: "completed",
            },
          },
        })),
    }),
    {
      name: "ideon-onboarding",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
