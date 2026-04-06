# Battle Sandbox MVP Design

## 1. Purpose

This document proposes a small TypeScript app for rapidly testing how Cloud Arcanum cards play in battle.

The goal is not to build the full long-term game. The goal is to create a fast local battle sandbox where a designer can:

- choose a player deck
- choose a scripted enemy encounter
- start from a known battle setup
- play through turns manually
- observe how cards feel in context
- iterate on card text, costs, stats, and encounter flow quickly

This should be the fastest path from "I changed some cards" to "I can see how this battle actually feels."

## 2. Product Framing

The app should behave more like a battle lab than a polished consumer game.

It is primarily for:

- internal design testing
- card feel checks
- enemy flow checks
- validating whether encounters create interesting decisions
- spotting broken or unfun patterns early

It is not primarily for:

- campaign progression
- collection management
- multiplayer
- AI deckbuilding
- final content balance
- full comprehensive-rules MTG simulation

## 3. Core MVP Thesis

The MVP should test the direction already suggested in the repo's mechanics notes:

- the player has a deck and a persistent battle state
- the enemy is encounter-driven, not a full mirror-match deck player
- enemy pressure is visible through telegraphed intent
- the battle is turn-based and readable
- the main purpose is fast iteration on card behavior and encounter pacing

This means the enemy side should usually be represented as an encounter script, action deck, or intent table, even if the setup UI lets the designer "insert enemy cards."

For MVP purposes, "enemy cards" can mean one of two things:

- true enemy card records later, if the project introduces them
- a lightweight encounter definition made of enemy actions, intents, and event entries

The second option is the better MVP default because it fits the repo's existing design direction and avoids building two full player engines at once.

## 4. MVP Goals

The app should make it easy to:

- load a player deck from canonical JSON data
- choose or define an enemy encounter
- optionally override the starting state for targeted tests
- play the battle turn by turn
- inspect battlefield, hand, discard, graveyard, health, energy, and enemy intent
- make player decisions manually
- resolve battle state deterministically
- review a battle log
- restart the same scenario quickly

Success looks like:

- "I can test Abraham against a specific enemy pattern in under a minute"
- "I can replay the same opening several times after changing one card"
- "I can tell whether an encounter is boring, too swingy, or too punishing"

## 4.1 Delivery Strategy

This project should be approached as a staged build, not as a single large implementation push.

That is important because the battle sandbox introduces a different kind of complexity than the current Cloud Arcanum app. The existing app is primarily a content system for loading, validating, querying, and browsing structured data. The battle sandbox adds a stateful game engine, effect resolution, encounter scripting, and replayable turn flow.

Because of that, the safest and fastest path is:

- prove the engine with one narrow playable slice
- validate that the slice is actually useful for card-feel testing
- add only the next layer of complexity that has already earned its place

The project should not begin by trying to support the full card pool, full enemy deck simulation, or broad mechanic coverage.

## 4.2 Relative Project Size

Relative to the app built so far, this battle sandbox MVP should be treated as a meaningfully larger and more difficult feature area.

A practical framing is:

- larger in implementation difficulty than the current browse-and-query app surface
- denser in logic per file than the existing API and web routes
- more design-risk-heavy because the rules model is still exploratory

In short:

- the current app is mostly "structured content in, structured views out"
- the battle sandbox is "structured content in, evolving game state over time"

That makes this a project where phased validation matters more than broad initial scope.

## 5. Non-Goals

The MVP should explicitly avoid:

- full MTG timing windows and stack fidelity
- networking or multiplayer
- real-time animation-heavy presentation
- progression meta-systems
- procedural runs
- draft mode
- full AI opponent logic
- comprehensive card rules parsing

If a card cannot be supported cleanly in the battle sandbox yet, the system should allow an explicit unsupported-mechanics note rather than pretending full rules coverage exists.

## 6. User Stories

### 6.1 Card Designer

- I can pick a deck and an enemy encounter.
- I can start a battle from normal setup or from a custom seeded board state.
- I can play turns manually and see what changed after every action.
- I can inspect the log to understand why a result happened.
- I can quickly restart and re-test after editing card JSON.

