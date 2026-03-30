import { createAgent, anthropic, createNetwork } from '@inngest/agent-kit';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

import { inngest } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex } from "@/lib/convex-client";
import { decrypt } from "@/lib/encryption";
import { api } from "../../../../convex/_generated/api";
import { 
  CODING_AGENT_SYSTEM_PROMPT, 
  TITLE_GENERATOR_SYSTEM_PROMPT
} from "./constants";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";
import { createReadFilesTool } from './tools/read-files';
import { createListFilesTool } from './tools/list-files';
import { createUpdateFileTool } from './tools/update-file';
import { createCreateFilesTool } from './tools/create-files';
import { createCreateFolderTool } from './tools/create-folder';
import { createRenameFileTool } from './tools/rename-file';
import { createDeleteFilesTool } from './tools/delete-files';
import { createScrapeUrlsTool } from './tools/scrape-urls';

interface MessageEvent {
  messageId: Id<"messages">;
  conversationId: Id<"conversations">;
  projectId: Id<"projects">;
  message: string;
  userId: string;
};

export const processMessage = inngest.createFunction(
  {
    id: "process-message",
    cancelOn: [
      {
        event: "message/cancel",
        if: "event.data.messageId == async.data.messageId",
      },
    ],
    onFailure: async ({ event, step }) => {
      const { messageId } = event.data.event.data as MessageEvent;
      const internalKey = process.env.IDEON_CONVEX_INTERNAL_KEY;

      // Update the message with error content
      if (internalKey) {
        await step.run("update-message-on-failure", async () => {
          await convex.mutation(api.system.updateMessageContent, {
            internalKey,
            messageId,
            content:
              "My apologies, I encountered an error while processing your request. Let me know if you need anything else!",
          });
        });
      }
    }
  },
  {
    event: "message/sent",
  },
  async ({ event, step }) => {
    const { 
      messageId, 
      conversationId,
      projectId,
      message,
      userId,
    } = event.data as MessageEvent;

    const internalKey = process.env.IDEON_CONVEX_INTERNAL_KEY; 

    if (!internalKey) {
      throw new NonRetriableError("IDEON_CONVEX_INTERNAL_KEY is not configured");
    }

    // Get user settings (vaulted keys)
    const userSettings = await step.run("get-user-settings", async () => {
      return await convex.query(api.system.getUserSettings, {
        internalKey,
        userId,
      });
    });

    // Determine which provider to use and decrypt key
    const getModel = () => {
      const provider = userSettings?.activeProvider ?? "anthropic";

      if (provider === "google" && userSettings?.googleKeyEncrypted && userSettings?.googleKeyIv) {
        const decryptedKey = decrypt(userSettings.googleKeyEncrypted, userSettings.googleKeyIv);
        const googleProvider = createGoogleGenerativeAI({ apiKey: decryptedKey });
        return googleProvider("gemini-3.1-flash");
      }
      
      if (provider === "anthropic" && userSettings?.anthropicKeyEncrypted && userSettings?.anthropicKeyIv) {
        const decryptedKey = decrypt(userSettings.anthropicKeyEncrypted, userSettings.anthropicKeyIv);
        return anthropic({ 
          apiKey: decryptedKey,
          model: "claude-sonnet-4.6" 
        });
      }

      // Default to internal Anthropic key if nothing else is provided
      return anthropic("claude-sonnet-4.6");
    };

    const model = getModel();

    // TODO: Check if this is needed
    await step.sleep("wait-for-db-sync", "1s");

    // Get conversation for title generation check
    const conversation = await step.run("get-conversation", async () => {
      return await convex.query(api.system.getConversationById, {
        internalKey,
        conversationId,
      });
    });

    if (!conversation) {
      throw new NonRetriableError("Conversation not found");
    }

    // Fetch recent messages for conversation context
    const recentMessages = await step.run("get-recent-messages", async () => {
      return await convex.query(api.system.getRecentMessages, {
        internalKey,
        conversationId,
        limit: 10,
      });
    });

    // Build system prompt with conversation history (exclude the current processing message)
    let systemPrompt = CODING_AGENT_SYSTEM_PROMPT;

    // Filter out the current processing message and empty messages
    const contextMessages = recentMessages.filter(
      (msg) => msg._id !== messageId && msg.content.trim() !== ""
    );

    if (contextMessages.length > 0) {
      const historyText = contextMessages
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n\n");

      systemPrompt += `\n\n## Previous Conversation (for context only - do NOT repeat these responses):\n${historyText}\n\n## Current Request:\nRespond ONLY to the user's new message below. Do not repeat or reference your previous responses.`;
    }

    // Generate conversation title if it's still the default
    const shouldGenerateTitle =
      conversation.title === DEFAULT_CONVERSATION_TITLE;

    if (shouldGenerateTitle) {
       const titleAgent = createAgent({
        name: "title-generator",
        system: TITLE_GENERATOR_SYSTEM_PROMPT,
        model,
       });

       const { output } = await titleAgent.run(message, { step });

       const textMessage = output.find(
        (m) => m.type === "text" && m.role === "assistant"
      );

      if (textMessage?.type === "text") {
         const title = 
          typeof textMessage.content === "string"
            ? textMessage.content.trim()
            : textMessage.content
              .map((c) => c.text)
              .join("")
              .trim();

        if (title) {
          await step.run("update-conversation-title", async () => {
            await convex.mutation(api.system.updateConversationTitle, {
              internalKey,
              conversationId,
              title,
            });
          });
        }
      }
    }

    // Create the coding agent with file tools
    const codingAgent = createAgent({
      name: "IDEON",
      description: "An expert AI coding assistant",
      system: systemPrompt,
       model,
       tools: [
        createListFilesTool({ internalKey, projectId }),
        createReadFilesTool({ internalKey }),
        createUpdateFileTool({ internalKey }),
        createCreateFilesTool({ projectId, internalKey }),
        createCreateFolderTool({ projectId, internalKey }),
        createRenameFileTool({ internalKey }),
        createDeleteFilesTool({ internalKey }),
        createScrapeUrlsTool(),
       ],
    });

    // Create network with single agent
    const network = createNetwork({
      name: "IDEON-network",
      agents: [codingAgent],
      maxIter: 20,
      router: ({ network }) => {
        const lastResult = network.state.results.at(-1);
        const hasTextResponse = lastResult?.output.some(
          (m) => m.type === "text" && m.role === "assistant"
        );
        const hasToolCalls = lastResult?.output.some(
          (m) => m.type === "tool_call"
        );

        // Anthropic outputs text AND tool calls together
        // Only stop if there's text WITHOUT tool calls (final response)
        if (hasTextResponse && !hasToolCalls) {
          return undefined;
        }
        return codingAgent;
      }
    });

    // Run the agent
    const result = await network.run(message);

    // Aggregate token usage from all steps in the run
    const totalUsage = result.state.results.reduce(
      (acc, res) => {
        if (res.raw) {
          try {
            const raw = JSON.parse(res.raw);
            // Most AI providers put usage in a 'usage' field
            if (raw.usage) {
              acc.inputTokens += raw.usage.input_tokens || raw.usage.prompt_tokens || 0;
              acc.outputTokens += raw.usage.output_tokens || raw.usage.completion_tokens || 0;
              if (raw.usage.cache_read_input_tokens || raw.usage.cached_prompt_tokens) {
                 acc.cachedInputTokens = (acc.cachedInputTokens || 0) + 
                  (raw.usage.cache_read_input_tokens || raw.usage.cached_prompt_tokens || 0);
              }
              if (raw.usage.thinking_tokens) {
                acc.reasoningTokens = (acc.reasoningTokens || 0) + raw.usage.thinking_tokens;
              }
            }
          } catch {
            // Ignore parse errors
          }
        }
        return acc;
      },
      { inputTokens: 0, outputTokens: 0, reasoningTokens: 0, cachedInputTokens: 0 }
    );

    // Extract the assistant's text response from the last agent result
    const lastResult = result.state.results.at(-1);
    const textMessage = lastResult?.output.find(
      (m) => m.type === "text" && m.role === "assistant"
    );

    let assistantResponse =
      "I processed your request. Let me know if you need anything else!";

    if (textMessage?.type === "text") {
      assistantResponse =
        typeof textMessage.content === "string"
          ? textMessage.content
          : textMessage.content.map((c) => c.text).join("");
    }

    // Update the assistant message with the response (this also sets status to completed)
    await step.run("update-assistant-message", async () => {
      await convex.mutation(api.system.updateMessageContent, {
        internalKey,
        messageId,
        content: assistantResponse,
        usage: totalUsage,
        modelId: "anthropic:claude-3-opus-20240229", // Canonical model ID for cost calculation
      })
    });

    return { success: true, messageId, conversationId };
  }
);

