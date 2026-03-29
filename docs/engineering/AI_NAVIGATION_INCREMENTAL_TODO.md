# AI Navigation Incremental TODO

## 1. Purpose

This document turns the AI-navigation optimization idea into a step-by-step checklist that can be approved gradually.

Each phase is meant to be independently valuable.

That means we should be able to:

- implement one phase
- evaluate whether it helped
- approve the next phase, defer it, or skip it

The goal is to improve AI's ability to find, inspect, and safely change cards as the number of records grows, while keeping canonical JSON in `data/` as the source of truth.

## 2. How To Use This TODO

Recommended decision rule for each phase:

- `Approve` if the current system is starting to feel limited in that area
- `Defer` if the idea is good but not yet needed
- `Skip` if the added complexity is not worth it for this project

Recommended execution rule:

- do not start a later phase until the current phase has either been completed, explicitly deferred, or explicitly skipped

## 3. Success Criteria

We should consider this roadmap successful if AI can reliably:

- narrow large card sets down to exact IDs before reading full files
- answer "which cards match X?" without broad repo scans
- propose multi-card changes against exact targets
- preview bulk edits before applying them
- keep working smoothly as the number of cards grows into the thousands

## 4. Phase 0: Baseline And Instrumentation

Decision status:

- [ ] Approve
- [ ] Defer
- [ ] Skip

Why this phase matters:

- We should know where time is actually going before we optimize too far.

TODO:

- [ ] Add a simple benchmark script for `loadSnapshot`, `normalize`, and `queryCards`
- [ ] Record current benchmark numbers for the existing dataset
- [ ] Add a synthetic benchmark mode for `1k`, `5k`, and `10k` cards
- [ ] Decide on "acceptable" response targets for local AI-facing queries
- [ ] Write a short performance note in `docs/` with baseline results

Approval gate:

- After this phase, decide whether current pain is mostly load time, filter time, AI ambiguity, or bulk-edit safety

## 5. Phase 1: Cheap Performance Wins

Decision status:

- [ ] Approve
- [ ] Defer
- [ ] Skip

Why this phase matters:

- These changes should improve responsiveness without changing the authoring workflow much.

TODO:

- [ ] Add a short-lived in-memory cache for normalized card data
- [ ] Invalidate cached normalized data when canonical files change
- [ ] Precompute `hasImage` during normalization instead of deriving it repeatedly during filtering
- [ ] Precompute `hasUnresolvedMechanics` during normalization instead of deriving it repeatedly during filtering
- [ ] Stop rebuilding expensive view-model data inside filter predicates
- [ ] Add tests for cache invalidation and precomputed filter flags
- [ ] Re-run benchmarks and compare against Phase 0

Approval gate:

- If browse and query latency feel meaningfully better, move on only if AI targeting is still too fuzzy

## 6. Phase 2: AI-Friendly Query Modes

Decision status:

- [ ] Approve
- [ ] Defer
- [ ] Skip

Why this phase matters:

- AI should not need to fetch full records just to identify targets.

TODO:

- [ ] Add query modes for `count`, `ids`, `summary`, and `full`
- [ ] Define a compact summary model for cards
- [ ] Make filtering and sorting deterministic across all modes
- [ ] Add tests that ensure `count`, `ids`, and `summary` resolve the same target set as `full`
- [ ] Expose these modes through API routes, scripts, or both
- [ ] Add a short workflow note describing "count -> ids -> summary -> full"

Approval gate:

- After this phase, decide whether AI now has enough structure to find the right cards without broad file reads

## 7. Phase 3: Derived AI Card Index

Decision status:

- [ ] Approve
- [ ] Defer
- [ ] Skip

Why this phase matters:

- A compact derived index gives AI a smaller, cheaper working surface than raw canonical files.

TODO:

- [ ] Define a compact `AiCardIndexEntry` type
- [ ] Build a generated card index artifact under `output/`
- [ ] Include search-friendly fields such as `name`, `slug`, `typeLine`, `tags`, `set`, and `universe`
- [ ] Include precomputed flags such as `hasImage`, `hasUnresolvedMechanics`, and validation counts
- [ ] Add a rebuild command for the derived index
- [ ] Decide whether the index should be rebuilt on demand, on startup, or after writes
- [ ] Add tests that ensure the derived index stays aligned with canonical records

Approval gate:

- After this phase, decide whether AI should primarily query the derived index first and only load full records second

## 8. Phase 4: Broad-Query Safety Guards

Decision status:

