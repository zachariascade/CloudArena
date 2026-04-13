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

Status:

- completed for the current replay and interactive UI foundation
- replay and interactive mode now share a common top-level Cloud Arena UI view model plus a shared battle board snapshot
- future work can extend the shared model further without needing to split the renderer again

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

Status:

- completed for the current replay baseline
- replay mode remains trace-driven and read-only
- replay navigation controls, replay controller logic, shared screen view model, and board rendering are now separated more cleanly
- battle log rendering is now reusable instead of being embedded directly in the replay screen

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

Status:

- completed for the current in-memory implementation
- Cloud Arena now has an API-owned session model with session id, scenario id, seed, creation timestamp, reset source config, current battle state, visible log, and action history
- reset currently returns the session to its original scenario and seed
- the model is structured so it can later move from in-memory storage to filesystem or database-backed persistence without changing the web contract

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

Status:

- completed for the current architecture
- the API app now has a dedicated Cloud Arena session service between routes and engine functions
- the service owns session creation, latest snapshot retrieval, legal-action packaging, action validation, action application, snapshot packaging, and reset behavior
- the service is now directly covered by tests in addition to route-level integration coverage

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

Status:

- completed for the current MVP contract
- Cloud Arena session routes, params, request payloads, response payloads, and client path helpers are defined in the shared API contract
- the API app exposes create session, get session, apply action, and reset session routes
- action responses currently return the full latest session snapshot, which is the locked-in MVP direction
- route behavior is covered by API integration tests

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

Status:

- completed for the current narrow MVP flow
- the app has a dedicated interactive Cloud Arena route with automatic session creation into the fixed Mixed Guardian scenario
- the UI includes a lightweight setup flow around seed override, start new battle, and restart from seed
- live battle state, legal actions, recent events, current turn, and current phase are rendered from the latest session snapshot
- controls are disabled while requests are in flight and the current view remains visible while actions resolve
- setup, loading, success, and error states now surface more clearly in the current interactive screen

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

Status:

- completed for the current MVP action model
- engine legal actions are now exposed through shared grouped action data for hand, battlefield, and turn controls
- the interactive battle UI renders those action groups with clearer summaries and turn-control affordances
- loading and disabled states remain visible while requests are in flight
- the UI still leaves room for a richer future targeting flow without overengineering the current action model

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

Status:

- completed for the current MVP direction
- interactive mode uses the recommended server-side full enemy-turn resolution when the player ends their turn
- the UI now explicitly communicates that enemy turns auto-resolve and directs the player to the recent-events feed to review the full exchange
- the current implementation keeps the screen in a single live-state mode instead of stepping through enemy sub-actions individually

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

Status:

- completed for the current board renderer baseline
- the shared battle renderer is now split into reusable Cloud Arena board components instead of keeping all panel markup inside one large component
- replay and interactive mode both continue to use the same shared board rendering path
- the board renderer continues to support empty battlefield slots, changing hand contents, changing enemy intent, no legal actions, and finished-battle states through the shared view model
- rendering components are more cleanly separated from replay-specific controller logic than they were at the start of this workstream

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

Status:

- completed for the current service-level export path
- interactive sessions now accumulate action history and full event log data
- the Cloud Arena session service can export a `SimulationTrace`-compatible replay artifact from a live session
- the export path is implemented at the service layer; a dedicated API route or UI affordance can be added later without changing the underlying session model

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
- Status:
  - completed for MVP
- Done:
  - malformed setup input returns explicit route-level `invalid_request` errors
  - unknown sessions return `not_found`
  - illegal actions return `invalid_request`
  - finished session mutation attempts now fail explicitly instead of falling through as generic illegal actions
- Deferred:
  - snapshot version numbers / optimistic concurrency
  - stronger multi-request race handling beyond the current in-memory one-request-at-a-time expectation

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
- Status:
  - completed for current baseline
- Done:
  - service coverage for session creation, legal action packaging, valid action application, reset behavior, finished battle handling, replay export, and end-turn enemy resolution
  - API coverage for create/get/apply/reset plus invalid session ids, malformed action payloads, invalid setup input, illegal actions, and finished-session mutation attempts
  - renderer-level UI coverage for replay rendering, interactive shell rendering, shared view-model normalization, grouped action presentation, and disabled battle controls
  - parity checks for replay export compatibility and interactive action-group alignment with engine legal actions