### 6.2 Encounter Designer

- I can define an enemy with a small move list or intent deck.
- I can telegraph the next enemy action before the player acts.
- I can test whether the encounter pressures wide boards, tall boards, or slow hands in the intended way.
- I can add one or two battle events to see if they improve variety.

### 6.3 System Designer

- I can keep the rules model intentionally small.
- I can add support for a few mechanics at a time.
- I can record assumptions and unsupported behavior in code and docs.

## 7. Recommended MVP Shape

### 7.1 App Form

The best MVP shape is a local TypeScript app with:

- a battle engine package or module
- a lightweight local UI for setup and turn progression
- filesystem-backed loading from existing `data/` records

Recommended UI direction:

- a simple React screen inside the existing web app, or
- a separate route group in `apps/cloud-arcanum-web/`

That keeps the battle sandbox close to the current project structure and avoids inventing a second frontend stack.

### 7.2 Interaction Model

The player should mostly drive the battle manually.

The system should:

- show legal or likely actions when possible
- resolve deterministic outcomes
- automate boring bookkeeping
- leave strategic choices to the human tester

This is important because the point is to feel the cards, not to prove AI competence.

## 8. Functional Scope

### 8.1 Setup Screen

The MVP setup screen should support:

- selecting one player deck from `data/decks/`
- selecting one enemy encounter preset
- optional seed value for reproducible shuffle order
- optional starting health override
- optional starting hand override
- optional battlefield seeding for targeted tests

Nice MVP shortcut:

- allow "load deck, then manually add cards to opening hand/battlefield" for scenario testing

### 8.2 Battle View

The core battle screen should show:

- player health
- enemy health or enemy roster
- current turn number
- current energy
- player hand
- player draw pile count
- player discard pile
- player graveyard
- player battlefield with slot limits
- active effects or statuses
- telegraphed enemy intent
- recent battle log

### 8.3 Player Actions

The MVP should support these player actions:

- play a card from hand if cost and targeting requirements are met
- choose attack assignments
- use a baseline no-board action if applicable
- end turn
- inspect card details and effect text

Optional but valuable for MVP:

- undo last action within the current unresolved step
- restart battle from original seed and setup

### 8.4 Enemy Flow

The enemy side should support:

- one or more enemies in an encounter
- telegraphed next action
- a deterministic action source driven by script, pattern, or encounter deck
- automatic resolution on enemy phase

Recommended enemy models for MVP:

- `pattern`: rotates through a defined move list
- `deck`: draws from a small shuffled action deck
- `threshold`: changes behavior at health breakpoints

### 8.5 Battle Log

The app should maintain a readable event log such as:

- turn start
- draw events
- card plays
- summons and deaths
- damage dealt
- healing
- status application
- enemy intent reveal
- enemy action resolution
- win or loss

This log is essential because design testing depends on understanding why the battle felt a certain way.

## 9. Rules Scope For MVP

The MVP should use a simplified battle model rather than full Magic timing.

### 9.1 Recommended Turn Loop

1. Start player turn
2. Gain energy
3. Reveal enemy intent
4. Apply start-of-turn effects
5. Draw up to hand size
6. Player takes actions
7. Resolve combat and end-of-turn cleanups
8. Enemy resolves telegraphed action
9. Check win/loss
10. Advance round

This aligns with the repo's current encounter-focused mechanics direction and is easier to test than full precombat/postcombat phase fidelity.

### 9.2 Zones

The MVP should model only the zones it truly needs:

- draw pile
- hand
- battlefield
- discard pile
- graveyard
- exile

The stack can be omitted in version one if effects resolve immediately on play.

### 9.3 Supported Card Categories

For a first battle sandbox pass, cards should be interpreted in a constrained way, such as:

- `intercessor` or creature-like permanents
- `miracle` or one-shot spell effects
- `relic` or passive permanents
- `blessing` or buffs/status effects

These can initially be derived from tags, mechanics, or a lightweight battle adapter layer rather than requiring the canonical card schema to change immediately.

