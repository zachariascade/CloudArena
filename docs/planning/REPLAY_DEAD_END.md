# Replay Dead End

This document marks the current Cloud Arena replay/trace-viewer path as a dead end.

## Intent

The replay feature exists only as legacy scaffolding for the current app state and
trace inspection flow. It should not be extended with new gameplay rules, new
interaction modes, or deeper state reconstruction.

## Guidance

- Do not add new replay-only gameplay behavior.
- Do not widen the replay controller into a second rules engine.
- Do not invest in replay fidelity beyond what is required to keep the existing
  trace viewer from breaking.
- Prefer live-game and combat-engine work over replay work for any new features.

## Allowed Work

- Minimal bug fixes that keep the current trace viewer usable.
- Small compatibility fixes when shared UI components are reused by the live game.
- Deletion or simplification work that reduces the replay surface area.

## Exit Path

The long-term plan is to delete the replay surface after the live interactive
flow no longer depends on it.
