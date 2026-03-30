"use client";

import { useState } from "react";
import { 
  SettingsIcon, 
  KeyIcon, 
  CheckIcon, 
  AlertCircleIcon,
  HelpCircleIcon
} from "lucide-react";

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
    apiKeys, 
    setApiKey 
  } = useSettingsStore();

  const [anthropicKey, setAnthropicKey] = useState(apiKeys.anthropic || "");
  const [googleKey, setGoogleKey] = useState(apiKeys.google || "");

  const handleSave = () => {
    setApiKey("anthropic", anthropicKey);
    setApiKey("google", googleKey);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="size-5" />
            AI Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI provider and API keys. These keys are stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="provider">Active Provider</Label>
            <Select 
              value={activeProvider} 
              onValueChange={(v) => setActiveProvider(v as any)}
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="google">Google (Gemini)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 border-t pt-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="anthropic-key" className="flex items-center gap-2">
                  Anthropic API Key
                  {apiKeys.anthropic && (
                    <CheckIcon className="size-3.5 text-green-500" />
                  )}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a 
                        href="https://console.anthropic.com/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <HelpCircleIcon className="size-3.5" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Get key from Anthropic Console</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <KeyIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="anthropic-key"
                  type="password"
                  placeholder="sk-ant-..."
                  className="pl-9"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="google-key" className="flex items-center gap-2">
                  Google AI (Gemini) API Key
                  {apiKeys.google && (
                    <CheckIcon className="size-3.5 text-green-500" />
                  )}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <HelpCircleIcon className="size-3.5" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Get key from Google AI Studio</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <KeyIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="google-key"
                  type="password"
                  placeholder="AIza..."
                  className="pl-9"
                  value={googleKey}
                  onChange={(e) => setGoogleKey(e.target.value)}
                />
              </div>
            </div>
          </div>

          {!anthropicKey && !googleKey && (
            <Alert variant="destructive" className="bg-destructive/10">
              <AlertCircleIcon className="size-4" />
              <AlertTitle>No API Keys</AlertTitle>
              <AlertDescription className="text-xs">
                You haven't configured any API keys. IDEON will use its default internal keys (if available).
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
