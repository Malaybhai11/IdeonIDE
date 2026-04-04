import { z } from "zod";
import { toast } from "sonner";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";

const editRequestSchema = z.object({
  selectedCode: z.string(),
  fullCode: z.string(),
  instruction: z.string(),
  userId: z.string(),
});

const editResponseSchema = z.object({
  editedCode: z.string(),
});

type EditRequest = z.infer<typeof editRequestSchema>;

export const fetcher = async (
  payload: EditRequest,
  signal: AbortSignal,
): Promise<string | null> => {
  try {
    const validatedPayload = editRequestSchema.parse(payload);

    // Call Convex Action directly
    const editedCode = await convex.action(api.ai.generateQuickEdit, validatedPayload);

    return editedCode || null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return null;
    }
    console.error("Failed to fetch AI quick edit", error);
    return null;
  }
};
