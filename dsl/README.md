# AI IDE Domain Specific Language (DSL)

This package contains the core engine for IDEON's custom Domain Specific Language. This DSL is designed to allow the AI to perform complex, multi-step operations (like project scaffolding, file transformations, and system configurations) in a safe, structured, and reproducible manner.

## Overview

The DSL provides a full compilation and execution pipeline:

1.  **Tokenizer**: Breaks the source string into a stream of tokens.
2.  **Parser**: Converts the token stream into an Abstract Syntax Tree (AST).
3.  **Analyzer**: Performs semantic analysis on the AST to ensure safety and correctness.
4.  **Generator**: Compiles the AST into a lightweight bytecode format.
5.  **Executor**: A virtual machine that executes the bytecode against a provided `Runtime` (e.g., the WebContainer filesystem).

## Why a DSL?

Using a custom DSL instead of raw shell scripts or JavaScript for AI operations provides several benefits:

- **Safety**: The execution environment is strictly controlled.
- **Observability**: Every step of the compilation and execution process can be debugged and logged.
- **Portability**: The same instructions can be executed across different runtimes (WebContainer, local FS, etc.).
- **Optimized for LLMs**: The syntax is designed to be easily generated and understood by Large Language Models.

## Usage

```typescript
import { compile } from './dsl/src/index';

const source = `
  create_folder("src/components");
  create_file("src/index.ts", "console.log('Hello World');");
`;

const runtime = {
  // Implementation of the target filesystem/environment
};

await compile(source, runtime);
```

## Directory Structure

- `src/tokenizer`: Lexical analysis logic.
- `src/parser`: Grammar definition and AST generation.
- `src/analyzer`: Static analysis and validation rules.
- `src/generator`: Bytecode compilation.
- `src/executor`: The virtual machine/runtime handler.
- `types/`: Shared TypeScript definitions for the AST, Bytecode, and Runtime.
- `tests/`: Test suite for individual compiler phases.

## Development

To run the tests for the DSL:

```bash
cd dsl
npm install
npm test
```

---
*Powering AI-driven infrastructure at IDEON.*
