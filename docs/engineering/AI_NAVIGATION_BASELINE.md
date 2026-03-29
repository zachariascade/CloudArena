# AI Navigation Baseline

## Purpose

This note captures the benchmark shape for the Phase 0 through Phase 2 AI-navigation work.

The benchmark is intended to answer:

- how expensive data fingerprinting is
- how expensive normalized-data loading is when cold
- how much caching helps when warm
- how card query cost grows as the dataset scales

## How To Run

Use:

```bash
npm run benchmark:api
```

The script prints JSON so the output can be compared across commits.

## Current Measurement Shape

The benchmark script reports:

- `dataFingerprint`
- `loadNormalizedData.cold`
- `loadNormalizedData.warm`
- query timings for:
  - full list page
  - text search
  - summary query
  - ids query
  - count query

It runs against:

- the current canonical dataset
- synthetic `1k`, `5k`, and `10k` card scenarios

## Current Goal

For the low-risk Phase 0 through Phase 2 path, the practical local target is:

- fast warm reads against the current dataset
- clearly improved repeated-query behavior from normalized-data caching
- usable filtered query performance at `1k` cards
- still reasonable local query behavior at `5k` cards

## Latest Baseline

Recorded on `2026-03-28` from the local workspace:

- `dataFingerprint`: about `13 ms`
- `loadNormalizedData.cold`: about `18 ms`
- `loadNormalizedData.warm`: about `1 ms`

Synthetic query timings:

- `1k` cards:
  - full page query: about `0.9 ms`
  - search query: about `0.8 ms`
  - summary query: about `1.2 ms`
  - ids query: about `0.9 ms`
  - count query: about `0.8 ms`
- `5k` cards:
  - full page query: about `2.7 ms`
  - search query: about `3.4 ms`
  - summary query: about `4.0 ms`
  - ids query: about `3.8 ms`
  - count query: about `3.9 ms`
- `10k` cards:
  - full page query: about `5.3 ms`
  - search query: about `6.8 ms`
  - summary query: about `7.6 ms`
  - ids query: about `12.1 ms`
  - count query: about `7.6 ms`

These numbers are a local authoring baseline, not a production benchmark.

## Notes

- This benchmark is meant to guide local authoring and AI navigation work, not production-grade load testing.
- Canonical JSON remains the source of truth.
- Synthetic scaling uses repeated in-memory card records to measure query growth without forcing huge fixture sets into the repo.
