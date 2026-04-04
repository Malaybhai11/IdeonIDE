import ky from "ky";
import { toast } from "sonner";
import { useState } from "react";
import { 
  CopyIcon, 
  HistoryIcon, 
  LoaderIcon, 
  PlusIcon,
  PlayIcon,
  CoinsIcon,
  SettingsIcon
} from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  Context,
  ContextTrigger,
  ContextContent,
  ContextContentHeader,
  ContextContentBody,
  ContextContentFooter,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextCacheUsage,
} from "@/components/ai-elements/context";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import {
  useConversation,
  useConversations,
  useCreateConversation,
  useMessages,
  useMessagesActions,
} from "../hooks/use-conversations";

import { Id } from "../../../../convex/_generated/dataModel";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";
import { PastConversationsDialog } from "./past-conversations-dialog";
import { SettingsDialog } from "./settings-dialog";
import { useWebContainer } from "@/features/preview/hooks/use-webcontainer";
import { useLayoutStore } from "@/features/projects/store/use-layout-store";
import { usePreviewStore } from "@/features/preview/store/use-preview-store";
import { useSettingsStore } from "../store/use-settings-store";

interface ConversationSidebarProps {
  projectId: Id<"projects">;
};

export const ConversationSidebar = ({
  projectId,
}: ConversationSidebarProps) => {
  const [input, setInput] = useState("");
  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<Id<"conversations"> | null>(null);
  const [
    pastConversationsOpen,
    setPastConversationsOpen
  ] = useState(false);
  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  const createConversation = useCreateConversation();
  const conversations = useConversations(projectId);
  const { send } = useMessagesActions();
  const { setActiveView } = useLayoutStore();
  const { setIsTerminalOpen } = usePreviewStore();
  const { 
    showTokenUsage, 
    setShowTokenUsage,
  } = useSettingsStore();

  const activeConversationId =
    selectedConversationId ?? conversations?.[0]?._id ?? null;

  const activeConversation = useConversation(activeConversationId);
  const conversationMessages = useMessages(activeConversationId);

  const { interprete } = useWebContainer({
    projectId,
    enabled: true,
  });

  // Check if any message is currently processing
  const isProcessing = conversationMessages?.some(
    (msg) => msg.status === "processing"
  );

  const handleRunDSL = async (content: string) => {
    // Basic extraction of DSL from markdown code blocks
    const dslMatch = content.match(/```dsl\n([\s\S]*?)```/);
    if (!dslMatch || !dslMatch[1]) {
      toast.error("No DSL script found in this message");
      return;
    }

    try {
      setActiveView("preview");
      setIsTerminalOpen(true);
      toast.info("Running DSL script...");
      await interprete(dslMatch[1]);
      toast.success("DSL script executed successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "DSL Execution failed");
    }
  };

  const handleCancel = async () => {
    try {
      await ky.post("/api/messages/cancel", {
        json: { projectId },
      });
    } catch {
      toast.error("Unable to cancel request");
    }
  };

  const handleCreateConversation = async () => {
    try {
      const newConversationId = await createConversation({
        projectId,
        title: DEFAULT_CONVERSATION_TITLE,
      });
      setSelectedConversationId(newConversationId);
      return newConversationId;
    } catch {
      toast.error("Unable to create new conversation");
      return null;
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    // If processing and no new message, this is just a stop function
    if (isProcessing && !message.text) {
      await handleCancel()
      setInput("");
      return;
    }

    let conversationId = activeConversationId;

    if (!conversationId) {
      conversationId = await handleCreateConversation();
      if (!conversationId) {
        return;
      }
    }

    // Trigger message processing via Convex Action
    try {
      await send({
        conversationId,
        content: message.text,
      });
    } catch {
      toast.error("Message failed to send");
    }

    setInput("");
  }

  return (
    <>
      <PastConversationsDialog
        projectId={projectId}
        open={pastConversationsOpen}
        onOpenChange={setPastConversationsOpen}
        onSelect={setSelectedConversationId}
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
      <div className="flex flex-col h-full bg-sidebar">
        <div className="h-8.75 flex items-center justify-between border-b">
          <div className="text-sm truncate pl-3">
            {activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE}
          </div>
          <div className="flex items-center px-1 gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-xs"
                  variant={showTokenUsage ? "highlight" : "ghost"}
                  onClick={() => setShowTokenUsage(!showTokenUsage)}
                >
                  <CoinsIcon className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showTokenUsage ? "Hide token usage" : "Show token usage"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="highlight"
                  onClick={() => setSettingsOpen(true)}
                  data-tour="conversation-settings"
                >
                  <SettingsIcon className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                AI Settings
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="highlight"
                  onClick={() => setPastConversationsOpen(true)}
                >
                  <HistoryIcon className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                History
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="highlight"
                  onClick={handleCreateConversation}
                >
                  <PlusIcon className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                New conversation
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <Conversation className="flex-1">
          <ConversationContent>
            {conversationMessages?.map((message, messageIndex) => (
              <Message
                key={message._id}
                from={message.role}
              >
                <MessageContent>
                  {message.status === "processing" ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <LoaderIcon className="size-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : message.status === "cancelled" ? (
                    <span className="text-muted-foreground italic">
                      Request cancelled
                    </span>
                  ) : (
                    <MessageResponse>{message.content}</MessageResponse>
                  )}
                </MessageContent>
                {message.role === "assistant" &&
                  message.status === "completed" && (
                    <MessageActions>
                      {message.usage && showTokenUsage && (
                        <Context
                          usedTokens={message.usage.inputTokens + message.usage.outputTokens}
                          maxTokens={200000} // Claude-3 context window
                          usage={{
                            inputTokens: message.usage.inputTokens,
                            outputTokens: message.usage.outputTokens,
                            reasoningTokens: message.usage.reasoningTokens,
                            cachedInputTokens: message.usage.cachedInputTokens,
                            inputTokenDetails: {
                              cacheReadTokens: message.usage.cachedInputTokens,
                              noCacheTokens: message.usage.inputTokens - (message.usage.cachedInputTokens ?? 0),
                              cacheWriteTokens: undefined,
                            },
                            outputTokenDetails: {
                              reasoningTokens: message.usage.reasoningTokens,
                              textTokens: message.usage.outputTokens - (message.usage.reasoningTokens ?? 0),
                            },
                            totalTokens: message.usage.inputTokens + message.usage.outputTokens,
                          }}
                          modelId={message.modelId}
                        >
                          <ContextTrigger className="h-6 px-1 hover:bg-transparent" />
                          <ContextContent>
                            <ContextContentHeader />
                            <ContextContentBody className="space-y-1">
                              <ContextInputUsage />
                              <ContextOutputUsage />
                              <ContextReasoningUsage />
                              <ContextCacheUsage />
                            </ContextContentBody>
                            <ContextContentFooter />
                          </ContextContent>
                        </Context>
                      )}
                      {message.content.includes("```dsl") && 
                        messageIndex === (conversationMessages?.length ?? 0) - 1 && (
                          <MessageAction
                            onClick={() => handleRunDSL(message.content)}
                            tooltip="Run DSL"
                            className="text-primary hover:text-primary"
                          >
                            <PlayIcon className="size-3 fill-current" />
                          </MessageAction>
                        )
                      }
                      <MessageAction
                        onClick={() => {
                          navigator.clipboard.writeText(message.content)
                        }}
                        tooltip="Copy"
                      >
                        <CopyIcon className="size-3" />
                      </MessageAction>
                    </MessageActions>
                  )
                }
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="p-3">
          <PromptInput 
            onSubmit={handleSubmit}
            className="mt-2"
            data-tour="conversation-input"
          >
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Ask IDEON anything..."
                onChange={(e) => setInput(e.target.value)}
                value={input}
                disabled={isProcessing}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit
                disabled={isProcessing ? false : !input}
                status={isProcessing ? "streaming" : undefined}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </>
  );
};
