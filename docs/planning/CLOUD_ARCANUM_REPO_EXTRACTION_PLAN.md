# Cloud Arcanum Repo Extraction Plan

This document lays out a practical path for pulling Cloud Arcanum into its own GitHub repository.

It assumes the current monorepo boundary is already mostly clean:

- Cloud Arcanum owns catalog, browsing, deckbuilding, validation, and canonical content.
- Cloud Arena owns combat, sessions, simulation, and battle UI.
- `src/domain/` is the intentionally small shared schema layer.

The goal of this plan is to make the extraction repeatable, low-risk, and easy to verify in a separate GitHub repo.

## Confirmed Decisions

These choices are locked in for implementation:

- new repo name: `CloudArcanum`
- preserve git history: no
- `src/domain/` strategy: copy it into the new repo for now
- post-split relationship: fully independent repos
- issue migration: no
- workflow strategy: copy existing workflows and adjust them
- old monorepo role: keep it active for Cloud Arena only

## Outcome We Want

After extraction, the new Cloud Arcanum repo should be able to:

- build independently
- run its API and web apps independently
- validate canonical content independently
- keep its own docs, scripts, tests, and assets
- avoid importing Cloud Arena modules

The end state should feel like a real product repo, not a copied folder with hidden dependencies.

## Recommended Strategy

Use a staged extraction instead of a single hard cut.

That means:

1. first freeze and inventory the Arcanum surface
2. then create a new repo with only Arcanum-owned files
3. then replace or package anything that is still shared
4. finally verify that the old repo no longer depends on Arcanum internals

This lowers the chance of discovering missing pieces after the move.

## Phase 1: Define The Extraction Boundary

Before moving files, confirm exactly what belongs to Cloud Arcanum.

The working inventory for this phase lives in [CLOUD_ARCANUM_REPO_EXTRACTION_INVENTORY.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/CLOUD_ARCANUM_REPO_EXTRACTION_INVENTORY.md).

### Move To The New Repo

- `apps/cloud-arcanum-api/`
- `apps/cloud-arcanum-web/`
- `src/cloud-arcanum/`
- `src/biblical/`
- `src/domain/`
- `data/`
- `images/cards/`
- Arcanum-specific `scripts/`
- Arcanum-specific tests
- Arcanum-specific docs

### Stay In The Old Repo

- `apps/cloud-arena-api/`
- `apps/cloud-arena-web/`
- `src/cloud-arena/`
- Arena scripts, tests, and docs
- Arena-only content and assets

### Shared Decision Point

The main unresolved question used to be what to do with `src/domain/`.

The likely options are:

- copy it into the new repo as an internal package layer
- publish it as a separate package and depend on it from both repos
- keep the monorepo as the shared source of truth for a short transition period

For the first extraction pass, we are copying `src/domain/` into the new repo as an internal layer. That keeps the new repo self-contained while preserving the option to factor it out later.

## Phase 2: Inventory Dependencies

Before any cutover, list the files that Arcanum depends on outside its own surface.

This inventory should include:

- imports from `src/domain/`
- any shared helper utilities
- any scripts that read both Arcanum and Arena paths
- any top-level tests that cross product boundaries
- any root-level build or dev scripts that assume both games live together

The purpose here is to identify the minimum amount of packaging work needed after extraction.

## Phase 3: Create The New Repository

Create the new Cloud Arcanum GitHub repository with a clean initial shape.

This includes the repo-level decisions that do not exist in a monorepo split:

- new GitHub remote
- default branch choice
- branch protection and CI setup
- issue and PR history policy
- whether to preserve full git history or start fresh with a squash import

Suggested layout:

```text
apps/
  cloud-arcanum-api/
  cloud-arcanum-web/
data/
images/
scripts/
src/
  biblical/
  domain/
  cloud-arcanum/
tests/
docs/
```

The new repo should include only the files needed to build and run Cloud Arcanum.

Because we are not preserving history, the import can be a clean copy of the current Arcanum-owned tree rather than a filtered git rewrite.

At this stage, keep the repo boring and explicit:

- one root `package.json`
- one TypeScript configuration stack
- one set of Arcanum commands
- one docs index
- one test command