### 9.4 Mechanics Coverage

The MVP should only implement a small supported set, for example:

- summon to battlefield
- attack
- block or defend if the design needs it
- direct damage
- healing
- shield or ward-like prevention
- draw
- discard
- revive from graveyard
- stat buffs and debuffs
- simple triggered effects such as "on play," "on death," and "start of turn"

Anything more complicated should be marked unsupported until intentionally added.

## 10. Data Model Approach

### 10.1 Canonical Content Stays Source Of Truth

Existing card and deck JSON should remain canonical.

The battle sandbox should load from:

- `data/cards/`
- `data/decks/`

It should not create a separate incompatible card database.

### 10.2 Add A Battle Adapter Layer

The current card schema is good for authoring, but not enough by itself for a battle engine.

The MVP should introduce an adapter layer that converts a canonical card into a battle-ready model, for example:

- resolved title and ID
- battle category
- energy cost
- attack and health values
- supported effects
- unsupported mechanics notes

This can be derived from card JSON plus temporary conventions in `notes`, `tags`, or `mechanics` while the battle system is still exploratory.

### 10.3 New Encounter Data

The MVP likely needs a new encounter definition type, stored separately from canonical decks.

Recommended new data folder:

- `data/encounters/`

Recommended encounter fields:

- `id`
- `name`
- `description`
- `enemyUnits`
- `intentModel`
- `actionDefinitions`
- `battleEvents`
- `startingState`
- `tags`

This is cleaner than forcing enemy behavior into the current deck schema too early.

### 10.4 Optional Scenario Presets

For rapid testing, the MVP should also support small scenario presets, for example:

- `data/battle-scenarios/`

A scenario can define:

- player deck ID
- encounter ID
- seed
- forced opening hand
- preloaded battlefield
- expected test note

This would make regression-style gameplay testing possible later.

## 11. Technical Design

### 11.1 Suggested Module Boundaries

Recommended structure:

```text
apps/cloud-arcanum-web/src/routes/battle-sandbox-page.tsx
apps/cloud-arcanum-web/src/components/battle/
src/cloud-arena/
  engine.ts
  state.ts
  actions.ts
  reducer.ts
  adapters/
  encounter.ts
  logging.ts
  random.ts
```

### 11.2 Engine Style

The engine should be:

- deterministic
- state-driven
- serializable
- easy to replay from seed plus action history

A reducer-style architecture is a strong fit:

- current `BattleState`
- player or system `Action`
- pure `reduceBattleState(state, action)` transitions

This will make debugging, logging, and future automated tests much easier.

### 11.3 Randomness

All randomness should come from a seeded RNG so battles can be replayed exactly.

That includes:

- opening draw order
- enemy action deck shuffles
- random target selection
- random effect rolls

### 11.4 Logging And Debuggability

Every state transition should be loggable.

Useful debug capabilities:

- inspect current state as JSON
- replay from the same seed
- step through one action at a time
- snapshot state after each action

## 12. UX Priorities

The UI does not need to be beautiful for MVP, but it must be fast to reason about.

Priorities:

- setup in one screen
- battle state visible without deep navigation
- enemy intent always obvious
- card text readable
- recent events easy to scan
- restart flow extremely quick

The key metric is iteration speed, not production polish.

## 13. Phased Implementation Plan

This section is intentionally the center of gravity for delivery. The battle sandbox should be built as a staircase, where each phase is useful on its own and reduces uncertainty for the next one.

If a phase fails to feel useful in live testing, the project should pause and adjust before moving deeper.

### Phase 1. Engine Skeleton

- create battle state types
- create seeded shuffle utilities
- load player decks and cards
- support draw, play, damage, death, and turn progression
- render a minimal battle screen

Phase 1 goal:

- prove that a deterministic battle loop is possible inside the current codebase
- prove that state transitions are understandable and loggable
- avoid broad mechanic support

Suggested scope restraint:

- one curated player deck
- one very simple encounter
- a tiny supported mechanic set

### Phase 2. Encounter Support

