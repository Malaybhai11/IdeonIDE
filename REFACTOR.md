# Architectural Refactor 

_Optimizing Communication via WebSocket Protocol_

## Technical Analysis

### Latency in HTTP-Based Orchestration

The IDE's current integration with **Inngest** for core operations (AI reasoning, repository synchronization, and filesystem management) creates a performance bottleneck categorized as "Proxy-Based Polling."

### The Inngest Execution Cycle

Inngest's serverless orchestration relies on an **event-driven HTTP-callback** model. Every operation follows a multi-hop lifecycle:

1.  **State Synchronization:** 
    - For every `step.run`, `step.sleep`, or `step.waitForEvent`, the scheduler initiates an inbound HTTP request to the application's `/api/inngest` endpoint.

2.  **The N+1 Network Hop Problem:** 
    - A complex AI task involving multiple tool calls results in a serialized chain of 12-15 discrete HTTP round-trips.
    - This architectural overhead prevents the low-latency response times required for a modern IDE.

### Middleware Interception Tax (`src/proxy.ts`)

Within the Next.js App Router, every inbound Inngest synchronization request is intercepted by the Clerk-based middleware:

1. **Cumulative Overhead:** 
    - Each synchronization heartbeat incurs the cost of TLS termination, header parsing, and session validation.

2. **Resource Contention:**
    - At ~15-30ms per interception, a single multi-step AI workflow can lose over 500ms solely to middleware processing, independent of actual LLM execution or database latency.

3. **Connection Statelessness:** 
    - The lack of a persistent connection forces the application to repeatedly re-instantiate state via `ConvexHttpClient` over HTTP, compounding the total request time.

---

## Strategic WebSocket Orchestration

To achieve a high-performance developer experience, we will consolidate the orchestration layer into **Convex Actions**, leveraging the existing **Convex WebSocket (WSS)** protocol.

### Persistent Bidirectional Execution

By migrating to Convex's native execution environment, we utilize a single, pre-established WebSocket connection (`ConvexReactClient`):

1. **Middleware Bypass:** 
    - WebSocket triggers bypass the Next.js Middleware layer entirely, eliminating the per-step interception tax.

2. **Connection Persistence:** 
    - Actions maintain a "hot" state during execution, removing the need for repeated HTTP-based database lookups.

### Real-Time State Reactivity

The transition from HTTP polling to WebSocket-based state management enables:

1.  **Atomic Stream Updates:** 
    - Character-by-character LLM streaming and file status updates are pushed via `ctx.runMutation` directly through the active socket.

2.  **Sub-Millisecond Sync:** 
    - Frontend reactivity is decoupled from HTTP request-response cycles, ensuring UI updates are reflected as fast as the backend can commit them.

---

## Execution Roadmap

### Phase 1: Orchestration Migration
Re-implement core logic from `src/features/*/inngest/` as stateless Convex Actions. This includes porting the LLM reasoning loops and GitHub integration logic.

### Phase 2: Reactivity Layer
Implement character-level streaming and token usage tracking using internal Convex mutations within the newly created Actions, ensuring the `messages` and `projects` tables are updated in real-time.

### Phase 3: Infrastructure Deprecation
Decommission the `/api/inngest` endpoint and the associated Inngest feature modules. All AI and project management triggers will transition to the unified WebSocket interface, fully eliminating the "proxy-based polling" architecture.
