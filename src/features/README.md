# Features Registry

This directory contains the core domain logic of IDEON, organized into feature-specific modules. This modular structure ensures that each major part of the IDE is isolated, testable, and reusable.

## Feature Modules

### [Auth](auth/)
Handles user authentication and identity management using **Clerk**.
- Middleware for route protection.
- Identity sync with the Convex backend.
- Managed user profiles and GitHub OAuth integration.

### [Editor](editor/)
The heart of IDEON, powered by **CodeMirror 6**.
- **Syntax Highlighting**: Support for multiple languages (JS, TS, Python, etc.).
- **Extensions**: Custom extensions for AI suggestions, bracket matching, and line numbers.
- **State Management**: Real-time synchronization of editor state with the backend.

### [Conversations](conversations/)
The AI assistant's chat interface and context management.
- **Message Streams**: Handles real-time streaming of AI responses.
- **Context Injection**: Automatically provides relevant code context to the AI model.
- **History Management**: Syncs conversation history across sessions.

### [Preview](preview/)
Enables in-browser code execution using the **WebContainer API**.
- **Terminal Integration**: `xterm.js` for interacting with the sandbox environment.
- **Live Preview**: Real-time viewing of web applications as they run inside the browser.
- **Package Management**: Handles `npm install` and other dependency operations.

### [Projects](projects/)
Comprehensive project and file management system.
- **Dashboard**: User interface for creating, viewing, and managing projects.
- **File Explorer**: Advanced file tree view with support for CRUD operations on files and folders.
- **Settings**: Configuration for project-specific build and dev commands.

## Philosophy

- **Domain Isolation**: Each feature is mostly self-contained, with clear entry points.
- **Hook-first Logic**: Features often expose custom hooks for components to interact with their logic.
- **Convex Integration**: Backend interaction for each feature is typically handled via specific mutations/queries defined in the `convex/` directory.

---
*Building the foundational features of a modern IDE.*
