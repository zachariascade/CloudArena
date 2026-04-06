# Combat Example

## Purpose

This document shows a simple worked combat example using the current prototype combat rules.

This example is intentionally narrow:

- 1 player
- 1 enemy
- no permanents
- instant/event cards only
- 3 energy per turn
- 100 player health
- 30 enemy health
- enemy intents limited to attack or defend

The goal is to illustrate pacing, card resolution, Block usage, and enemy intent response before adding the extra complexity of permanents.

## Prototype Assumptions Used Here

### Player

- Health: `100`
- Energy per turn: `3`
- Hand size drawn each turn: `5`

### Enemy

- Health: `30`
- Starts with `0 Block`
- Has one intent each turn

### Block Rule

- Damage hits Block first
- Remaining damage then hits health
- Unused Block does not carry over unless a card explicitly says otherwise

## Sample Cards Used In This Example

These are intentionally generic placeholder cards meant only to demonstrate the core combat loop.

### Attack

- Cost: `1`
- Effect: Deal `6` damage to an enemy.

### Defend

- Cost: `1`
- Effect: Gain `7 Block`.

## Example Enemy

### Accusing Spirit

- Health: `30`

Example intents used in this walkthrough:

- Attack for `12`
- Defend for `8 Block`
- Attack for `14`

## Example Combat Walkthrough

### Round 1

Start of round:

- Player health: `100`
- Player Block: `0`
- Enemy health: `30`
- Enemy Block: `0`
- Enemy intent: `Attack for 12`

Player draws 5 cards:

- Attack
- Attack
- Attack
- Defend
- Defend

Player has `3` energy.

#### Player Turn

1. The player casts `Call to Repentance` for `1` energy.
- Remaining energy: `2`

1. The player casts `Attack` for `1` energy.

- Deal `6` damage to the enemy immediately
- Enemy health goes from `30` to `24`
- Remaining energy: `2`

2. The player casts `Attack` for `1` energy.

- Deal `6` damage to the enemy immediately
- Enemy health goes from `24` to `18`
- Remaining energy: `1`

3. The player casts `Defend` for `1` energy.

- Gain `7 Block`
- Player Block goes from `0` to `7`
- Remaining energy: `0`

Player ends turn.

#### Enemy Turn

Enemy intent is `Attack for 12`.

Damage settles on player Block first:

- Player Block goes from `7` to `0`
- `5` damage remains

Remaining damage hits player health:

- Player health goes from `100` to `95`

End of round 1:

- Player health: `95`
- Player Block: `0`
- Enemy health: `18`
- Enemy Block: `0`

### Round 2

Enemy intent for this round: `Defend for 8 Block`

Player draws 5 cards:

- Attack
- Attack
- Defend
- Defend
- Attack

Player has `3` energy.

#### Player Turn

The enemy is planning to defend, so the player decides to push damage before the Block goes up.

1. The player casts `Attack` for `1` energy.

- Deal `6` damage immediately
- Enemy health goes from `18` to `12`
- Remaining energy: `2`

2. The player casts `Attack` for `1` energy.

- Deal `6` damage immediately
- Enemy health goes from `12` to `6`
- Remaining energy: `1`

3. The player casts `Defend` for `1` energy.

- Gain `7 Block`
- Player Block goes from `0` to `7`
- Remaining energy: `0`

Player ends turn.

#### Enemy Turn

Enemy resolves `Defend for 8 Block`.

- Enemy Block goes from `0` to `8`

End of round 2:

- Player health: `95`
- Player Block: `7`
- Enemy health: `6`
- Enemy Block: `8`

### Round 3

Enemy intent for this round: `Attack for 14`

Player draws 5 cards:

- Attack
- Defend
- Attack
- Defend
- Attack

Player has `3` energy.

#### Player Turn

The enemy has `8 Block`, so the player wants to push as much damage as possible and stay protected for the counterattack.

1. The player casts `Attack` for `1` energy.

- Damage settles on enemy Block first
- Enemy Block goes from `8` to `2`
- Enemy health remains `6`
- Remaining energy: `2`

2. The player casts `Attack` for `1` energy.

- Damage settles on enemy Block first
- Enemy Block goes from `2` to `0`
- `4` damage remains and hits enemy health
- Enemy health goes from `6` to `2`
- Remaining energy: `1`

3. The player casts `Defend` for `1` energy.

- Gain `7 Block`
- Player Block goes from `7` to `14`
- Remaining energy: `0`

Player ends turn.

#### Enemy Turn

Enemy attacks for `14`.

Damage settles on player Block first:

- Player Block goes from `14` to `0`
- `0` damage remains

Remaining damage hits player health:

- Player health remains `95`

End of round 3:

- Player health: `95`
- Player Block: `0`
- Enemy health: `2`
- Enemy Block: `0`

At this point the player is strongly favored to win on the next turn with any `Attack` card.

## What This Example Shows

- telegraphed enemy intent creates meaningful play decisions
- immediate card resolution is easy to follow
- simple attack and defend intents are enough to create tactical variation
- Block creates short-term protection without adding heavy timing complexity
- even with no permanents, the combat loop already functions cleanly

## What This Example Does Not Yet Show

This example does not yet include:

- permanents
- the blocking queue
- persistent health on permanents
- graveyard interaction
- stronger hero permanents
- multiple enemies

Those should be demonstrated in a follow-up combat example once permanent play is added.
