# Cloud Arcanum API Spec

## 1. Purpose

This document defines the initial read-only API for the Cloud Arcanum app.

It is designed to support the decisions captured in [CLOUD_ARCANUM_TODO.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/CLOUD_ARCANUM_TODO.md):

- Canonical JSON remains the source of truth
- A local Node API sits between the filesystem and the React app
- The API returns server-side normalized view models
- V1 is read-only
- Cards are the main navigation entry point

The API should be implemented as a lightweight Fastify service.

## 2. API Goals

The first version of the API should:

- Read canonical records from `data/`
- Resolve relationships across cards, sets, universes, and decks
- Expose UI-friendly list and detail responses
- Surface validation results separately from normal draft placeholders
- Stay close to the canonical domain model without forcing the frontend to perform joins

The first version of the API should not:

- Mutate records
- Write files
- Introduce authentication
- Require a database

## 3. Base Conventions

### 3.1 Base URL

Recommended local base path:

```text
/api
```

### 3.2 Response Format

All endpoints should return JSON.

Successful responses should follow this envelope:

```json
{
  "data": {}
}
```

List responses should follow this envelope:

```json
{
  "data": [],
  "meta": {}
}
```

Error responses should follow this envelope:

```json
{
  "error": {
    "code": "string_code",
    "message": "Human-readable message"
  }
}
```

### 3.3 ID Handling

All entity lookup routes should use canonical IDs:

- `card_*`
- `deck_*`
- `set_*`
- `universe_*`

### 3.4 Draft Placeholder Rule

The API must never replace unresolved canonical values with fake finalized values.

If a card has `null` mechanics in canonical JSON, the API should:

- return the canonical raw field as `null`
- provide derived UI flags that explain the field is unresolved
- optionally provide display labels such as `Draft` or `Not finalized`

## 4. Shared View-Model Concepts

These are not separate endpoints. They are shared payload shapes the API should reuse.

### 4.1 Entity Reference

Use lightweight references when linking related records.

```json
{
  "id": "set_celestialwar",
  "name": "Celestial War"
}
```

Recommended shape:

```ts
type EntityReference = {
  id: string;
  name: string;
};
```

### 4.2 Image Preview

The API should resolve image information into a browser-friendly payload.

Recommended shape:

```ts
type ImagePreview = {
  kind: "local" | "remote" | "generated" | "placeholder" | "missing";
  sourcePath: string | null;
  publicUrl: string | null;
  isRenderable: boolean;
  alt: string;
};
```

Notes:

- `sourcePath` represents the canonical or resolved source path
- `publicUrl` is what the frontend can actually render
- `kind: "missing"` should be used when no usable image is available

### 4.3 Draft Status Summary

Recommended shape:

```ts
type DraftStatusSummary = {
  status: "draft" | "templating" | "balanced" | "approved";
  isDraftLike: boolean;
  hasUnresolvedMechanics: boolean;
  unresolvedFields: string[];
  reviewLabel: string;
};
```

Recommended semantics:

- `draft` and `templating` should be treated as draft-like
- unresolved fields should include values such as `manaCost`, `manaValue`, `oracleText`, `power`, `toughness`, `loyalty`, `defense`, `rarity`

### 4.4 Validation Summary

Recommended lightweight shape for list and detail payloads:

```ts
type ValidationSummary = {
  hasErrors: boolean;
  errorCount: number;
};
```

This should remain separate from draft placeholder status.

## 5. Card API

Cards are the primary Cloud Arcanum app entry point.

### 5.1 `GET /api/cards`

Returns the card browser dataset.

Query parameters:

- `q`: free-text search against card name, slug, tags, and optionally type line
- `universeId`: filter by canonical universe ID
- `setId`: filter by canonical set ID
- `status`: filter by one or more card statuses
- `color`: filter by one or more colors
- `rarity`: filter by rarity
- `hasImage`: `true` or `false`
- `hasUnresolvedMechanics`: `true` or `false`
- `deckId`: optionally restrict to cards used by a specific deck
- `sort`: recommended values: `name`, `updatedAt`, `createdAt`, `status`
- `direction`: `asc` or `desc`

