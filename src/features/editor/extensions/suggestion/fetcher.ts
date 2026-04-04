import { z } from "zod";
import { toast } from "sonner";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";

const suggestionRequestSchema = z.object({
  fileName: z.string(),
  code: z.string(),
  currentLine: z.string(),
  previousLines: z.string(),
  textBeforeCursor: z.string(),
  textAfterCursor: z.string(),
  nextLines: z.string(),
  lineNumber: z.number(),
  userId: z.string(),
});

type SuggestionRequest = z.infer<typeof suggestionRequestSchema>;

export const fetcher = async (
  payload: SuggestionRequest,
  signal: AbortSignal,
): Promise<string | null> => {
  try {
    const validatedPayload = suggestionRequestSchema.parse(payload);

    // Call Convex Action directly
    const suggestion = await convex.action(api.ai.generateSuggestion, validatedPayload);

    return suggestion || null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return null;
    }
    console.error("Failed to fetch AI completion", error);
    return null;
  }
};
