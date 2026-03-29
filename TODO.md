# Image Attribution Theme TODO

## Status

Completed on 2026-03-29.

## Goal

Move illustrator attribution from the card record to the image asset record so attribution follows the actual image being shown, including themed image variants.

## Completed Work

- [x] Extended image references to support image-level attribution metadata.
- [x] Added attribution fields to resolved image previews in the API contract.
- [x] Updated API view models so the resolved image variant determines displayed illustrator metadata.
- [x] Updated the web UI to read illustrator from the resolved image preview instead of relying only on the card root.
- [x] Migrated existing non-null card-level artist data onto image records.
- [x] Kept root `artist` as a backward-compatible fallback instead of a required source of truth.
- [x] Verified the changes with typecheck, tests, and validation.

## Implemented Model

Image references now support these attribution-oriented fields:

- `artist`
- `sourceUrl`
- `license`
- `creditText`
- `sourceNotes`

This applies both to:

- `image`
- `images.<themeId>`

## Theme Behavior Now

- If a requested theme resolves to a theme-specific image, that image's attribution is used.
- If the request falls back to the default image, the default image's attribution is used.
- If an image asset has no attribution, the system can still fall back to legacy root `artist` data.
- The UI now treats attribution as part of the selected image, not just the card.

## Key Files Updated

- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/src/domain/types.ts`
- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/src/domain/card.ts`
- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/src/cloud-arcanum/api-contract.ts`
- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/src/cloud-arcanum/shared-utils.ts`
- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/apps/cloud-arcanum-api/src/services/view-models.ts`
- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/apps/cloud-arcanum-web/src/components/card-face-tile.tsx`
- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/apps/cloud-arcanum-web/src/routes/card-detail-page.tsx`
- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/schemas/card.schema.json`

## Current Compatibility Approach

- Root `artist` remains supported for legacy data.
- New attribution should be written to the image asset record whenever possible.
- Resolved image previews expose the attribution fields needed by the UI.

## Remaining Nice-to-Haves

- [ ] Add richer UI treatment for `sourceUrl`, `license`, and `creditText` beyond plain metadata display.
- [ ] Add stricter validation once more of the catalog has real attribution data on image assets.
- [ ] Remove or fully deprecate root `artist` after the catalog has been fully migrated.
