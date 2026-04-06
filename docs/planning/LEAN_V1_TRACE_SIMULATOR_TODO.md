# Lean V1 Trace Simulator TODO

## Purpose

This TODO list covers the next phase after the Lean V1 combat engine: using `src/cloud-arena/` to run deterministic simulated battles and produce useful trace output for design iteration.

This phase should stay narrow.

The goal is not to build the full battle app yet. The goal is to turn the current engine into a usable simulation tool.

## Core Goal

Build a first simulator loop that:

- creates a battle from a seed
- chooses actions with a simple heuristic policy
- runs to win or loss
- records chosen actions
- emits a summary and trace artifact

## Phase 1: Runner Skeleton

- [x] Add a small simulation runner module under `src/cloud-arena/`
- [x] Define a `runSimulation(...)` entry point
- [ ] Accept:
  - [x] player deck
  - [x] enemy definition
  - [x] seed
  - [x] agent
- [x] Loop until battle ends
- [ ] Return:
  - [x] final battle state
  - [x] action history
  - [x] battle summary
  - [x] battle log

## Phase 2: Agent Interface

- [x] Add a small agent interface like `chooseAction(state, legalActions)`
- [x] Keep the interface engine-owned and deterministic
- [x] Add a first `heuristic` agent
- [x] Keep agent decisions simple and explicit

Recommended heuristic priorities:

- [x] if lethal is available, take it
- [x] if incoming attack is high and defend is available, prefer defense
- [x] if a permanent card can be played early, prefer playing it
- [x] otherwise spend energy efficiently
- [x] otherwise end turn

## Phase 3: Structured Trace Output

- [x] Define a simulation result shape
- [ ] Include:
  - [x] seed
  - [x] chosen actions
  - [x] final summary
  - [x] final result: win or loss
  - [x] final turn count
  - [x] engine battle log
- [x] Add a JSON-friendly output format
- [x] Keep the trace easy to inspect manually

## Phase 4: Script Entry Point

- [x] Add a script such as `scripts/run-cloud-arena-simulation.ts`
- [x] Add a package command for running one simulation locally
- [ ] Print:
  - [x] final outcome
  - [x] turns survived or turns to win
  - [x] summary snapshot
  - [x] chosen action list
  - [x] readable battle log
  - [x] structured trace JSON

## Phase 5: Repeated Simulations

- [x] Add a lightweight batch mode
- [x] Run the same battle across multiple seeds
- [ ] Aggregate:
  - [x] wins
  - [x] losses
  - [x] average turns
  - [x] average remaining player health
  - [x] average remaining enemy health on losses
- [x] Keep this phase heuristic-only for now

## Phase 6: Scenario Coverage

- [x] Add more seed-sensitive scenarios
- [x] Add slightly larger decks
- [x] Add mixed `attack` / `defend` / `guardian` decks
- [x] Add enemies with longer intent cycles
- [x] Add enough deck churn that reshuffles matter regularly
- [ ] Add scenario presets for:
  - [x] attack-heavy deck
  - [x] defense-heavy deck
  - [x] mixed permanent deck
  - [x] long attrition battle

## Phase 7: Heuristic V2

- [x] Spend energy more intentionally
- [x] Value permanent `attack` vs `defend` based on board state
- [x] Consider enemy block before choosing damage lines
- [x] Avoid over-defending when lethal pressure is low
- [x] Record a short decision reason for each chosen action
- [x] Include heuristic reasoning in trace output

## Phase 8: Richer Batch Metrics

- [x] Add richer batch metrics
- [ ] Aggregate:
  - [x] average surviving permanents
  - [x] average damage taken
  - [x] average unused energy per turn
  - [x] dead turns where no meaningful action happened
- [x] Keep at least one sample win trace and one sample loss trace easy to inspect

## Phase 9: Minimal Trace Viewer UI

- [x] Start a minimal trace viewer UI
- [x] Feed it one saved trace/result
- [x] Step through actions and events
- [ ] Visualize:
  - [x] player state
  - [x] enemy state
  - [x] hand
  - [x] battlefield
- [x] battle log
- [x] Keep the first viewer read-only
- [x] Reuse the same trace shape produced by the simulator

Implementation reference:

- `TRACE_VIEWER_UI_IMPLEMENTATION_PLAN.md`

## Testing

- [x] Add at least one deterministic simulation test
- [x] Verify the same seed produces the same action sequence
- [x] Verify the same seed produces the same result
- [x] Verify the heuristic agent never chooses an illegal action
- [x] Verify simulation exits cleanly on finished battle states

## Guardrails

- [ ] Do not add LLM or Codex action selection yet
- [ ] Do not expand combat mechanics yet
- [ ] Do not add multiple enemies yet
- [ ] Do not add batch balancing dashboards yet
- [ ] Do not let the viewer own combat rules

## Definition Of Done

This phase is done when:

- [x] one seeded simulation can run end to end
- [x] it produces a readable result
- [x] it produces a structured artifact
- [x] the agent only chooses legal actions
- [x] repeated runs are deterministic per seed
- [x] batch mode can produce simple aggregate numbers

## Next Definition Of Done

The next phase is done when:

- [ ] multiple scenario presets produce meaningfully different outcomes across seeds
- [x] the heuristic records explainable decision reasons
- [x] batch mode exposes higher-signal balancing metrics
- [x] one trace can be loaded into a minimal step-through viewer

## Suggested Order

1. Add stronger scenario presets
2. Improve heuristic scoring and reasoning output
3. Expand batch metrics
4. Build minimal trace viewer UI
