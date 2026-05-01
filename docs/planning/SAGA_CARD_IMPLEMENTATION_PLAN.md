# Saga Card Implementation Plan

## Purpose

This document describes what Cloud Arena would need in order to support Saga cards.

A Saga is a permanent card that enters the battlefield, receives lore counters over time, resolves chapter abilities as those counters are reached, and then leaves the battlefield for the graveyard when its final chapter is complete. The feel should be close to Magic: The Gathering Sagas: the card tells a story in numbered chapter beats, and the visual layout gives the chapter text more room than a normal card.

## Target Player Experience

The baseline behavior should be:

- the player casts a Saga like any other permanent
- the Saga enters a noncreature battlefield slot
- it immediately receives its first lore counter
- the chapter for lore count 1 resolves
- at the start of each later player turn, it receives another lore counter
- each newly reached chapter resolves
- when the Saga has reached and resolved its final chapter, it is moved from the battlefield to its owner's graveyard

The UI should make the current chapter obvious. A player should be able to glance at a Saga and understand:

- how many lore counters it has
- which chapters have already happened
- which chapter is active or resolving
- which chapter will happen next
- when the Saga will be sacrificed or otherwise leave the battlefield

## Current Repo Shape

Relevant existing pieces:

- card types live in `src/cloud-arena/core/types.ts`
- permanent creation lives in `src/cloud-arena/core/permanents.ts`
- turn-start processing lives in `src/cloud-arena/core/reset-round.ts`
- counters are already represented on `PermanentState`
- counter-added triggers already exist
- battlefield cleanup already moves defeated player permanents to `player.graveyard`
- display models are built through `src/presentation/display-card.ts`
- the React card renderer lives at `apps/cloud-arena-web/src/components/display-card.tsx`
- CSS for the card face lives in `apps/cloud-arena-web/src/app/base-html.ts`

The current engine can represent generic named counters, but its counter model is still mostly stat-oriented. Sagas need semantic counters that do not imply power or health changes.

## Engine Changes

### 1. Add Saga as a Permanent Type

Extend the permanent card type union:

```ts
export type PermanentCardType =
  | "artifact"
  | "battle"
  | "creature"
  | "enchantment"
  | "land"
  | "planeswalker"
  | "saga";
```

The recommended MTG-compatible type line is `Enchantment - Saga`. In the engine this can be represented either as:

```ts
cardTypes: ["enchantment", "saga"]
```

or as `cardTypes: ["saga"]` with display code adding the "Enchantment" parent type. The first option is better because selectors can ask for enchantments without special Saga handling.

### 2. Add a Saga Definition Block

Add a Saga-specific metadata block to `PermanentCardDefinition`.

```ts
export type SagaChapter = {
  chapter: number;
  label?: string;
  effects: Effect[];
};

export type SagaDefinition = {
  loreCounter?: CounterName; // default: "lore"
  addLoreTiming?: "enters_and_turn_start";
  chapters: SagaChapter[];
  sacrificeAfterChapter?: number; // default: max chapter
};

export type PermanentCardDefinition = BaseCardDefinition & {
  cardTypes: PermanentCardType[];
  power: number;
  health: number;
  saga?: SagaDefinition;
  // existing fields...
};
```

For v1, every Saga should use a simple numeric chapter list. Later, the model can support combined chapters like `I, II` by allowing a chapter range or repeated entries with the same effects.

### 3. Support Non-Stat Counters

`PermanentCounter` currently expects a `stat`, and counter display code groups by power and health. Lore counters should not need a stat.

Change the counter model so `stat` is optional:

```ts
export type PermanentCounter = {
  id: string;
  counter: CounterName;
  stat?: CounterStat;
  amount: number;
  sourceKind: CounterSourceKind;
  sourceId: string;
  expiresAtTurnNumber?: number;
};
```

Then update helpers so:

- stat counters still affect derived power and health
- semantic counters like `lore` are counted but do not alter stats
- `getPermanentCounterCount(permanent, "lore")` works without a stat
- counter summaries can include lore counters for UI display

### 4. Add a Direct Sacrifice or Move Effect

Sagas need to leave the battlefield even when they have not taken damage. The existing `sacrifice` effect can choose permanents, but Saga expiry should be deterministic and source-driven.

Recommended engine addition:

```ts
type Effect =
  | {
      type: "sacrifice_self";
    }
  // existing effects...
```

Alternatively, create a reusable helper such as `movePermanentToGraveyard(state, permanentId, reason)`. That helper should:

- remove the permanent from its battlefield slot
- push the original card instance into the owner's graveyard
- emit `permanent_left_battlefield`
- emit `permanent_destroyed` only if the reason is destruction
- clear attachments or move attached cards according to the attachment rules

