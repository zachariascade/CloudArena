# Empty Board Risk

## Purpose

This document captures the current assessment of the `empty board problem` in the biblical deckbuilder combat model.

The goal is not to assume this problem is fatal, but to identify:

- why it may still exist
- why the current system softens it
- what warning signs to watch for in testing
- what design levers can solve it without relying on healing loops

## The Core Concern

An `empty board problem` happens when the player loses most or all permanents and the game becomes:

- low agency
- low hope
- low tempo
- obviously doomed

The worst version looks like:

- the player cannot meaningfully defend
- the player cannot rebuild fast enough
- the player only plays weak stall turns
- the outcome feels predetermined before defeat actually happens

This is one of the most important risks in any combat system where permanents are central to both offense and defense.

## Why The Current System Softens The Risk

The current combat design already avoids the harshest version of the problem.

Reasons:

- players still have non-permanent cards in hand
- enemy intent is telegraphed, which preserves tactical agency
- limited board slots mean the player is not expected to maintain a giant battlefield
- the player can still attack, block, and react even with no permanents in play

This means an empty board does not automatically equal zero gameplay.

That is a strong baseline.

## Why The Risk Still Exists

Even though the player can still act, the system still has several pressures that can make a wiped or weakened board feel bad:

- permanents are likely to be the main repeatable source of value
- summoning sickness slows rebuilding
- permanent health is persistent, so attrition compounds over time
- player health is persistent between encounters, so losing tempo now can also hurt future fights
- low board slots make each permanent loss more significant
- stronger hero permanents will likely represent major chunks of deck identity and power

This means the remaining risk is not total helplessness.

It is `tempo collapse`.

The player may still be able to take actions, but those actions may no longer feel strong enough to stabilize or recover.

## Current Assessment

The current model does `not` have the most dangerous form of the empty board problem.

However, it likely still has a medium-strength version of it unless the card pool and encounters are designed with recovery in mind.

That means:

- no panic is needed
- but resilience should be treated as a deliberate balance target

## What To Watch For In Testing

The key testing question is:

> When the player loses the board, do their next turns feel like meaningful stabilization attempts, or do they feel like delaying the inevitable?

Warning signs:

- players stop believing they can recover once two permanents die
- rebuilding from zero takes too many turns
- summoning a new permanent feels too slow because of summoning sickness plus cost
- players hoard permanents because playing them feels too risky
- enemy pressure scales faster than board recovery
- losing a strong permanent effectively decides the fight
- players describe post-wipe turns as boring, hopeless, or automatic

Good signs:

- players can still buy time with non-permanent cards
- rebuilding one permanent meaningfully changes the game state
- death of a permanent hurts, but does not erase all momentum
- some "behind" turns feel clever rather than desperate

## Design Levers That Help Without Healing

These are the most promising ways to reduce empty-board misery without enabling infinite healing loops.

### 1. Cheap Rebuild Permanents

Include low-cost permanents whose job is not to dominate, but to help the player re-establish presence.

These can be:

- cheap defenders
- disposable support bodies
- low-cost attackers
- cards that are intentionally efficient only when the board is empty or nearly empty

### 2. Strong Instant Defense

If the board is gone, the hand must still be able to buy time.

That means:

- efficient Block cards
- cards that weaken enemy attacks
- cards that combine attack and Block
- temporary stall effects

These let players survive long enough to rebuild.

### 3. Death Value

Some permanents should leave behind something when they die.

Examples:

- Block
- card draw
- summon discount
- delayed replacement token
- graveyard setup for later resurrection

This turns death into a setback rather than pure deletion.

### 4. Behind-State Support

Some cards, blessings, or relics should be better when the player is behind.

Examples:

- reduced cost if you control 0 or 1 permanents
- bonus Block if your board is empty
- stronger summon if an allied permanent died this round
- draw or energy boost while behind on board

This gives the system built-in comeback texture.

### 5. Rebuild Velocity

The game should make rebuilding practical, not rare.

That does not mean every deck should recover instantly.

It means that:

- replacing one lost slot should usually be possible
- re-entering the fight should not take too many dead turns
- rebuilding from zero should feel difficult but realistic

### 6. Enemy Restraint

Not every enemy should be able to erase the whole board efficiently.

Healthiest pattern:

- most enemies pressure the player and one part of the board
- some enemies pressure wide boards
- full-board punishment exists, but is rare and telegraphed

This keeps permanent investment worthwhile.

### 7. Momentum Outside The Board

Some forms of progress should survive even after permanents die.

Examples:

- deck quality
- relic effects
- blessings
- graveyard setup
- cost reduction for the next summon

This makes the board important without making it the only source of progress.

## Practical Recommendation

Do not solve the empty board problem by reintroducing routine healing.

Instead, solve it through:

- rebuild speed
- defensive instants
- death value
- behind-state tools
- encounter restraint

That approach fits the current combat model much better and avoids the loop risks that healing introduces.

## Current Design Conclusion

The empty board problem is real, but currently manageable.

The present system:

- reduces total helplessness
- preserves player action after board loss
- still needs deliberate recovery scaffolding to avoid tempo-collapse frustration

This should be treated as a balancing and card-pool design concern, not as evidence that the combat system is broken.
