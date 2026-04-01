"use client";

import { useEffect, useMemo } from "react";
import {
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
  type Step,
} from "react-joyride";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { usePreviewStore } from "@/features/preview/store/use-preview-store";
import { useLayoutStore } from "@/features/projects/store/use-layout-store";

import { OnboardingTourTooltip } from "./onboarding-tour-tooltip";
import {
  defaultOnboardingEntry,
  useOnboardingStore,
} from "../store/use-onboarding-store";

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export const WorkspaceOnboardingTour = ({
  projectId,
}: {
  projectId: Id<"projects">;
}) => {
  const { userId } = useAuth();

  const settings = useQuery(api.settings.getMySettings);
  const { setActiveView } = useLayoutStore();
  const { setIsTerminalOpen } = usePreviewStore();

  const hasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const onboardingEntry = useOnboardingStore(
    (state) => state.entries[userId ?? ""] ?? defaultOnboardingEntry
  );
  const markWorkspaceStarted = useOnboardingStore(
    (state) => state.markWorkspaceStarted
  );
  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding
  );
  const dismissOnboarding = useOnboardingStore(
    (state) => state.dismissOnboarding
  );

  const hasConfiguredProvider = Boolean(
    settings &&
      (settings.hasAnthropicKey || settings.hasGoogleKey)
  );

  const steps = useMemo<Step[]>(() => {
    const workspaceSteps: Step[] = [];

    if (!hasConfiguredProvider) {
      workspaceSteps.push({
        content:
          "Connect an Anthropic or Gemini API key here before you ask IDEON to generate code.",
        placement: "left-start",
        skipBeacon: true,
        spotlightPadding: 12,
        spotlightRadius: 999,
        target: '[data-tour="conversation-settings"]',
        targetWaitTimeout: 4000,
        title: "Connect AI",
      });
    }

    workspaceSteps.push(
      {
        content:
          "Describe the feature, page, or fix you want. IDEON will generate files and edits from here.",
        placement: "left-end",
        skipBeacon: true,
        spotlightPadding: 12,
        spotlightRadius: 24,
        target: '[data-tour="conversation-input"]',
        targetWaitTimeout: 4000,
        title: "Start with a prompt",
      },
      {
        before: async () => {
          setActiveView("editor");
          await delay(180);
        },
        content:
          "New files and edits show up here so you can inspect what changed and navigate the project structure.",
        placement: "right-start",
        skipBeacon: true,
        spotlightPadding: 10,
        spotlightRadius: 18,
        target: '[data-tour="file-explorer"]',
        targetWaitTimeout: 4000,
        title: "Track generated files",
      },
      {
        before: async () => {
          setActiveView("editor");
          await delay(120);
        },
        content:
          "Switch between reading code and running the project. Keep the loop tight: inspect, run, adjust.",
        placement: "bottom-start",
        skipBeacon: true,
        spotlightPadding: 8,
        spotlightRadius: 999,
        target: '[data-tour="workspace-tabs"]',
        targetWaitTimeout: 4000,
        title: "Move between code and runtime",
      },
      {
        before: async () => {
          setActiveView("preview");
          setIsTerminalOpen(true);
          await delay(220);
        },
        content:
          "Run the app here, check the preview URL, and keep the terminal open for logs and runtime errors.",
        placement: "bottom",
        skipBeacon: true,
        spotlightPadding: 8,
        spotlightRadius: 16,
        target: '[data-tour="preview-toolbar"]',
        targetWaitTimeout: 4000,
        title: "Preview and debug",
      },
      {
        content:
          "When the project is ready to leave IDEON, export it to GitHub and continue from there.",
        placement: "bottom",
        skipBeacon: true,
        spotlightPadding: 8,
        spotlightRadius: 999,
        target: '[data-tour="export-project"]',
        targetWaitTimeout: 4000,
        title: "Ship it to GitHub",
      }
    );

    return workspaceSteps;
  }, [hasConfiguredProvider, setActiveView, setIsTerminalOpen]);

  const shouldRunWorkspaceTour =
    Boolean(userId) &&
    hasHydrated &&
    settings !== undefined &&
    onboardingEntry.pendingProjectId === projectId &&
    (onboardingEntry.status === "welcome_seen" ||
      onboardingEntry.status === "workspace_started");

  useEffect(() => {
    if (!userId || !shouldRunWorkspaceTour) {
      return;
    }

    if (onboardingEntry.status !== "workspace_started") {
      markWorkspaceStarted(userId, projectId);
    }
  }, [
    markWorkspaceStarted,
    onboardingEntry.status,
    projectId,
    shouldRunWorkspaceTour,
    userId,
  ]);

  const handleEvent = (data: EventData, controls: { next: () => void }) => {
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      controls.next();
      return;
    }

    if (!userId) {
      return;
    }

    if (data.status === STATUS.FINISHED) {
      completeOnboarding(userId);
    }

    if (data.status === STATUS.SKIPPED) {
      dismissOnboarding(userId);
    }
  };

  if (!shouldRunWorkspaceTour || steps.length === 0) {
    return null;
  }

  return (
    <Joyride
      continuous
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        nextWithProgress: "Next ({current} of {total})",
        skip: "Skip tour",
      }}
      onEvent={handleEvent}
      options={{
        closeButtonAction: "skip",
        disableFocusTrap: true,
        dismissKeyAction: false,
        offset: 16,
        overlayClickAction: false,
        overlayColor: "rgba(5, 7, 11, 0.74)",
        primaryColor: "#f4f4f5",
        scrollDuration: 220,
        scrollOffset: 24,
        showProgress: true,
        spotlightPadding: 10,
        spotlightRadius: 18,
        textColor: "#f4f4f5",
        zIndex: 140,
      }}
      run={shouldRunWorkspaceTour}
      steps={steps}
      styles={{
        overlay: {
          backdropFilter: "blur(2px)",
        },
        tooltip: {
          backgroundColor: "transparent",
          borderRadius: 0,
          boxShadow: "none",
          color: "inherit",
          padding: 0,
        },
      }}
      tooltipComponent={OnboardingTourTooltip}
    />
  );
};
