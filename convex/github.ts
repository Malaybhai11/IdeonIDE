"use node";

import { v } from "convex/values";
import ky from "ky";
import { Octokit } from "octokit";
import { isBinaryFile } from "isbinaryfile";

import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

const getGitHubToken = async (userId: string): Promise<string> => {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) {
    throw new Error("CLERK_SECRET_KEY is not configured. Cannot authenticate GitHub requests.");
  }

  const response = await fetch(
    `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/oauth_github`,
    {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Clerk API Error:", error);
    throw new Error("Failed to fetch GitHub token from Clerk. Please ensure your GitHub account is connected.");
  }

  const tokens = await response.json();
  const token = tokens[0]?.token;

  if (!token) {
    throw new Error("No GitHub OAuth token found. Please connect your GitHub account in your profile.");
  }

  return token;
};

export const importGithubRepo = action({
  args: {
    owner: v.string(),
    repo: v.string(),
    projectId: v.id("projects"),
    userId: v.string(), // Pass userId explicitly for scheduled actions
  },
  handler: async (ctx, args) => {
    // Scheduled actions run with null identity, so we use the passed userId
    const project = await ctx.runQuery(internal.projects.getByIdInternal, { id: args.projectId });
    if (!project || project.ownerId !== args.userId) {
      console.error(`[Import] Unauthorized or missing project: ${args.projectId}`);
      return;
    }

    try {
      console.log(`[Import] Starting import for ${args.owner}/${args.repo} (User: ${args.userId})`);
      const githubToken = await getGitHubToken(args.userId);
      
      // 1. Update status to importing
      await ctx.runMutation(internal.projects.updateImportStatusInternal, {
        projectId: args.projectId,
        status: "importing",
      });

      const octokit = new Octokit({ auth: githubToken });

      // 2. Get repo metadata for default branch
      const { data: repoData } = await octokit.rest.repos.get({
        owner: args.owner,
        repo: args.repo,
      });
      const defaultBranch = repoData.default_branch;
      console.log(`[Import] Default branch: ${defaultBranch}`);

      // 3. Cleanup existing files
      await ctx.runMutation(internal.projects.cleanupInternal, {
        projectId: args.projectId,
      });

      // 4. Fetch the full recursive tree
      // Use branch name as tree_sha, recursive=true (boolean for Octokit)
      const { data: treeData } = await octokit.rest.git.getTree({
        owner: args.owner,
        repo: args.repo,
        tree_sha: defaultBranch,
        recursive: "true", // Octokit translates this to ?recursive=1
      });

      if (!treeData.tree || treeData.tree.length === 0) {
        throw new Error("The repository seems to be empty or the tree could not be retrieved.");
      }

      console.log(`[Import] Discovered ${treeData.tree.length} items`);

      const folderIdMap: Record<string, Id<"files">> = {};
      
      // 5. Create Folders first (sorted by depth)
      const folders = treeData.tree
        .filter((item: any) => item.type === "tree")
        .sort((a: any, b: any) => (a.path?.split("/").length ?? 0) - (b.path?.split("/").length ?? 0));

      console.log(`[Import] Creating ${folders.length} folders...`);

      for (const folder of folders) {
        const path = folder.path!;
        const pathParts = path.split("/");
        const name = pathParts.pop()!;
        const parentPath = pathParts.join("/");
        const parentId = parentPath ? folderIdMap[parentPath] : undefined;

        const folderId = await ctx.runMutation(api.system.createFolder, {
          internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
          projectId: args.projectId,
          name,
          parentId,
        });
        folderIdMap[path] = folderId;
      }

      // 6. Create Files in small batches to avoid timeouts
      const files = treeData.tree.filter((item: any) => item.type === "blob");
      console.log(`[Import] Creating ${files.length} files...`);
      
      const BATCH_SIZE = 5;
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (file: any) => {
          const path = file.path!;
          const pathParts = path.split("/");
          const name = pathParts.pop()!;
          const parentPath = pathParts.join("/");
          const parentId = parentPath ? folderIdMap[parentPath] : undefined;

          try {
            const { data: blob } = await octokit.rest.git.getBlob({
              owner: args.owner,
              repo: args.repo,
              file_sha: file.sha!,
            });

            const buffer = Buffer.from(blob.content, "base64");
            const isBinary = await isBinaryFile(buffer);

            if (isBinary) {
              const uploadUrl = await ctx.runMutation(api.system.generateUploadUrl, {
                internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
              });
              const { storageId } = await ky.post(uploadUrl, {
                headers: { "Content-Type": "application/octet-stream" },
                body: buffer,
              }).json<{ storageId: Id<"_storage"> }>();

              await ctx.runMutation(api.system.createBinaryFile, {
                internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
                projectId: args.projectId,
                name,
                storageId,
                parentId,
              });
            } else {
              await ctx.runMutation(api.system.createFile, {
                internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
                projectId: args.projectId,
                name,
                content: buffer.toString("utf-8"),
                parentId,
              });
            }
          } catch (fileError: any) {
            console.error(`[Import] Failed file ${path}:`, fileError);
            if (fileError.status === 403 || fileError.status === 401) throw fileError;
          }
        }));

        console.log(`[Import] Progress: ${Math.min(i + BATCH_SIZE, files.length)}/${files.length}`);
      }

      console.log(`[Import] Success: Imported ${args.owner}/${args.repo}`);

      await ctx.runMutation(internal.projects.updateImportStatusInternal, {
        projectId: args.projectId,
        status: "completed",
      });
    } catch (error) {
      console.error("[Import] Fatal Error:", error);
      await ctx.runMutation(internal.projects.updateImportStatusInternal, {
        projectId: args.projectId,
        status: "failed",
      });
    }
  },
});

