# Flexible Rules Engine TODO

This document outlines an incremental plan for evolving the current Cloud Arena combat engine into a more flexible rules engine that can support triggered abilities, dynamic scaling, counters, and attachment-style mechanics.

The goal is not to parse English card text directly.

Instead, the engine should move toward a structured rules model built from:

- abilities
- triggers
- conditions
- selectors
- value expressions
- effect primitives

## Reference Schema Sketches

These are not final APIs. They are reference sketches to keep implementation direction consistent while the engine is still evolving.

```ts
type Ability = {
  id?: string;
  kind: "triggered" | "activated" | "static" | "replacement";
  trigger?: Trigger;
  conditions?: Condition[];
  effects?: Effect[];
  modifier?: StatModifier;
};
```

```ts
type Trigger =
  | { event: "self_enters_battlefield" }
  | { event: "permanent_enters_battlefield"; selector?: Selector }
  | { event: "permanent_died"; selector?: Selector }
  | { event: "counter_added"; selector?: Selector; counter?: string }
  | { event: "turn_started"; player: "self" | "controller" | "opponent" };
```

```ts
type Condition =
  | { type: "exists"; selector: Selector }
  | { type: "compare"; left: ValueExpression; op: "==" | "!=" | ">" | ">=" | "<" | "<="; right: ValueExpression };
```

```ts
type Selector = {
  zone?: "battlefield" | "hand" | "graveyard" | "discard";
  controller?: "you" | "opponent" | "any";
  cardType?: "permanent" | "equipment" | "instant";
  subtype?: string;
  relation?: "self" | "another";
  source?: "trigger_subject" | "ability_source";
};
```

```ts
type ValueExpression =
  | { type: "constant"; value: number }
  | { type: "count"; selector: Selector }
  | { type: "counter_count"; target: "self"; counter: string }
  | { type: "property"; target: "self" | "trigger_subject"; property: "health" | "block" | "damage" };
```

```ts
type Effect =
  | {
      type: "sacrifice";
      selector: Selector;
      amount: number;
      choice: "controller";
    }
  | {
      type: "add_counter";
      target: "self" | Selector;
      counter: string;
      amount: ValueExpression;
    }
  | {
      type: "deal_damage";
      target: "enemy" | "player" | Selector;
      amount: ValueExpression;
    }
  | {
      type: "gain_block";
      target: "self" | "player" | Selector;
      amount: ValueExpression;
    }
  | {
      type: "attach_from_hand";
      selector: Selector;
      target: "self" | Selector;
      optional: boolean;
      cost: "free";
    };
```

```ts
type StatModifier = {
  target: "self";
  stat: "damage" | "health" | "block";
  operation: "add" | "set";
  value: ValueExpression;
};
```

```ts
type PermanentState = {
  instanceId: string;
  sourceCardInstanceId: string;
  definitionId: string;
  controllerId: string;
  health: number;
  maxHealth: number;
  block: number;
  counters: Record<string, number>;
  attachments: string[];
  abilities: Ability[];
};
```

### Example Ability Encodings

Example: "When this enters the battlefield, sacrifice another permanent you control."

```ts
const etbSacrificeAnother: Ability = {
  kind: "triggered",
  trigger: { event: "self_enters_battlefield" },
  effects: [
    {
      type: "sacrifice",
      selector: {
        zone: "battlefield",
        controller: "you",
        cardType: "permanent",
        relation: "another",
      },
      amount: 1,
      choice: "controller",
    },
  ],
};
```

Example: "Whenever a permanent you control dies, put a +1/+1 counter on this."

```ts
const growOnFriendlyDeath: Ability = {
  kind: "triggered",
  trigger: {
    event: "permanent_died",
    selector: {
      zone: "battlefield",
      controller: "you",
      cardType: "permanent",
    },
  },
  effects: [
    {
      type: "add_counter",
      target: "self",
      counter: "+1/+1",
      amount: { type: "constant", value: 1 },
    },
  ],
};
```

Example: "This gets +X damage where X is the number of Angels on the battlefield."

```ts
const angelScaledDamage: Ability = {
  kind: "static",
  modifier: {
    target: "self",
    stat: "damage",
    operation: "add",
    value: {
      type: "count",
      selector: {
        zone: "battlefield",
        subtype: "Angel",
      },
    },
  },
};
```

Example: "When this enters the battlefield, you may attach an Equipment from your hand to it for free."

