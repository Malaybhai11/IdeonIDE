# IDEON - Open Source AI IDE

IDEON is an experimental, fully-featured cloud IDE built from the ground up by two passionate college students. Our goal is to create a high-performance, accessible alternative to tools like Cursor AI, focusing on real-time collaboration and seamless AI integration.

IDEON leverages modern web technologies to provide a smooth, VSCode-like experience entirely in the browser.

## Key Features

- **Real-time Collaborative Editing:** Multi-user synchronization for seamless pair programming.
- **AI-Powered Workflows:** Smart code suggestions and natural language editing (Cmd+K).
- **Assistant Chat:** Full context-aware AI assistant integrated directly into the workspace.
- **In-browser Execution:** Secure code execution and preview using WebContainer technology.
- **Project Management:** Robust file system management and cloud persistence.
- **Modern UI:** A premium, dark-themed experience built with shadcn/ui and CodeMirror 6.

## Tech Stack

| Category      | Technologies                                                  |
| ------------- | ------------------------------------------------------------- |
| **Frontend**  | Next.js 16, React 19, TypeScript, Tailwind CSS 4              |
| **Editor**    | CodeMirror 6, custom extensions, One Dark Theme               |
| **Backend**   | Convex (Real-time DB & Actions)              |
| **AI**        | Claude Sonnet 4 / Gemini 2.0 Flash Integration               |
| **Auth**      | Clerk (GitHub OAuth)                                          |
| **Execution** | WebContainer API, xterm.js                                    |
| **Monitoring**| Sentry (Error & Performance Tracking)                        |

## Getting Started

### Prerequisites

- Node.js 20.09+
- npm or pnpm
- API keys for Clerk, Convex, and internal AI providers.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Malaybhai11/IdeonIDE.git
   cd IdeonIDE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *Fill in the required keys for Clerk, Convex, and your chosen AI provider.*

4. Launch the Development Environment:
   ```bash
   npm run dev:all
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Architecture & Project Structure

Explore the dedicated READMEs in each major directory for technical deep dives:

- [`/convex`](/convex/README.md) - Real-time database schema, backend serverless logic, and AI Actions.
- [`/src/app`](/src/app/README.md) - Routing structure and AI-driven API endpoints.
- [`/src/features`](/src/features/README.md) - Domain-specific modules (Editor, AI, Auth).
- [`/src/components`](/src/components/README.md) - Shared UI library and styling patterns.
- [`/dsl`](/dsl/README.md) - The project's internal Domain Specific Language for AI operations.

## Roadmap

- [ ] AI Agent file-system modification capabilities.
- [ ] Advanced message cancellation and history management.
- [ ] Integrated GitHub import/export workflow.
- [ ] AI-assisted project scaffolding.

## Built with ❤️ by Two College Students

This project is a labor of love. We're building IDEON to learn, experiment, and provide an open-source alternative for the developer community. Contributions are more than welcome!

---

*For any bugs or feature requests, please open an issue or submit a pull request.*
