"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, tool as aiTool } from "ai";
import crypto from "crypto";
import { z } from "zod";

// --- Encryption Logic ---

const getEncryptionKey = () => {
  const key = process.env.IDEON_MASTER_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("IDEON_MASTER_ENCRYPTION_KEY is not defined");
  }
  return crypto.scryptSync(key, "salt", 32);
};

function decrypt(encrypted: string, ivHex: string): string {
  const authTag = Buffer.from(encrypted.slice(-32), "hex");
  const encryptedText = encrypted.slice(0, -32);
  const iv = Buffer.from(ivHex, "hex");
  
  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

// --- System Prompts ---

const CODING_AGENT_SYSTEM_PROMPT = `You are IDEON, an expert AI coding assistant. 
You help users by reading, creating, updating, and organizing files in their projects.
Respond in markdown. Be concise and professional.`;

const TITLE_GENERATOR_SYSTEM_PROMPT =
  "Generate a short, descriptive title (3-6 words) for a conversation based on the user's message. Return ONLY the title, nothing else. No quotes, no punctuation at the end.";

// --- Actions ---

export const processMessage = action({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.runQuery(internal.messages.getInternal, {
      messageId: args.messageId,
    });

    if (!message) return;

    const conversation = await ctx.runQuery(api.conversations.getById, {
      id: message.conversationId,
    });

    if (!conversation) return;

    const userSettings = await ctx.runQuery(api.system.getUserSettings, {
      internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
      userId: args.userId,
    });

    // Hardcoded to Gemini 3.1 Pro
    const getModel = () => {
      const apiKey = (userSettings?.googleKeyEncrypted && userSettings?.googleKeyIv)
        ? decrypt(userSettings.googleKeyEncrypted, userSettings.googleKeyIv)
        : process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      const google = createGoogleGenerativeAI({ apiKey });
      return google("gemini-3.1-pro");
    };

    const model = getModel();

    const recentMessages = await ctx.runQuery(api.conversations.getMessages, {
      conversationId: message.conversationId,
    });

    const history = recentMessages
      .filter(m => m._id !== args.messageId)
      .map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    if (conversation.title === "New Conversation") {
      try {
        const { text } = await streamText({
          model,
          prompt: `Conversation history:\n${JSON.stringify(history)}\n\nUser: ${history[history.length-1]?.content}\n\n${TITLE_GENERATOR_SYSTEM_PROMPT}`,
        });
        const title = await text;
        if (title) {
          await ctx.runMutation(internal.messages.updateConversationTitleInternal, {
            conversationId: message.conversationId,
            title: title.trim().slice(0, 100),
          });
        }
      } catch (e) {
        console.error("Title generation failed", e);
      }
    }

    let fullContent = "";
    
    // Define tools with explicit 'any' to avoid SDK version conflicts
    const tools: any = {
      listFiles: aiTool({
        description: "List all files in the project",
        parameters: z.object({}),
        execute: async () => {
          const files = await ctx.runQuery(api.system.getProjectFiles, {
            internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
            projectId: message.projectId,
          });
          return JSON.stringify(files.map(f => ({ id: f._id, name: f.name, type: f.type, parentId: f.parentId })));
        },
      } as any),
      readFiles: aiTool({
        description: "Read the content of files",
        parameters: z.object({ fileIds: z.array(z.string()) }),
        execute: async ({ fileIds }: any) => {
          const contents = await Promise.all(fileIds.map(async (id: any) => {
            const file = await ctx.runQuery(api.system.getFileById, {
              internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
              fileId: id,
            });
            return { id, name: file?.name, content: file?.content };
          }));
          return JSON.stringify(contents);
        },
      } as any),
      createFiles: aiTool({
        description: "Create multiple files in a project",
        parameters: z.object({
          files: z.array(z.object({ name: z.string(), content: z.string() })),
          parentId: z.string().optional(),
        }),
        execute: async ({ files, parentId }: any) => {
          const result = await ctx.runMutation(api.system.createFiles, {
            internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
            projectId: message.projectId,
            files,
            parentId: parentId,
          });
          return JSON.stringify(result);
        },
      } as any),
      createFolder: aiTool({
        description: "Create a new folder",
        parameters: z.object({
          name: z.string(),
          parentId: z.string().optional(),
        }),
        execute: async ({ name, parentId }: any) => {
          const folderId = await ctx.runMutation(api.system.createFolder, {
            internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
            projectId: message.projectId,
            name,
            parentId: parentId,
          });
          return `Folder created with ID: ${folderId}`;
        },
      } as any),
      renameFile: aiTool({
        description: "Rename a file or folder",
        parameters: z.object({
          fileId: z.string(),
          newName: z.string(),
        }),
        execute: async ({ fileId, newName }: any) => {
          await ctx.runMutation(api.system.renameFile, {
            internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
            fileId: fileId,
            newName,
          });
          return `Item renamed to ${newName}`;
        },
      } as any),
      deleteFile: aiTool({
        description: "Delete a file or folder",
        parameters: z.object({ fileId: z.string() }),
        execute: async ({ fileId }: any) => {
          await ctx.runMutation(api.system.deleteFile, {
            internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
            fileId: fileId,
          });
          return `Item deleted.`;
        },
      } as any),
      scrapeUrls: aiTool({
        description: "Scrape content from one or more URLs",
        parameters: z.object({ urls: z.array(z.string()) }),
        execute: async ({ urls }: any) => {
          const results = await Promise.all(
            urls.map(async (url: any) => {
              const response = await fetch(`https://api.firecrawl.dev/v1/scrape`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${process.env.FIRECRAWL_API_KEY}`,
                },
                body: JSON.stringify({ url, formats: ["markdown"] }),
              });
              const data: any = await response.json();
              return data.data?.markdown ?? "";
            })
          );
          return results.filter(Boolean).join("\n\n");
        },
      } as any),
    };

    const { textStream, usage } = await streamText({
      model,
      system: CODING_AGENT_SYSTEM_PROMPT,
      messages: history,
      tools,
    });

    for await (const delta of textStream) {
      fullContent += delta;
      await ctx.runMutation(internal.messages.updateContentInternal, {
        messageId: args.messageId,
        content: fullContent,
        status: "processing",
      });
    }

    const finalUsage: any = await usage;

    await ctx.runMutation(internal.messages.updateContentInternal, {
      messageId: args.messageId,
      content: fullContent,
      status: "completed",
      usage: {
        inputTokens: finalUsage.promptTokens ?? finalUsage.inputTokens ?? 0,
        outputTokens: finalUsage.completionTokens ?? finalUsage.outputTokens ?? 0,
        totalTokens: finalUsage.totalTokens ?? 0,
      },
    });
  },
});

export const generateSuggestion = action({
  args: {
    userId: v.string(),
    fileName: v.string(),
    code: v.string(),
    currentLine: v.string(),
    previousLines: v.optional(v.string()),
    textBeforeCursor: v.string(),
    textAfterCursor: v.string(),
    nextLines: v.optional(v.string()),
    lineNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const userSettings = await ctx.runQuery(api.system.getUserSettings, {
      internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
      userId: args.userId,
    });

    // Hardcoded to Gemini 3.1 Pro
    const getModel = () => {
      const apiKey = (userSettings?.googleKeyEncrypted && userSettings?.googleKeyIv)
        ? decrypt(userSettings.googleKeyEncrypted, userSettings.googleKeyIv)
        : process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      const google = createGoogleGenerativeAI({ apiKey });
      return google("gemini-3.1-pro");
    };

    const model = getModel();

    const SUGGESTION_PROMPT = `You are a code suggestion assistant.

<context>
<file_name>${args.fileName}</file_name>
<previous_lines>
${args.previousLines || ""}
</previous_lines>
<current_line number="${args.lineNumber}">${args.currentLine}</current_line>
<before_cursor>${args.textBeforeCursor}</before_cursor>
<after_cursor>${args.textAfterCursor}</after_cursor>
<next_lines>
${args.nextLines || ""}
</next_lines>
<full_code>
${args.code}
</full_code>
</context>

<instructions>
Follow these steps IN ORDER:

1. First, look at next_lines. If next_lines contains ANY code, check if it continues from where the cursor is. If it does, return empty string immediately - the code is already written.

2. Check if before_cursor ends with a complete statement (;, }, )). If yes, return empty string.

3. Only if steps 1 and 2 don't apply: suggest what should be typed at the cursor position, using context from full_code.

Your suggestion is inserted immediately after the cursor, so never suggest code that's already in the file.
</instructions>`;

    const { text } = await streamText({
      model,
      prompt: SUGGESTION_PROMPT,
    });

    return await text;
  },
});

export const generateQuickEdit = action({
  args: {
    userId: v.string(),
    selectedCode: v.string(),
    fullCode: v.optional(v.string()),
    instruction: v.string(),
  },
  handler: async (ctx, args) => {
    const userSettings = await ctx.runQuery(api.system.getUserSettings, {
      internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
      userId: args.userId,
    });

    // Hardcoded to Gemini 3.1 Pro
    const getModel = () => {
      const apiKey = (userSettings?.googleKeyEncrypted && userSettings?.googleKeyIv)
        ? decrypt(userSettings.googleKeyEncrypted, userSettings.googleKeyIv)
        : process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      const google = createGoogleGenerativeAI({ apiKey });
      return google("gemini-3.1-pro");
    };

    const model = getModel();

    const QUICK_EDIT_PROMPT = `You are a code editing assistant. Edit the selected code based on the user's instruction.

<context>
<selected_code>
${args.selectedCode}
</selected_code>
<full_code_context>
${args.fullCode || ""}
</full_code_context>
</context>

<instruction>
${args.instruction}
</instruction>

<instructions>
Return ONLY the edited version of the selected code.
Maintain the same indentation level as the original.
Do not include any explanations or comments unless requested.
If the instruction is unclear or cannot be applied, return the original code unchanged.
</instructions>`;

    const { text } = await streamText({
      model,
      prompt: QUICK_EDIT_PROMPT,
    });

    return await text;
  },
});
