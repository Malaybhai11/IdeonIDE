# Onboarding Wizard Spec

## Goal

Design a first-run onboarding flow that appears after a successful sign-up and
gets a new user to their first meaningful result as fast as possible.

For IDEON, the first meaningful result is:

1. create or import a project
2. ask IDEON to do something
3. see files/code change
4. open the preview or terminal

The onboarding should not try to explain the full product. It should guide the
user to the first win.

## Product Principles

1. Keep the main tour short: 4 to 6 steps maximum.
2. Use spotlight guidance, not full-screen blocking instructions, except for
   the initial welcome choice.
3. Only highlight controls that matter for the first win.
4. Make the target stay clickable through the spotlight hole.
5. Skip steps automatically when the related UI is unavailable.
6. Never replay the full tour once completed unless the user explicitly starts
   it again from a help menu.

## Recommended Flow

The onboarding should be split into two moments.

### Phase 1: Welcome Gate on First Redirect

Trigger:

- user has just signed up or signed in for the first time
- user has not completed onboarding
- user is on the projects page

UI:

- centered welcome modal
- background dimmed
- two primary actions:
  - `Create a new project`
  - `Import from GitHub`
- secondary action:
  - `Skip for now`

Why:

- On the home screen there are only a few controls.
- Starting immediately with a tooltip feels weak.
- A short welcome card creates orientation and lets the user choose intent.

Suggested copy:

- Title: `Build your first project in under 2 minutes`
- Body: `Start from a prompt or import an existing GitHub repo. We’ll guide you
  through the workspace after that.`

Behavior:

- choosing `Create a new project` opens `NewProjectDialog`
- choosing `Import from GitHub` opens `ImportGithubDialog`
- choosing `Skip for now` dismisses the welcome gate but does not mark the full
  workspace tour completed

### Phase 2: Contextual Workspace Tour

Trigger:

- a first project is successfully opened
- onboarding is still incomplete

This phase should use the dark overlay plus circular spotlight that leaves the
target visible and optionally clickable.

## Tour Structure for This App

The current app structure suggests this sequence.

### Step 0: Optional AI Setup

Show only if the user does not have a configured provider key.

Target:

- settings button in the conversation sidebar header

Message:

- `Connect an AI provider first. IDEON uses this to generate files and answer
  prompts.`

Action:

- clicking the highlighted target opens the settings dialog
- after the dialog closes successfully, continue the tour

### Step 1: Prompt Input

Target:

- conversation prompt textarea in the right sidebar

Message:

- `This is the fastest way to use IDEON. Ask for a page, feature, bug fix, or
  refactor in plain English.`

Why first:

- this is the main activation surface
- it directly maps to the product’s value

Behavior:

- spotlight should allow clicks
- tooltip should sit above or left of the input so the send button stays visible

### Step 2: File Explorer

Target:

- left file explorer pane

Message:

- `Everything IDEON creates shows up here. Open files, inspect folders, and
  track what changed.`

Behavior:

- no forced action required
- simple next/previous controls are enough

### Step 3: Editor / Terminal Toggle

Target:

- top workspace tabs: `Code` and `Terminal`

Message:

- `Switch between editing code and running the app. Use Code to inspect files,
  then open Terminal to preview and debug.`

Behavior:

- if possible, this should be one step with a wide spotlight that includes both
  tabs
- if targeting both is hard, split into two smaller steps

### Step 4: Preview / Terminal Controls

Target:

- top bar inside preview view, especially terminal toggle and preview URL area

Message:

- `Run what you build here. Open the terminal for logs, commands, and runtime
  errors.`

Behavior:

- if the user is still on `Code`, the tour should switch to preview before
  showing this step
- do not show this step while the container is still booting unless the loading
  state is itself the point of the step

### Step 5: Export

Target:

- export button/popover in the project workspace header

Message:

- `When you’re ready, export the project to GitHub and continue working there.`

Why last:

- export is not part of the first win
- it matters once the user already understands the build loop

## What Not To Include in the First Tour

Do not include these in the first-run wizard:

- rename project
- project history
- token usage toggle
- account avatar
- advanced preview settings
- keyboard shortcuts

These are secondary features. They belong in later discovery patterns, not the
initial flow.

## Visual Design Rules

### Overlay