```ts
const freeEquipmentOnEnter: Ability = {
  kind: "triggered",
  trigger: { event: "self_enters_battlefield" },
  effects: [
    {
      type: "attach_from_hand",
      selector: {
        zone: "hand",
        controller: "you",
        cardType: "equipment",
      },
      target: "self",
      optional: true,
      cost: "free",
    },
  ],
};
```

## 1. Define the Rules Language

- Add a new `Ability` model to `src/cloud-arena/core/types.ts`.
- Separate abilities into `triggered`, `activated`, and `static`.
- Add shared engine types for `Trigger`, `Condition`, `Selector`, `Effect`, and `ValueExpression`.
- Keep existing simple card fields working for now so migration can happen incrementally.

## 2. Expand Game State

- Add counters to permanents, likely as `counters: Record<string, number>`.
- Add attachment support, even if minimal at first, such as `attachments: string[]` or `attachedTo`.
- Add a place for runtime modifiers or derived stats so dynamic buffs do not overwrite printed card values.
- Add ownership and controller metadata to permanents and future attachments.

## 3. Build a Real Rules Event Layer

- Introduce internal rules events separate from UI and log-only events.
- Start with events like `card_played`, `permanent_entered`, `permanent_died`, `counter_added`, and `attachment_attached`.
- Make engine actions emit these events during resolution.
- Preserve the current battle log, but treat it as output rather than the source of rules behavior.

## 4. Add Query and Selector Helpers

- Create reusable selector helpers for things like:
  - permanents you control
  - another permanent you control
  - angels on the battlefield
  - equipment cards in your hand
- Centralize filtering logic so card abilities do not duplicate targeting code.
- Make selectors operate over zones such as battlefield, hand, graveyard, and discard.

## 5. Add Value Expressions

- Implement expression types like:
  - constant number
  - count of matching objects
  - property lookup on self or target
- Start with `count(selector)` since it unlocks effects like "X is the number of angels on the battlefield."
- Add an evaluator function the whole engine can reuse.

## 6. Add Effect Primitives

- Implement generic effects instead of card-specific hardcoding.
- First batch should be:
  - `add_counter`
  - `sacrifice`
  - `deal_damage`
  - `gain_block`
  - `summon_permanent`
  - `attach_from_hand`
- Each effect should be a resolver that can emit follow-up rules events.

## 7. Build Trigger Resolution

- Add a pass that listens for emitted events and finds matching triggered abilities.
- Check trigger conditions, then queue or resolve the resulting effects.
- Start without a full MTG-style stack if needed. A simple deterministic trigger queue is enough for V1.
- Make sure chained events work correctly, such as `sacrifice -> death event -> counter trigger`.

## 8. Support Static Modifiers

- Add a derived-stat calculation layer instead of mutating base stats directly.
- Use it for effects like "this permanent gets +X damage where X is the number of angels on the battlefield."
- Recompute derived stats from board state rather than storing temporary math everywhere.
- Keep printed and base stats separate from modified and current stats.

## 9. Support Attachments and Equipment

- Model equipment as permanents or attachment-capable objects.
- Add attach legality checks.
- Implement "attach from hand for free" as a triggered effect with optional choice handling.
- Decide early whether "play from hand attached" means "put onto battlefield and attach" or a distinct shortcut in your rules system.

## 10. Add Choice Handling

- Add a way for effects to ask for controller choices:
  - choose a permanent to sacrifice
  - choose an equipment from hand
  - may and optional effects
- For now, support deterministic AI or default-choice behavior plus a future hook for interactive play.
- Represent unresolved choices explicitly instead of hiding them inside effect code.

## 11. Migrate Card Definitions

- Keep existing `attack`, `defend`, and `guardian` cards working.
- Add one or two prototype cards using the new schema.
- Express the example cards in structured data to pressure-test the model.
- Only remove old hardcoded fields after the new path proves itself.

## 12. Test in Layers

- Add unit tests for selector matching.
- Add unit tests for expression evaluation.
- Add unit tests for each effect primitive.
- Add integration tests for trigger chains like:
  - enters -> sacrifice another permanent
  - controlled permanent dies -> self gets counter
  - static buff updates when angel count changes
  - enter -> optionally attach equipment from hand

## 13. Refactor Engine Entry Points

