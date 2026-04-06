# Trace-Based Simulator Design

## 1. Purpose

This document proposes a trace-based simulator for rapidly testing Cloud Arcanum battle concepts without first building the full interactive battle sandbox UI.

The core idea is:

- a deterministic battle engine owns rules truth
- an agent chooses from engine-exposed actions
- the simulator records a complete structured trace
- the trace becomes the main artifact for review, debugging, and later visualization

This is intended to be a lower-risk and faster-to-build path than the full battle sandbox app.

## 2. Why This Exists

The full battle sandbox is valuable, but it is also a relatively large project because it combines:

- engine work
- encounter scripting
- interactive UI
- state inspection tools
- battle presentation

A trace-based simulator separates the most important early question from the presentation problem:

> Can we simulate useful battles and learn from them quickly?

If the answer is yes, the simulator can later feed a UI replay tool or a fuller battle app.

## 3. Core Thesis

The simulator should not ask an AI to "be the rules engine."

Instead:

- the engine determines legal actions
- the engine resolves all outcomes
- the engine tracks state changes
- the agent only selects among available choices

This distinction is critical.

If the AI is allowed to interpret rules freely, the results will be inconsistent and hard to trust. If the engine owns legality and resolution, the simulator can still be useful even when the agent's strategic quality is imperfect.

## 4. Primary Goals

The simulator should make it easy to:

- load a player deck from canonical JSON
- load an encounter definition
- run a deterministic simulated battle
- record every important state transition in order
- inspect the final result and battle summary
- rerun the same test with the same seed
- compare runs after changing cards, encounter rules, or agent policy

Success looks like:

- "I can run ten tests against the same encounter after changing one card"
- "I can inspect why the run failed without watching a full manual battle"
- "I can get directional balance signals before building the richer UI"

## 5. Non-Goals

The simulator should explicitly avoid:

- trusting the AI to adjudicate rules text directly
- full comprehensive-rules MTG timing fidelity
- polished battle presentation
- animation or consumer-facing UI
- broad mechanic coverage on day one
- pretending that simulated win rate equals final balance truth

This tool is for directional testing, not final balance certification.

## 6. Product Shape

The recommended first version is a local TypeScript simulation runner with:

- a deterministic battle engine
- an encounter model
- one or more agent policies
- a trace writer
- a summary report output

Possible outputs:

- JSON trace files
- human-readable text summaries
- aggregate run statistics

The simulator can initially live as a script or lightweight local tool rather than as a route in the main web app.

## 7. Core Architecture

### 7.1 Source Of Truth

Canonical content stays in:

- `data/cards/`
- `data/decks/`

The simulator should consume canonical content, not fork it into a separate content system.

### 7.2 Battle Adapter Layer

The existing card schema is not yet a battle-engine-native schema.

The simulator should introduce a battle adapter that derives a simulator-ready card model from canonical card data, such as:

- ID
- display name
- battle role
- energy cost
- attack and health values
- supported effects
- unsupported mechanics warnings

This lets the simulator stay aligned with the real content without forcing premature schema changes.

### 7.3 Encounter Model

The simulator should use a dedicated encounter definition rather than treating the enemy as a full deck-playing mirror opponent.

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

This matches the encounter-driven direction already established in the repo's design notes.

### 7.4 Agent Model

The agent should receive:

- current battle state
- public information
- a list of legal actions
- optional evaluation hints or goals

The agent should return:

- one chosen action from the provided list

The agent should not directly mutate state or settle effects.

## 8. Key Design Principle

The simulator should be built around this rule:

> The engine owns truth. The agent owns choice.

That means:

- the engine shuffles
- the engine draws
- the engine checks legality
- the engine settles damage
- the engine applies triggers and deaths
- the engine reveals enemy intent
- the engine determines win and loss

The agent only decides things like:

- which card to play
- which target to choose
- whether to attack
- which attack assignment to use
- whether to end the turn

## 9. Simulation Flow

### 9.1 Single Run

One simulated run should work like this:

1. Load deck and encounter
2. Build initial battle state from seed
3. Repeat until battle end:
4. Engine advances to next decision point
5. Engine produces legal actions
6. Agent selects one action
7. Engine resolves the action
8. Engine appends trace entries
9. Engine performs enemy and system steps as needed
10. Return final state, trace, and summary

### 9.2 Batch Runs

The simulator should also support repeated runs with varying seeds so designers can inspect:

- win/loss rate
- average turns survived
- average damage dealt
- dead-hand frequency
- card play frequency
- encounter pressure patterns

These should be treated as rough signals, not definitive balancing proof.

## 10. Trace Format

The trace is the core deliverable of this system.

### 10.1 Trace Requirements

The trace should be:

- ordered
- structured
- deterministic
- replayable
- readable by both code and humans

### 10.2 Recommended Trace Sections

Each run should record:

- run metadata
- deck ID
- encounter ID
- seed
- simulator version
- supported-mechanics version or ruleset version
- chronological event list
- final state snapshot
- summary metrics

### 10.3 Example Event Types

Useful event types may include:

- `battle_started`
- `turn_started`
- `energy_gained`
- `intent_revealed`
- `card_drawn`
- `card_played`
- `unit_summoned`
- `attack_declared`
- `damage_dealt`
- `healing_applied`
- `status_applied`
- `unit_destroyed`
- `card_moved_zone`
- `turn_ended`
- `battle_ended`

### 10.4 Why Trace Quality Matters

If the trace is weak, the simulator becomes hard to trust.

If the trace is strong, it enables:

