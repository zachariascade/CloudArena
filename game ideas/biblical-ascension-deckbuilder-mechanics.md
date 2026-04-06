# Biblical Ascension Deckbuilder Mechanics

## Table Of Contents

- [Purpose](#purpose) ✓
- [Combat Source Of Truth](#combat-source-of-truth) ✓
- [Core Direction](#core-direction) ✓
- [High-Level Fantasy](#high-level-fantasy) ✓
- [Resource System](#resource-system) ✓
  - [Energy](#energy) ✓
- [Hand Model](#hand-model) ✓
  - [Chosen Direction: Full Hand Refresh](#chosen-direction-full-hand-refresh) ✓
- [Board Structure](#board-structure) ✓
  - [Current Direction: Permanents As Active Party Members](#current-direction-permanents-as-active-party-members) ✓
- [Keeping Cognitive Load Light](#keeping-cognitive-load-light) ✓
- [Current Working Thesis](#current-working-thesis) ✓
- [Permanent Types](#permanent-types)
- [Combat Flow](#combat-flow)
- [Empty Board Problem](#empty-board-problem)
- [Empty Board Risk Note](#empty-board-risk-note) ✓
- [Enemy Design](#enemy-design) ✓
- [Battle Events And World Effects](#battle-events-and-world-effects)
- [Player Strategy Directions](#player-strategy-directions) ✓
- [Cooperative Possibilities](#cooperative-possibilities)
- [Open Questions](#open-questions)

<a id="purpose"></a>
## Purpose

This document captures the current mechanics design for the Biblical Ascension Deckbuilder concept.

The goal is to preserve the fantasy of building a persistent board of biblical heroes and allies while still using a lower-cognitive-load structure that feels approachable, readable, and social in cooperative play.

<a id="combat-source-of-truth"></a>
## Combat Source Of Truth

Low-level combat rules now live in [CORE_COMBAT_SPEC.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/CORE_COMBAT_SPEC.md).

That file is the source of truth for:

- turn structure
- enemy intent and behavior
- permanent activations
- summoning sickness
- Block and damage settlement
- persistent health
- prototype combat scope

This mechanics document should stay focused on high-level design direction, fantasy, structure, and system goals rather than trying to restate the full combat rules in parallel.

<a id="core-direction"></a>
## Core Direction

- Use *Slay the Spire*-style energy as the main turn resource instead of land-based mana growth
- Keep a more persistent hand-and-board feel than *Slay the Spire*
- Let characters function as permanents that stay on the field
- Emphasize defense, synergy, attrition, and resurrection
- Avoid the full cognitive overhead of traditional *Magic* by simplifying timing, board states, and decision trees

<a id="high-level-fantasy"></a>
## High-Level Fantasy

The player is ascending toward a heavenly destination while demonic forces attempt to stop that progress. Instead of personally swinging a weapon or casting every attack directly, the player is upheld by biblical figures who intercede on their behalf.

In this design, much of the emotional payoff comes from gradually assembling a sacred board state:
- trusted heroes and allies standing with you
- relics and blessings enhancing them
- persistent board damage creating tension over time
- resurrection and endurance letting your formation persist through difficult encounters

This supports the fantasy of "my side of the field is becoming a holy coalition."

<a id="resource-system"></a>
## Resource System

<a id="energy"></a>
### Energy

- The game uses an energy system inspired by *Slay the Spire*
- Each turn, the player receives a set amount of energy
- Cards and abilities cost energy to play or activate
- Energy resets each turn rather than being permanently built like mana
- Current prototype baseline in examples: `3` energy per turn

Why use energy instead of mana:
- Prevents mana screw or slow starts caused by missing resource cards
- Reduces deck-tax pressure from needing dedicated resource slots
- Makes cards easier to evaluate during a run
- Keeps the game feeling like a deckbuilder instead of a full trading card game simulation

<a id="hand-model"></a>
## Hand Model

This design now assumes a full new hand every turn.

<a id="chosen-direction-full-hand-refresh"></a>
### Chosen Direction: Full Hand Refresh

The player receives a fresh set of cards each turn rather than slowly building and holding a long-term hand.

Possible structure:
- start turn and gain energy
- draw a full hand, such as `5` cards
- play cards for that turn
- permanents stay on board once played
- one-shot cards are discarded after use
- most or all unplayed non-permanent cards are discarded at end of turn
- draw a fresh hand on the next turn

What this looks like in play:
- your battlefield is the persistent part of your strategy
- your hand is the tactical part of your strategy
- each turn gives you a fresh mini-puzzle
- deckbuilding still matters because it changes what kinds of puzzles you are presented with
- permanents remain the main way your build accumulates over time

Why this is a good pick:
- it keeps turns moving
- it lowers hoarding and long-range hand math
- it reduces the chance of stale or clogged hands
- it helps players see more of their deck during a run
- it keeps the cognitive load lighter for co-op play
- it supports the goal that players can still talk and banter during the game

Why it fits this design in particular:
- the permanence fantasy still lives on the board through heroes, allies, relics, and blessings
- the hand can then focus on immediate tactical choices, miracles, defenses, and support effects
- this creates a nice split between long-term board growth and short-term turn decisions
- it gives the game some *Slay the Spire* clarity without giving up creature-building

Tradeoff to accept:
- players will feel less attached to holding one specific card for the perfect moment
- the hand becomes less of a long-term planning space than in *Magic*

Why that tradeoff is acceptable:
- the board still preserves strategic continuity
- fresh hands help prevent analysis paralysis
- the run should feel dynamic rather than stalled by card hoarding

### Design Notes

To make this system work well:
- hand size should stay modest
- card text should stay concise
- permanent cards should be exciting enough that board-building still feels central
- instant and miracle cards should create interesting tactical turns without becoming overly combo-heavy
- discard and draw effects should be used carefully so they do not undermine the simplicity of the refresh model

<a id="board-structure"></a>
## Board Structure

The board is where this design lives or dies. It should feel satisfying without becoming cluttered.

<a id="current-direction-permanents-as-active-party-members"></a>
### Current Direction: Permanents As Active Party Members

This document is now assuming a specific direction for combat presentation:

- permanents are not just passive stat pieces
- permanents act more like allied party members on the field
- each permanent can have its own attack value and health value
- enemies can damage and eventually kill permanents
- defeated permanents go to the graveyard unless another effect changes that

This gives the battlefield a more living, turn-based feel. It preserves the joy of building up creatures while making combat feel immediate and character-driven.

It also places the game somewhere between several familiar structures:
- *Magic: The Gathering* style creature development
- *Slay the Spire* style encounter pacing
- JRPG-style party combat
- creature battler sensibilities similar to games where your units persist and fight as individuals

The important distinction is that the board is not just abstract value. It is a party-like spiritual formation.

### Recommended Starting Direction

- Give each player a limited number of permanent slots, such as `3` to `5`
- Give each player a small relic or blessing area
- Keep graveyard and discard visible but simple
- Avoid sprawling battlefields with many token bodies

Why limited slots help:
- The board remains readable at a glance
- Every permanent matters
- Replacing a character becomes an interesting decision
- "Go wide" still exists, but within a healthy cap

### Permanent Roles

To reduce complexity, permanents should often have one clear role.

Possible role families:
- `Protector`: generates shield, reduces incoming harm, guards allies
- `Evangelist`: grows stronger when other allies are present
- `Martyr`: benefits from death, sacrifice, or revival
- `Prophet`: enables foresight, scrying, or enemy intent manipulation
- `Support`: improves the team, enemy reads, or card flow
- `Judge`: converts holy pressure into direct punishment against demonic enemies

The more cards use shared role language, the easier the game is to learn.

<a id="keeping-cognitive-load-light"></a>
## Keeping Cognitive Load Light

This is one of the most important constraints for the whole design.

The game should be deep enough to feel rewarding, but light enough that players can still banter, react socially, and enjoy the journey together.

### Strong Principles

- Keep the number of active permanents low
- Prefer one strong effect over three small conditional effects
- Use shared keywords and role labels
- Keep numbers small and estimable
- Limit how often players must react on other players' turns
- Make synergies obvious from the card face
- Avoid long combo chains with repeated sub-decisions
- Put most complexity in deckbuilding and encounter planning, not in timing windows

### Practical Tools

#### Board Slot Limits

- Each player only gets a few permanent positions
- This naturally limits board complexity without killing the permanent fantasy

#### Small Hand Size

- A hand of around `4` to `6` cards may be plenty
- Fewer cards means fewer line calculations

#### Simple Timing Rules

- Most effects happen on your turn
- Very few interrupt windows
- Co-op support should be explicit and easy to understand

#### Cap Trigger Frequency

- Avoid cards that create nested chains of triggers
- Prefer "once per turn" and "when played" over highly recursive interactions

#### Narrow Status Vocabulary

- Use a small set of recurring conditions such as `Shielded`, `Corrupted`, `Exhausted`, `Blessed`
- Repeated language reduces learning load

#### Prototype Combat Constraints

- one enemy per battle in the initial prototype
- one activation per permanent per turn
- no passive abilities to start
- a small keyword set
- player health persists between encounters

### Social Design Goal

An important benchmark:
- players should still be able to talk casually while playing
- decisions should feel interesting, not exhausting
- turns should invite collaboration rather than silent calculation

That means the game should avoid:
- giant board states
- too many instant-speed responses
- too many hidden possibilities
- overly math-heavy combat

<a id="current-working-thesis"></a>
## Current Working Thesis

This mechanics design is strongest when it borrows *Magic*'s feeling of persistent sacred board-building without borrowing its full rules weight.

The likely sweet spot is:
- energy-based turns
- a full new hand each turn
- a small number of meaningful permanent slots
- permanents functioning as active party members with attack and persistent health
- no baseline healing loops in combat
- built-in recovery through defense, resurrection, replacement, and careful pacing rather than routine healing
- telegraphed enemy intent systems with readable shared threats
- a card pool built around strong roles, readable synergies, and emotionally resonant biblical figures

If done well, this could deliver the fantasy of building a holy battlefield while staying readable enough for cooperative, conversational play.

<a id="permanent-types"></a>
## Permanent Types

This design can likely support several broad card types without becoming too hard to parse.

### Characters

- Biblical figures who remain on the board
- The main engine pieces of the deck
- Generate defense, buffs, revival hooks, or payoff effects

### Relics

- Persistent support tools or sacred objects
- Usually passive
- Better for long-term bonuses than active micromanagement

### Blessings

- Semi-persistent effects, enchantments, or divine states
- Could modify all intercessors, the player, or the whole party

### Events Or Miracles

- One-shot cards with immediate effects
- Good for turning points, rescue moments, and tempo swings

### Burdens Or Corruptions

- Negative statuses added by enemies
- These can clog hand, disable slots, or tax energy

<a id="combat-flow"></a>
## Combat Flow

One possible turn flow for this design:

See [CORE_COMBAT_SPEC.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/CORE_COMBAT_SPEC.md) for the current combat flow and rules details.

At a high level, the flow is:

1. start turn and gain energy
2. see the enemy's telegraphed action
3. draw a fresh hand
4. play non-permanent cards
5. summon permanents or use permanent activations
6. end turn and resolve the enemy's action

This is appealing because:
- players still make real choices
- enemy turns stay understandable
- co-op discussion has a natural rhythm

### What This Means In Practice

Under the current direction:
- permanents contribute through card-defined activations and board presence
- some will be attackers, some defenders, some support units, and some hybrid pieces
- health matters because enemy pressure can break your formation over time
- the graveyard matters because defeated permanents are expected to come and go during a run

This creates more emotional stakes than purely static permanents, but it also introduces a major design risk: the empty board problem.

<a id="empty-board-problem"></a>
## Empty Board Problem

For the current detailed assessment, see [EMPTY_BOARD_RISK.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/EMPTY_BOARD_RISK.md).

If all or most of the player's intercessors die in a long battle, the player can end up in a hopeless or miserable state:
- not enough damage to finish the fight
- no meaningful defense left
- turns become "draw and pray"
- recovery feels too slow

This is one of the biggest design dangers in the party-member permanents model, so the game should build in safety valves from the start.

### Design Goal

Losing board presence should hurt, but it should feel like loss of tempo or position, not automatic defeat.

The player should still believe:
- "I can stabilize"
- "I can rebuild"
- "I still have decisions"

### Possible Solutions

#### 1. Baseline Player Action

Even with no intercessors on the field, the player can always do something small each turn.

Examples:
- a basic attack
- a basic defend action
- a draw/filter action to help find rebuilding tools

Why this helps:
- the player is never completely helpless
- empty-board turns still contain agency
- recovery becomes slow but possible instead of impossible

#### 2. Death Leaves Behind Value

When intercessors die, they should often leave behind something useful.

Examples:
- create a temporary shield
- draw a card
- reduce the cost of resurrection
- leave a spirit, echo, or memory effect behind for one turn

Why this helps:
- death still hurts, but it advances the player state instead of fully deleting it
- martyr-style builds become naturally thematic

#### 3. Easy Access To Rebuilding

The game should make rebuilding a board practical, not rare.

Examples:
- cheap low-tier permanents
- common revival effects
- cards that return a unit from graveyard to hand
- cards that summon temporary followers
- relics that refill one empty slot each combat or each boss fight

Why this helps:
- the player can recover from attrition
- long fights feel survivable
- the graveyard becomes a resource, not just a loss pile

#### 4. Momentum Persists Beyond The Board

Part of the player's momentum can survive even after units die through:

- remaining deck quality
- relics or blessings
- graveyard recursion
- hand quality on the next turn

Why this helps:
- the board matters, but it is not the only source of progress
- losing units does not erase all prior momentum

#### 5. Reserve Row Or Backline

The player might have a limited reserve system.

Examples:
- one or two backup slots
- a "hand to field" quick-deploy rule
- one permanent in reserve who enters when a front unit dies

Why this helps:
- wipes become softer
- turns stay active
- the battlefield feels more like a living party structure

Risk:
- too much reserve complexity could raise cognitive load

#### 6. Enemy Damage Pattern Restraint

Enemies should not constantly erase the whole board.

Possible rules:
- most enemies pressure one or two units at a time
- full wipes are rare and heavily telegraphed
- board punishment exists, but mostly as a boss identity rather than a default pattern

Why this helps:
- players can plan around danger
- losses feel earned, not arbitrary
- creature investment remains worthwhile

#### 7. Strong Defensive Roles

Some intercessors should exist mainly to keep the formation alive.

Examples:
- guards who intercept attacks
- protectors who generate shield for allies
- prophets who warn against or soften incoming attacks

Why this helps:
- board survival becomes a strategic layer
- players are rewarded for building balanced parties instead of pure offense

#### 8. Replace Death With Exhaustion In Some Cases

Not every defeated intercessor has to go straight to the graveyard.

Possible softer failure states:
- exhausted and inactive for one turn
- flipped to a weakened state
- returned to hand instead of graveyard
- disabled until healed

Why this helps:
- lowers punishment without removing danger
- supports longer battles
- gives certain enemies a different texture than simple kill pressure

#### 9. Comeback Cards And Blessings

The card pool should intentionally include recovery tools.

Examples:
- miracle cards that refill empty slots
- blessings that trigger when you control fewer units
- relics that discount the first permanent played each turn
- "last stand" effects when your board is nearly gone

Why this helps:
- comeback is part of the game plan, not an accident
- players can draft for resilience

### Likely Best Combined Approach

The cleanest version may be a layered solution:
- the player always has a weak baseline action
- permanents often leave behind some value on death
- some momentum partially persists beyond the board
- rebuilding tools are common enough to matter
- full enemy wipes are rare

<a id="empty-board-risk-note"></a>
## Empty Board Risk Note

The project now has a dedicated risk note for this topic:

[EMPTY_BOARD_RISK.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/EMPTY_BOARD_RISK.md)

That file should be treated as the current focused analysis of:

- why the risk still exists
- what to watch for in testing
- which design levers help without healing

This keeps combat dramatic without making a lost board feel like the run is over.

<a id="enemy-design"></a>
## Enemy Design

Enemies should not use a player-style resource system or build out their own permanent board.

Instead:
- enemies act more like boss puzzles than like another deckbuilding player
- a fight can contain one enemy or multiple enemies
- those enemies do not play permanents or create a second battlefield for the player to track
- each enemy has a defined move list, intent table, stance cycle, or attack deck
- at the start of the player turn, the enemy telegraphs its next action
- players can then plan around the incoming threat before the enemy acts

Why this fits:
- reduces bookkeeping
- lets players focus on cooperation and deck decisions
- preserves tension without asking players to solve the enemy turn as well
- supports meaningful planning without making the fight overly mathematical

### Core Enemy Role

The enemy side should provide pressure, disruption, timing, and puzzle-like threats.

It should not feel like a mirror match where both sides are building equally complex engines.

The player side is where most of the expressive board-building happens. The enemy side is where clear danger and tactical response pressure come from.

### Shared Telegraphed Intent

Enemy attacks should usually be telegraphed to all players at the start of the player turn, similar to *Slay the Spire*.

That lets players respond by:
- defending themselves
- defending the team
- debuffing the enemy
- weakening the attack
- choosing whether intercessors spend their effort on offense or defense

This supports cooperative discussion because all players are reacting to the same visible threat pattern.

### Multiple Enemies, No Enemy Permanents

Fights may include multiple enemies for replayability and roguelike variety.

However:
- those enemies still should not create permanents or sub-boards
- the enemy side should remain visually and mechanically simpler than the player side
- the main health targets should stay obvious and easy to parse

This creates variety without producing the cognitive weight of a full second battlefield.

### Enemy Randomness And Replayability

Replayability can come from:
- different enemy groups
- different combinations of enemy roles
- semi-randomized intent sequences
- boss stance changes
- varied encounter mixes across runs

The goal is not pure randomness. The goal is recognizable enemy identity with enough variation to keep runs fresh.

### Enemy Action Categories

Possible enemy action categories:
- direct attack
- area attack that affects all players
- corruption or weakening effects
- debuffs that reduce attack, defense, or efficiency
- pressure against wide boards
- pressure against tall boards
- self-buffs such as strength gain or escalation
- defensive turns such as fortifying or reducing incoming damage
- setup turns that create a stronger follow-up attack

These actions should create strategic pressure while staying readable.

### Pressure Without Board Clutter

Instead of spawning permanents, enemies can create complexity through:
- stance changes
- self-buffs
- delayed attacks
- marks, curses, or corruption effects
- attacks that punish specific player behaviors
- follow-up sequences where one turn sets up the next

This keeps the enemy dangerous without requiring the player to track a second full engine.

### Targeting And Defensive Interaction

Enemy pressure does not have to be only direct player-health damage.

Enemy actions can also:
- threaten all players at once
- pressure one player's board more than another's
- target the weakest intercessor
- pressure support units
- punish exhausted or damaged units
- create attacks that players may choose to intercept with intercessors

One promising direction is to let intercessors commit their power toward offense or defense depending on the telegraphed threat. That creates meaningful turn tension without making the enemy logic itself too complex.

### Math And Readability

The enemy side should involve meaningful computation, but not excessive math.

Good forms of enemy readability:
- visible incoming damage values
- clear self-buff numbers
- recognizable move patterns
- understandable debuffs

Less desirable forms:
- hidden probability trees
- too many simultaneous modifiers
- long chains of enemy triggers
- multiple layers of enemy sub-systems running at once

### Strong Enemy Role Models

Several enemy roles already look promising for this design:
- `Duel Boss`: one major enemy with one strong telegraphed action each round
- `Stance Boss`: an enemy that shifts between aggressive, defensive, corruptive, or vulnerable modes
- `Pattern Boss`: an enemy with a learnable but not perfectly fixed action cycle
- `Pressure Boss`: an enemy that steadily escalates corruption, damage, or tempo pressure over time

These models can work for bosses and can also inspire standard encounter design.

### Current Direction

The current likely direction is:
- enemies telegraph their intent before players act
- enemies may appear in groups, but they do not play permanents
- enemy complexity comes from patterns, buffs, debuffs, and pressure effects
- enemy attacks are often shared threats that affect all players
- players respond through defense, mitigation, debuffs, interception, and offensive tradeoffs

<a id="battle-events-and-world-effects"></a>
## Battle Events And World Effects

In addition to enemy actions, encounters can include larger battlefield-level events.

These events represent disasters, miracles, judgments, environmental shifts, or major story-scale forces that affect the whole battle rather than behaving like a normal enemy attack.

### Current Direction

The current likely direction is to use a separate battle event deck rather than attaching these effects directly to an enemy's normal action list.

That means:
- enemy moves remain readable and learnable
- battle events feel bigger and more special than standard attacks
- encounters gain replayability through a second, lighter source of variation
- the game can support both disasters and blessings without forcing them into enemy identity

### Why A Separate Event Deck Fits

This approach works well because:
- it keeps enemy behavior cleaner
- it gives the battle a world-level layer without creating a second enemy board
- it allows major biblical-scale moments to appear across different encounters
- it helps the game feel less repetitive without making each enemy too complicated

### What Battle Events Can Be

Battle events can include:
- disasters
- battlefield shifts
- blessings
- divine interventions
- encounter-wide debuffs
- encounter-wide buffs
- round-based pressure escalations

These should feel larger than a normal enemy strike.

### Example Event Types

Possible events:
- `The Flood`: a massive board-clearing or board-punishing event
- `Famine`: restrict healing, recovery, or card gain
- `Darkness`: reduce visibility, weaken attacks, or limit options for a round
- `Deliverance`: give players a temporary blessing or recovery burst
- `Trial by Fire`: damage everything, but reward survivors
- `Silence`: reduce support actions or weaken passive effects for a round
- `Judgment`: punish overextended boards or overcommitted strategies

### How They Should Function

Battle events should be:
- rare enough to feel special
- dramatic enough to change the shape of the fight
- readable enough that players can still respond intelligently

Good timing models might include:
- draw from a small encounter event deck
- trigger on a round number
- trigger when the enemy reaches a health threshold
- trigger when a special encounter condition is met

The current direction is specifically to use a small separate event deck for encounters that use this system.

### Scope And Restraint

Not every battle needs battle events.

A good default could be:
- only some encounters use the event deck
- those encounters use only a small number of event cards
- major events are telegraphed if they are severe

This helps keep the system dramatic without making every fight feel overloaded.

### Relationship To Enemy Design

Enemy actions should still carry most of the turn-by-turn pressure.

Battle events should add:
- encounter identity
- replayability
- dramatic pivots
- larger world-scale threats or blessings

This keeps the enemy role and the event role distinct.

### Caution On Full Board Wipes

Events like `The Flood` are exciting because they are memorable and dramatic.

However, full board wipes are also one of the most dangerous effects in the game, especially in a system where the player's intercessors are central to both offense and defense.

Possible softer versions of a board-wipe event:
- destroy all exhausted intercessors
- deal heavy damage to all intercessors
- return all intercessors to hand
- remove all attachments and blessings
- force each player to keep only one intercessor

These can still feel huge without always causing total collapse.

<a id="player-strategy-directions"></a>
## Player Strategy Directions

For now, the cleanest starting point is a single player character or baseline player ruleset rather than multiple selectable player characters with separate starting decks.

Why this is a good first direction:
- it keeps the board game easier to learn
- it reduces setup and balance complexity
- it lets replayability come from runs, deckbuilding, relics, and encounter variance rather than from multiple starting hero kits
- additional player characters can still be added later if the core game proves strong enough to support them

### Strategy Count Goal

The game should support a small number of recognizable strategy families.

Too few strategies and every run feels the same.

Too many strategies and the game becomes harder to learn, draft, and teach at the table.

Current likely target:
- about `5` core strategy families in the overall card pool
- most runs should naturally support `1` main lane plus `1` secondary lane
- players should be able to recognize the major lanes quickly from signpost cards and relics

This keeps variety high while keeping cognitive load smaller.

### Equipment As Attachable Permanents

Equipment is a promising part of the player strategy space.

Current likely direction:
- equipment is a permanent
- equipment can be attached to an intercessor
- equipment acts similarly to persistent upgrades, counters, or artifacts that modify a unit already on the field
- equipment can help define a run without requiring a totally separate subsystem

This is especially useful for:
- tall builds
- durable champion-style units
- builds that want a strong sense of progression on the board

### Core Strategy Families

#### Tall

- focus on one major intercessor or a very small number of elite units
- stack equipment, blessings, and protection effects
- win through one heavily supported battlefield anchor

Why it matters:
- creates a clear identity
- works naturally with attachable equipment
- gives players a satisfying "build up my champion" fantasy

#### Wide

- fill more intercessor slots
- generate broad value across the board
- benefit from buffs, support pieces, and multi-unit synergy

Why it matters:
- creates a very different board feel from tall
- rewards sequencing and formation-building
- gives players a more communal, coalition-like battlefield identity

#### Resurrection

- use the graveyard as part of the engine
- recover fallen intercessors
- turn losses into momentum, value, or repeatable payoff

Why it matters:
- supports the game's spiritual themes well
- helps solve the empty-board problem
- gives longer fights resilience and drama

#### Energy Ramp

- build toward bigger turns
- increase energy efficiency, burst potential, or miracle-style payoff turns
- create moments where the player pivots from setup into explosive action

Why it matters:
- creates a resource-focused lane that feels different from board-shape lanes
- gives the deckbuilder a sense of acceleration and timing

#### Defense / Control

- survive, mitigate, cleanse, and weaken incoming threats
- respond well to telegraphed enemy attacks
- win by stabilizing, disrupting, and choosing the right response windows

Why it matters:
- fits the enemy-intent system especially well
- supports co-op discussion and team defense
- keeps the game from becoming only about raw attack output

### Supporting Strategy Ideas

These can exist as supporting sub-themes rather than needing to become full primary lanes immediately:
- `Martyr`: units want to die and leave value behind
- `Relic / Equipment Engine`: heavy use of attachable or persistent upgrades
- `Debuff`: reduce enemy pressure and weaken incoming attacks
- `Support Combo`: focus on healing, buffs, draw, and support chains

These are useful because they can add character to a run without forcing the game to teach too many separate archetypes up front.

### How Runs Stay Varied

To keep runs from feeling the same:
- core strategies should overlap
- some cards should support two lanes at once
- relics and equipment should tilt a run without locking it immediately
- early picks should suggest a direction, but not fully decide it

Examples:
- `Tall + Equipment`
- `Wide + Defense`
- `Resurrection + Martyr`
- `Energy Ramp + Big Miracle Turns`
- `Control + Tall`

This overlap helps each run feel distinct without requiring a huge number of independent systems.

### Current Direction

The current likely direction is:
- start with one player character or baseline player ruleset
- support about `5` core strategy families
- let most runs build around one primary and one secondary lane
- use attachable equipment permanents as a major part of tall and upgrade-focused play
- keep the strategy map readable enough for a board game audience

<a id="cooperative-possibilities"></a>
## Cooperative Possibilities

This design works well in co-op if teamwork remains legible.

Possible co-op patterns:
- one player focuses on protection while another builds offense
- one player plays resurrection while another manages cleansing and support
- team relics or blessings buff all allied intercessors
- players can contribute to shared defensive and tactical decisions during key moments

Important constraint:
- co-op should create collaboration, not waiting
- each player should have a clear lane
- support effects should be easy to declare and resolve

<a id="open-questions"></a>
## Open Questions

- How much direct damage should miracles and judgments contribute compared with board-generated power?
- How much of each permanent's value should be in direct attack versus defense or support?
- How often should players replace permanents already on the board?
- How much graveyard play is healthy before complexity spikes?
- What is the right slot count for solo versus co-op?