export const exportToGithub = action({
  args: {
    projectId: v.id("projects"),
    repoName: v.string(),
    visibility: v.union(v.literal("public"), v.literal("private")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    try {
      const githubToken = await getGitHubToken(identity.subject);

      await ctx.runMutation(internal.projects.updateExportStatusInternal, {
        projectId: args.projectId,
        status: "exporting",
      });

      const octokit = new Octokit({ auth: githubToken });
      const { data: user } = await octokit.rest.users.getAuthenticated();

      const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
        name: args.repoName,
        description: args.description || "Exported from IDEON",
        private: args.visibility === "private",
        auto_init: true,
      });

      // Wait for repo init
      await new Promise(resolve => setTimeout(resolve, 3000));

      const { data: ref } = await octokit.rest.git.getRef({
        owner: user.login,
        repo: args.repoName,
        ref: "heads/main",
      });
      const initialCommitSha = ref.object.sha;

      const files = (await ctx.runQuery(api.system.getProjectFilesWithUrls, {
        internalKey: process.env.IDEON_CONVEX_INTERNAL_KEY!,
        projectId: args.projectId,
      })) as (Doc<"files"> & { storageUrl: string | null })[];

      // Build paths
      const fileMap = new Map<Id<"files">, Doc<"files">>();
      files.forEach(f => fileMap.set(f._id, f));
      
      const getFullPath = (f: Doc<"files">): string => {
        if (!f.parentId) return f.name;
        const parent = fileMap.get(f.parentId);
        return parent ? `${getFullPath(parent)}/${f.name}` : f.name;
      };

      const treeItems = [];
      for (const f of files.filter(f => f.type === "file")) {
        let content;
        let encoding: "utf-8" | "base64" = "utf-8";

        if (f.content !== undefined) {
          content = f.content;
        } else if (f.storageUrl) {
          const response = await ky.get(f.storageUrl);
          content = Buffer.from(await response.arrayBuffer()).toString("base64");
          encoding = "base64";
        } else continue;

        const { data: blob } = await octokit.rest.git.createBlob({
          owner: user.login,
          repo: args.repoName,
          content,
          encoding,
        });

        treeItems.push({
          path: getFullPath(f),
          mode: "100644" as const,
          type: "blob" as const,
          sha: blob.sha,
        });
      }

      const { data: tree } = await octokit.rest.git.createTree({
        owner: user.login,
        repo: args.repoName,
        tree: treeItems,
      });

      const { data: commit } = await octokit.rest.git.createCommit({
        owner: user.login,
        repo: args.repoName,
        message: "Initial commit from IDEON",
        tree: tree.sha,
        parents: [initialCommitSha],
      });

      await octokit.rest.git.updateRef({
        owner: user.login,
        repo: args.repoName,
        ref: "heads/main",
        sha: commit.sha,
        force: true,
      });

      await ctx.runMutation(internal.projects.updateExportStatusInternal, {
        projectId: args.projectId,
        status: "completed",
        repoUrl: repo.html_url,
      });
    } catch (error) {
      console.error(error);
      await ctx.runMutation(internal.projects.updateExportStatusInternal, {
        projectId: args.projectId,
        status: "failed",
      });
    }
  },
});
