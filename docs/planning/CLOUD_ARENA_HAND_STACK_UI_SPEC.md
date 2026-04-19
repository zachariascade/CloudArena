# Cloud Arena Hand Stack UI Spec

## Goal

Make the player hand in Cloud Arena feel like a real held hand of cards instead of a flat horizontal strip.

The desired behavior is:

- cards overlap slightly in the hand tray
- each card is still individually selectable
- hovering or focusing a card raises it above the rest
- the hovered card becomes visually dominant so the full card is readable
- the interaction should feel tactile, but should not interfere with gameplay targeting or details actions

## Current State

The current hand UI is functional but visually flat.

Relevant pieces:

- [`apps/cloud-arena-web/src/components/cloud-arena-hand-tray.tsx`](../../apps/cloud-arena-web/src/components/cloud-arena-hand-tray.tsx)
- [`apps/cloud-arena-web/src/components/display-card.tsx`](../../apps/cloud-arena-web/src/components/display-card.tsx)
- [`apps/cloud-arena-web/src/lib/cloud-arena-display-card.ts`](../../apps/cloud-arena-web/src/lib/cloud-arena-display-card.ts)
- [`apps/cloud-arena-web/src/app/base-html.ts`](../../apps/cloud-arena-web/src/app/base-html.ts)

Today the hand tray:

- renders cards in a horizontal scroll row
- uses `DisplayCard` for the card face
- exposes inspector hover/focus interactions through `bindInspectorInteractions`
- adds a `details` button below each card
- already distinguishes playable vs disabled hand cards

## Product Intent

The hand should feel like a physical hand of cards:

- cards are fanned or stacked enough to imply depth
- the card order matters visually
- the topmost/active card should win overlap conflicts
- hovering a card should lift it and reduce the overlap so the whole frame is visible

This is a presentation change only.

It should not change:

- rules for playing a card
- target selection
- card legality
- hand contents or ordering semantics
- the existing details/inspection model

## Proposed UX

### Resting State

When no card is hovered:

- cards overlap horizontally by a small amount
- the left-to-right order still matches hand order
- each later card sits slightly higher in `z-index` so overlap is readable
- the hand looks like a fanned stack rather than a row of independent tiles

### Hover And Focus State

When a card is hovered or keyboard-focused:

- it lifts slightly upward
- it scales up a bit
- it rotates back toward `0deg`
- it receives the top `z-index`
- neighboring cards remain visible but recede

### Selection State

When a card is playable or targeted:

- the existing playable/disabled styling stays intact
- the visual stack should not hide action affordances
- targetable cards may optionally get a stronger outline or glow, but only as a secondary layer on top of the hand stack treatment

## Interaction Rules

### Pointer

- Hovering a card should raise that card only.
- Moving from one card to another should transition smoothly.
- Clicking a card should keep the existing click/inspect behavior.

### Keyboard

- Tabbing through the hand should move through cards in order.
- Focus should visually match hover behavior.
- Focus should not require a mouse to make the card readable.

### Details Button

- The `details` button remains available.
- The button should remain reachable even when cards overlap.
- The card shell may need a slightly larger click/focus hit area to preserve usability.

## Layout Model

Use a staggered hand layout rather than a strict grid or scroll row.

Recommended structure:

- the tray still owns the overall hand region
- the hand cards are laid out in a single row
- each card gets a small per-index offset from React or CSS custom properties
- the first few cards get the largest visual separation
- later cards can cap their offset so the hand does not drift too far off-center

Suggested visual parameters:

- horizontal overlap: small, around one third to one half of a card-width step
- vertical lift: very small in the resting state
- hover lift: noticeable but not dramatic
- rotation: subtle and varied by card index
- hover scale: just enough to expose the full art and frame

## Recommended Component Boundary

Keep the implementation centered in the existing hand tray rather than spreading it across the battle UI.

### Primary Owner

- [`apps/cloud-arena-web/src/components/cloud-arena-hand-tray.tsx`](../../apps/cloud-arena-web/src/components/cloud-arena-hand-tray.tsx)

### Supporting Style Layer

- [`apps/cloud-arena-web/src/app/base-html.ts`](../../apps/cloud-arena-web/src/app/base-html.ts)

### Data Mapping

- [`apps/cloud-arena-web/src/lib/cloud-arena-display-card.ts`](../../apps/cloud-arena-web/src/lib/cloud-arena-display-card.ts)

The card model itself should not need a new gameplay field unless we later want explicit presentation metadata.

## Implementation Approach

### Option A: CSS-First Stack

Use CSS custom properties and per-card index styling:

- assign stack offset and tilt per card from the hand tray
- translate cards with negative inline margin or `transform`
- elevate hovered/focused cards with a higher `z-index`

This is the simplest option and should be the default choice.

### Option B: Presentation Metadata On The View Model

Add an optional hand presentation field to the display model:

- fan position
- rotation
- depth ordering

This is only worth doing if the layout needs to become more dynamic later.

For the first version, CSS-first is better because it keeps the logic local and low-risk.

## Accessibility Requirements

- cards must remain tabbable in hand order
- hover behavior must have a keyboard equivalent
- focus rings must remain visible above the stack
- text should remain readable at the default zoom level
- the stacked layout must not trap the pointer or make buttons impossible to reach

## Responsive Requirements

The hand stack should adapt to viewport width:

- on wide screens, use a more pronounced overlap/fan
- on narrower screens, reduce the overlap so cards remain distinguishable
- if the hand grows too large for the available width, the tray may fall back to a mild scroll affordance
- mobile should favor usability over the full theatrical fan effect

## Visual Constraints

The stack should feel physical without becoming noisy.

Avoid:

- large rotations
- large scale jumps
- cards drifting so far apart that the hand stops reading as a hand
- a hover effect that causes the card to jump under adjacent controls

## Non-Goals

This work does not require:

- changing the card face artwork system
- changing the arena combat engine
- changing card play rules
- adding drag-and-drop
- adding card sorting controls
- changing graveyard, discard, or draw pile behavior

## Suggested Phases

### Phase 1: Hand Stack Presentation

Implement the overlapping fan/stack for the player hand.

### Phase 2: Hover And Focus Elevation

Add the lift-to-front behavior and ensure keyboard parity.

### Phase 3: Playability Polish

Confirm playable cards, disabled cards, and the details button all still read clearly in the stacked state.

### Phase 4: Responsive Tuning

Adjust overlap and hover lift for desktop, tablet, and narrow layouts.

## Acceptance Criteria

The feature is done when:

- the player hand reads as a staggered stack of cards
- hovering a card raises it above the others
- the hovered card becomes fully readable
- keyboard focus behaves the same way as hover
- playable cards remain obvious
- details and inspect interactions still work
- no gameplay behavior changes are introduced

## Open Questions

- Should the hand fan be strongest on the left edge, the right edge, or centered symmetrically?
- Should playable cards get a slightly stronger lift than unplayable cards?
- Should the stack effect flatten out when the hand contains many cards?

