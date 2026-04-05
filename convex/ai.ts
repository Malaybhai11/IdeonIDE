"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import crypto from "crypto";
import { Doc } from "./_generated/dataModel";

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

    const conversation = await ctx.runQuery(api.system.getConversationById, {
      internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
      conversationId: message.conversationId,
    });

    if (!conversation) return;

    const userSettings = await ctx.runQuery(api.system.getUserSettings, {
      internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
      userId: args.userId,
    });

    const apiKey = (userSettings?.googleKeyEncrypted && userSettings?.googleKeyIv)
      ? decrypt(userSettings.googleKeyEncrypted, userSettings.googleKeyIv)
      : process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      throw new Error("Google API key not found");
    }

    // Masked logging for debugging (safe)
    const source = (userSettings?.googleKeyEncrypted && userSettings?.googleKeyIv) ? "DB Settings" : "Env Variable";
    console.log(`Using API key from ${source} (first 4: ${apiKey.substring(0, 4)})`);

    // Use v1beta for Gemma 4
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      { model: "gemma-4-31b-it", systemInstruction: CODING_AGENT_SYSTEM_PROMPT },
      { apiVersion: 'v1beta' }
    );

    const recentMessages = await ctx.runQuery(api.system.getRecentMessages, {
      internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
      conversationId: message.conversationId,
      limit: 20,
    });

    const history: Content[] = recentMessages
      .filter((m: Doc<"messages">) => m._id !== args.messageId)
      .map((m: Doc<"messages">) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

    if (conversation.title === "New Conversation") {
      try {
        const titleModel = genAI.getGenerativeModel({ model: "gemma-4-31b-it" }, { apiVersion: 'v1beta' });
        const lastUserMessage = history[history.length - 1]?.parts[0]?.text || "";
        const titleResult = await titleModel.generateContent(`${TITLE_GENERATOR_SYSTEM_PROMPT}\n\nUser: ${lastUserMessage}`);
        const title = titleResult.response.text();
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
    
    const chat = model.startChat({
      history: history.slice(0, -1), // History except the last message
    });

    const userMessage = history[history.length - 1]?.parts[0]?.text || "";
    const result = await chat.sendMessageStream(userMessage);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullContent += chunkText;
      await ctx.runMutation(internal.messages.updateContentInternal, {
        messageId: args.messageId,
        content: fullContent,
        status: "processing",
      });
    }

    await ctx.runMutation(internal.messages.updateContentInternal, {
      messageId: args.messageId,
      content: fullContent,
      status: "completed",
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
  handler: async (ctx, args): Promise<string> => {
    const userSettings = await ctx.runQuery(api.system.getUserSettings, {
      internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
      userId: args.userId,
    });

    const apiKey = (userSettings?.googleKeyEncrypted && userSettings?.googleKeyIv)
      ? decrypt(userSettings.googleKeyEncrypted, userSettings.googleKeyIv)
      : process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) throw new Error("Google API key not found");

    // Masked logging for debugging (safe)
    const source = (userSettings?.googleKeyEncrypted && userSettings?.googleKeyIv) ? "DB Settings" : "Env Variable";
    console.log(`Using API key from ${source} (first 4: ${apiKey.substring(0, 4)})`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemma-4-31b-it" }, { apiVersion: 'v1beta' });

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
Return ONLY the suggestion text.
</instructions>`;

    const result = await model.generateContent(SUGGESTION_PROMPT);
    return result.response.text();
  },
});

export const generateQuickEdit = action({
  args: {
    userId: v.string(),
    selectedCode: v.string(),
    fullCode: v.optional(v.string()),
    instruction: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const userSettings = await ctx.runQuery(api.system.getUserSettings, {
      internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
      userId: args.userId,
    });

    const apiKey = (userSettings?.googleKeyEncrypted && userSettings?.googleKeyIv)
      ? decrypt(userSettings.googleKeyEncrypted, userSettings.googleKeyIv)
      : process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) throw new Error("Google API key not found");

    // Masked logging for debugging (safe)
    const source = (userSettings?.googleKeyEncrypted && userSettings?.googleKeyIv) ? "DB Settings" : "Env Variable";
    console.log(`Using API key from ${source} (first 4: ${apiKey.substring(0, 4)})`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemma-4-31b-it" }, { apiVersion: 'v1beta' });

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

    const result = await model.generateContent(QUICK_EDIT_PROMPT);
    return result.response.text();
  },
});
