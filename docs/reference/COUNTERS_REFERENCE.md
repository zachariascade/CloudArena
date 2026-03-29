# Magic Counters Reference

Source: [Magic Comprehensive Rules, 2026-02-27](./MagicCompRules-2026-02-27.txt)

Extracted from section `122` of the Comprehensive Rules.

## Core Rules

- A counter is a marker on an object or player that modifies characteristics and/or interacts with rules or effects.
- Counters are not objects.
- Tokens are not counters, and counters are not tokens.
- Counters with the same name or description are interchangeable.

## Common Counter Classes

- `+X/+Y` and `-X/-Y` counters modify power and toughness.
- Keyword counters grant the corresponding keyword ability.
- `shield` counters protect a permanent from destruction and damage once.
- `stun` counters replace untapping with removing a stun counter.
- `loyalty` counters track planeswalker loyalty.
- `poison` counters on players can cause a loss at ten or more.
- `defense` counters track battle defense.
- `finality` counters exile the permanent instead of letting it go to the graveyard from the battlefield.
- `rad` counters create a triggered ability at the beginning of that player’s precombat main phase.

## Keyword Counters Recognized by the Rules

- `flying`
- `first strike`
- `double strike`
- `deathtouch`
- `decayed`
- `exalted`
- `haste`
- `hexproof`
- `indestructible`
- `lifelink`
- `menace`
- `reach`
- `shadow`
- `trample`
- `vigilance`

## Important Rules Interactions

- Counters cease to exist when an object changes zones.
- `+1/+1` and `-1/-1` counters remove each other in matching amounts as a state-based action.
- If an effect says to “move” a counter, the counter must actually be removable from one object and placeable on the other.
- Entering with counters and having counters put on an object are both covered by the rules.
- “Nth counter” triggers care about crossing the threshold, not about one-at-a-time placement.

## Design Implications

- Counter-based designs need to account for zone changes.
- Counters that create replacement effects, like `shield`, `stun`, and `finality`, behave very differently from simple stat counters.
- Player counters and permanent counters should be treated as separate design spaces.
