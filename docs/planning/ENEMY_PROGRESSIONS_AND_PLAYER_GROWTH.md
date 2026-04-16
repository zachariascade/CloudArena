# Enemy Progressions And Player Growth

## Purpose

This document sketches how enemy encounters can grow over time in step with player deck progression.

The goal is to keep enemies:

- readable
- mechanically distinct
- easy to scale across an arc
- interesting without becoming a second full deckbuilder

The current preferred direction is:

- enemies have health bars rather than MTG-style block as a default
- enemies may have a base power value
- enemies may use card-like attack patterns with explicit numbers
- enemies may spawn simple token enemies
- token enemies usually follow one routine, often just `attack`

## Core Design Thesis

Player progression should mostly improve:

- options
- consistency
- synergy
- tempo
- resilience

Enemy progression should mostly improve:

- pressure
- pattern complexity
- timing puzzles
- counterplay demands
- board pressure

That means the enemy side should not simply scale by becoming bigger versions of early enemies.

Instead, the enemy side should grow by gaining:

- more distinctive patterns
- more ways to pressure the board
- more ways to create awkward turns
- more ways to punish a weak response

## Recommended Enemy Model

The recommended baseline enemy model is:

- `health`
- optional `base power`
- a small action pattern or card list
- optional spawn actions
- optional threshold-based behavior changes
- optional starting tokens on the battlefield

The enemy can be expressed in one of two main ways:

1. **Base power model**
   - Enemy has a steady power number.
   - Actions reference that base power.
   - Example: a `5/30` enemy always attacks for `5` unless modified.

2. **Card-number model**
   - Enemy cards print the exact numbers on them.
   - Example: `Attack for 10`, `Attack for 5`, `Gain 3 Block`, `Spawn 5/10 Demon`.

These can coexist. The system does not need to pick only one forever.

### Base Power Vs Fixed Values

The preferred long-term direction is to make `base power` the core enemy stat and use reusable action templates that scale off it.

That means a single enemy can be written as:

- `Health: 30`
- `Base Power: 5`
- action cards like:
  - `Attack once with base power`
  - `Attack twice with base power`
  - `Attack once with 4x base power`
  - `Gain block equal to base power`
  - `Spawn a simple token`

This is the best fit for a physical card game because:

- it keeps the enemy card pool small and reusable
- it makes rank or tier progression easy to print and scale
- it lets many enemies share the same templates while still feeling different

Specific-value cards should still exist, but mostly as special cases:

- token enemies
- boss signature moves
- phase-break attacks
- encounter-only specials

Those cards can say exactly what they do, such as:

- `Deal 12 damage`
- `Spawn 5/10 Demon`
- `Gain 8 block`

The practical rule is:

- use generic scaling templates for the main enemy system
- use fixed values for special moves, minions, and memorable set pieces

## Enemy Progression Ladder

### Tier 1: Raw Stat Enemies

These are the earliest and simplest enemies.

Characteristics:

- base health and base power matter most
- one or two simple attack values
- maybe a single defend or fortify move
- little to no spawning

Example:

- `Grunt Demon 5/20`
- `Attack for 5`
- `Attack for 5`

Purpose:

- teach the player what a normal enemy turn looks like
- establish combat rhythm
- keep turn math easy

### Tier 2: Pattern Enemies

These enemies still remain simple, but now they have a recognizable move cycle.

Characteristics:

- fixed attack pattern
- alternating attack and defend turns
- a small amount of self-scaling
- easy-to-learn rhythm

Example pattern:

- `Attack for 5`
- `Gain 3 Block`
- `Attack for 7`
- `Rage +1 power`

Purpose:

- reward reading the enemy
- create planning decisions
- introduce basic “what is the enemy trying to do?” gameplay

### Tier 3: Token Pressure Enemies

These enemies create extra board pressure through simple summoned bodies.

Characteristics:

- may begin the battle with one or more tokens on the field
- may spawn tokens during the battle
- tokens are usually very simple
- token routine is often just `attack`

Example:

- main enemy: `5/30`
- starting tokens: two `2/4` demons
- token routine: `attack for 2`

Purpose:

- force the player to decide between racing the main enemy and clearing adds
- make the battlefield feel busier without building a second engine
- support swarming encounters and guard-rail fights

### Tier 4: Scaling Enemies

These enemies grow if ignored.

Characteristics:

- gain power over time
- grow stronger when they defend
- spawn better tokens over time
- increase pressure with every cycle

Example moves:

