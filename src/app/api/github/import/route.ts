import { z } from "zod";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

import { convex } from "@/lib/convex-client";
import { inngest } from "@/inngest/client";

import { api } from "../../../../../convex/_generated/api";

const requestSchema = z.object({
  url: z.url(),
});

function parseGitHubUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL");
  }

  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url } = requestSchema.parse(body);

    const { owner, repo } = parseGitHubUrl(url);
    // https://github.com/AntonioErdeljac/cursor-dev
    // { owner: "AntonioErdeljac", repo: "cursor-dev" }

    const client = await clerkClient();
    const tokens = await client.users.getUserOauthAccessToken(
      userId,
      "github"
    );
    const githubToken = tokens.data[0]?.token;

    if (!githubToken) {
      return NextResponse.json(
        { error: "GitHub not connected. Please reconnect your GitHub account." },
        { status: 400 }
      );
    }

    const internalKey = process.env.IDEON_CONVEX_INTERNAL_KEY;

    if (!internalKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const projectId = await convex.mutation(api.system.createProject, {
      internalKey,
      name: repo,
      ownerId: userId,
    });

    const event = await inngest.send({
      name: "github/import.repo",
      data: {
        owner,
        repo,
        projectId,
        githubToken,
      },
    });

    return NextResponse.json({
      success: true,
      projectId,
      eventId: event.ids[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please enter a valid GitHub repository URL." },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Invalid GitHub URL") {
      return NextResponse.json(
        { error: "Please enter a valid GitHub repository URL." },
        { status: 400 }
      );
    }

    console.error("GitHub import failed", error);

    return NextResponse.json(
      { error: "Unable to import repository." },
      { status: 500 }
    );
  }
};