- debugging
- post-run review
- automated regression comparison
- step-by-step future UI playback
- designer understanding of why a battle felt good or bad

## 11. Agent Strategy Options

The simulator does not need to begin with an LLM agent.

Recommended order:

### 11.1 Heuristic Agent First

Start with a simple deterministic or semi-deterministic heuristic agent, such as:

- play affordable permanent first
- prioritize removal on high-threat enemies
- defend against lethal or near-lethal intent
- spend unused energy efficiently

Why start here:

- easier to debug
- cheaper to run
- more consistent for comparisons
- helps validate that the engine boundary is sound

### 11.2 LLM Agent Later

An LLM-based agent can be added later once:

- the engine is stable
- legal action generation is solid
- trace quality is good
- supported mechanics are clear

The LLM should receive compact structured state plus a legal action list, then choose one action.

### 11.3 Hybrid Agent

A practical middle ground is:

- heuristic policy for routine choices
- LLM policy only for harder branches

This may reduce cost and variance.

## 12. Rules Scope For First Version

The first simulator should support only a narrow rules slice.

Recommended initial mechanic set:

- draw
- play card
- summon unit
- direct damage
- attack
- simple defend or intercept behavior if needed
- healing
- death
- discard
- revive
- start-of-turn and on-play triggers

Anything more advanced should be explicitly unsupported until added on purpose.

## 13. Outputs

The simulator should produce two outputs per run:

### 13.1 Structured Output

A machine-readable JSON artifact containing:

- metadata
- chronological trace
- final state
- summary metrics

### 13.2 Human Summary

A concise readable report containing things like:

- result: win or loss
- turns taken
- final player health
- final enemy health
- key cards played
- notable events
- possible failure reasons

This makes the simulator valuable even before any replay UI exists.

## 14. How This Helps Deck Iteration

This simulator can help with:

- spotting dead draws
- spotting cards that are never played
- seeing whether energy curves are too clunky
- seeing whether certain cards dominate too often
- seeing whether an encounter overwhelms a deck too early
- identifying obvious underpowered or overperforming patterns

This simulator cannot, by itself, fully solve:

- nuanced fun
- subtle decision richness
- final card balance
- theological or thematic fit
- whether manual play feels satisfying

It is best used as an early signal generator.

## 15. Relationship To A Future UI

The simulator should be designed so that a future UI can replay its traces step by step.

That means the trace format should be treated as a stable product surface, not just temporary debug noise.

Future UI layers could include:

- battle trace viewer
- step-by-step state playback
- action timeline
- state diff inspector
- final battle summary screen

This gives the project a clean progression:

1. build engine and trace output
2. validate that the simulation is useful
3. add a trace viewer
4. later add a richer manual battle sandbox if still needed

## 16. Recommended Module Boundaries

Recommended structure:

```text
src/cloud-arena/
  engine/
  adapters/
  encounters/
  agents/
  trace/
  reports/
  run-simulation.ts
  run-batch-simulation.ts
```

Possible supporting data folders:

```text
data/encounters/
data/battle-scenarios/
```

## 17. Phased Delivery Plan

### Phase 0. Deterministic Core

- create battle state types
- create seeded randomness utilities
- create legal action generation
- create deterministic resolution for a tiny mechanic set

Phase goal:

- prove that the engine can own truth cleanly

### Phase 1. Trace Output

- define trace schema
- record event stream
- write JSON output
- write a readable run summary

Phase goal:

- make runs inspectable and debuggable

### Phase 2. Encounter Support

- add encounter definitions
- add enemy intent
- add encounter action resolution

Phase goal:

- prove useful battle pressure without a full enemy deck engine

### Phase 3. Agent Policy

- add a heuristic agent
- support end-to-end simulated runs
- add batch execution across seeds

Phase goal:

- produce useful deck and encounter signals quickly

### Phase 4. Visualization Bridge

- refine trace output for replay
- add state snapshots or diffs where needed
- prepare a trace viewer or battle playback UI

Phase goal:

- turn simulation output into something easier to inspect visually

## 18. Scope Guardrails

To keep this project useful and smaller than the full app, it should follow these guardrails:

- do not let the AI resolve rules
- do not start with an LLM agent if a heuristic agent can prove the loop
- do not try to support the whole card catalog
- do not build full deck-vs-deck enemy simulation first
- do not treat aggregate numbers as trustworthy if the supported mechanics are still thin
- do not overinvest in presentation before traces are useful

## 19. Relative Effort

Relative to the full battle sandbox app, this trace-based simulator should be meaningfully smaller and safer.

Why:

- no full interactive battle UI required at the start
- no need to solve manual action UX first
- replay can be deferred until traces are already useful
- summary output can deliver value early

It is still a real systems project because the engine must be deterministic and credible, but it is a better first step than starting with a full visual battle client.

## 20. Acceptance Criteria

The trace-based simulator is a successful MVP if:

- it can load at least one real deck and one real encounter
- it can run a complete deterministic battle from a seed
- it records a structured trace of the battle
- it produces a readable summary at the end
- it can rerun the same seed and produce the same result
- it can run multiple seeds and produce directional aggregate metrics
- designers can inspect a loss and understand why it happened

## 21. Bottom-Line Recommendation

Before building the full battle sandbox app, Cloud Arcanum should strongly consider building this trace-based simulator first.

It gives the project:

- earlier gameplay feedback
- lower UI cost
- better debugging surfaces
- a future replay foundation
- a safer path for AI-assisted battle testing

The main rule should remain:

> The engine resolves the game. The agent chooses from legal actions. The trace tells the story of what happened.