## Phase 4: Move Code In Ownership Order

Move the most product-local code first, then the most shared code last.

Recommended order:

1. `apps/cloud-arcanum-api/`
2. `apps/cloud-arcanum-web/`
3. `src/cloud-arcanum/`
4. `src/biblical/`
5. `data/`
6. `images/cards/`
7. `scripts/`
8. `tests/`
9. `docs/`
10. `src/domain/` or the chosen replacement strategy

That order keeps the highest-confidence app code moving early while leaving the shared boundary decision for later.

## Phase 5: Rebuild The Tooling Surface

Once files are in the new repo, replace monorepo assumptions with Arcanum-specific commands.

Minimum command set:

- `dev`
- `dev:api`
- `dev:web`
- `build`
- `check`
- `test`
- `validate`

If the repo keeps any export or ingest workflows, make sure they are Arcanum-only and do not reach into Arena paths.

Also update:

- TypeScript path aliases
- build scripts
- runtime config references
- local dev ports and API base URLs
- test setup and fixtures

## Phase 6: Repair Imports And Contracts

After the move, search for broken cross-repo assumptions.

This phase should remove or rewrite:

- imports that still point at Arena files
- any mixed contracts that were only safe in the monorepo
- any shared utilities that are not truly domain-neutral
- any relative paths that still assume the old repository root

This is also the right time to simplify.

If a helper was only shared because the monorepo made it easy, prefer copying it into the new repo instead of preserving a wider shared layer.

## Phase 7: Verify The New Repo Works Alone

The new repo should be tested as if it had never been part of the monorepo.

Verification should include:

- typecheck
- unit tests
- content validation
- API startup
- web startup
- a full build

If there are content pipelines or ingestion scripts, run the smallest representative end-to-end path too.

## Phase 8: Cut Over The Old Repo

After the new repo is healthy, reduce the old monorepo’s dependence on Arcanum.

That means:

- remove Arcanum from any combined root scripts that no longer make sense
- delete dead references to Arcanum paths
- update documentation to point to the new repo
- keep only the Arena-side code and any truly shared infrastructure that still belongs there

This step should be conservative. The old repo should keep working even if the split is staged over multiple PRs.

If the extraction is fully moving to a new GitHub repo, also plan for:

- updating docs links and badges to the new remote
- leaving open issues in the old repo unless they are still relevant to Arena or the migration itself
- updating any deploy or automation hooks that point at the old GitHub repository

## Phase 9: Final Quality Checks

Before declaring the split complete, confirm the following:

- the new repo has no imports from the old monorepo
- the old repo has no live dependencies on Arcanum-owned code
- docs clearly state which repo owns which product
- CI or local scripts run without special monorepo path assumptions
- any copied shared code has an explicit ownership decision

## Risks To Watch

- `src/domain/` may still be the main packaging question
- a few top-level tests may still assume both products exist together
- some scripts may still use root paths that only exist in the old repo
- docs may still link to old absolute paths
- content validation may rely on local file layout more than expected

These are all manageable, but they are the places I would inspect first during the split.

## Suggested Implementation Order

If we were doing this next, I would sequence it like this:

1. freeze the current boundary and copy `src/domain/` into the new repo
2. create the `CloudArcanum` GitHub repository and copy the Arcanum-owned tree
3. make the new repo build and typecheck
4. copy workflows and adjust them for the standalone repo
5. run the new repo independently until it is stable
6. trim the old repo and update links/docs while leaving Arena active

That keeps the migration from being blocked on the hardest packaging choice.

## Definition Of Done

Cloud Arcanum is successfully extracted when:

- the code lives in its own GitHub repository
- the new repository has its own build, test, and dev commands
- the new repository owns its own docs and content pipeline
- the new repository no longer imports Arena code
- the old monorepo no longer needs Arcanum code to function
- the ownership boundary is obvious to a new contributor on day one

## Next Decision To Make

The first concrete decision has now been made:

- `src/domain/` will be copied into the new repo for now
- the new repo will be named `CloudArcanum`
- the split will produce fully independent repos

From here on, the remaining work is mostly mechanical execution.
