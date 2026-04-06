# Interactive Cloud Arena TODO

## Purpose

Turn the existing Cloud Arena dashboard from a read-only pre-run trace viewer into a two-mode experience:

- `replay` mode for stepping through a finished battle trace
- `interactive` mode for viewing the current game state, showing legal actions, executing moves, and rendering the updated board

This document captures the implementation work needed to get there in a staged, testable way.

## Current State

The repo already has:

- a shared battle engine under `src/cloud-arena/`
- deterministic simulation and trace generation
- a read-only trace viewer route in `apps/cloud-arcanum-web/`
- local replay reconstruction logic for trace steps

The repo does not yet have:

- a live battle session concept
- API endpoints for creating or mutating battle sessions
- a shared battle snapshot/view model used by both replay and interactive mode
- a UI flow for selecting and executing legal actions

## Product Goal

Support two distinct but related modes:

### Replay Mode

- input is a finished trace
- user can step forward and backward through the battle
- no state mutation
- optimized for understanding what happened and why

### Interactive Mode

- input is a live battle session
- user can inspect the current board state
- user can see currently legal actions
- user can execute one action at a time
- engine resolves the action and returns the next state
- optimized for battle sandbox playtesting and design iteration

## Recommended Architecture

Use a shared rendering model with two different controllers:

- replay controller: trace-driven, read-only, step navigation
- interactive controller: session-driven, fetch/apply/reset flow

Use an API-owned battle session for interactive mode, even if the first version is only in-memory and local to the dev server.

Why this is the preferred direction:

- legal actions stay authoritative on the engine side
- action validation remains server-side
- future persistence is easier
- replay export becomes straightforward
- the web app avoids owning mutation logic directly

## Workstreams

## 1. Shared Domain and View Model

- Define a shared `BattleViewModel` or similarly named UI snapshot shape.
- Include:
  - turn number
  - phase
  - player summary
  - enemy summary
  - battlefield slots
  - blocking queue
  - hand contents
  - pile counts or pile contents as needed
  - legal actions
  - recent events or visible log
  - session metadata
- Decide whether replay and interactive mode use the exact same top-level shape or share a common base plus mode-specific fields.
- Add explicit serialization helpers so the API and UI are not coupled directly to raw internal engine state.
- Keep the current trace viewer reconstruction logic, but adapt it to emit the shared view model instead of a replay-only shape.

## 2. Replay Mode Refactor

- Keep replay mode trace-based and read-only.
- Refactor the existing trace viewer into:
  - board/state presentation components
  - replay navigation controls
  - trace-specific controller logic
- Preserve:
  - first/previous/next/last navigation
  - keyboard navigation
  - current action reason
  - event log grouping
- Replace any replay-only board rendering assumptions with the shared board renderer.
- Make replay mode a stable baseline before adding live session complexity.

## 3. Interactive Session Model

- Introduce a battle session concept for live play.
- Define a session record with:
  - session id
  - scenario/setup config
  - seed
  - current battle state
  - action history
  - visible log or recent log window
  - creation timestamp
  - reset source config
- Decide whether reset means:
  - reset to original seed and setup
  - or re-roll a fresh shuffled seed
- Start with in-memory storage on the API server.
- Make sure the session model can later be swapped to filesystem or database persistence without changing the web contract.

## 4. Engine Service Layer

- Add a small service layer between API handlers and `src/cloud-arena/` engine functions.
- Service responsibilities:
  - create a new battle session from preset input
  - return the latest session snapshot
  - compute legal actions from current state
  - validate submitted action
  - apply action
  - package the next response snapshot
  - reset a session
- Ensure the service does not leak raw mutable engine state outside the server boundary.
- Confirm illegal actions produce a clean, structured API error.

## 5. API Contract and Routes

- Extend `src/cloud-arcanum/api-contract.ts` with Cloud Arena session routes.
- Add routes for:
  - create session
  - get session
  - apply action
  - reset session
- Consider whether a separate route is useful for:
  - listing scenario presets
  - fetching replay artifacts from sessions
- Define request/response payloads for:
  - session setup input
  - session snapshot output
  - submitted action
  - action result
- Decide whether the action response returns:
  - the full latest snapshot
  - or a delta plus snapshot metadata
- Recommendation:
  - return the full latest snapshot for MVP simplicity

## 6. Interactive UI Flow

- Add a dedicated interactive Cloud Arena route.
- Build a setup entry flow for:
  - scenario selection
  - deck selection
  - seed override
  - optional starting health override if desired
- Keep the first version narrow:
  - one preset scenario is acceptable for MVP
- After session creation, render the live battle board.
- Show:
  - player state
  - enemy state
  - battlefield
  - hand
  - legal actions
  - recent events
  - current turn and phase
- Disable controls while an action request is in flight.
- On success, replace the rendered state with the returned snapshot.
- On failure, surface a readable error without losing the current view.

