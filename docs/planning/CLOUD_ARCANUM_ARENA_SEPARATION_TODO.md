# Cloud Arcanum / Cloud Arena Separation TODO

This checklist tracks the work required to separate Cloud Arcanum deckbuilding and card display from Cloud Arena game simulation.

The boundary assumptions for this work live in [CLOUD_ARCANUM_ARENA_SEPARATION_BOUNDARY.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/CLOUD_ARCANUM_ARENA_SEPARATION_BOUNDARY.md).

## 1. Lock The Boundary

- [x] Write a product-boundary document for Cloud Arcanum vs Cloud Arena.
- [x] Decide that Cloud Arena keeps its own runtime card definitions rather than consuming canonical Arcanum card data.
- [x] Move forward with a monorepo-first split and re-evaluate repo extraction later.
- [ ] Define and enforce the minimal shared surface.

## 2. Untangle Shared Types And Contracts

- [x] Split `src/cloud-arcanum/api-contract.ts` into Arcanum-owned and Arena-owned contracts.
- [x] Remove Cloud Arena imports from Arcanum contract modules.
- [x] Move Arena path builders and session request/response types into Arena-owned files.
- [x] Update all imports in apps and tests.
- [ ] Add a guardrail so Arcanum modules do not import Arena modules.

## 3. Separate Backend Apps

- [ ] Keep `apps/cloud-arcanum-api` focused on catalog and validation behavior.
- [ ] Create `apps/cloud-arena-api`.
- [ ] Move Arena session routes into the Arena API app.
- [ ] Move Arena session services into the Arena API app.
- [ ] Remove Arena route registration from the Arcanum API app.
- [ ] Give each API app its own route and service composition boundary.

## 4. Separate Frontend Apps

- [ ] Keep `apps/cloud-arcanum-web` focused on cards, decks, sets, universes, and deckbuilding.
- [ ] Create `apps/cloud-arena-web`.
- [ ] Move Arena routes out of the Arcanum router.
- [ ] Move Arena navigation out of the Arcanum app shell.
- [ ] Move Arena pages, Arena components, and Arena libs into the Arena web app.
- [ ] Give each web app its own router, shell, and API client surface.

## 5. Clean Up Cross-Domain UI Coupling

- [x] Remove Arena engine imports from generic Arcanum card-display code.
- [x] Move Arena-specific display variants into Arena-owned files.
- [ ] Split generic card rendering from battle rendering.
- [ ] Audit Arcanum web libs for Arena imports.
- [ ] Audit Arcanum components for Arena-owned behavior.

## 6. Clarify Shared Core Modules

- [ ] Keep `src/domain/**` as the canonical shared schema layer if both games still need it.
- [ ] Make `src/cloud-arcanum/**` Arcanum-owned only.
- [ ] Make `src/cloud-arena/**` Arena-owned only.
- [ ] Create `src/shared/**` only for truly domain-neutral code.
- [ ] Document allowed dependency directions.

## 7. Reorganize Scripts And Commands

- [ ] Replace combined dev assumptions with per-game commands.
- [ ] Add separate API and web dev commands for both games.
- [ ] Keep combined commands optional.
- [ ] Split build targets where practical.
- [ ] Split simulation/demo scripts from catalog/content scripts.

## 8. Separate Tests

- [ ] Group Arcanum tests under Arcanum ownership.
- [ ] Keep Arena engine and session tests under Arena ownership.
- [ ] Ensure Arcanum tests do not import Arena modules unless intentionally integration-level.
- [ ] Ensure Arena tests do not depend on Arcanum browsing routes.
- [ ] Add boundary checks for forbidden imports.

## 9. Separate Docs

- [ ] Split mixed docs into Arcanum-specific vs Arena-specific planning where useful.
- [ ] Add per-product architecture docs.
- [ ] Add AI-navigation docs for each game.
- [ ] Update the root README to describe the new product split.

## 10. Separate Data And Assets Strategy

- [ ] Confirm Arcanum ownership of canonical card/deck/set/universe data.
- [x] Decide that Arena owns its own runtime cards and gameplay content.
- [ ] Decide whether Arcanum should have a read-only Arena data viewer layer later.
- [ ] Decide how Arena should handle art and visual assets.
- [ ] Document any shared read-only asset usage.

## 11. Improve AI-Friendly Repo Boundaries

- [ ] Add small folder-level READMEs where ownership is not obvious.
- [ ] Add boundary notes or lint rules for forbidden imports.
- [ ] Prefer product-local API clients and view models over mixed abstractions.
- [x] Split the current web API client surface so Arena routes can use an Arena-specific client.
- [ ] Reduce top-level ambiguity so each task has a smaller working set.

## 12. Final Extraction Prep

- [ ] Re-evaluate whether either game should move into its own repo.
- [ ] Identify what would need to be copied, vendored, or published before extraction.
- [ ] Remove any remaining accidental cross-product imports.
- [ ] Verify each game can build, test, and run independently.
