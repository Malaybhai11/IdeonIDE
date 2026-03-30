# Shared Components & UI Library

This directory contains the reusable React components and global providers that form the visual foundation of IDEON.

## Directory Structure

- **`ui/`**: A collection of atomic components (Buttons, Inputs, Dialogs, etc.) powered by [shadcn/ui](https://ui.shadcn.com) and styled with Tailwind CSS. These follow a "copy-paste" philosophy for maximum customizability.
- **`ai-elements/`**: Specialized UI components for the AI interaction experience:
  - Chat bubbles and message history views.
  - Suggestion ghost text and tooltips.
  - Quick-edit overlays (Cmd+K).
- **`providers.tsx`**: The global provider wrapper that initializes essential application contexts:
  - Clerk (Authentication)
  - Convex (Real-time Database)
  - Sentry (Error Tracking)
  - ThemeProvider (Dark/Light Mode)
- **`theme-provider.tsx`**: Manages the application's visual theme using `next-themes`.

## Key Patterns

### Styling with Tailwind
We use Tailwind CSS for all styling. Utility classes are combined with standard CSS variables for theme-aware colors and spacing.

### Component Design
- **Atomic-ish Strategy**: Most components are kept small and focused.
- **Composition**: Larger components are built by composing smaller ones from the `ui/` directory.
- **Server vs Client**: Components are marked with `"use client"` where interactivity or context usage is required.

### Icons
We use [Lucide React](https://lucide.dev) for a consistent and high-quality iconography across the entire IDE.

---
*Designing the future of AI-powered development.*