For Sagas, the reason should be sacrifice, not combat destruction. That distinction matters for future cards that care about dying versus leaving.

### 5. Resolve Lore Counters Centrally

Add a Saga processing step instead of making every Saga author hand-write turn-start triggers.

Recommended flow:

1. When a Saga enters the battlefield, add one lore counter.
2. Resolve all chapters whose chapter number equals the new lore count.
3. At the start of the Saga controller's turn, add one lore counter.
4. Resolve all chapters newly reached by that counter.
5. If the lore count is greater than or equal to `sacrificeAfterChapter`, move the Saga to the graveyard after chapter effects finish.

The clean place for the turn-start part is near `resetRound`, after temporary cleanup and before or during general triggered ability processing. The enter-the-battlefield part can live in `summonPermanentFromCard` immediately after the `permanent_entered` event, or in a Saga-specific listener that reacts to that event.

Avoid resolving Saga chapters twice. A robust v1 implementation can store a small runtime marker on the permanent:

```ts
sagaState?: {
  resolvedChapters: number[];
};
```

That prevents repeated resolution if a card adds multiple lore counters, removes counters, or reprocesses triggers.

### 6. Handle Multiple Lore Counters

MTG rules allow several lore counters to be added at once. The engine should support that even if v1 cards only add one per turn.

If a Saga goes from one lore counter to three, it should resolve chapter 2 and chapter 3 in order. The chapter resolver should compare the previous lore count to the new lore count and run every chapter where:

```ts
previousLoreCount < chapter && chapter <= newLoreCount
```

### 7. Ordering With Other Triggers

For v1, Saga chapter abilities can resolve immediately as part of the lore-counter operation. That is simpler than putting chapter abilities onto a stack.

Recommended ordering:

- enter battlefield event is emitted
- Saga gets lore counter 1
- chapter 1 effects resolve
- normal `self_enters_battlefield` and `counter_added` triggers can still process according to the existing rules event flow

If strict MTG ordering becomes important later, Saga chapters should be represented as triggered abilities caused by adding lore counters. For now, deterministic immediate resolution is easier to test and easier for the UI to explain.

## App And API Changes

### 1. Expose Saga Runtime State

Permanent snapshots should expose Saga-specific data to the app:

```ts
saga?: {
  loreCounter: number;
  finalChapter: number;
  activeChapter: number | null;
  resolvedChapters: number[];
  chapters: Array<{
    chapter: number;
    label: string;
    text: string;
    resolved: boolean;
    active: boolean;
  }>;
};
```

This can be derived from the card definition plus the permanent's counters. The API does not need to send raw effect objects to the client; it should send display-ready chapter text produced by the existing card summary layer or a new Saga summary helper.

### 2. Display Lore Counters Separately

The current display-card counter panel only understands Power and Health pills. Add a generic counter pill path for named counters:

- lore counters should show as `Lore 2` or a small chapter-marker rail
- power and health counters should keep their current combat-focused treatment
- generic counters should appear in the inspector and on the battlefield card without implying stat changes

This requires widening `DisplayCardCounterPill` from `"Power" | "Health"` to a general label/tone model.

### 3. Add a Saga Display Variant or Layout Profile

The existing `DisplayCardModel` supports variants like `mtg`, `player`, `enemy`, and `permanent`. Sagas need a presentation profile rather than a brand-new game object.

Recommended addition:

```ts
export type DisplayCardVariant = "mtg" | "player" | "enemy" | "permanent" | "saga";
```

or:

```ts
layoutProfile?: "default" | "saga";
```

The profile approach is more flexible because a Saga is still an MTG-like permanent, but it needs a different internal layout.

### 4. Saga Card Layout

The Saga card face should be closer to MTG's Saga layout:

- normal title and mana cost across the top
- type line reads `Enchantment - Saga`
- the text panel becomes the dominant body region
- chapter text is placed on the left side in a vertical sequence
- art appears on the right side as a tall, narrow image
- each chapter has a visible marker such as `I`, `II`, `III`, or numeric chapter badges
- the current lore count highlights the matching chapter marker
- resolved chapters can appear subdued or checked
- flavor text is optional and should not crowd chapter text

In CSS terms, the inner body of `.card-face` can switch to a two-column Saga layout:

```css
.card-face.is-saga .card-face-saga-body {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(5rem, 0.9fr);
  gap: 0.45rem;
}
```

The text side should own the larger column. The art side should use `object-fit: cover` and preserve a stable aspect ratio so cards do not shift when images load.

### 5. Inspector And Battlefield Readability

Sagas will often sit in noncreature slots, so their battlefield rendering should avoid creature combat clutter.

