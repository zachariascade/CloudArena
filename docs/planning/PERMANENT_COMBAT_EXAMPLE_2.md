# Permanent Combat Example 2

## Purpose

This document stress-tests the current prototype combat system with:

- a stronger enemy
- two permanents on the player board
- summoning sickness
- persistent permanent health
- repeated attack vs defend decisions
- a 5-round combat

The goal is to see whether the system still reads cleanly once the player is managing a small board over multiple rounds.

## Prototype Assumptions Used Here

### Player

- Health: `100`
- Energy per turn: `3`
- Hand size drawn each turn: `5`
- Board slots: assume `3`

### Enemy

- Health: `45`
- Starts with `0 Block`
- Has one intent each turn

### Block Rule

- Damage hits Block first
- Remaining damage then hits health
- Unused Block does not carry over unless a card explicitly says otherwise

### Permanent Rule

- Permanents enter play in an open board slot
- Summoned permanents have summoning sickness and cannot use their action on the turn they enter
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

### Summon Archer

- Cost: `2`
- Effect: Summon an `Archer` permanent.

### Guardian

- Power: `4`
- Health: `10`
- Block: `3`
- Actions: `Attack` or `Defend`

If the Guardian attacks, it deals `4` damage immediately.

If the Guardian defends, it enters the blocking queue for the enemy turn.

### Archer

- Power: `5`
- Health: `7`
- Block: `1`
- Actions: `Attack` or `Defend`

If the Archer attacks, it deals `5` damage immediately.

If the Archer defends, it enters the blocking queue for the enemy turn.

## Example Enemy

### Ravaging Demon

- Health: `45`

Example intents used in this walkthrough:

- Round 1: Attack for `10`
- Round 2: Attack for `14`
- Round 3: Defend for `8 Block`
- Round 4: Attack for `18`
- Round 5: Attack for `12`

## Example Combat Walkthrough

### Round 1

Start of round:

- Player health: `100`
- Player Block: `0`
- Enemy health: `45`
- Enemy Block: `0`
- Enemy intent: `Attack for 10`
- Player board: empty

Player draws 5 cards:

- Summon Guardian
- Defend
- Attack
- Defend
- Attack

Player has `3` energy.

#### Player Turn

1. The player casts `Summon Guardian` for `2` energy.

- A Guardian enters play in one open board slot
- Guardian enters with `10 Health` and `3 Block`
- It has summoning sickness and cannot act this turn
- Remaining energy: `1`

2. The player casts `Defend` for `1` energy.

- Player gains `7 Block`
- Player Block goes from `0` to `7`
- Remaining energy: `0`

Player ends turn.

#### Enemy Turn

Enemy attacks for `10`.

Damage settles on player Block first:

- Player Block goes from `7` to `0`
- `3` damage remains

The Guardian is not defending, so it is not in the blocking queue.

Remaining damage hits player health:

- Player health goes from `100` to `97`

End of round 1:

- Player health: `97`
- Player Block: `0`
- Enemy health: `45`
- Enemy Block: `0`
- Guardian health: `10`
- Guardian Block: `3`

### Round 2

Enemy intent for this round: `Attack for 14`

Player draws 5 cards:

- Summon Archer
- Attack
- Defend
- Attack
- Defend

Player has `3` energy.

#### Player Turn

The player wants to develop a second permanent while the Guardian is now available to act.

1. The player uses the Guardian's action to `Defend`.

- The Guardian is moved forward, tapped, and placed in the blocking queue

2. The player casts `Summon Archer` for `2` energy.

- An Archer enters play in an open board slot
- Archer enters with `7 Health` and `1 Block`
- It has summoning sickness and cannot act this turn
- Remaining energy: `1`

3. The player casts `Defend` for `1` energy.

- Player gains `7 Block`
- Player Block goes from `0` to `7`
- Remaining energy: `0`

Player ends turn.

#### Enemy Turn

Enemy attacks for `14`.

Damage settles on player Block first:

- Player Block goes from `7` to `0`
- `7` damage remains

The Guardian is in the blocking queue.

Damage settles on the Guardian:

1. Guardian Block
2. Guardian Health

Guardian Block absorbs `3`:

- Guardian Block goes from `3` to `0`
- `4` damage remains

Guardian Health takes the rest:

- Guardian health goes from `10` to `6`

No damage remains for the player.

End of round 2:

- Player health: `97`
- Player Block: `0`
- Enemy health: `45`
- Enemy Block: `0`
- Guardian health: `6`
- Guardian Block: `0`
- Archer health: `7`
- Archer Block: `1`

### Round 3

Enemy intent for this round: `Defend for 8 Block`

Player draws 5 cards:

