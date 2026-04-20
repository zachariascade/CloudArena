# Flexible Card Presentation Plan

## Goal

Expand the definition of what a "card" can be in Cloud Arcanum so we are not locked into MTG-style cards as the only canonical presentation model, while still remaining fully compatible with MTG-style definitions and rendering.

This plan is especially relevant for Cloud Arena, where we want to use card-like visual elements for:

- player entities
- enemy entities
- playable cards
- permanents on the battlefield

The long-term goal is not just "make Arena look more like cards," but to create a broader presentation system where "card" means a configurable content object with shared identity, art, metadata, stats, and display regions.

## Current State

Today, there are two adjacent but different models:

1. Cloud Arcanum card data is rich and MTG-shaped.

- `name`
- `title`
- `typeLine`
- `manaCost`
- `oracleText`
- `flavorText`
- `power/toughness/loyalty/defense`
- `image`
- set/universe metadata

2. Cloud Arena data is mechanically focused.

- arena cards know battle rules and costs
- enemies mostly know combat values and name
- player state is numeric and not visually modeled as a card-like entity

This makes the Arena UI functional, but it prevents the visual system from becoming a reusable design language.

## Product Direction

We should separate these ideas:

- **game mechanics definition**
- **presentation definition**
- **presentation profile**

That lets us say:

- A thing may be rendered as a card without being an MTG card.
- A thing may use an MTG-compatible profile when appropriate.
- Multiple entities can share a visual grammar without sharing the same rules schema.

## Core Proposal

Introduce a more general concept than "MTG card":

- `EntityDefinition` or `RenderableEntityDefinition`

Then allow one or more presentation profiles on top of it:

- `mtg_card`
- `arena_character`
- `arena_enemy`
- `arena_permanent`
- `artifact_panel`
- `timeline_token`

MTG becomes one supported profile, not the only shape the system understands.

## Recommended Model Split

### 1. Canonical Identity Layer

Every renderable object should have a shared base identity:

- `id`
- `name`
- `title`
- `subtitle`
- `kind`
- `tags`
- `image`
- `theming`
- `sourceUniverseId`

This layer is intentionally broad and should work for:

- a traditional card
- a hero portrait-card
- an enemy boss panel
- a battlefield summon
- a relic/object

### 2. Mechanics Layer

Mechanics should be game-specific and not drive the display schema directly.

Examples:

- MTG card mechanics
- Cloud Arena battle mechanics
- deckbuilding metadata
- enemy behavior scripting

This means an enemy can be mechanically defined as an Arena combatant while still borrowing card-like presentation fields.

### 3. Presentation Layer

Presentation should be configurable and profile-based.

Suggested fields:

- `profile`
- `frame`
- `layoutRegions`
- `primaryStats`
- `secondaryStats`
- `rulesText`
- `badges`
- `actions`
- `imageCrop`
- `backgroundTreatment`

This is where we define how the same underlying entity appears in different contexts.

### 3a. Shared Content Sections

The underlying content sections should be the same across profiles. The UI object should not invent separate content trees for each presentation mode.

Instead, define one shared section model that can be rendered differently depending on profile and context.

Examples of shared sections:

- identity section
- art section
- rules or summary section
- stat section
- status section
- action section
- metadata section

Each profile can reorder, resize, emphasize, hide, or compress these sections, but the underlying section data stays consistent.

This keeps Arena and MTG-style cards aligned at the data level while still allowing the UI to present them very differently.

## Important Design Principle

Do not model "card" as a single fixed object with optional MTG leftovers.

Instead:

- model a flexible base entity
- model a presentation profile
- model a renderer that understands that profile

This avoids slowly turning one giant MTG card type into an unmaintainable kitchen sink.

## MTG Compatibility Strategy

We should preserve full compatibility with existing MTG-style card definitions by treating them as a first-class profile.

### MTG-Compatible Profile Should Continue To Support

- name line
- title/subtitle
- mana cost
- type line
- art box
- oracle text
- flavor text
- P/T or loyalty/defense area
- rarity/set treatment

### Why This Is Better Than Generalizing The Current MTG Card Type

If we keep expanding the existing MTG card type to also represent players, enemies, and abstract Arena entities, we will eventually get:

- unclear required fields
- too many nulls
- implicit rendering assumptions
- UI components that only work because they know hidden MTG conventions

Treating MTG as one profile keeps that rendering strong without making it the source of truth for everything else.

## Cloud Arena Direction

Cloud Arena should become a consumer of the generalized presentation system.

### Arena Use Cases

#### Player

The player can render as a hero-card or character panel with:

- name
- title
- portrait/art
- health
- block
- energy
- passive identity or class text

#### Enemy

The enemy can render as a boss-card or character card with:

- name
- title or epithet
- art
- health
- block
- current intent
- threat or phase markers

#### Hand Cards

Hand cards can render with either:

- an MTG-compatible layout
- a simplified Arena action-card layout

depending on the chosen profile.

#### Permanents

Permanents can reuse the same shared card shell, but with a board-oriented presentation profile that emphasizes:

- health
- block
- ready/acted state
- defend/attack actions

## Suggested Architecture

### Phase 1: Introduce Shared Presentation Definitions

Add a new shared UI-facing model, for example:

- `RenderableEntityDefinition`
- `RenderableEntityProfile`
- `RenderableImage`
- `RenderableStat`

This should live in a shared place that both the web app and Cloud Arena presentation layer can consume.

### Phase 2: Create a Mapping Layer

Add a transformation layer that maps existing data into the new presentation shape.

Examples:

