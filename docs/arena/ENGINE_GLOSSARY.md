# Cloud Arena Engine Glossary

This document defines the main Cloud Arena engine terms we use when authoring cards and rules.

It is meant as a vocabulary reference for abilities, effects, selectors, and other data-driven engine concepts.

## Ability Model

Cloud Arena is data-driven. Most card behavior comes from attaching abilities to card definitions.

### Ability kinds

Supported ability kinds are defined in `src/cloud-arena/core/types.ts`:

- `triggered`
- `activated`
- `static`
- `replacement`

Where they are authored:

- permanent and spell definitions under `src/cloud-arena/cards/definitions/*.ts`
- tests that build custom card definitions under `tests/cloud-arena/`

### Triggered ability

A triggered ability listens for an event, may check conditions, and then runs effects.

Supported trigger events:

- `self_enters_battlefield`
- `permanent_enters_battlefield`
- `permanent_died`
- `permanent_left_battlefield`
- `permanent_attacked`
- `permanent_blocked`
- `permanent_becomes_blocked`
- `counter_added`
- `card_drawn`
- `card_discarded`
- `turn_started`

### Activated ability

An activated ability is manually used by the player or another engine action.

Current activation shape:

- `type: "action"`
- `actionId: string`

### Static ability

A static ability continuously modifies a derived stat.

Supported derived stats:

- `power`
- `health`
- `block`

### Replacement ability

A replacement ability can intercept an event and swap in alternate behavior.

## Effect Model

Supported effect types are defined in `src/cloud-arena/core/types.ts` and resolved in `src/cloud-arena/core/effects.ts`.

- `sacrifice`
- `add_counter`
- `remove_counter`
- `deal_damage`
- `gain_block`
- `draw_card`
- `summon_permanent`
- `attach_from_hand`
- `attach_from_battlefield`

Equipment permanents on the battlefield get a built-in `Equip` activated ability that resolves through `attach_from_battlefield`.

For `add_counter`, prefer the structured stat-delta shape:

```ts
{
  type: "add_counter",
  target: {
    zone: "battlefield",
    controller: "you",
    cardType: "creature",
  },
  targeting: {
    prompt: "Choose a creature to bless",
  },
  powerDelta: 1,
  healthDelta: 1,
}
```

The engine still accepts the older `counter` / `stat` / `amount` shape for compatibility, but the structured delta form is the preferred authoring style.

## Value Expressions

Many effects accept a `ValueExpression` instead of a raw number.

Supported value expression kinds:

- `constant`
- `count`
- `counter_count`
- `property`

## Selector Model

Effects and conditions often point at a `Selector`.

Common selector fields:

- `zone`
- `controller`
- `cardType`
- `subtype`
- `relation`
- `source`

## Where To Look For Examples

- `src/cloud-arena/cards/definitions/guardian.ts`
- `src/cloud-arena/cards/definitions/sacrificial-seraph.ts`
- `src/cloud-arena/cards/definitions/anointed-banner.ts`
- `src/cloud-arena/cards/definitions/choir-captain.ts`
- `tests/cloud-arena/effects.test.ts`
- `tests/cloud-arena/triggers.test.ts`
- `tests/cloud-arena/static-modifiers.test.ts`
