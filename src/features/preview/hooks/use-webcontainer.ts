import { useCallback, useEffect, useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";

import { 
  buildFileTree,
  getFilePath
} from "@/features/preview/utils/file-tree";
import { useFiles } from "@/features/projects/hooks/use-files";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

import { compile } from "@dsl/index";
import type { Runtime } from "@dsl/../types/runtime.d.ts";
import { usePreviewStore } from "../store/use-preview-store";

// Singleton WebContainer instance
let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

const getWebContainer = async (): Promise<WebContainer> => {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  if (!bootPromise) {
    bootPromise = WebContainer.boot({ coep: "credentialless" });
  }

  webcontainerInstance = await bootPromise;
  return webcontainerInstance;
};

const teardownWebContainer = () => {
  if (webcontainerInstance) {
    webcontainerInstance.teardown();
    webcontainerInstance = null;
  }
  bootPromise = null;
};

interface UseWebContainerProps {
  projectId: Id<"projects">;
  enabled: boolean;
  settings?: {
    installCommand?: string;
    devCommand?: string;
  };
};

export const useWebContainer = ({
  projectId,
  enabled,
  settings,
}: UseWebContainerProps) => {
  const {
    status,
    previewUrl,
    error,
    terminalOutput,
    setStatus,
    setPreviewUrl,
    setError,
    appendOutput,
    clearOutput,
  } = usePreviewStore();

  const [restartKey, setRestartKey] = useState(0);
  const containerRef = useRef<WebContainer | null>(null);
  const hasStartedRef = useRef(false);

  // Fetch files from Convex (auto-updates on changes)
  const files = useFiles(projectId);

  // Initial boot and mount
  useEffect(() => {
    if (!enabled || !files || files.length === 0 || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const start = async () => {
      try {
        setStatus("booting");
        setError(null);
        clearOutput();

        const container = await getWebContainer();
        containerRef.current = container;

        const fileTree = buildFileTree(files);
        await container.mount(fileTree);

        container.on("server-ready", (_port, url) => {
          setPreviewUrl(url);
          setStatus("running");
        });

        setStatus("installing");

        // Parse install command (default: npm install)
        const installCmd = settings?.installCommand || "npm install";
        const [installBin, ...installArgs] = installCmd.split(" ");
        appendOutput(`$ ${installCmd}\n`)
        const installProcess = await container.spawn(installBin, installArgs);
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              appendOutput(data);
            },
          })
        );
        const installExitCode = await installProcess.exit;

        if (installExitCode !== 0) {
          throw new Error(
            `${installCmd} failed with code ${installExitCode}`
          );
        }

        // Parse dev command (default: npm run dev)
        const devCmd = settings?.devCommand || "npm run dev";
        const [devBin, ...devArgs] = devCmd.split(" ");
        appendOutput(`\n$ ${devCmd}\n`);
        const devProcess = await container.spawn(devBin, devArgs);
        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              appendOutput(data);
            },
          })
        );
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
        setStatus("error");
      }
    };

    start();
  }, [
    enabled,
    files,
    restartKey,
    settings?.devCommand,
    settings?.installCommand,
    setStatus,
    setError,
    clearOutput,
    appendOutput,
    setPreviewUrl,
  ]);

  // Sync file changes (hot-reload)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !files || status !== "running") return;

    const filesMap = new Map(files.map((f) => [f._id, f]));

    for (const file of files) {
      if (file.type !== "file" || file.storageId || !file.content) continue;

      const filePath = getFilePath(file, filesMap);
      container.fs.writeFile(filePath, file.content);
    }
  }, [files, status]);

  // Reset when disabled
  useEffect(() => {
    if (!enabled) {
      hasStartedRef.current = false;
      setStatus("idle");
      setPreviewUrl(null);
      setError(null);
    }
  }, [enabled, setStatus, setPreviewUrl, setError]);

  // Restart the entire WebContainer process
  const restart = useCallback(() => {
    teardownWebContainer();
    containerRef.current = null;
    hasStartedRef.current = false;
    setStatus("idle");
    setPreviewUrl(null);
    setError(null);
    setRestartKey((k) => k + 1);
  }, [setStatus, setPreviewUrl, setError]);

  const interprete = useCallback(async (dslCode: string) => {
    const container = containerRef.current || webcontainerInstance;
    if (!container) {
      throw new Error("WebContainer not initialized");
    }

    const runtime: Runtime = {
      writeFile: async (path, content) => {
        appendOutput(`Writing to ${path}...\n`);
        await container.fs.writeFile(path, content);
      },
      readFile: async (path) => {
        return await container.fs.readFile(path, "utf-8");
      },
      appendFile: async (path, content) => {
        appendOutput(`Appending to ${path}...\n`);
        const current = await container.fs.readFile(path, "utf-8");
        await container.fs.writeFile(path, current + content);
      },
      executeShell: async (command) => {
        appendOutput(`$ ${command}\n`);
        const [bin, ...args] = command.split(" ");
        const process = await container.spawn(bin!, args);
        
        process.output.pipeTo(
          new WritableStream({
            write(data) {
              appendOutput(data);
            },
          })
        );

        const exitCode = await process.exit;
        if (exitCode !== 0) {
          throw new Error(`Command "${command}" failed with exit code ${exitCode}`);
        }
      },
      exists: async (path) => {
        try {
          await container.fs.readFile(path);
          return true;
        } catch {
          return false;
        }
      }
    };

    try {
      await compile(dslCode, runtime, true);
      appendOutput("\nDSL Execution successful!\n");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      appendOutput(`\nDSL Execution failed: ${msg}\n`);
      throw err;
    }
  }, [appendOutput]);

  return {
    status,
    previewUrl,
    error,
    restart,
    terminalOutput,
    interprete,
  };
};