- [ ] Approve
- [ ] Defer
- [ ] Skip

Why this phase matters:

- As the corpus grows, the risk shifts from "AI cannot find enough" to "AI found too much."

TODO:

- [ ] Add match-count warnings for broad queries
- [ ] Add a "show first N targets" summary for candidate sets
- [ ] Require explicit confirmation for edits above a chosen threshold
- [ ] Consider requiring set or universe scoping for very broad edit operations
- [ ] Add tests for broad-match warnings and threshold behavior

Approval gate:

- After this phase, decide whether selection safety is now good enough before introducing bulk apply workflows

## 9. Phase 5: Bulk Edit Preview Plans

Decision status:

- [ ] Approve
- [ ] Defer
- [ ] Skip

Why this phase matters:

- AI should show its work before it changes lots of canonical files.

TODO:

- [ ] Define a `BulkEditPlan` type
- [ ] Define a structured selection model and exact target ID resolution
- [ ] Define a small set of allowed patch operations such as set field, add tag, remove tag, and status change
- [ ] Generate machine-readable preview plans under `output/bulk-edits/`
- [ ] Generate human-readable markdown summaries for review
- [ ] Add preview validation that shows expected failures before apply
- [ ] Add tests for preview plan generation and target resolution

Approval gate:

- After this phase, decide whether preview plans are clear enough that apply logic is worth adding

## 10. Phase 6: Bulk Edit Apply Workflow

Decision status:

- [ ] Approve
- [ ] Defer
- [ ] Skip

Why this phase matters:

- This phase turns AI navigation into safe AI maintenance.

TODO:

- [ ] Add an apply command for approved bulk-edit plans
- [ ] Write only to canonical files after target resolution and preview approval
- [ ] Re-run validation automatically after apply
- [ ] Report applied, skipped, and failed records clearly
- [ ] Ensure apply behavior is deterministic and testable
- [ ] Add tests for partial failure behavior
- [ ] Add workflow guidance for git-based review after apply

Approval gate:

- After this phase, decide whether the workflow feels safe enough for regular multi-card maintenance

## 11. Phase 7: Higher-Value Query Features

Decision status:

- [ ] Approve
- [ ] Defer
- [ ] Skip

Why this phase matters:

- Once the basics are solid, richer query surfaces can make AI much more capable without requiring broader prompts.

TODO:

- [ ] Add filters for validation state and missing required finishing fields
- [ ] Add "recently changed" query support
- [ ] Add optional query presets such as "needs review", "missing image", or "draft creatures"
- [ ] Add relationship-aware queries such as "cards used in deck X" or "cards in set Y not in any deck"
- [ ] Add tests for the new preset and relationship queries

Approval gate:

- After this phase, decide which queries deserve a first-class UI surface and which should remain AI/script-oriented

## 12. Phase 8: Optional Read-Model Storage

Decision status:

- [ ] Approve
- [ ] Defer
- [ ] Skip

Why this phase matters:

- This is the "only if needed" scalability phase.

TODO:

- [ ] Evaluate whether the derived JSON index is still fast enough at projected card counts
- [ ] If not, prototype a SQLite or FTS-backed read model
- [ ] Keep canonical JSON as source of truth
- [ ] Keep the read model rebuildable from canonical data
- [ ] Compare complexity against real observed performance gains before adopting it

Approval gate:

- Only approve this phase if the lighter indexing and caching layers are no longer enough

## 13. Recommended Approval Order

Best default sequence:

1. Approve Phase 0
2. Approve Phase 1
3. Approve Phase 2
4. Re-evaluate before Phase 3
5. Approve Phases 4-6 only when you want safe AI-driven bulk changes
6. Treat Phases 7-8 as optional follow-on improvements

## 14. Minimum Useful Path

If we want the smallest high-impact version of this roadmap, the best stopping point is:

- Phase 0 complete
- Phase 1 complete
- Phase 2 complete

That would already give AI:

- better performance
- exact target counts and IDs
- less need to scan raw repo files

## 15. Most Valuable Path

If we want the best end-to-end AI maintenance workflow, the best stopping point is:

- Phase 0 through Phase 6 complete

That would give AI:

- fast navigation
- compact targeting
- explicit broad-query safety
- previewable bulk edits
- controlled apply workflows

## 16. Recommendation

The best next move is to approve only:

- Phase 0
- Phase 1
- Phase 2

Those are the lowest-risk, highest-payoff improvements.

They will make the system much more AI-friendly without committing you yet to derived index maintenance or bulk-edit machinery.
