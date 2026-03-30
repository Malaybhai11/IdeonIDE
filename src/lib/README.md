# Utilities & Integrations Registry

This directory contains the shared utility functions and external service integrations that support the IDEON frontend.

## Key Files

### `convex-client.ts`
The primary entry point for the Convex client. It initializes the `ConvexReactClient` and provides the necessary configuration to connect to the backend from the browser.

### `firecrawl.ts`
Implementation of the [Firecrawl](https://firecrawl.dev) integration. This is used by the AI engine to crawl and ingest documentation from live websites, providing the model with up-to-date information for code generation and project assistance.

### `utils.ts`
A collection of small, reusable utility functions used throughout the application.
- **`cn`**: A standard helper for conditionally joining Tailwind CSS classes using `clsx` and `tailwind-merge`.

## Patterns

- **Minimalistic Logic**: We keep this folder lean. If a piece of logic is complex and domain-specific, it should live in its respective feature folder.
- **Service Isolation**: Each external service integration (like Firecrawl) should have its own dedicated file within this directory to ensure clean separation of concerns.
- **Consistency**: All utilities are designed to be used identically across the entire codebase to maintain consistency and reduce developer friction.

---
*The building blocks of our shared patterns.*
