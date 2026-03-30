import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { convex } from "@/lib/convex-client";
import { encrypt } from "@/lib/encryption";
import { api } from "../../../../convex/_generated/api";

const settingsSchema = z.object({
  activeProvider: z.enum(["anthropic", "google"]),
  anthropicKey: z.string().optional(),
  googleKey: z.string().optional(),
});

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const internalKey = process.env.IDEON_CONVEX_INTERNAL_KEY;
  if (!internalKey) {
    return NextResponse.json({ error: "Internal key not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { activeProvider, anthropicKey, googleKey } = settingsSchema.parse(body);

    // Get current settings
    const currentSettings = await convex.query(api.system.getUserSettings, {
      internalKey,
      userId,
    });

    let anthropicEncrypted = currentSettings?.anthropicKeyEncrypted;
    let anthropicIv = currentSettings?.anthropicKeyIv;
    let googleEncrypted = currentSettings?.googleKeyEncrypted;
    let googleIv = currentSettings?.googleKeyIv;

    // Encrypt if new keys are provided
    if (anthropicKey && anthropicKey.trim() !== "") {
      const { encrypted, iv } = encrypt(anthropicKey.trim());
      anthropicEncrypted = encrypted;
      anthropicIv = iv;
    }

    if (googleKey && googleKey.trim() !== "") {
      const { encrypted, iv } = encrypt(googleKey.trim());
      googleEncrypted = encrypted;
      googleIv = iv;
    }

    await convex.mutation(api.system.updateUserSettings, {
      internalKey,
      userId,
      activeProvider,
      anthropicKeyEncrypted: anthropicEncrypted,
      anthropicKeyIv: anthropicIv,
      googleKeyEncrypted: googleEncrypted,
      googleKeyIv: googleIv,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update AI settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
