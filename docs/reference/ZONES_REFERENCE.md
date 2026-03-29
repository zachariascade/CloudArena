# Magic Zones Reference

Source: [Magic Comprehensive Rules, 2026-02-27](./MagicCompRules-2026-02-27.txt)

Extracted from section `400` of the Comprehensive Rules.

## Core Zones

- `library`
- `hand`
- `battlefield`
- `graveyard`
- `stack`
- `exile`
- `command`

Older rules also reference the `ante` zone.

## Public vs Hidden

- Public zones: `graveyard`, `battlefield`, `stack`, `exile`, `ante`, `command`
- Hidden zones: `library`, `hand`

## Useful Rules to Remember

- If an object would go to another player’s `library`, `graveyard`, or `hand`, it goes to its owner’s corresponding zone instead.
- Instants and sorceries cannot enter the battlefield.
- Conspiracy, phenomenon, plane, scheme, and vanguard cards cannot leave the command zone.
- The order of cards in a library, graveyard, or on the stack cannot be changed unless a rule or effect allows it.

## Zone Changes

- When an object changes zones, it usually becomes a new object with no memory of its previous existence.
- That “new object” rule is one of the most important rules for custom card design and rules validation.
- Counters are not retained when an object changes zones.
- If something in exile is exiled again, it does not change zones, but it still becomes a new object.
- If something is put into the command zone while already there, it likewise becomes a new object.

## Outside the Game

- Outside the game is not a zone.
- Sideboards are outside the game.
- Cards outside the game are generally unaffected by spells and abilities unless a rule or effect specifically allows them to be brought into the game.

## Design Implications

- “Return that card” style effects need to track the right object across zone changes.
- “That permanent” and “that card” often stop referring to the same game object once a zone change happens.
- Zone-change interactions are a common source of unintended custom card behavior.
