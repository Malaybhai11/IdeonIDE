# Inngest Background Jobs

This directory contains the background job definitions and workflows that power IDEON's asynchronous operations. We use [Inngest](https://inngest.com) to handle long-running tasks, event-driven processes, and complex multi-step workflows.

## Core Concepts

- **Event-Driven**: Functions are triggered by specific events (e.g., `demo/generate`).
- **Step-based Execution**: Workflows are broken down into discrete "steps" that can be retried independently and have built-in state management.
- **Durable Workflows**: Even if the execution is interrupted, Inngest ensures the workflow resumes precisely where it left off.

## Structure

### `client.ts`
Initializes the Inngest client used to send events and register functions.

### `functions.ts`
Contains the implementation of background jobs.
- **`demoGenerate`**: A sophisticated workflow that:
  1. Extracts URLs from a user prompt.
  2. Scrapes the extracted URLs using **Firecrawl**.
  3. Combines the scraped content with the original prompt.
  4. Calls an LLM (Claude) to generate a final, context-aware response.
- **`demoError`**: A utility function used to test error handling and retry logic within the Inngest environment.

## Logic Flows

1. **Trigger**: An event is sent from the frontend or a Convex mutation using `inngest.send()`.
2. **Execution**: The Inngest server receives the event and invokes the corresponding function defined in this directory.
3. **Success/Failure**: The function completes its steps. Failures are automatically retried according to the configured policy.

## Development

To view and debug your background jobs locally, start the Inngest dev server:

```bash
npx inngest-cli@latest dev
```

This will provide you with a local dashboard (usually at `http://localhost:8288`) to inspect events, function runs, and step-by-step logs.

---
*Powering the asynchronous heart of IDEON.*