Recommended response shape:

```ts
type CardListItem = {
  id: string;
  name: string;
  slug: string;
  typeLine: string;
  manaCost: string | null;
  manaValue: number | null;
  colors: string[];
  colorIdentity: string[];
  rarity: string | null;
  status: "draft" | "templating" | "balanced" | "approved";
  set: EntityReference;
  universe: EntityReference;
  image: ImagePreview;
  draft: DraftStatusSummary;
  validation: ValidationSummary;
  tags: string[];
  updatedAt: string;
};
```

Recommended response envelope:

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "filtersApplied": {}
  }
}
```

### 5.2 `GET /api/cards/:cardId`

Returns a card detail payload with resolved relationships.

Recommended response shape:

```ts
type CardDetail = {
  id: string;
  name: string;
  slug: string;
  setId: string;
  typeLine: string;
  manaCost: string | null;
  manaValue: number | null;
  colors: string[];
  colorIdentity: string[];
  rarity: string | null;
  oracleText: string | null;
  flavorText: string | null;
  power: string | null;
  toughness: string | null;
  loyalty: string | null;
  defense: string | null;
  artist: string | null;
  mechanics: string[];
  tags: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  image: ImagePreview;
  draft: DraftStatusSummary;
  validation: ValidationSummary;
  set: {
    id: string;
    name: string;
    code: string;
  };
  universe: EntityReference;
  decks: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
};
```

Behavior notes:

- `decks` should list every deck that references this card
- the API should compute `draft.unresolvedFields`
- the API should not hide `null` fields

## 6. Deck API

### 6.1 `GET /api/decks`

Returns deck list data.

Query parameters:

- `q`: free-text search against deck name, format, tags
- `universeId`: filter by universe
- `setId`: filter by included set membership
- `containsCardId`: filter decks containing a specific card

Recommended response shape:

```ts
type DeckListItem = {
  id: string;
  name: string;
  format: string;
  universe: EntityReference;
  setCount: number;
  cardCount: number;
  uniqueCardCount: number;
  commander: EntityReference | null;
  tags: string[];
  validation: ValidationSummary;
};
```

### 6.2 `GET /api/decks/:deckId`

Returns full deck detail plus expanded card references.

Recommended response shape:

```ts
type DeckDetail = {
  id: string;
  name: string;
  format: string;
  notes: string | null;
  tags: string[];
  universe: EntityReference;
  sets: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  commander: {
    id: string;
    name: string;
    image: ImagePreview;
  } | null;
  cards: Array<{
    quantity: number;
    card: {
      id: string;
      name: string;
      typeLine: string;
      manaCost: string | null;
      manaValue: number | null;
      status: "draft" | "templating" | "balanced" | "approved";
      image: ImagePreview;
      draft: DraftStatusSummary;
      set: EntityReference;
    };
  }>;
  summary: {
    totalCards: number;
    uniqueCards: number;
    byStatus: Record<string, number>;
    bySet: Array<{
      set: EntityReference;
      count: number;
    }>;
  };
  validation: ValidationSummary;
};
```

Behavior notes:

- `totalCards` should be the sum of quantities
- `uniqueCards` should be the number of unique card IDs
- `byStatus` helps show how much of a deck is still draft-stage

## 7. Set API

### 7.1 `GET /api/sets`

Returns set list data.

Query parameters:

- `q`: free-text search against set name or code
- `universeId`: filter by universe

Recommended response shape:

```ts
type SetListItem = {
  id: string;
  name: string;
  code: string;
  universe: EntityReference;
  description: string | null;
  cardCount: number;
  countsByStatus: Record<string, number>;
};
```

### 7.2 `GET /api/sets/:setId`

Returns set detail plus summary data.

Recommended response shape:

```ts
type SetDetail = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  universe: EntityReference;
  cardCount: number;
  countsByStatus: Record<string, number>;
  featuredCards: Array<{
    id: string;
    name: string;
    status: string;
    image: ImagePreview;
  }>;
};
```

For V1, `featuredCards` can simply be the first N cards sorted by name or update time.

## 8. Universe API

### 8.1 `GET /api/universes`

Returns universe list data.

Recommended response shape:

```ts
type UniverseListItem = {
  id: string;
  name: string;
  description: string | null;
  setCount: number;
  cardCount: number;
  deckCount: number;
};
```

### 8.2 `GET /api/universes/:universeId`

Returns universe detail plus linked summaries.

Recommended response shape:

```ts
type UniverseDetail = {
  id: string;
  name: string;
  description: string | null;
  counts: {
    sets: number;
    cards: number;
    decks: number;
  };
  sets: Array<{
    id: string;
    name: string;
    code: string;
    cardCount: number;
  }>;
  decks: Array<{
    id: string;
    name: string;
    format: string;
    cardCount: number;
  }>;
};
```

## 9. Validation API

Validation data should be separated from draft incompleteness.

### 9.1 `GET /api/validation/summary`

Returns high-level project validation data based on the existing validator.

Recommended response shape:

```ts
type ValidationSummaryResponse = {
  counts: {
    universes: number;
    sets: number;
    cards: number;
    decks: number;
    totalFiles: number;
  };
  errors: Array<{
    file?: string;
    message: string;
  }>;
};
```

This maps closely to the existing `validateProject()` output.

### 9.2 `GET /api/validation/entities/:entityId`

Returns validation issues associated with a specific entity when they can be mapped by canonical file or record lookup.

Recommended response shape:

```ts
type EntityValidationResponse = {
  entityId: string;
  hasErrors: boolean;
  errors: Array<{
    file?: string;
    message: string;
  }>;
};
```

If entity-level mapping is not easy in the first implementation, this route can be deferred, but the spec is still useful as a target.

## 10. Supporting API

### 10.1 `GET /api/meta/filters`

Returns precomputed filter options for the UI.

Recommended response shape:

```ts
type FilterMetadata = {
  statuses: string[];
  colors: string[];
  rarities: string[];
  universes: EntityReference[];
  sets: Array<{
    id: string;
    name: string;
    code: string;
    universeId: string;
  }>;
  decks: EntityReference[];
};
```

This allows the frontend to build filter controls without deriving everything itself.

### 10.2 `GET /api/health`

Returns a minimal health check.

Recommended response shape:

```json
{
  "data": {
    "ok": true
  }
}
```

## 11. Recommended Route Set For V1

The smallest useful route set is:

- `GET /api/health`
- `GET /api/meta/filters`
- `GET /api/cards`
- `GET /api/cards/:cardId`
- `GET /api/decks`
- `GET /api/decks/:deckId`
- `GET /api/sets`
- `GET /api/sets/:setId`
- `GET /api/universes`
- `GET /api/universes/:universeId`
- `GET /api/validation/summary`

## 12. Recommended Server-Side Derivations

The API should compute these fields rather than forcing the frontend to recompute them:

- card set and universe references
- deck membership for a card
- card counts per set and universe
- deck summary counts
- `hasUnresolvedMechanics`
- `unresolvedFields`
- image renderability and fallback state
- validation summary counts where available

## 13. Error Codes

Recommended initial error codes:

- `not_found`
- `invalid_query`
- `validation_unavailable`
- `internal_error`

## 14. Implementation Decisions

These implementation decisions are recommended for the first API version:

- [x] Include optional pagination parameters in the API contract, but return full datasets by default in V1
- [x] Keep `q` broadly consistent across endpoints as a lightweight free-text search over the most human-meaningful fields for each entity type
- [x] Return raw canonical values alongside a small set of API-derived UI helpers such as resolved references, draft summaries, validation summaries, and image previews
- [x] Serve local image files through a static file mount and expose browser-friendly URLs in API payloads
- [x] Memoize validation data in memory for a short TTL to reduce repeated filesystem and validation work during local use

## 15. Suggested Next Step

After this spec, the next implementation-oriented artifact should be a small endpoint contract document or TypeScript type file that defines:

- request query types
- response payload types
- route names
- shared view-model utilities
