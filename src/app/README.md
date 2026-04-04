# App Router - Routes & API

This directory contains the main application routing logic and API endpoints using the Next.js App Router.

## Directory Structure

- `layout.tsx`: Root layout providing global context (Auth, Convex, Sentry).
- `globals.css`: Global Tailwind variables and base styles.
- `page.tsx`: Landing page for the project.
- `projects/`: Dynamic route for project workspaces (`/projects/[projectId]`).
- `api/`: Backend API endpoints.

## Service Layer

- **Convex Actions**: AI services (messages, suggestions, quick-edits) and integrations (GitHub) are managed as **Convex Actions**. These are triggered directly via WebSocket for low-latency, real-time streaming and bidirectional state synchronization.
- **`api/settings`**: Dynamic settings retrieval for AI provider configurations.

## Key Patterns

- **Convex Actions**: Core AI-driven operations (reasoning, streaming, file management) are now orchestrated via **Convex Actions** over WebSocket, replacing the previous HTTP-based polling model.
- **Auth Protection**: Routes are protected by Clerk Middleware.
- **Persistence**: Backend interactions are performed through Convex mutations and queries triggered from the frontend.

---
*Navigating the IDEON experience.*