- add encounter definitions
- add telegraphed enemy intent
- add enemy action resolution
- support one simple enemy model such as rotating patterns

Phase 2 goal:

- prove that encounter-driven enemies are enough to create interesting turn pressure
- avoid building a full enemy deck engine unless testing shows it is necessary

### Phase 3. Card Feel Testing

- support a small set of battle-capable cards
- add scenario presets
- add restart from seed
- add readable log and inspector tools

Phase 3 goal:

- make the sandbox genuinely useful for repeated design iteration
- focus on card-feel evaluation, not breadth for its own sake

Suggested success check:

- can a designer change one real card, replay a known test, and learn something meaningful within a few minutes?

### Phase 4. Designer Convenience

- add custom opening hand setup
- add battlefield seeding
- add optional undo for local testing
- add more effect coverage

Phase 4 goal:

- improve iteration speed after the core loop has already proven worthwhile
- add convenience only after the basic battle model is stable enough to deserve polish

## 13.1 Staged Scope Guardrails

The following guardrails should be treated as active delivery rules:

- do not try to support the entire card catalog in the first implementation
- do not begin with full deck-vs-deck simulation
- do not build a comprehensive stack-and-priority engine for MVP
- do not optimize for content breadth before proving battle usefulness
- do not add designer convenience features ahead of deterministic core state and logging

When in doubt, the project should prefer:

- one more reliable test scenario over ten partially supported ones
- one more supported mechanic over one more unfinished system
- one better debugging tool over one more flashy interface feature

## 14. Acceptance Criteria For MVP

The MVP is successful if all of the following are true:

- a local user can choose an existing deck and an encounter preset
- a battle can begin from deterministic setup
- the player can draw, play cards, and end turn
- the enemy can telegraph and resolve at least one kind of intent pattern
- battle state updates visibly after every action
- the app records a readable log
- the user can restart the same test quickly
- at least a handful of real cards can be meaningfully tested end to end

## 15. Key Risks

### 15.1 Card Schema Ambiguity

The current card records are authoring-focused, not battle-engine-native.

Mitigation:

- use an adapter layer
- explicitly mark unsupported mechanics
- avoid schema churn until battle patterns become clearer

### 15.2 Trying To Simulate Full MTG

A full stack-and-priority engine would dramatically slow delivery.

Mitigation:

- use a simplified encounter loop
- resolve effects directly
- expand only when a tested design need appears

### 15.3 Enemy Side Becoming Too Complex

If enemies become full deck players, the sandbox will become much slower to build and harder to read.

Mitigation:

- keep enemies script-driven
- use intent telegraphing
- prefer pattern and event systems over mirror-match simulation

### 15.4 Unsupported Cards Creating Confusion

If the app loads cards it cannot interpret, tests may become misleading.

Mitigation:

- show unsupported mechanics warnings clearly
- filter or flag battle-ready cards
- start with a curated test pool

## 16. Recommended Next Steps

1. Create `src/battle/` with core state, action, and reducer types.
1. Create `src/cloud-arena/` with core state, action, and reducer types.
2. Define a first `Encounter` schema for script-driven enemy behavior.
3. Build a single battle sandbox route in the existing web app.
4. Hand-adapt a small set of testable cards and one sample deck.
5. Add one sample encounter that uses visible telegraphed intent.
6. Validate the loop by testing whether one full battle is playable and worth repeating.

The key implementation rule for these steps is to stop after each one and ask:

- did this reduce uncertainty?
- is the sandbox becoming more useful, or just more elaborate?

If the answer is mostly "more elaborate," scope should be tightened before continuing.

## 17. Bottom-Line Recommendation

The strongest MVP is not "full player deck versus full enemy deck."

The strongest MVP is:

- a TypeScript battle sandbox
- backed by existing card and deck JSON
- using a simplified battle adapter layer
- with script-driven enemy encounters
- optimized for replayable, deterministic card feel testing

That will let Cloud Arcanum answer the most important near-term question quickly:

> Do these cards and encounters create interesting battles worth building the fuller game around?