Battlefield card requirements:

- no power/health footer unless a Saga explicitly has stats for a custom mode
- show lore count prominently
- show the active or next chapter in the compact battlefield view
- show full chapter text in the inspector
- animate or visually pulse when a new lore counter is added
- log chapter resolution in the battle log

### 6. Card Builder And Gallery Flow

If the deckbuilder or gallery card-maker creates Sagas, the authoring form needs fields for:

- chapter count
- chapter labels or Roman numerals
- chapter rules text
- chapter effects
- art crop preference for right-side vertical art
- final chapter behavior

The gallery workflow should prefer wide or detailed artwork that can survive a narrow right-side crop. It should avoid faces or key action being cropped out when the art is placed in the Saga rail.

## Card Design Guidance

### Mechanical Identity

A Cloud Arena Saga should be a delayed value engine. It should not just be a spell with extra steps. Good Saga designs create a sequence:

- chapter 1 stabilizes or sets up
- chapter 2 changes the board or rewards the setup
- chapter 3 pays off and then the Saga leaves

Sagas are best for story moments, prophecies, judgments, journeys, and historical episodes.

### Costing

Because a Saga produces effects across multiple turns, its cost should account for:

- the immediate chapter 1 effect
- the delayed value of later chapters
- the risk that the battle ends before later chapters resolve
- the battlefield slot it occupies
- any synergies with enchantments, counters, or graveyard triggers

The first Saga cards should be conservative. It is easier to buff delayed cards than to unwind a Saga that wins every long battle by itself.

### Chapter Count

Recommended v1 range:

- two chapters for fast Arena battles
- three chapters for normal Saga cards
- four chapters only for bossy or high-rarity designs

Longer Sagas are risky because Cloud Arena turns can be decisive. A five-chapter card may never reach its ending unless the whole deck is built to prolong the game.

### Example Definition

```ts
export const writingOnTheWallSagaDefinition: CardDefinition = {
  id: "writing_on_the_wall_saga",
  name: "Writing on the Wall",
  cost: 2,
  manaCost: "{2}{W}",
  cardTypes: ["enchantment", "saga"],
  subtypes: [],
  rarity: "rare",
  power: 0,
  health: 1,
  onPlay: [],
  saga: {
    loreCounter: "lore",
    chapters: [
      {
        chapter: 1,
        effects: [
          {
            type: "gain_block",
            target: "player",
            amount: { type: "constant", value: 5 },
          },
        ],
      },
      {
        chapter: 2,
        effects: [
          {
            type: "deal_damage",
            target: { zone: "enemy_battlefield", controller: "opponent", cardType: "creature" },
            amount: { type: "constant", value: 3 },
          },
        ],
      },
      {
        chapter: 3,
        effects: [
          {
            type: "draw_card",
            target: "player",
            amount: { type: "constant", value: 1 },
          },
        ],
      },
    ],
  },
  abilities: [],
  display: {
    frameTone: "white",
    imagePath: "gallery-belshazzars-feast.jpg",
    imageAlt: "Belshazzar sees the writing on the wall",
    artist: "John Martin",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "S001",
  },
};
```

For display text, that same card should read like:

```text
I - You gain 5 block.
II - Deal 3 damage to target enemy creature.
III - Draw a card.
```

### Thematic Examples

Good biblical Saga candidates:

- Creation Week
- The Flood Rises
- The Writing on the Wall
- Exodus from Egypt
- Forty Days in the Wilderness
- The Passion
- The Road to Emmaus
- Seven Seals

Each should have chapters that feel sequential rather than interchangeable.

## Tests

Add focused tests for:

- a Saga enters with one lore counter
- chapter 1 resolves immediately
- start of turn adds one lore counter
- chapter 2 and chapter 3 resolve on later turns
- the Saga moves to graveyard after its final chapter
- adding multiple lore counters resolves skipped chapters in order
- lore counters do not modify power or health
- removing a lore counter does not cause an already resolved chapter to resolve again
- generic counter display includes lore counters
- the Saga renderer places text left and art right

## Recommended First Slice

The smallest useful implementation is:

1. allow semantic counters by making `PermanentCounter.stat` optional
2. add `cardTypes: ["enchantment", "saga"]`
3. add `saga` metadata to permanent card definitions
4. create a Saga resolver for enter-the-battlefield and player turn start
5. add a deterministic self-sacrifice path that moves the Saga to graveyard
6. expose Saga lore count and chapters in permanent snapshots
7. add a Saga layout profile to the display-card renderer
8. author one simple three-chapter Saga as a proof of concept

That slice proves the whole feature without forcing a broad presentation rewrite.