- Attack
- Attack
- Defend
- Attack
- Defend

Player has `3` energy.

#### Player Turn

The enemy is not attacking this round, so the player can shift into offense.

1. The player uses the Guardian's action to `Attack`.

- The Guardian deals `4` damage immediately
- Enemy health goes from `45` to `41`

2. The player uses the Archer's action to `Attack`.

- The Archer deals `5` damage immediately
- Enemy health goes from `41` to `36`

3. The player casts `Attack` for `1` energy.

- Deal `6` damage immediately
- Enemy health goes from `36` to `30`
- Remaining energy: `2`

4. The player casts `Attack` for `1` energy.

- Deal `6` damage immediately
- Enemy health goes from `30` to `24`
- Remaining energy: `1`

5. The player casts `Defend` for `1` energy.

- Player gains `7 Block`
- Player Block goes from `0` to `7`
- Remaining energy: `0`

Player ends turn.

#### Enemy Turn

Enemy resolves `Defend for 8 Block`.

- Enemy Block goes from `0` to `8`

End of round 3:

- Player health: `97`
- Player Block: `7`
- Enemy health: `24`
- Enemy Block: `8`
- Guardian health: `6`
- Guardian Block: `0`
- Archer health: `7`
- Archer Block: `1`

### Round 4

Enemy intent for this round: `Attack for 18`

Player draws 5 cards:

- Attack
- Defend
- Attack
- Defend
- Attack

Player has `3` energy.

#### Player Turn

The enemy attack is large, so the player must decide whether to preserve board presence or push damage.

For this example:

- the Guardian will `Defend`
- the Archer will `Attack`

1. The player uses the Guardian's action to `Defend`.

- The Guardian is tapped and placed in the blocking queue

2. The player uses the Archer's action to `Attack`.

- The Archer deals `5` damage immediately
- Damage settles on enemy Block first
- Enemy Block goes from `8` to `3`

3. The player casts `Defend` for `1` energy.

- Player gains `7 Block`
- Player Block goes from `7` to `14`
- Remaining energy: `2`

4. The player casts `Attack` for `1` energy.

- Damage settles on enemy Block first
- Enemy Block goes from `3` to `0`
- `3` damage remains and hits enemy health
- Enemy health goes from `24` to `21`
- Remaining energy: `1`

5. The player casts `Attack` for `1` energy.

- Deal `6` damage immediately
- Enemy health goes from `21` to `15`
- Remaining energy: `0`

Player ends turn.

#### Enemy Turn

Enemy attacks for `18`.

Damage settles on player Block first:

- Player Block goes from `14` to `0`
- `4` damage remains

The Guardian is in the blocking queue.

Damage settles on the Guardian:

1. Guardian Block
2. Guardian Health

The Guardian currently has `0 Block`, so all `4` damage goes to health.

- Guardian health goes from `6` to `2`

No damage remains for the player.

End of round 4:

- Player health: `97`
- Player Block: `0`
- Enemy health: `15`
- Enemy Block: `0`
- Guardian health: `2`
- Guardian Block: `0`
- Archer health: `7`
- Archer Block: `1`

### Round 5

Enemy intent for this round: `Attack for 12`

Player draws 5 cards:

- Attack
- Attack
- Defend
- Attack
- Defend

Player has `3` energy.

#### Player Turn

The Guardian is nearly dead. The player now has a meaningful attrition decision:

- defend with the Guardian and likely lose it
- keep the Guardian back and rely on player Block
- attack with both permanents and race the enemy

For this example, the player chooses to race.

1. The player uses the Guardian's action to `Attack`.

- The Guardian deals `4` damage immediately
- Enemy health goes from `15` to `11`

2. The player uses the Archer's action to `Attack`.

- The Archer deals `5` damage immediately
- Enemy health goes from `11` to `6`

3. The player casts `Attack` for `1` energy.

- Deal `6` damage immediately
- Enemy health goes from `6` to `0`
- Remaining energy: `2`

The enemy is defeated before its attack resolves.

End of round 5:

- Player health: `97`
- Guardian health: `2`
- Archer health: `7`
- Enemy defeated

## What This Example Shows

- summoning sickness meaningfully slows permanent tempo
- two permanents are still manageable to track
- attack vs defend decisions create real tension over several rounds
- persistent health makes damaged permanents feel increasingly risky
- a low-slot, low-action board can still produce meaningful choices
- the player can switch between survival and racing depending on enemy state

## What This Example Suggests To Test Next

- a permanent with an `Activate` action
- multiple defending permanents in the blocking queue at once
- a permanent death followed by resurrection
- a stronger hero permanent with an on-summon effect
- whether enemy defend needs a stronger implementation than delayed Block