- Cloud Arcanum `CardDetail` -> `RenderableEntityDefinition`
- Cloud Arena hand card snapshot -> `RenderableEntityDefinition`
- Arena enemy preset -> `RenderableEntityDefinition`
- Arena player preset -> `RenderableEntityDefinition`

This avoids rewriting the engine and lets us adapt incrementally.

The mapping layer should preserve the same underlying section payloads and only adapt presentation concerns such as ordering, emphasis, and visibility.

### Phase 3: Build a New Generic Renderer

Create a renderer such as:

- `EntityCard`

It should support profile-based variants, for example:

- `profile="mtg_card"`
- `profile="arena_character"`
- `profile="arena_enemy"`
- `profile="arena_permanent"`

This component should own layout decisions based on profile rather than hardcoding MTG assumptions everywhere.

### Phase 4: Keep MTG-Specific Components As Specialized Wrappers

Existing components like the current card face UI can remain, but they should eventually become wrappers around the generic renderer or a sibling specialized renderer that consumes the same shared presentation model.

That gives us:

- backward compatibility
- a path to gradual migration
- less duplicated visual logic

## Suggested Type Shape

This is not final code, but a direction worth exploring:

```ts
type RenderableEntityDefinition = {
  id: string;
  kind: "card" | "character" | "enemy" | "permanent" | "artifact";
  name: string;
  title?: string | null;
  subtitle?: string | null;
  tags?: string[];
  image?: RenderableImage | null;
  presentation: RenderablePresentation;
  mechanicsRef?: {
    system: "mtg" | "cloud_arena" | string;
    id: string;
  };
};

type RenderablePresentation = {
  profile: "mtg_card" | "arena_character" | "arena_enemy" | "arena_permanent";
  typeLine?: string | null;
  cost?: string | number | null;
  textBlocks?: Array<{
    kind: "rules" | "flavor" | "intent" | "passive";
    text: string;
  }>;
  primaryStats?: Array<{
    label: string;
    value: string | number;
  }>;
  secondaryStats?: Array<{
    label: string;
    value: string | number;
  }>;
  badges?: string[];
};
```

This preserves MTG compatibility while broadening the system enough to support non-MTG entities naturally.

## File and Layer Suggestions

### New Shared Types

Possible locations:

- `src/presentation/`
- `src/entities/`
- `src/ui-schema/`

Recommended:

- `src/presentation/types.ts`
- `src/presentation/renderable-entity.ts`

### Arena Mapping Layer

Possible locations:

- `apps/cloud-arcanum-web/src/lib/cloud-arena-presentation.ts`
- `apps/cloud-arcanum-web/src/lib/renderable-entity-mappers.ts`

### Shared Renderer

Possible location:

- `apps/cloud-arcanum-web/src/components/entity-card.tsx`

## Data Strategy Recommendations

### Recommendation 1

Keep existing card/domain records intact for now.

Do not immediately rewrite the existing Cloud Arcanum card schema. Instead, add a new presentation abstraction and mapping layer on top.

### Recommendation 2

Add explicit presentation definitions for Arena-only entities.

For example:

- player visual profiles
- enemy visual profiles
- permanent visual profiles

These should not need to masquerade as MTG cards in storage.

### Recommendation 3

Let real cards map directly when appropriate.

If an Arena hand card corresponds to a real Cloud Arcanum card, it should be able to inherit:

- name
- title
- image
- type line
- flavor/rules text

while still layering Arena-specific mechanics display on top.

## Risks

### Risk 1: Over-generalization

If the shared model becomes too abstract, it may stop being useful and force every renderer to re-interpret it.

Mitigation:

- keep a small strong core
- use profile-specific fields when needed
- accept that some renderers may still have specialized wrappers

### Risk 2: Hidden MTG assumptions leaking back in

Even after generalizing, the renderer may still assume:

- mana costs always exist
- type lines always look like MTG type lines
- stats always mean P/T

Mitigation:

- profile-driven rendering
- component props that do not assume MTG terminology
- explicit fallback handling for missing regions

### Risk 3: Mixing mechanics and presentation again

If Arena combat stats become the source of layout shape, we end up tightly coupling gameplay and UI.

Mitigation:

- keep mechanics objects and presentation objects separate
- use mapping functions between them

## Proposed Rollout

### Step 1

Write the shared presentation types and decide profile names.

### Step 2

Build a first-pass `EntityCard` component with:

- art
- name/title
- type/subtitle
- stat region
- text region

### Step 3

Map current Cloud Arcanum card data into the new renderer using an `mtg_card` profile.

### Step 4

Map Cloud Arena enemy and player into `arena_enemy` and `arena_character` profiles.

### Step 5

Replace current Arena hand/permanent UI with the new renderer incrementally.

### Step 6

Evaluate whether the original MTG-specific card face component should become:

- a wrapper around the new renderer
- or a specialized sibling renderer that shares lower-level presentation primitives

## Recommendation

The best path is:

1. Keep MTG card compatibility as a supported presentation profile.
2. Introduce a broader renderable entity model above game-specific schemas.
3. Let Cloud Arena use that model for player, enemy, hand cards, and permanents.
4. Migrate through mapping layers, not a hard schema rewrite.

This gives us a much more future-proof system:

- flexible enough for non-MTG UI
- compatible with current card data
- reusable across Arena and the broader Cloud Arcanum app

## Suggested Next Deliverable

The next practical step should be a short technical spec that defines:

- the exact shared TypeScript types
- the initial supported presentation profiles
- the mapping strategy for MTG cards, Arena enemies, Arena player, and Arena permanents
- which existing component should be refactored first

That would be enough to move from concept to implementation without overcommitting too early.