- Update `src/cloud-arena/actions/play-card.ts` to resolve effects through the shared ability and effect system.
- Update `src/cloud-arena/actions/use-permanent-action.ts` to use the same primitives where possible.
- Update `src/cloud-arena/core/engine.ts` so cleanup and death processing emit rules events, not just logs.
- Move direct combat math behind reusable resolvers where possible.

## 14. Document the Authoring Pattern

- Write a short spec for how a card author defines abilities in JSON or TypeScript.
- Document supported triggers, selectors, expressions, and effects.
- Include examples for "another permanent," "count subtype," and "attach from hand."
- Make it clear that rules text is flavor and authoring text, while structured abilities drive the engine.

## Recommended First Sprint

1. Add `Ability`, `Selector`, `Effect`, and `ValueExpression` types.
2. Add counters to permanents.
3. Add rules events: `permanent_entered` and `permanent_died`.
4. Implement selectors plus `count(selector)`.
5. Implement `sacrifice` and `add_counter`.
6. Create one prototype card with "ETB sacrifice another permanent" and "whenever your permanent dies, add a counter."

## Follow-Ups To Consider Implementing

These are not part of the minimum first sprint, but they are strong categories to keep in mind as the rules model expands.

### Additional Ability Categories

- Zone-change abilities:
  - "when this leaves the battlefield"
  - "when a card is discarded"
  - "return a card from your graveyard"
- Cast and play distinction:
  - separate "cast", "played", "put onto battlefield", and "enters battlefield"
  - this matters for cheats, summons, and attachment shortcuts
- Combat-state triggers:
  - "when this attacks"
  - "when this blocks"
  - "when this becomes blocked"
- Targeted abilities:
  - target selection should be a first-class concept instead of being hidden in effect code
- Modal and choice abilities:
  - "choose one"
  - "you may"
  - "if you do"
- Conditional and intervening-if abilities:
  - "at end step, if you control 3 Angels"
  - "whenever a creature dies, if it was sacrificed"
- Continuous global modifiers:
  - "Angels you control get +1 damage"
  - "equipped creature has guardian"
- Replacement and prevention effects:
  - "if this would die, return it to hand instead"
  - "damage dealt to this is reduced by 1"
- Delayed triggered effects:
  - "until end of turn"
  - "at the beginning of the next turn"
- Resource and cost manipulation:
  - "the next equipment you play costs 0"
  - "sacrifice a permanent: draw a card"

### Additional Event Categories

- Add events for:
  - `spell_cast`
  - `card_drawn`
  - `card_discarded`
  - `permanent_attacked`
  - `permanent_blocked`
  - `combat_started`
  - `combat_ended`
  - `turn_ended`
  - `phase_started`
  - `player_damaged`
  - `permanent_targeted`
  - `zone_changed`
  - `permanent_left_battlefield`
  - `permanent_sacrificed`
  - `damage_dealt`
- Keep distinctions between `died`, `sacrificed`, and `left_battlefield` so future mechanics do not collapse into one ambiguous event.

### Additional Selector Dimensions

- Consider expanding selectors with:
  - `owner`
  - `name`
  - `tags`
  - `hasCounter`
  - `isTapped` or other status flags
  - `isToken`
  - stat comparisons like damage, health, or cost
  - `equipped` or `attached`
  - `enteredThisTurn`
  - `damagedThisTurn`
  - `targetedBySource`

### Additional Effect Primitive Categories

- Consider adding generic effects for:
  - `draw_card`
  - `discard_card`
  - `move_to_zone`
  - `destroy`
  - `return_to_hand`
  - `exile`
  - `tap`
  - `untap`
  - `heal`
  - `modify_cost`
  - `grant_ability`
  - `remove_counter`
  - `create_token`
  - `search_zone`
  - `copy`
  - `fight`
  - `apply_continuous_effect_until`

### Mechanic Families Worth Pressure-Testing

- Death-matters and sacrifice-matters cards
- Tribe-matters and subtype scaling cards
- Equipment and attachment synergy cards
- Blink, bounce, and re-entry cards
- Graveyard recursion cards
- Temporary combat trick cards
- Counter-as-resource cards
- Life gain and damage payoff cards
- Token and summon-heavy cards
- Lockdown, stun, silence, or other status-effect cards

### Architectural Reminder

- Keep the engine oriented around a reusable pipeline:
  - `event -> trigger match -> conditions -> choices/targets -> effect resolution -> emitted events`
- This should scale better than introducing card-specific procedural logic every time a new mechanic appears.
