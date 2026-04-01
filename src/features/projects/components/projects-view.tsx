"use client";

import { Poppins } from "next/font/google";
import { SparkleIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ProjectsOnboardingGate } from "@/features/onboarding/components/projects-onboarding-gate";
import { useOnboardingStore } from "@/features/onboarding/store/use-onboarding-store";

import { ProjectsList } from "./projects-list";
import { ProjectsCommandDialog } from "./projects-command-dialog";
import { ImportGithubDialog } from "./import-github-dialog";
import { NewProjectDialog } from "./new-project-dialog";
import { useProjects } from "../hooks/use-projects";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const ProjectsView = () => {
  const { userId } = useAuth();
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const projects = useProjects();

  const hasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const onboardingEntry = useOnboardingStore(
    (state) => state.entries[userId ?? ""]
  );
  const dismissOnboarding = useOnboardingStore(
    (state) => state.dismissOnboarding
  );
  const markWelcomeSeen = useOnboardingStore(
    (state) => state.markWelcomeSeen
  );
  const queueWorkspaceTour = useOnboardingStore(
    (state) => state.queueWorkspaceTour
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault();
          setCommandDialogOpen(true);
        }
        if (e.key === "i") {
          e.preventDefault();
          setImportDialogOpen(true);
        }
        if (e.key === "j") {
          e.preventDefault();
          setNewProjectDialogOpen(true);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const shouldShowWelcomeGate =
    Boolean(userId) &&
    hasHydrated &&
    projects !== undefined &&
    projects.length === 0 &&
    onboardingEntry === undefined;

  const handleSkipWelcome = () => {
    if (!userId) return;
    dismissOnboarding(userId);
  };

  const handleWelcomeCreate = () => {
    if (userId) {
      markWelcomeSeen(userId);
    }
    setNewProjectDialogOpen(true);
  };

  const handleWelcomeImport = () => {
    if (userId) {
      markWelcomeSeen(userId);
    }
    setImportDialogOpen(true);
  };

  const handleProjectCreated = (projectId: string) => {
    if (!userId) {
      return;
    }

    const currentStatus =
      useOnboardingStore.getState().entries[userId]?.status;

    if (currentStatus === "welcome_seen" || currentStatus === "workspace_started") {
      queueWorkspaceTour(userId, projectId);
    }
  };


  return (
    <>
      <ProjectsOnboardingGate
        open={shouldShowWelcomeGate}
        onCreateProject={handleWelcomeCreate}
        onImportProject={handleWelcomeImport}
        onSkip={handleSkipWelcome}
      />
      <ProjectsCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
      <ImportGithubDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
      <NewProjectDialog
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
      <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-6 md:p-16">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4 items-center">

          <div className="flex justify-between gap-4 w-full items-center">

            <div className="flex items-center gap-2 w-full group/logo">
              <Image 
                src="/logo.svg" 
                alt="IDEON" 
                className="size-[32px] md:size-[46px]" 
                width={46} 
                height={46} 
              />
              <h1 className={cn(
                "text-4xl md:text-5xl font-semibold",
                font.className,
              )}>
                IDEON
              </h1>
            </div>

          </div>

          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setNewProjectDialogOpen(true)}
                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <SparkleIcon className="size-4" />
                  <Kbd className="bg-accent border">
                    ⌘J
                  </Kbd>
                </div>
                <div>
                  <span className="text-sm">
                    New
                  </span>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <FaGithub className="size-4" />
                  <Kbd className="bg-accent border">
                    ⌘I
                  </Kbd>
                </div>
                <div>
                  <span className="text-sm">
                    Import
                  </span>
                </div>
              </Button>
            </div>

            <ProjectsList onViewAll={() => setCommandDialogOpen(true)} />

          </div>

        </div>
      </div>
    </>
  );
};