- overlay color: near-black with about 70 to 78 percent opacity
- backdrop should feel calm, not harsh
- background should remain visible enough for orientation

Recommended token:

- `rgba(5, 7, 11, 0.74)`

### Spotlight

- shape: circular for icon buttons and compact controls
- shape: rounded rectangle for textareas, tabs, and larger surfaces
- padding around target: `8px` on dense controls, `12px` on primary actions
- spotlight edge: subtle 1px light ring to separate the target from the overlay

### Tooltip Card

- compact, dark, and aligned with existing UI
- max width: `320px`
- title: 14 to 15px medium
- body: 13px muted foreground
- actions:
  - `Back`
  - `Next`
  - `Skip`
- progress should be visible as `2 of 5`, not only dots

### Motion

- fade overlay in quickly: around `160ms`
- move spotlight smoothly between targets: around `180ms` to `220ms`
- tooltip motion should be subtle, not bouncy

## Interaction Rules

1. Only one spotlight target at a time.
2. Allow clicks through the spotlight when the step asks the user to act.
3. Disable accidental dismiss on background click for critical setup steps.
4. Escape should close the wizard only on non-critical steps.
5. When the wizard closes, return focus to the last highlighted control.
6. Tooltip placement must adapt to viewport and avoid covering the target.

## Mobile and Small Screen Rules

On smaller screens, do not keep the desktop tour unchanged.

Use this adaptation:

1. Keep the welcome gate.
2. Reduce the workspace tour to 3 steps:
   - prompt input
   - file explorer or code area
   - preview/terminal
3. Use bottom-sheet style tooltip content on small screens.
4. If a target is offscreen, scroll it into view before showing the step.

## Persistence Rules

Track onboarding state separately from transient UI state.

Suggested states:

- `not_started`
- `welcome_seen`
- `workspace_started`
- `completed`
- `dismissed`

Recommended storage:

1. local storage for immediate control and resilience
2. user-level server persistence if you want the state to follow the user across
   devices

For this codebase:

- quick version: persist in a dedicated zustand store with `persist`
- durable version: add onboarding fields to `userSettings` in Convex

Recommended fields if persisted in Convex:

- `onboardingStatus`
- `onboardingCompletedAt`
- `onboardingDismissedAt`
- `onboardingLastStep`

## Implementation Fit for Current Codebase

The project already includes `react-joyride`, which fits this design.

Recommended usage:

- use `react-joyride` for spotlight, overlay, tooltip positioning, and progress
- set spotlight clicks enabled only on actionable steps
- set the first actionable step with beacon disabled so it opens immediately
- control the current step from app state so the flow can wait for dialogs,
  routing, or preview readiness

Suggested anchor attributes to add:

- projects page:
  - `data-tour="welcome-new-project"`
  - `data-tour="welcome-import-project"`
- workspace:
  - `data-tour="conversation-settings"`
  - `data-tour="conversation-input"`
  - `data-tour="file-explorer"`
  - `data-tour="workspace-tabs"`
  - `data-tour="preview-toolbar"`
  - `data-tour="export-project"`

## Suggested Step Copy

### Welcome modal

- `Create from a prompt or import a repo. We’ll guide you through the editor
  once you’re inside.`

### Prompt input

- `Describe what you want in plain English. IDEON will generate or edit files
  for you.`

### File explorer

- `New files and edits appear here so you can inspect what changed.`

### Code and terminal

- `Use Code to inspect the project and Terminal to run and preview it.`

### Export

- `Ship your work to GitHub when you want to continue outside IDEON.`

## Acceptance Criteria

1. A brand-new user sees the welcome gate once after first auth success.
2. Choosing create/import leads into the actual project flow with no dead end.
3. The workspace tour starts only after the target UI is mounted.
4. The rest of the screen darkens while the target remains visible.
5. Actionable highlighted targets stay clickable.
6. The full tour can be skipped at any point.
7. Completed users do not see the wizard again automatically.
8. Users can relaunch the tour later from a help or profile entry point.

## Recommendation

Do not start by touring every button on the landing page.

Instead:

1. use a welcome gate on the projects page
2. route the user into a project
3. run a short contextual tour around the prompt, files, preview, and export

That sequence matches IDEON’s value much better than a generic tooltip tour.
