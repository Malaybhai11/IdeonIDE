# React Hooks Registry

This directory contains global React hooks used for common application logic, such as responsive design, state management, and interaction with various APIs.

## Global Hooks

### `use-mobile.ts`
Detects whether the application is running on a mobile device based on a configurable breakpoint (default: 1024px). Useful for adjusting layouts and preventing certain rich interactions on smaller screens.

## Feature-Specific Hooks

To maintain domain isolation, most hooks are located within their respective feature folders in `src/features/`. Key feature hooks include:

- **[Editor Hooks](/src/features/editor/hooks)**: Manages CodeMirror state, real-time code synchronization, and AI suggestions.
- **[Conversation Hooks](/src/features/conversations/hooks)**: Manages AI message streaming and history context.
- **[Project Hooks](/src/features/projects/hooks)**: Handles project-specific logic like file tree traversal and metadata updates.
- **[Preview Hooks](/src/features/preview/hooks)**: Manages WebContainer instance lifecycle and terminal interactions.

## Coding Patterns

- **Custom Hooks over Context**: We prefer using custom hooks for logic that can be isolated, only falling back to React Context when state needs to be shared across deeply nested components.
- **Convex Query/Mutation Wrappers**: We often wrap raw Convex calls in custom hooks to provide additional logic like optimistic updates and error handling.
- **Side Effect Control**: Hooks are the primary place for `useEffect` and interaction with browser APIs (e.g., local storage, resize observers).

---
*Elevating React logic with custom hooks.*
