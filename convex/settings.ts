import { v } from "convex/values";
import { query } from "./_generated/server";
import { verifyAuth } from "./auth";

export const getMySettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await verifyAuth(ctx);
    const userId = identity.subject;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) return null;

    return {
      activeProvider: settings.activeProvider,
      hasAnthropicKey: !!settings.anthropicKeyEncrypted,
      hasGoogleKey: !!settings.googleKeyEncrypted,
    };
  },
});