## 7. Action Presentation

- Convert engine legal actions into UI-friendly action items.
- For each legal action, include enough metadata to render readable buttons or controls.
- Examples:
  - play a named card from hand
  - use a permanent to attack
  - use a permanent to defend
  - end turn
- Decide whether the UI needs grouping:
  - hand actions
  - battlefield actions
  - turn control actions
- Add selection/loading affordances so the user can tell which move is resolving.
- Leave room for future richer targeting UI without overengineering the first version.

## 8. Enemy Resolution UX

- Decide how enemy turns should appear in interactive mode.
- Candidate A:
  - player presses `End Turn`
  - entire enemy turn resolves server-side
  - UI receives the next player-action state
- Candidate B:
  - player presses `End Turn`
  - UI steps through enemy sub-events or sub-actions
- Recommendation for MVP:
  - use Candidate A
  - show the resulting event log clearly so the player can still understand what happened
- If later needed, add an event playback layer on top of the session response.

## 9. Shared Board Components

- Extract the current trace viewer board panels into reusable components.
- Reuse them in both:
  - replay mode
  - interactive mode
- Keep the rendering components free of replay-specific step logic.
- Ensure the board renderer can handle:
  - no legal actions
  - finished battle state
  - empty battlefield slots
  - changing hand contents
  - changing enemy intent

## 10. Session History and Replay Export

- Make interactive sessions record enough history to support replay later.
- Decide whether an interactive session should accumulate:
  - full action history
  - full event log
  - periodic snapshots
- Add a conversion path from an interactive session to a replay artifact.
- This can be:
  - a `SimulationTrace`-compatible shape
  - or a new session replay trace type
- Goal:
  - any interactive run should be inspectable later in replay mode

## 11. Error Handling and State Safety

- Protect the engine boundary from malformed client input.
- Return clear API errors for:
  - unknown session
  - illegal action
  - finished battle mutation attempt
  - invalid setup input
- Decide how to handle stale client state if two requests race.
- For MVP, one request at a time per session is acceptable.
- Consider whether snapshots should include a version number for future optimistic concurrency handling.

## 12. Testing

### Engine and Service Tests

- test session creation from preset input
- test legal action generation at session start
- test valid action application
- test illegal action rejection
- test end turn flow and enemy resolution
- test reset behavior
- test finished battle handling

### API Tests

- test create session route
- test get session route
- test apply action route
- test reset route
- test invalid session ids
- test invalid action payloads

### UI Tests

- test interactive board renders a snapshot correctly
- test legal action controls render expected labels
- test clicking an action triggers request and updates state
- test controls disable during in-flight request
- test API error handling path
- test replay mode still renders correctly after shared component refactor

### Parity Tests

- test that a deterministic interactive run can be represented in replay mode
- test that legal actions shown in the UI correspond to engine output

## 13. Suggested Delivery Phases

### Phase 1: Shared UI Foundation

- define shared battle snapshot/view model
- extract reusable board panels from the trace viewer
- refactor replay mode onto the shared renderer

### Phase 2: Live Session Backend

- add in-memory battle session service
- add API contracts and endpoints
- return full session snapshots

### Phase 3: Minimal Interactive Battle Screen

- add interactive route
- support one preset scenario
- show legal actions
- execute actions
- update board state

### Phase 4: Restart, Setup, and Polish

- add reset/restart controls
- add setup form inputs
- improve action labeling and error handling
- improve recent event visibility

### Phase 5: Replay/Interactive Unification

- export live sessions into replay artifacts
- enable replaying a completed interactive run
- tighten parity tests

## 14. Decisions Locked In

- `End Turn` should resolve the full enemy turn immediately.
- MVP interactive mode should open straight into one fixed scenario.
- Restart from the same seed is enough for MVP.
- Interactive mode should show available legal actions only.
- The current simplified action model is sufficient for the first interactive pass.

## 15. Architecture Decision

- Live battle state should be API-owned from the start.
- The first version can use in-memory local sessions on the API server.
- The web app should treat the API as the source of truth for:
  - current battle snapshot
  - legal actions
  - action validation
  - state transitions

## 16. Recommended MVP Answers

Recommended implementation path:

- API-owned in-memory sessions
- full enemy turn resolves on `End Turn`
- one preset interactive scenario first
- restart from same seed instead of undo
- show legal actions only
- keep the current simplified action model for the first playable version

## 17. First Concrete Tasks

- Create a shared battle snapshot type for UI rendering.
- Refactor the existing trace viewer to use shared board components.
- Add a Cloud Arena session service in the API app.
- Extend API contract types with session endpoints and payloads.
- Implement `create session`, `get session`, `apply action`, and `reset session`.
- Add a minimal interactive route in the web app.
- Render legal actions from live session data.
- Wire action submission and state refresh.
- Add service, API, and UI tests for the first end-to-end flow.
