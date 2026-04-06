# Trace Viewer UI Implementation Plan

## Purpose

This plan covers Phase 9 of the Cloud Arena simulator work: a minimal read-only UI for viewing a single simulation trace.

The goal is not to build the full battle sandbox yet.

The goal is to:

- load one existing trace artifact
- step through the trace
- visualize the important state clearly
- reuse the current web app structure

## Primary Goal

Build a first trace viewer page in `apps/cloud-arcanum-web/` that can display one `SimulationTrace` from `src/cloud-arena/`.

The first version should help answer:

- what happened on each turn
- which action was chosen
- why the heuristic chose it
- what the player, enemy, hand, and battlefield looked like at that step

## Scope

The first viewer should support:

- one hardcoded or locally imported trace
- step-by-step navigation
- current step indicator
- action reason display
- event log display
- player state panel
- enemy state panel
- battlefield panel
- hand snapshot if available in the derived view state

The first viewer should not support:

- editing battle state
- issuing actions
- live simulation in-browser
- multiple traces at once
- persistence
- trace uploads
- Codex or LLM interaction

## Recommended Placement

Use the existing web app:

- route under `apps/cloud-arcanum-web/src/routes/`
- shared viewer components under `apps/cloud-arcanum-web/src/components/`
- trace-specific helpers under `apps/cloud-arcanum-web/src/lib/`

Recommended first route:

- `/cloud-arena/trace-viewer`

Recommended files:

- `apps/cloud-arcanum-web/src/routes/cloud-arena-trace-viewer-page.tsx`
- `apps/cloud-arcanum-web/src/components/cloud-arena-trace-viewer.tsx`
- `apps/cloud-arcanum-web/src/components/cloud-arena-trace-panels.tsx`
- `apps/cloud-arcanum-web/src/lib/cloud-arena-trace-view-model.ts`
- `apps/cloud-arcanum-web/src/lib/cloud-arena-sample-trace.ts`

## Architecture

### Input

The viewer should accept a `SimulationTrace`.

For the first version, the trace can come from:

1. a checked-in sample trace object
2. a generated TS module copied from a successful simulation run

This avoids introducing file upload or API work too early.

### Derived View Model

The viewer should not render raw trace JSON directly.

Instead, derive a viewer state model per step:

- current turn number
- current action
- current action reason
- current event index
- player summary
- enemy summary
- battlefield slots
- visible log up to current step

Recommended helper:

- `buildTraceStepViewModels(trace): TraceStepViewModel[]`

Each step model should represent one actionable moment in the trace timeline.

### Navigation Model

The viewer should support:

- first
- previous
- next
- last

Optional nice first addition:

- keyboard support for left/right arrows

## UI Layout

Use the existing `PageLayout` and `AppShell`.

Recommended page structure:

1. Header
- trace name / scenario label
- seed
- winner
- final turn count

2. Timeline controls
- step index
- action label
- action reason
- previous / next buttons

3. Main state grid
- player panel
- enemy panel
- battlefield panel
- hand panel

4. Event log panel
- show events up to the current step
- highlight the current action/event cluster

5. Trace metadata panel
- scenario
- agent name
- max steps

## Visual Priorities

Keep the first version clear and information-dense.

The viewer should make these easy to scan:

- current hp/block/energy
- enemy intent
- battlefield slots
- selected action reason
- recent log entries

Recommended first panel contents:

### Player Panel

- health / max health
- block
- energy
- hand count
- discard count
- graveyard count

### Enemy Panel

- name
- health / max health
- block
- current intent

### Battlefield Panel

For each slot:

- empty or occupied
- permanent name / id
- health
- block
- acted this turn
- defending

### Hand Panel

For the first version, if exact hand snapshots are not reconstructed yet:

- show current hand count
- optionally show the action history card context

If hand reconstruction is practical from the trace:

- show card names in hand for the current step

## Data Strategy

There are two reasonable paths:

### Path A: Replay from Trace

Build a reducer-like viewer reconstruction function that walks the trace and derives state snapshots for each step.

Pros:

- uses the trace artifact directly
- best long-term viewer foundation

Cons:

- more implementation work up front

### Path B: Use Final Summary + Log + Action History Only

Render a simpler timeline-focused UI first and defer full per-step state reconstruction.

Pros:

- very fast first UI

Cons:

- weaker battlefield/hand snapshots

Recommendation:

Start with a light replay helper.

Use the existing `BattleEvent` stream plus `SimulationActionRecord[]` to derive per-step snapshots.

## Suggested Implementation Phases

### Phase 9A: Viewer Scaffolding

- add new route to `apps/cloud-arcanum-web/src/routes/index.tsx`
- add nav item in `apps/cloud-arcanum-web/src/components/app-shell.tsx`
- render a simple page with a hardcoded sample trace

### Phase 9B: Step Controls

- add `currentStepIndex` state
- add previous/next/first/last controls
- display current action and reason

### Phase 9C: Derived Step View Model

- implement `buildTraceStepViewModels(trace)`
- derive step snapshots from trace events
- render player, enemy, battlefield, and log views

### Phase 9D: Better Trace Presentation

- group event log by turn
- highlight current step
- add compact labels for cards and permanents

## Testing

Add focused UI-safe tests where practical for:

- trace step model generation
- navigation bounds
- current-step action reason display
- battlefield slot rendering from a sample trace

Recommended first test file:

- `tests/cloud-arena/trace-view-model.test.ts`

## Guardrails

- keep the viewer read-only
- do not move combat logic into React
- do not rebuild the combat engine in the UI
- do not block on uploads or persistence
- do not add action execution from the viewer yet

## Definition Of Done

Phase 9 is done when:

- one route in the web app renders a sample Cloud Arena trace
- the user can step forward and backward through the trace
- the current action and heuristic reason are visible
- player, enemy, battlefield, and log are visible
- the UI remains read-only

## Suggested Build Order

1. Add route and sample trace module
2. Add step navigation
3. Add trace step view-model builder
4. Render player/enemy/battlefield/log panels
5. Add lightweight tests for step derivation
