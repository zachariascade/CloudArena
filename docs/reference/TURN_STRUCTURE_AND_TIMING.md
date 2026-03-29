# Magic Turn Structure and Timing

Source: [Magic Comprehensive Rules, 2026-02-27](./MagicCompRules-2026-02-27.txt)

Extracted from sections `117`, `500`-`514` of the Comprehensive Rules.

## Priority Basics

- The player with priority may cast spells, activate abilities, and take special actions.
- Instants can be cast any time a player has priority.
- Noninstants can normally be cast only during that player’s main phase while the stack is empty.
- Mana abilities can be activated whenever priority exists and also while paying mana during casting, activation, or resolution.
- Triggered abilities wait to be put on the stack until the next time a player would receive priority.
- Before a player gets priority, the game checks state-based actions, then puts triggered abilities on the stack.
- If all players pass in succession with the stack not empty, the top object resolves.
- If all players pass in succession with the stack empty, the phase or step ends.

## Turn Outline

1. Beginning phase
2. Precombat main phase
3. Combat phase
4. Postcombat main phase
5. Ending phase

## Beginning Phase

Steps:

1. `untap`
2. `upkeep`
3. `draw`

Key notes:

- No player gets priority during the untap step.
- Untap-step triggers wait until upkeep to go on the stack.
- The active player draws at the start of the draw step before getting priority.

## Main Phases

- There are normally two main phases: precombat and postcombat.
- Main phases have no steps.
- The active player gets priority in each main phase.
- This is when the active player normally casts artifacts, creatures, enchantments, planeswalkers, and sorceries.
- Lands are normally played only during a main phase, while the stack is empty, with priority, and within the land-play limit.
- Sagas get lore counters during the precombat main phase.
- Attractions are rolled during the precombat main phase.

## Combat Phase

Steps:

1. `beginning of combat`
2. `declare attackers`
3. `declare blockers`
4. `combat damage`
5. `end of combat`

Key notes:

- If no creatures attack, the declare blockers and combat damage steps are skipped.
- If first strike or double strike is involved, there are two combat damage steps.
- Only creatures can attack or block.
- Players, planeswalkers, and battles can be attacked.

### Declare Attackers

- Attackers are chosen as a turn-based action.
- Restrictions and requirements must both be satisfied for attacks to be legal.
- Attack costs are locked in before payment.
- Declaring attackers is what causes “whenever this attacks” triggers.
- A creature put onto the battlefield attacking is attacking, but it never “attacked.”

### Declare Blockers

- Blockers are chosen as a turn-based action.
- Restrictions and requirements must both be satisfied for blocking to be legal.
- A creature can remain blocked even if all blockers later leave combat.
- “Attacks and isn’t blocked” triggers happen in the declare blockers step.
- A creature put onto the battlefield blocking is blocking, but it never “blocked.”

### Combat Damage

- Damage is assigned first, then dealt simultaneously.
- Players do not get priority between assignment and dealing.
- Unblocked creatures assign damage to what they are attacking.
- Blocked creatures normally assign damage to their blockers.
- Blocking creatures assign damage to the creatures they block.
- First strike and double strike can create an additional combat damage step.

### End of Combat

- “At end of combat” triggers trigger here.
- “Until end of combat” effects last until the combat phase ends, not merely until this step begins.
- Creatures, battles, and planeswalkers are removed from combat as the end of combat step ends.

## Ending Phase

Steps:

1. `end step`
2. `cleanup`

Key notes:

- “At the beginning of the end step” triggers happen at the start of the end step.
- If something enters during the end step, it misses those beginning-of-end-step triggers until the next turn.
- During cleanup, excess cards are discarded, damage is removed, and “until end of turn” effects end.
- Players normally do not receive priority during cleanup.
- If state-based actions or triggers appear during cleanup, another cleanup step happens afterward.

## Design Implications

- “At end of combat” and “until end of turn” are not interchangeable.
- “Attacks” and “enters attacking” are not interchangeable.
- “Becomes blocked” and “is blocked” style wording matters.
- Cleanup-step timing matters for delayed triggers and end-of-turn effects.
