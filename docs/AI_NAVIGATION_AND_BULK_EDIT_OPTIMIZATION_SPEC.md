# Cloud Arcanum AI Navigation And Bulk Edit Optimization Spec

## 1. Purpose

This document defines the next set of optimizations that will improve Cloud Arcanum's ability to:

- let AI tools find the right cards quickly
- let AI tools target changes with less ambiguity
- make bulk edits safer and easier to review
- keep the canonical `data/` directory as the source of truth

The goal is not to replace the current JSON-first model.

The goal is to add enough indexing, caching, metadata, and workflow support that AI tools can work against a large card corpus without needing to repeatedly scan or rewrite the entire canonical store.

## 2. Problem Summary

Today the system is strong as a canonical content store, but AI-facing navigation and batch editing still rely too heavily on full-folder scans and broad prompt interpretation.

Current limitations:

- every API load rereads and reparses the canonical JSON files
- cards list filtering scans the full in-memory card collection before pagination
- some filters build card list view models during filtering instead of using precomputed flags
- AI tools must infer target sets from broad text prompts instead of using a queryable targeting layer
- batch edits do not yet have a dedicated plan, dry-run, diff, or approval workflow
- there is no derived search/index layer that AI tools can use as a compact working set

These limits will matter before raw disk size becomes the real bottleneck.

The first pain point will be navigation cost, selection ambiguity, and bulk-edit safety.

## 3. Goals

- Preserve `data/` JSON files as the canonical source of truth
- Make card discovery fast enough for AI-driven filtering at thousands of records
- Give AI tools a compact derived index instead of forcing repeated full-record scans
- Support bulk operations like "edit all draft angels in set X" with deterministic targeting
- Make multi-record changes reviewable, reversible, and validation-aware
- Reduce accidental edits caused by vague prompts or partial matches

## 4. Non-Goals

- Replacing canonical JSON files with a database as the source of truth
- Building a full collaborative CMS
- Allowing AI to apply large destructive changes without review
- Solving final long-term scaling for millions of records

## 5. Design Principles

- Canonical vs derived: canonical JSON remains authoritative; all indexes and caches are rebuildable
- Stable targeting: AI should operate on stable IDs and explicit filter criteria, not fuzzy folder navigation
- Reviewability: bulk edits should produce a plan and a diff before they are accepted
- Determinism: identical filters should produce identical target sets
- Small working sets: AI should receive compact summaries and IDs first, full records second
- Progressive scaling: optimize the current file-based architecture before introducing mandatory database dependence

## 6. Proposed Architecture

### 6.1 Derived Card Index

Add a derived local index artifact that summarizes all cards in a compact, query-friendly form.

Recommended shape:

- one generated file such as `output/indexes/cards-index.json`
- optional later split into sharded files if size grows significantly

Each index entry should include:

- `id`
- `name`
- `slug`
- `setId`
- `setCode`
- `universeId`
- `status`
- `rarity`
- `colors`
- `colorIdentity`
- `typeLine`
- `tags`
- `hasImage`
- `hasUnresolvedMechanics`
- `updatedAt`
- `searchText`

Recommended `searchText` inputs:

- card name
- slug
- type line
- tags
- set name
- universe name

This index should be treated as a derived read model for search and AI targeting, not as a second source of truth.

### 6.2 Precomputed Filter Flags

Move expensive filter conditions out of per-request view-model construction.

Precompute on normalization or index build:

- `hasImage`
- `hasUnresolvedMechanics`
- `isDraftLike`
- `deckIds`
- `validationErrorCount`

This prevents filter evaluation from rebuilding card list items just to answer simple yes/no questions.

### 6.3 In-Memory Snapshot Cache

Add a short-lived data snapshot cache inside the API service layer.

Recommended behavior:

- cache the loaded snapshot and normalized data
- invalidate when canonical file mtimes change
- expose a manual rebuild or refresh path for authoring workflows

Recommended initial rule:

- reuse normalized data for a short TTL during active browsing
- invalidate immediately after write operations or explicit validation runs

This should remove the current need to reread all JSON files on every cards request.

### 6.4 Structured Query Layer For AI

Define a first-class query contract for AI-targeting operations.

The AI should be able to ask for:

- cards matching filters
- counts only
- IDs only
- summaries only
- full records for a narrowed subset

Recommended API capability:

- `mode=count`
- `mode=ids`
- `mode=summary`
- `mode=full`

This lets AI workflows start small:

1. find candidate cards
2. confirm target count and IDs
3. fetch full records only for approved targets
4. generate changes

### 6.5 Bulk Edit Plan Model

Introduce a bulk-edit plan artifact for AI-generated multi-record changes.

Recommended generated file location:

- `output/bulk-edits/<timestamp>_<slug>/plan.json`
- `output/bulk-edits/<timestamp>_<slug>/summary.md`

Each plan should contain:

- natural-language operation summary
- exact selection filters
- resolved target IDs
- before snapshots or hashes
- proposed field-level changes
- validation expectations
- apply mode: safe patch, create, update, delete

This gives AI a stable intermediate representation between "user prompt" and "edited canonical files."

### 6.6 Dry Run And Apply Workflow

Bulk operations should default to dry-run before canonical writes.

Recommended workflow:

1. resolve target set
2. write bulk-edit plan
3. generate preview diff
4. run validation in preview mode
5. apply only after approval
6. rerun validation after apply

This makes "edit all cards with criteria X" much safer than direct prompt-to-file rewriting.

## 7. Functional Requirements

### 7.1 Search And Navigation

The system should support:

- filtering by stable fields without loading full detail records first
- counts for any filter combination
- deterministic sort orders
- fast retrieval of only matching card IDs
- efficient paging over filtered results

