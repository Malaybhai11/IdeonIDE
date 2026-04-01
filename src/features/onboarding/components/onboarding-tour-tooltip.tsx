"use client";

import { XIcon } from "lucide-react";
import type { TooltipRenderProps } from "react-joyride";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const OnboardingTourTooltip = ({
  backProps,
  closeProps,
  index,
  isLastStep,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) => {
  return (
    <div
      {...tooltipProps}
      className={cn(
        "w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#121721] p-4 text-foreground shadow-2xl backdrop-blur-sm"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/45">
            {index + 1} of {size}
          </div>
          {step.title ? (
            <div className="text-sm font-semibold text-foreground">
              {step.title}
            </div>
          ) : null}
        </div>
        <button
          {...closeProps}
          className="rounded-full p-1 text-foreground/55 transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <XIcon className="size-3.5" />
          <span className="sr-only">Close tour</span>
        </button>
      </div>

      <div className="text-sm leading-6 text-foreground/75">{step.content}</div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          {...skipProps}
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-foreground/60 hover:text-foreground"
        >
          Skip tour
        </Button>
        <div className="flex items-center gap-2">
          {index > 0 ? (
            <Button
              {...backProps}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-white/12 bg-white/[0.03] px-3 text-xs hover:bg-white/[0.06]"
            >
              Back
            </Button>
          ) : null}
          <Button
            {...primaryProps}
            type="button"
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
          >
            {isLastStep ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};
