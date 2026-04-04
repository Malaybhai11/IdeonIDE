"use client";

import { SparklesIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProjectsOnboardingGateProps {
  onCreateProject: () => void;
  onImportProject: () => void;
  onSkip: () => void;
  open: boolean;
}

export const ProjectsOnboardingGate = ({
  onCreateProject,
  onImportProject,
  onSkip,
  open,
}: ProjectsOnboardingGateProps) => {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onSkip()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xl overflow-hidden rounded-3xl border-white/10 bg-[#0d1117] p-0 shadow-[0_32px_120px_rgba(0,0,0,0.55)]"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))] px-6 py-6">
          <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-white/6 ring-1 ring-white/10">
            <SparklesIcon className="size-5 text-white" />
          </div>
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-semibold tracking-tight text-white">
              Build your first project in under 2 minutes
            </DialogTitle>
            <DialogDescription className="max-w-lg text-sm leading-6 text-white/68">
              Start from a prompt or import an existing GitHub repository. Once
              you&apos;re inside the workspace, the app will guide you through the
              first key actions.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid gap-3 p-6 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-36 flex-col items-start justify-between rounded-2xl border-white/10 bg-white/[0.03] p-5 text-left hover:bg-white/[0.06]"
            onClick={onCreateProject}
          >
            <div className="flex size-10 items-center justify-center rounded-2xl bg-white/6 ring-1 ring-white/10">
              <SparklesIcon className="size-4 text-white" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">
                Create from a prompt
              </div>
              <div className="text-sm leading-6 text-white/60">
                Describe what you want to build and let IDEON create the first
                version for you.
              </div>
            </div>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-36 flex-col items-start justify-between rounded-2xl border-white/10 bg-white/[0.03] p-5 text-left hover:bg-white/[0.06]"
            onClick={onImportProject}
          >
            <div className="flex size-10 items-center justify-center rounded-2xl bg-white/6 ring-1 ring-white/10">
              <FaGithub className="size-4 text-white" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">
                Import from GitHub
              </div>
              <div className="text-sm leading-6 text-white/60">
                Bring in an existing repository and use IDEON to inspect, edit,
                and run it.
              </div>
            </div>
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-white/8 bg-white/[0.02] px-6 py-4">
          <p className="text-xs text-white/45">
            The first tour focuses on the actions that lead to your first result.
          </p>
          <Button
            type="button"
            variant="ghost"
            className="h-8 rounded-full px-3 text-xs text-white/70 hover:bg-white/6 hover:text-white"
            onClick={onSkip}
          >
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
