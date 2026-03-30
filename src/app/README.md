# App Router - Routes & API

This directory contains the main application routing logic and API endpoints using the Next.js App Router.

## Directory Structure

- `layout.tsx`: Root layout providing global context (Auth, Convex, Sentry).
- `globals.css`: Global Tailwind variables and base styles.
- `page.tsx`: Landing page for the project.
- `projects/`: Dynamic route for project workspaces (`/projects/[projectId]`).
- `api/`: Backend API endpoints.

## API Endpoints

### AI Services

- **`api/messages`**: Handles AI conversation history and message stream processing.
- **`api/suggestion`**: Provides real-time code completion ("ghost text") as users type.
- **`api/quick-edit`**: Powers the "Quick Edit" (Cmd+K) feature for targeted code modifications.

### System & Integration

- **`api/github`**: Manages GitHub OAuth, repository imports, and code exports.
- **`api/inngest`**: Webhook endpoint for Inngest background job processing.
- **`api/projects`**: Internal endpoints for project configuration and metadata updates.

## Key Patterns

- **Edge Runtime**: Many AI-driven API routes use the Next.js Edge Runtime for lower latency and better streaming performance.
- **Auth Protection**: Routes are protected by Clerk Middleware.
- **Convex Integration**: Backend interactions are mostly performed through Convex mutations and queries triggered from the frontend, but the `/api` directory handles operations that require third-party integrations (LLMs, GitHub).

---
*Navigating the IDEON experience.*