- Deferred:
  - browser-level interaction tests for click flows and in-flight disabled states once a DOM test harness is added
  - a full deterministic interactive-run-to-replay UI flow test

## 13. Suggested Delivery Phases

### Phase 1: Shared UI Foundation

- define shared battle snapshot/view model
- extract reusable board panels from the trace viewer
- refactor replay mode onto the shared renderer
- Status:
  - completed
- Delivered:
  - shared battle and screen-level view models now back both replay and interactive modes
  - replay UI now composes shared board components instead of owning a one-off layout
  - the board shell supports the fixed-window battlefield-first layout direction

### Phase 2: Live Session Backend

- add in-memory battle session service
- add API contracts and endpoints
- return full session snapshots
- Status:
  - completed
- Delivered:
  - API-owned in-memory sessions with create/get/apply/reset flows
  - richer session metadata including created time, reset source, and action history
  - replay export path from a live session into a `SimulationTrace`-compatible artifact

### Phase 3: Minimal Interactive Battle Screen

- add interactive route
- support one preset scenario
- show legal actions
- execute actions
- update board state
- Status:
  - completed
- Delivered:
  - interactive Cloud Arena route for the fixed `mixed_guardian` scenario
  - live legal-action presentation for hand, battlefield, and turn controls
  - API-backed action submission with refreshed board snapshots

### Phase 4: Restart, Setup, and Polish

- add reset/restart controls
- add setup form inputs
- improve action labeling and error handling
- improve recent event visibility
- Status:
  - completed for MVP
- Delivered:
  - restart-from-seed and start-new-battle controls
  - seed input for deterministic setup
  - clearer route/service error handling, including finished-session mutation attempts
  - recent-events and full-log presentation in the interactive screen

### Phase 5: Replay/Interactive Unification

- export live sessions into replay artifacts
- enable replaying a completed interactive run
- tighten parity tests
- Status:
  - partially completed
- Delivered:
  - live sessions can already export replay-compatible trace artifacts
  - parity coverage exists for replay export compatibility and interactive legal-action grouping
- Remaining:
  - add an API route or UI affordance to open/export a completed live session directly in replay mode
  - add a fuller end-to-end interactive-run-to-replay flow

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

## 18. Layout Overhaul TODO

Goal:

- fit player state, enemy state, battlefield, and hand on one desktop screen without vertical page scrolling during normal play
- keep cards readable enough to identify at a glance
- keep one selected card fully readable at all times

### Layout Direction

- Move away from rendering every zone as a full-size card stack.
- Use a focus-plus-context layout:
  - enemy summary in a compact top band
  - battlefield as the main visual center
  - player hand as a fixed bottom tray
  - player summary as a compact HUD panel instead of a full card face
  - a persistent card inspector for full readability
- Use different visual densities by zone:
  - player and enemy: summary HUD
  - battlefield: compact tactical cards
  - hand: medium decision cards
  - inspector: full readable card
- Treat the battle UI as a fixed battle viewport instead of a long scrolling document.

### Layout Tasks

- Refactor the current Cloud Arena battle screen into a fixed-height viewport layout for desktop.
- Pin the battle surface into a monitor-aware fixed window so the core play area does not grow into a tall scrolling page.
- Reserve clear screen bands for:
  - top enemy strip
  - center battlefield
  - bottom hand tray
  - optional side inspector
- Ensure the main battle view does not require vertical scrolling during ordinary turns on desktop.
- Prefer internal scrolling only inside secondary regions like logs, drawers, or inspectors when needed.
- Keep mobile and narrow widths functional even if they still collapse into a more stacked layout.

### Player and Enemy Summary Tasks

- Replace the current full-size player and enemy display cards with compact summary panels.
- Keep in those panels:
  - portrait thumbnail or art crop
  - health
  - block
  - energy for the player
  - intent for the enemy
  - short passive or status summary if needed
- Remove or collapse from those panels:
  - long rules text
  - full card footer treatment
  - large empty card-face regions

