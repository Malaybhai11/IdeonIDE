import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { AlertCircleIcon, ArrowRightIcon, GlobeIcon, Loader2Icon, XIcon } from "lucide-react";

import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

import { Doc, Id } from "../../../../convex/_generated/dataModel";

import { useCancelImport, useProjectsPartial } from "../hooks/use-projects";

const formatTimestamp = (timestamp: number) => {
  return formatDistanceToNow(new Date(timestamp), { 
    addSuffix: true
  });
};

const getProjectIcon = (project: Doc<"projects">) => {
  if (project.importStatus === "completed") {
    return <FaGithub className="size-3.5 text-muted-foreground" />
  }

  if (project.importStatus === "failed") {
    return <AlertCircleIcon className="size-3.5 text-muted-foreground" />;
  }

  if (project.importStatus === "importing") {
    return (
      <Loader2Icon className="size-3.5 text-muted-foreground animate-spin" />
    );
  }

  return <GlobeIcon className="size-3.5 text-muted-foreground" />;
}

interface ProjectsListProps {
  onViewAll: () => void;
}

const ContinueCard = ({ 
  data,
  onCancel,
}: {
  data: Doc<"projects">;
  onCancel: (id: Id<"projects">) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Last updated
        </span>
        {data.importStatus === "importing" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => onCancel(data._id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <XIcon className="size-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Cancel import
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <Button
        variant="outline"
        asChild
        className="h-auto items-start justify-start p-4 bg-background border rounded-none flex flex-col gap-2"
      >
        <Link href={`/projects/${data._id}`} className="group">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {getProjectIcon(data)}
              <span className="font-medium truncate">
                {data.name}
              </span>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(data.updatedAt)}
          </span>
        </Link>
      </Button>
    </div>
  )
};

const ProjectItem = ({ 
  data,
  onCancel,
}: {
  data: Doc<"projects">;
  onCancel: (id: Id<"projects">) => void;
}) => {
  return (
    <div className="flex items-center justify-between w-full group">
      <Link 
        href={`/projects/${data._id}`}
        className="text-sm text-foreground/60 font-medium hover:text-foreground py-1 flex items-center gap-2 flex-1 truncate"
      >
        {getProjectIcon(data)}
        <span className="truncate">{data.name}</span>
      </Link>
      <div className="flex items-center gap-2">
        {data.importStatus === "importing" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => onCancel(data._id)}
                className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <XIcon className="size-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Cancel import
            </TooltipContent>
          </Tooltip>
        )}
        <span className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors">
          {formatTimestamp(data.updatedAt)}
        </span>
      </div>
    </div>
  );
};

export const ProjectsList = ({ 
  onViewAll
}: ProjectsListProps) => {
  const projects = useProjectsPartial(6);
  const cancelImport = useCancelImport();

  const handleCancel = async (id: Id<"projects">) => {
    toast.promise(cancelImport(id), {
      loading: "Cancelling import...",
      success: "Import cancelled",
      error: "Failed to cancel import",
    });
  };

  if (projects === undefined) {
    return <Spinner className="size-4 text-ring" />
  }

  const [mostRecent, ...rest] = projects;

  return (
    <div className="flex flex-col gap-4">
      {mostRecent ? <ContinueCard data={mostRecent} onCancel={handleCancel} /> : null}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Recent projects
            </span>
            <button
              onClick={onViewAll}
              className="flex items-center gap-2 text-muted-foreground text-xs hover:text-foreground transition-colors"
            >
              <span>View all</span>
              <Kbd className="bg-accent border">
                ⌘K
              </Kbd>
            </button>
          </div>
          <ul className="flex flex-col">
            {rest.map((project) => (
              <ProjectItem
                key={project._id}
                data={project}
                onCancel={handleCancel}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
};
