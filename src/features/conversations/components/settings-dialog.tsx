"use client";

import { useState, useEffect } from "react";
import { 
  SettingsIcon, 
  KeyIcon, 
  CheckIcon, 
  AlertCircleIcon,
  HelpCircleIcon,
  Loader2Icon
} from "lucide-react";
import ky from "ky";
import { toast } from "sonner";
import { useQuery } from "convex/react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useSettingsStore } from "../store/use-settings-store";
import { api } from "../../../../convex/_generated/api";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({
  open,
  onOpenChange,
}: SettingsDialogProps) => {
  const { 
    activeProvider, 
    setActiveProvider, 
  } = useSettingsStore();

  const settings = useQuery(api.settings.getMySettings);

  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Update local active provider if server has it
  useEffect(() => {
    if (settings?.activeProvider) {
      setActiveProvider(settings.activeProvider);
    }
  }, [settings, setActiveProvider]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: any = { activeProvider };
      if (apiKey.trim()) {
        if (activeProvider === "anthropic") payload.anthropicKey = apiKey.trim();
        if (activeProvider === "google") payload.googleKey = apiKey.trim();
      }

      await ky.post("/api/settings/ai", { json: payload });
      
      toast.success(`${activeProvider === "anthropic" ? "Anthropic" : "Google"} settings updated`);
      setApiKey("");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const hasCurrentKey = activeProvider === "anthropic" 
    ? settings?.hasAnthropicKey 
    : settings?.hasGoogleKey;

  const providerLabel = activeProvider === "anthropic" ? "Anthropic (Claude)" : "Google (Gemini)";
  const consoleUrl = activeProvider === "anthropic" 
    ? "https://console.anthropic.com/" 
    : "https://aistudio.google.com/app/apikey";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-4 bg-sidebar border-b">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <SettingsIcon className="size-4 text-primary" />
            AI Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4 bg-background">
          <div className="space-y-2">
            <Label htmlFor="provider" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              AI Provider
            </Label>
            <Select 
              value={activeProvider} 
              onValueChange={(v) => {
                setActiveProvider(v as any);
                setApiKey(""); // Clear input when switching
              }}
            >
              <SelectTrigger id="provider" className="h-9 text-sm">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anthropic" className="text-sm">Anthropic Claude</SelectItem>
                <SelectItem value="google" className="text-sm">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between">
              <Label htmlFor="api-key" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-2">
                {activeProvider === "anthropic" ? "Anthropic" : "Gemini"} API Key
                {hasCurrentKey && (
                  <span className="flex items-center gap-0.5 text-[9px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">
                    <CheckIcon className="size-2.5" /> VAULTED
                  </span>
                )}
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href={consoleUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <HelpCircleIcon className="size-3.5" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs">Get {activeProvider} key</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <KeyIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground/50" />
              <Input
                id="api-key"
                type="password"
                placeholder={hasCurrentKey ? "••••••••••••••••" : "Paste your key here..."}
                className="pl-9 h-9 text-sm bg-muted/30 focus-visible:ring-1"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-muted-foreground italic px-1">
              Keys are AES-256 encrypted and never logged.
            </p>
          </div>
        </div>

        <DialogFooter className="p-3 bg-sidebar border-t flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 text-xs font-medium"
            onClick={() => onOpenChange(false)} 
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            size="sm"
            className="h-8 text-xs font-medium px-4"
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? <Loader2Icon className="size-3 animate-spin mr-2" /> : <CheckIcon className="size-3 mr-2" />}
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