### Battlefield Tasks

- Make the battlefield the largest visual region on the screen.
- Replace full battlefield card faces with compact tactical card tiles.
- Keep battlefield tiles readable for:
  - name
  - attack and defend actions
  - health and block
  - counters
  - attachments or equipment markers
- Collapse or hide by default:
  - long rules text
  - decorative footer details
  - low-value metadata
- Preserve clear empty-slot rendering so board capacity remains legible.

### Hand Tray Tasks

- Keep the hand visible in a dedicated bottom tray.
- Render hand cards larger than battlefield tiles but smaller than the current full card treatment.
- Make the hand tray horizontally scrollable only as a fallback, not the primary way the layout works.
- Preserve strong playable-state affordances for cards that can currently be used.
- Ensure hand cards are easy to inspect before playing.

### Card Inspector Tasks

- Add a persistent inspector panel or floating detail view.
- Show the currently hovered or selected card in a full readable format.
- Support inspection for:
  - hand cards
  - battlefield permanents
  - player summary
  - enemy summary
- Decide whether hover previews, click-to-pin, or both should be supported.
- Make sure the inspector becomes the primary place for full rules readability.

### Zone and Meta Information Tasks

- Compress discard pile, graveyard, and blocking queue into chips, counters, drawers, or popovers.
- Avoid rendering long comma-separated card-name strings inline across the main battle surface.
- Keep turn, phase, and current action visibility strong without taking battlefield space away.
- Keep recent events visible, but make sure the event log does not dominate the play surface.

### Component Architecture Tasks

- Split the current shared display treatment into distinct presentation modes:
  - summary HUD
  - tactical tile
  - hand card
  - full inspector card
- Avoid using the exact same full card-face layout for every zone.
- Decide whether to extend `DisplayCard` with multiple density modes or introduce separate Cloud Arena-specific presentation components.
- Keep the data mapping shared even if the visual components diverge by zone.

### Interaction Tasks

- Add hover-to-preview for mouse users.
- Add click-to-select and keyboard-focus inspection states.
- Keep action buttons or click targets obvious on compact battlefield tiles.
- Preserve current playable and disabled state styling after the refactor.
- Ensure the user can understand enemy intent and legal actions without opening the inspector.

### Suggested Delivery Order

1. Replace player and enemy full cards with compact HUD panels.
2. Add a persistent inspector panel.
3. Convert battlefield permanents into compact tactical tiles.
4. Resize the hand into a medium-density tray.
5. Compress discard, graveyard, and queue into smaller UI affordances.
6. Tune responsive behavior for laptop and mobile widths.

### Acceptance Criteria

- On a typical desktop or laptop viewport, player, enemy, battlefield, and hand are visible together without vertical page scrolling.
- Battlefield cards remain identifiable without opening the inspector.
- At least one selected or hovered card can always be read in full.
- Enemy intent remains obvious at a glance.
- Playable hand cards and battlefield actions remain easy to discover.
- The layout feels like a battle surface rather than a stack of repeated full card panels.

### Layout Decisions Locked In

- Desktop should include a persistent inspector panel.
- The main Cloud Arena battle UI should live inside a fixed viewport-style window rather than a vertically expanding page.
- Player and enemy should use HUD-like summary panels instead of full card-face layouts.
- The battlefield should be the highest-priority visual region.
- Hand cards should use medium readability in-place, with full readability delegated to the inspector.
- Desktop interaction should support hover previews.
- The inspector should live on the right side on wide desktop layouts.
- Event log and secondary meta panels should be collapsed or reduced instead of occupying major battle-surface space.
- Discard pile, graveyard, and similar zones should use compact chips or icon-plus-count affordances that can expand on demand.
- Cloud Arena should keep one shared data model but use separate presentation modes for summary HUDs, battlefield tiles, hand cards, and inspector cards.
- Battlefield cards should show almost no rules text by default, with at most a short keyword or status line when needed.
- Battlefield presentation should be tactical-first with a small amount of art presence.
- The inspector should remain pinned on wide desktop layouts and collapse into a drawer on smaller laptop widths.
- Mobile and narrow layouts may stack vertically again; the no-scroll requirement is primarily for desktop play.