The system should also support AI-oriented search prompts like:

- "find all draft angels in Genesis"
- "show all approved black demons without images"
- "count balanced cards missing rarity"

### 7.2 Target Selection Safety

Before a bulk edit is applied, the system should produce:

- exact count of matched cards
- exact target ID list
- optional preview names for first N records
- warning when criteria are unusually broad

Recommended guardrails:

- require explicit confirmation above a configurable match threshold
- require set or universe scoping for very broad edits unless the user opts out

### 7.3 Bulk Edit Types

Support these edit classes first:

- set one field across many cards
- append or remove a tag
- move status from one stage to another
- fill nulls based on explicit rules
- rewrite notes or image prompts
- change references such as `setId` when validated

Defer more dangerous classes:

- deletion
- ID rewrites
- relationship remapping across many entities at once

Those should require extra guardrails and a more explicit review step.

### 7.4 Review And Diffing

Each bulk edit should be reviewable as:

- count summary
- per-card field diff
- validation delta
- failures and skipped records

Recommended output:

- human-readable markdown summary for the user
- machine-readable JSON plan for tools

## 8. Data Model Additions

These additions should remain derived where possible.

### 8.1 Derived Index Entry

Add a TypeScript type for a compact AI-facing card index record.

Suggested name:

- `AiCardIndexEntry`

Suggested properties:

- `id`
- `name`
- `setId`
- `setCode`
- `setName`
- `universeId`
- `universeName`
- `status`
- `rarity`
- `colors`
- `typeLine`
- `tags`
- `hasImage`
- `hasUnresolvedMechanics`
- `validationErrorCount`
- `updatedAt`
- `searchText`

### 8.2 Bulk Edit Plan Types

Add explicit plan types for:

- selection criteria
- resolved target set
- per-record patch
- validation result summary
- apply result summary

Suggested names:

- `BulkEditSelection`
- `BulkEditPlan`
- `BulkEditPatch`
- `BulkEditPreview`
- `BulkEditApplyResult`

## 9. API And Tooling Additions

### 9.1 Metadata Endpoints

Add lightweight metadata routes for AI and UI use.

Recommended routes:

- `GET /api/cards/index`
- `GET /api/cards/ids`
- `GET /api/cards/count`
- `POST /api/bulk-edits/preview`
- `POST /api/bulk-edits/apply`

If keeping writes outside the API for now, the same capability can begin as scripts instead of routes.

### 9.2 CLI Scripts

Add scripts that are easy for AI tools and humans to call.

Recommended initial scripts:

- `npm run build:index`
- `npm run bulk-edit:preview -- --spec <file>`
- `npm run bulk-edit:apply -- --spec <file>`
- `npm run query:cards -- --mode ids --filter ...`

Scripts are a good first step because they keep workflows local and deterministic while avoiding premature UI complexity.

### 9.3 Validation Integration

Every bulk workflow should integrate validation automatically.

Required checkpoints:

- validate planned record shape before writing
- validate full repo after apply
- report which targets failed and why

## 10. Implementation Phases

### Phase 1: Cheap Wins

Goal: improve performance and AI-targeting quality without changing the core workflow much.

Deliverables:

- normalized data cache in API service layer
- precomputed `hasImage` and `hasUnresolvedMechanics`
- stable `ids/count/summary` query modes
- deterministic cards index builder

Expected outcome:

- better browse performance
- better AI targeting
- less redundant per-request computation

### Phase 2: AI Query And Selection Layer

Goal: let AI tools narrow targets safely before touching files.

Deliverables:

- compact AI card index
- query script or route for exact target resolution
- broad-match warnings
- structured selection payloads

Expected outcome:

- fewer ambiguous prompts
- fewer accidental edits
- smaller AI working context

### Phase 3: Bulk Edit Preview Workflow

Goal: make multi-record edits inspectable before apply.

Deliverables:

- bulk edit plan schema
- preview generator
- diff summary output
- validation preview

Expected outcome:

- safer large edits
- easier human review
- repeatable AI workflows

### Phase 4: Apply Workflow And Recovery

Goal: support confident application of approved multi-record changes.

Deliverables:

- apply engine for approved plans
- skipped-record reporting
- failure handling
- rollback guidance via plan snapshots or git-based workflow

Expected outcome:

- reliable AI-assisted refactors of card data
- lower fear around large-scale maintenance

### Phase 5: Optional Database Read Model

Goal: add more headroom if file-based derived indexes stop being sufficient.

Possible options:

- SQLite derived read model
- FTS search index
- sync-on-build read database

This phase should remain optional.

Canonical JSON should still be preserved unless the broader product direction changes.

## 11. Recommended Priority Order

If only a few improvements are implemented first, the best order is:

1. add normalized data caching
2. add a derived compact card index
3. add `count/ids/summary/full` query modes
4. add bulk-edit preview plans
5. add apply workflow with automatic validation

This order delivers the largest AI-usability gains with the lowest conceptual cost.

## 12. Open Questions

- Should the first AI-facing index live only in memory, on disk, or both?
- Should bulk edits be API-driven, script-driven, or both?
- Should broad edits require an explicit `--all-matches` style confirmation?
- Should preview plans store full pre-edit record snapshots or just hashes plus diffs?
- At what card count should SQLite or FTS become worthwhile for the derived read model?

## 13. Recommendation

The recommended near-term approach is:

- keep canonical JSON files exactly as they are
- introduce a compact derived card index
- cache normalized data
- make AI ask for counts and IDs before full records
- require preview plans before bulk applies

That combination will improve both performance and trust.

It will make the system feel much more navigable to AI long before a database becomes necessary.
