# Convex Backend

This directory contains the Convex functions and schema that power the real-time capabilities of IDEON. Convex acts as our database, serverless function provider, and real-time synchronization layer.

## Core Concepts

- **Real-time Sync:** All data in Convex is automatically pushed to the frontend, ensuring a seamless collaborative experience.
- **Optimistic Updates:** Frontend mutations provide immediate UI feedback while the backend processes the request.
- **Serverless Logic:** Business logic is encapsulated in queries and mutations, removing the need for a traditional REST API for most operations.

## Schema Overview (`schema.ts`)

The project uses a structured relational schema tailored for an IDE:

- **`projects`**: Stores project metadata, owners, and settings (including build/dev commands).
- **`files`**: A hierarchical file system structure. Supports both text content (stored directly) and binary files (via `_storage`).
- **`conversations`**: Groups AI messages into logical chat sessions associated with a project.
- **`messages`**: Individual AI or User messages with status tracking and token usage metadata.

## Directory Structure

- **`_generated/`**: Auto-generated Convex types and client code (do not edit).
- **`projects.ts`**: CRUD operations for managing user projects.
- **`files.ts`**: High-performance file system operations (create, move, delete, update).
- **`conversations.ts`**: Logic for managing AI chat sessions and message history.
- **`system.ts`**: Internal-only functions used for system-level operations and secure data access.
- **`auth.ts`**: Integration with Clerk for secure, identity-aware backend functions.

## Development

To start the Convex development server and sync your functions:

```bash
npx convex dev
```

This will:
1. Provide you with a local dashboard URL to inspect your data.
2. Synchronize your local function changes to the Convex cloud (or local dev environment).
3. Generate type-safe client code in `_generated/`.

## Key Patterns

### Identity Verification
Most functions use `ctx.auth.getUserIdentity()` to ensure that users can only access or modify their own projects.

### Indexing
We use custom indexes (e.g., `by_project`, `by_parent`) to ensure that file tree traversal and message retrieval remain fast even as the database grows.

---
*Built with Convex - The Full-stack TypeScript Platform.*