- `Add +1 power counter`
- `Spawn 3/4 Demon`
- `Attack for 6`
- `Attack for 6 x2`

Purpose:

- punish overly slow decks
- create urgency
- make long fights feel dangerous

### Tier 5: Phase Enemies And Bosses

These enemies change behavior at health thresholds.

Characteristics:

- different move set below a threshold
- summon reinforcements at phase breaks
- gain a temporary buff
- change their attack rhythm

Example:

- above 50% health: steady attacks
- below 50% health: spawn tokens every other turn
- below 25% health: heavy attacks or a burst phase

Purpose:

- create memorable fights
- make bosses feel like encounters instead of oversized grunts
- give the player a distinct “solve the phase” moment

## Token Design

Tokens should usually stay much simpler than main enemies.

Recommended token rules:

- tokens are cheap to understand
- tokens usually have one routine
- tokens often only attack
- tokens can be used as bodies, pressure, or sacrifice fuel
- tokens can start on the field or be spawned during the fight

Token examples:

- `Imp 2/4`
- `Cultist 3/3`
- `Hound 1/2`

Good token patterns:

- attack only
- attack and die quickly
- attack plus a small nuisance effect

Tokens should not usually have:

- their own complex deck
- multiple phases
- long decision trees
- many nested triggers

## Enemy Families

The enemy system becomes easier to design if enemies are grouped into a few recognizable families.

### Brute

- high base power
- simple attack cards
- low trick density

Use when the goal is direct damage pressure.

### Swarm

- low-to-medium power
- lots of tokens
- asks the player to manage the board

Use when the goal is battlefield clutter and tempo pressure.

### Warden

- lower damage
- defensive turns
- maybe temporary armor or block
- often punishes reckless bursts

Use when the goal is to slow the player down.

### Corruptor

- debuffs
- weakens player turns
- may create lingering pressure

Use when the goal is to distort the player’s engine instead of racing it.

### Boss

- phase thresholds
- mixed toolkit
- pattern shifts
- summons or escalation

Use when the goal is a major encounter with a distinct solve.

## How Enemy Growth Should Track Player Growth

Player progression and enemy progression should not mirror each other exactly.

The player gets stronger by improving:

- deck quality
- draw quality
- synergies
- permanent boards
- resource efficiency

The enemy gets stronger by improving:

- pattern clarity
- pressure density
- punishment windows
- token support
- escalation timing

## Matchup Principles

Good encounter design should usually test one main player strength at a time.

Examples:

- a wide-board enemy pressures swarm decks
- a burst enemy pressures slow setup decks
- a token enemy pressures single-target decks
- a scaling enemy pressures decks that stall

This keeps the game readable and helps each enemy feel like a puzzle.

## Recommended Campaign Progression

### Early Battles

Focus on:

- simple power numbers
- one attack pattern
- one or zero token units

The player should learn how the system works here.

### Midgame Battles

Add:

- small move cycles
- token spawns
- more distinct attack sizes
- occasional defensive turns

The player should start recognizing enemy families.

### Late Battles

Add:

- scaling
- threshold phases
- multi-token pressure
- harder punish windows

The player should now be solving encounters, not just surviving them.

### Boss Battles

Add:

- strong pattern identity
- phase breaks
- summon pressure
- a signature threat that changes the fight

Bosses should feel like a dramatic culmination of the encounter system.

## What To Avoid

Avoid letting enemy progression turn into a pure numbers race.

Do not rely on:

- only increasing health
- only increasing attack values
- only adding more tokens
- only adding more block

That creates fights that are harder but not necessarily more interesting.

Avoid making enemies too close to a full MTG opponent:

- no default enemy mana system
- no large enemy hand management layer
- no complex enemy board-building unless it is a special boss or faction mechanic

## Open Questions

- How much of enemy identity should come from fixed patterns versus draw-from-a-small-deck behavior?
- Should some enemies reveal one move ahead, while bosses reveal two?
- Should summoned tokens ever have non-attack actions, or stay mostly attack-only?
- Should enemy block exist as a named mechanic, or be reframed as armor or ward?
- Should the game support both scripted encounters and true enemy decks, or just one of those as the baseline?

## Practical Recommendation

The best near-term direction is:

1. use health bars and base power as the core enemy frame
2. add card-like enemy actions with explicit numbers
3. let some enemies spawn simple attack-only tokens
4. make later enemies scale through patterns, not just stats
5. reserve phase changes and more complex summoning for bosses

This keeps the system readable while still letting enemy design grow alongside the player deck.
