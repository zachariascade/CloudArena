# Cloud Arena Architecture

This document is the high-level architecture guide for the Cloud Arena side of the repo.

Cloud Arena is the combat and simulation product.

Replay and trace visualization exist only as legacy scaffolding and should be
treated as a dead end, not a place to build new features.

## Product Responsibility

Cloud Arena owns:

- combat engine rules
- battle state transitions
- scenario presets and enemy behavior
- session creation and action handling
- replay and trace visualization, legacy only
- simulation and batch-run scripts
- Arena-owned card definitions and battle entities

Cloud Arena does not own the MTG-style canonical card catalog, deck files, or content normalization pipeline.

## Main Code Areas

- `apps/cloud-arena-api/`
  - Fastify app for Arena sessions and battle actions
- `apps/cloud-arena-web/`
  - React app for interactive battles and legacy trace viewer UI
- `src/cloud-arena/`
  - Arena engine, rules, scenarios, and Arena-owned contracts
- `src/domain/`
  - small shared schema layer when both products need the same primitives
- `tests/cloud-arena/`
  - Arena-owned test coverage
- `scripts/run-cloud-arena-*.ts`
  - Arena simulation and demo scripts

## Dependency Boundary

Cloud Arena may depend on:

- `src/domain/**`
- Arena-owned apps and modules

Cloud Arena should avoid depending on:

- legacy browsing routes
- legacy content pipelines
- product-specific view models outside Arena

## Runtime Shape

Typical local flow:

- `dev:api` runs the Arena API
- `dev:web` runs the Arena frontend
- `dev` runs both together
- `arena:demo` and `arena:simulate*` run offline Arena behavior scripts

## Key Docs

- [Cloud Arena Engine Knobs Reference](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/arena/ENGINE_KNOBS_REFERENCE.md)
- [Cloud Arena Engine Glossary](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/arena/ENGINE_GLOSSARY.md)
- [Cloud Arena Rules Reference](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/CLOUD_ARENA_RULES_REFERENCE.md)
- [Core Combat Spec](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/CORE_COMBAT_SPEC.md)
- [Trace Based Simulator Design](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/TRACE_BASED_SIMULATOR_DESIGN.md)
- [Trace Viewer UI Implementation Plan](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/TRACE_VIEWER_UI_IMPLEMENTATION_PLAN.md)
- [Interactive Cloud Arena TODO](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/INTERACTIVE_CLOUD_ARENA_TODO.md)
