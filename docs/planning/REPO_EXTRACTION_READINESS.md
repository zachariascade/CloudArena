# Repo Extraction Readiness

This document captures the current readiness state for extracting Cloud Arcanum or Cloud Arena into separate repos later.

## Recommendation

Stay in one monorepo for now.

The current split already delivers most of the context-window and ownership benefits without paying the coordination cost of separate repos.

## Why The Monorepo Still Helps

- product boundaries are now explicit in `apps/`, `src/`, `tests/`, and docs
- each product has its own frontend and backend app
- each product has its own test slice
- each product has its own command namespace
- the shared layer is intentionally small

## What Would Need To Move For Arena Extraction

If Cloud Arena became its own repo later, it would need:

- `apps/cloud-arena-api/`
- `apps/cloud-arena-web/`
- `src/cloud-arena/`
- `tests/cloud-arena/`
- Arena-specific scripts such as `run-cloud-arena-*.ts`
- any Arena-owned assets added over time

It would also need a decision about whether to copy or vendor:

- `src/domain/`
- any remaining top-level mixed tests or docs that still matter

## What Would Need To Move For Arcanum Extraction

If Cloud Arcanum became its own repo later, it would need:

- `apps/cloud-arcanum-api/`
- `apps/cloud-arcanum-web/`
- `src/cloud-arcanum/`
- `src/biblical/`
- `tests/cloud-arcanum/`
- `data/`
- `images/cards/`
- Arcanum content pipeline and validation scripts

## Remaining Extraction Risks

- some intentionally mixed tests still live at the top level
- some docs remain organized by purpose rather than fully by product
- `src/domain/` would need a copy, vendor step, or package strategy during extraction

## Independent Verification Checklist

Cloud Arcanum should be independently buildable and runnable through:

- `npm run build:arcanum`
- `npm run dev:arcanum`

Cloud Arena should be independently buildable and runnable through:

- `npm run build:arena`
- `npm run dev:arena`

## Current Conclusion

The repo is structurally ready enough to extract later, but not so constrained that extraction is the best next step now.

Monorepo-first remains the recommended default.
