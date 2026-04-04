import { v } from "convex/values";
import { 
  internalMutation, 
  internalQuery, 
  mutation 
} from "./_generated/server";
import { api } from "./_generated/api";
import { verifyAuth } from "./auth";

// --- Internal Mutations & Queries ---

export const getInternal = internalQuery({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

export const updateContentInternal = internalMutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    status: v.optional(v.union(v.literal("processing"), v.literal("completed"), v.literal("cancelled"))),
    usage: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      content: args.content,
      status: args.status,
      usage: args.usage,
    });
  },
});

export const updateConversationTitleInternal = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

// --- Public Mutations ---

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const project = await ctx.db.get(conversation.projectId);
    if (!project || project.ownerId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // 1. Create User Message
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      projectId: conversation.projectId,
      role: "user",
      content: args.content,
    });

    // 2. Create Assistant Placeholder
    const assistantMessageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      projectId: conversation.projectId,
      role: "assistant",
      content: "",
      status: "processing",
    });

    // 3. Trigger the Action (Now in convex/ai.ts)
    await ctx.scheduler.runAfter(0, api.ai.processMessage, {
      messageId: assistantMessageId,
      userId: identity.subject,
    });

    return assistantMessageId;
  },
});

export const cancel = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    const processingMessages = await ctx.db
      .query("messages")
      .withIndex("by_project_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "processing")
      )
      .collect();

    for (const msg of processingMessages) {
      await ctx.db.patch(msg._id, {
        status: "cancelled",
      });
    }
  },
});
