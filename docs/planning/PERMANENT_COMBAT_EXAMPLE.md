# Permanent Combat Example

## Purpose

This document shows a worked combat example that introduces permanents into the current prototype combat system.

This example is meant to test:

- summoning permanents
- limited board slots
- one action per permanent each turn
- the choice between `Attack`, `Defend`, and `Activate`
- the blocking queue
- damage settlement onto permanents
- persistent health on permanents
- permanents dying and going to the graveyard

Like the first combat example, this version stays intentionally generic and system-focused.

## Prototype Assumptions Used Here

### Player

- Health: `100`
- Energy per turn: `3`
- Hand size drawn each turn: `5`
- Board slots: assume `3` for this example

### Enemy

- Health: `30`
- Starts with `0 Block`
- Has one intent each turn

### Block Rule

- Damage hits Block first
- Remaining damage then hits health
- Unused Block does not carry over unless a card explicitly says otherwise

### Permanent Rule

- Permanents enter play in an open board slot
- Each permanent has `Power`, `Health`, and possibly `Block`
- Each permanent gets `one action` during the player's turn
- That action may be `Attack`, `Defend`, or `Activate`, depending on the card
- A permanent cannot both attack and defend in the same round
- Damage to permanents is persistent
- If a permanent's health reaches `0`, it dies and goes to the graveyard
- Health is tracked with a die on the permanent

## Sample Cards Used In This Example

These are placeholder cards meant only to demonstrate the current rules.

### Attack

- Cost: `1`
- Effect: Deal `6` damage to an enemy.

### Defend

- Cost: `1`
- Effect: Gain `7 Block`.

### Summon Guardian

- Cost: `2`
- Effect: Summon a `Guardian` permanent.

### Guardian

- Power: `4`
- Health: `10`
- Block: `3`
- Actions: `Attack` or `Defend`

If the Guardian attacks, it deals `4` damage immediately.

If the Guardian defends, it enters the blocking queue for the enemy turn.

## Example Enemy

### Ravaging Demon

- Health: `30`

Example intents used in this walkthrough:

- Attack for `10`
- Attack for `15`
- Attack for `12`

## Example Combat Walkthrough

### Round 1

Start of round:

- Player health: `100`
- Player Block: `0`
- Enemy health: `30`
- Enemy Block: `0`
- Enemy intent: `Attack for 10`
- Player board: empty

Player draws 5 cards:

- Summon Guardian
- Defend
- Attack
- Attack
- Defend

Player has `3` energy.

#### Player Turn

The player wants to establish a permanent early.

1. The player casts `Summon Guardian` for `2` energy.

- A Guardian enters play in one open board slot
- Guardian enters with `10 Health` and `3 Block`
- Remaining energy: `1`

2. The player casts `Defend` for `1` energy.

- Player gains `7 Block`
- Player Block goes from `0` to `7`
- Remaining energy: `0`

The player chooses not to use the Guardian's action this turn.

Player ends turn.

#### Enemy Turn

Enemy attacks for `10`.

Damage settles in this order:

1. Player Block
2. Defending permanents
3. Player health

The Guardian is not defending this round, so it is not in the blocking queue.

Damage settles on player Block first:

- Player Block goes from `7` to `0`
- `3` damage remains

Remaining damage hits player health:

- Player health goes from `100` to `97`

End of round 1:

- Player health: `97`
- Player Block: `0`
- Enemy health: `30`
- Enemy Block: `0`
- Guardian health: `10`
- Guardian Block: `3`

### Round 2

Enemy intent for this round: `Attack for 15`

Player draws 5 cards:

- Attack
- Defend
- Attack
- Defend
- Attack

Player has `3` energy.

#### Player Turn

The player wants to pressure the enemy but also protect against the heavier incoming attack.

1. The player uses the Guardian's action to `Defend`.

- The Guardian is moved forward, tapped, and placed in the blocking queue

2. The player casts `Attack` for `1` energy.

- Deal `6` damage immediately
- Enemy health goes from `30` to `24`
- Remaining energy: `2`

3. The player casts `Defend` for `1` energy.

- Player gains `7 Block`
- Player Block goes from `0` to `7`
- Remaining energy: `1`

4. The player casts `Attack` for `1` energy.

- Deal `6` damage immediately
- Enemy health goes from `24` to `18`
- Remaining energy: `0`

Player ends turn.

#### Enemy Turn

Enemy attacks for `15`.

Damage settles on player Block first:

- Player Block goes from `7` to `0`
- `8` damage remains

The Guardian is in the blocking queue, so remaining damage settles there next.

Damage settles on the Guardian in this order:

1. Guardian Block
2. Guardian Health

Guardian Block absorbs `3`:

- Guardian Block goes from `3` to `0`
- `5` damage remains

Guardian Health takes the rest:

- Guardian health goes from `10` to `5`

No damage remains for the player.

End of round 2:

- Player health: `97`
- Player Block: `0`
- Enemy health: `18`
- Enemy Block: `0`
- Guardian health: `5`
- Guardian Block: `0`

This round demonstrates persistent permanent damage. The Guardian survives, but it is now significantly weakened for future rounds.

### Round 3

Enemy intent for this round: `Attack for 12`

Player draws 5 cards:

- Attack
- Attack
- Defend
- Attack
- Defend

Player has `3` energy.

#### Player Turn

The player now faces an interesting decision:

- use the damaged Guardian to defend again and risk losing it
- use the Guardian to attack while relying on player Block
- leave the Guardian unused

For this example, the player chooses to defend with the Guardian again.

1. The player uses the Guardian's action to `Defend`.

- The Guardian is moved into a defending position and tapped
- It is placed in the blocking queue again

2. The player casts `Defend` for `1` energy.

- Player gains `7 Block`
- Player Block goes from `0` to `7`
- Remaining energy: `2`

3. The player casts `Attack` for `1` energy.

- Deal `6` damage immediately
- Enemy health goes from `18` to `12`
- Remaining energy: `1`

4. The player casts `Attack` for `1` energy.

- Deal `6` damage immediately
- Enemy health goes from `12` to `6`
- Remaining energy: `0`

Player ends turn.

#### Enemy Turn

Enemy attacks for `12`.

Damage settles on player Block first:

- Player Block goes from `7` to `0`
- `5` damage remains

The Guardian is in the blocking queue.

Damage settles on the Guardian:

1. Guardian Block
2. Guardian Health

The Guardian currently has `0 Block`, so all `5` damage goes to health.

- Guardian health goes from `5` to `0`

The Guardian dies and goes to the graveyard.

No damage remains for the player.

End of round 3:

- Player health: `97`
- Player Block: `0`
- Enemy health: `6`
- Enemy Block: `0`
- Guardian: dead, in graveyard

At this point the player is still ahead, but has lost their permanent defender. That creates room for future resurrection, recovery, or replacement mechanics.

## What This Example Shows

- permanents meaningfully change combat decisions
- limited board slots create commitment pressure
- one action per permanent is easy to track
- defending with a permanent is an intentional choice
- persistent health makes defensive use carry long-term cost
- permanents can die protecting the player and move to the graveyard cleanly

## What This Example Suggests To Test Next

- a permanent using `Attack` instead of `Defend`
- a permanent with an `Activate` action
- multiple permanents in the blocking queue
- a stronger hero permanent entering the same system
- a resurrection effect returning a dead permanent from the graveyard
