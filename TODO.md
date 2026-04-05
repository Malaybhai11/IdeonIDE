# IDEON TODO

## AI & Agentic Workflows

- [ ] **Agentic AI Feature Enhancement**
  - Implement a more robust agentic loop for complex task handling.
  - Refactor system prompts to support multi-step reasoning and tool orchestration.
  - Transition model instructions to use structured output with special XML tags:
    - `<thought>`: For internal reasoning, planning, and chain-of-thought processing.
    - `<response>`: For the final output delivered to the user.
    - **Constraint**: Tool calls must only be valid and parsed when they appear within the `<response>` tag.
  - [ ] **LLM Output Parsing**
    - Implement a parser to separate `<thought>` and `<response>` blocks from the raw LLM stream.
