# Cloud Arcanum / Cloud Arena Separation TODO

This checklist tracks the work required to separate Cloud Arcanum deckbuilding and card display from Cloud Arena game simulation.

The boundary assumptions for this work live in [CLOUD_ARCANUM_ARENA_SEPARATION_BOUNDARY.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/CLOUD_ARCANUM_ARENA_SEPARATION_BOUNDARY.md).

## 1. Lock The Boundary

- [x] Write a product-boundary document for Cloud Arcanum vs Cloud Arena.
- [x] Decide that Cloud Arena keeps its own runtime card definitions rather than consuming canonical Arcanum card data.
- [x] Move forward with a monorepo-first split and re-evaluate repo extraction later.
- [x] Define and enforce the minimal shared surface.

## 2. Untangle Shared Types And Contracts

- [x] Split `src/cloud-arcanum/api-contract.ts` into Arcanum-owned and Arena-owned contracts.
- [x] Remove Cloud Arena imports from Arcanum contract modules.
- [x] Move Arena path builders and session request/response types into Arena-owned files.
- [x] Update all imports in apps and tests.
- [x] Add an initial guardrail so Arcanum modules do not import Arena modules accidentally.

## 3. Separate Backend Apps

- [x] Keep `apps/cloud-arcanum-api` focused on catalog and validation behavior.
- [x] Create `apps/cloud-arena-api`.
- [x] Move Arena session routes into the Arena API app.
- [x] Move Arena session services into the Arena API app.
- [x] Remove Arena route registration from the Arcanum API app.
- [x] Give each API app its own route and service composition boundary.

## 4. Separate Frontend Apps

- [x] Keep `apps/cloud-arcanum-web` focused on cards, decks, sets, universes, and deckbuilding.
- [x] Create `apps/cloud-arena-web`.
- [x] Move Arena routes out of the Arcanum router.
- [x] Move Arena navigation out of the Arcanum app shell.
- [x] Move Arena pages, Arena components, and Arena libs into the Arena web app.
- [x] Give each web app its own router, shell, and API client surface.

## 5. Clean Up Cross-Domain UI Coupling

- [x] Remove Arena engine imports from generic Arcanum card-display code.
- [x] Move Arena-specific display variants into Arena-owned files.
- [x] Split generic card rendering from battle rendering.
- [x] Audit Arcanum web libs for Arena imports.
- [x] Audit Arcanum components for Arena-owned behavior.

## 6. Clarify Shared Core Modules

- [x] Keep `src/domain/**` as the canonical shared schema layer if both games still need it.
- [x] Make `src/cloud-arcanum/**` Arcanum-owned only.
- [x] Make `src/cloud-arena/**` Arena-owned only.
- [x] Keep `src/shared/**` absent unless a truly domain-neutral need appears.
- [x] Document allowed dependency directions.

## 7. Reorganize Scripts And Commands

- [x] Replace combined dev assumptions with per-game commands.
- [x] Add separate API and web dev commands for both games.
- [x] Keep combined commands optional.
- [x] Split build targets where practical.
- [x] Split simulation/demo scripts from catalog/content scripts.

## 8. Separate Tests

- [x] Group Arcanum tests under Arcanum ownership.
- [x] Keep Arena engine and session tests under Arena ownership.
- [x] Ensure Arcanum tests do not import Arena modules unless intentionally integration-level.
- [x] Ensure Arena tests do not depend on Arcanum browsing routes.
- [x] Add boundary checks for forbidden imports.

## 9. Separate Docs

- [x] Split mixed docs into Arcanum-specific vs Arena-specific planning where useful.
- [x] Add per-product architecture docs.
- [x] Add AI-navigation docs for each game.
- [x] Update the root README to describe the new product split.

## 10. Separate Data And Assets Strategy

- [x] Confirm Arcanum ownership of canonical card/deck/set/universe data.
- [x] Decide that Arena owns its own runtime cards and gameplay content.
- [x] Defer Arcanum's read-only Arena viewer layer as a future integration decision.
- [x] Decide how Arena should handle art and visual assets.
- [x] Document any shared read-only asset usage.

## 11. Improve AI-Friendly Repo Boundaries

- [x] Add small folder-level READMEs where ownership is not obvious.
- [x] Add boundary notes or lint rules for forbidden imports.
- [x] Prefer product-local API clients and view models over mixed abstractions where we have already split the surface.
- [x] Split the current web API client surface so Arena routes can use an Arena-specific client.
- [x] Reduce top-level ambiguity so each task has a smaller working set.

## 12. Final Extraction Prep

- [x] Re-evaluate whether either game should move into its own repo.
- [x] Identify what would need to be copied, vendored, or published before extraction.
- [x] Remove any remaining accidental cross-product imports.
- [x] Verify each game can run independently.
