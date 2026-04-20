# Cloud Arena Game UI Implementation Plan

## Purpose

Turn Cloud Arena into a more game-like full-screen battle experience:

- the battle fills the viewport
- the page does not scroll
- only the essential combat UI is visible during normal play
- admin tools live behind a compact header menu

This is a UI and layout overhaul, not a gameplay rules rewrite.

## Product Goal

Make the Cloud Arena frontend feel like a real video game client instead of a general-purpose web dashboard.

The desired experience is:

- a fixed battle viewport that scales with `vh` and `vw`
- no document scrolling during play
- a minimal combat HUD
- a header menu for admin actions
- a dedicated place for logs, setup, and debugging without cluttering the battle surface

## Current State

The current interactive UI already has the right raw pieces:

- live battle state rendering
- scenario selection
- seed override
- reset and new battle actions
- log rendering
- inspector overlays

The current shape is still closer to a control dashboard than a game screen.

The main places involved today are:

- [`apps/cloud-arena-web/src/routes/interactive-page.tsx`](../../apps/cloud-arena-web/src/routes/interactive-page.tsx)
- [`apps/cloud-arena-web/src/components/app-shell.tsx`](../../apps/cloud-arena-web/src/components/app-shell.tsx)
- [`apps/cloud-arena-web/src/components/cloud-arena-battle-state.tsx`](../../apps/cloud-arena-web/src/components/cloud-arena-battle-state.tsx)
- [`apps/cloud-arena-web/src/app/base-html.ts`](../../apps/cloud-arena-web/src/app/base-html.ts)

## Scope

The new game UI should support:

- full-screen battle presentation
- fixed-height and fixed-width viewport behavior
- no page scrolling
- battle HUD with only necessary state
- header menu for admin utilities
- access to logs and battle setup from the menu
- responsive behavior across common desktop sizes

The new game UI should not:

- expose every debug control directly on the main screen
- rely on a tall page layout
- keep a permanent wide side panel for logs
- require scrolling to reach common battle actions

## Recommended Layout Model

Use a three-part UI model:

### 1. Game Shell

A full-screen wrapper that owns:

- viewport sizing
- background treatment
- overflow locking
- top header strip
- menu state

### 2. Battle Surface

The central play area that shows only the important battle UI:

- player state
- enemy state
- battlefield
- hand
- turn/action affordances
- selected combat feedback

### 3. Admin Layer

A header menu, drawer, or modal that contains:

- scenario selection
- seed override
- new battle / reset actions
- logs
- optional diagnostics
- external links like the card catalog

## Recommended Component Split

Refactor the interactive UI into smaller pieces:

- `GameShell`
- `GameHeader`
- `GameMenu`
- `BattleStage`
- `BattleHud`
- `BattleLogDrawer`
- `BattleAdminPanel`

Keep the battle renderer focused on combat presentation and move admin controls out of the main view.

## Implementation Phases

### Phase 1: Lock The Viewport

Status:

- completed

Goal:

- make the app behave like a fixed-screen game client

Work:

- update the root shell to fill the viewport
- lock body and app scrolling
- remove page-level vertical spacing
- make the battle screen use the full available width and height
- verify the main route can render without document scroll bars

Likely files:

- [`apps/cloud-arena-web/src/components/app-shell.tsx`](../../apps/cloud-arena-web/src/components/app-shell.tsx)
- [`apps/cloud-arena-web/src/app/base-html.ts`](../../apps/cloud-arena-web/src/app/base-html.ts)
- [`apps/cloud-arena-web/src/routes/index.tsx`](../../apps/cloud-arena-web/src/routes/index.tsx)

### Phase 2: Build The Game Shell

Status:

- completed

Goal:

- replace the current dashboard-style header with a game-style header strip

Work:

- keep branding compact
- add a hamburger menu button in the top-right corner
- move navigation links into a slide-out sidebar
- make the header visually feel attached to the game frame

Likely files:

- [`apps/cloud-arena-web/src/components/app-shell.tsx`](../../apps/cloud-arena-web/src/components/app-shell.tsx)
- new header/menu components under `apps/cloud-arena-web/src/components/`

### Phase 3: Reduce The Main Battle UI

Status:

- completed

Goal:

- only show the combat essentials during normal play

Work:

- trim the current interactive page into a battle-first layout
- keep scenario/seed/reset controls out of the default main surface
- prioritize the battlefield, hand, and current turn state
- compress any secondary information into smaller HUD elements

Likely files:

- [`apps/cloud-arena-web/src/routes/interactive-page.tsx`](../../apps/cloud-arena-web/src/routes/interactive-page.tsx)
- [`apps/cloud-arena-web/src/components/cloud-arena-battle-state.tsx`](../../apps/cloud-arena-web/src/components/cloud-arena-battle-state.tsx)
- [`apps/cloud-arena-web/src/components/cloud-arena-battlefield-panel.tsx`](../../apps/cloud-arena-web/src/components/cloud-arena-battlefield-panel.tsx)
- [`apps/cloud-arena-web/src/components/cloud-arena-hud-band.tsx`](../../apps/cloud-arena-web/src/components/cloud-arena-hud-band.tsx)

### Phase 4: Move Admin Tools Behind The Menu

Status:

- completed

Goal:

- keep setup and debugging available without cluttering the battle

Work:

- place scenario selection in the sidebar drawer
- move seed override and battle reset into the same sidebar surface
- move logs into the same sidebar area
- make the menu usable while preserving battle focus

Likely files:

- [`apps/cloud-arena-web/src/routes/interactive-page.tsx`](../../apps/cloud-arena-web/src/routes/interactive-page.tsx)
- [`apps/cloud-arena-web/src/components/cloud-arena-log-panel.tsx`](../../apps/cloud-arena-web/src/components/cloud-arena-log-panel.tsx)
- new menu/drawer components under `apps/cloud-arena-web/src/components/`

### Phase 5: Make The Layout Responsive

Status:

- in progress

Goal:

- keep the battle usable at different desktop sizes without scrolling

Work:

- use `clamp()`, `vh`, `vw`, and breakpoint-aware sizing
- ensure the battlefield scales cleanly
- prevent the hand, HUD, and log drawer from collapsing awkwardly
- tune for common 16:9 and ultrawide screens

Likely files:

- [`apps/cloud-arena-web/src/app/base-html.ts`](../../apps/cloud-arena-web/src/app/base-html.ts)
- battle presentation components in `apps/cloud-arena-web/src/components/`

### Phase 6: Polish The Game Feel

Status:

- pending

Goal:

- make the screen feel intentional and playful, not just compressed

Work:

- strengthen the visual hierarchy
- add stronger full-screen framing
- use background treatment that supports the battle mood
- tune spacing, typography, and card density for a game client feel

## Interaction Rules

The new UI should follow these rules:

- the battle surface should not scroll
- logs can scroll internally if needed
- the admin menu should be the main gateway to setup actions
- keyboard shortcuts should stay available, but admin shortcuts must not interfere with combat input
- the battle should remain readable with the menu closed

## Data And Behavior Boundaries

Keep these behaviors separated:

- battle rendering
- battle state mutation
- admin/setup controls
- logs and diagnostics

The game view should not need to know how logs are stored beyond rendering them.

The admin menu should not own combat logic; it should only trigger existing battle actions.

## Testing Checklist

Before calling the redesign done, verify:

- no page scroll on the main battle route
- battle still renders correctly at desktop viewport sizes
- admin menu opens and closes cleanly
- reset and new battle still work
- logs are accessible without permanently taking screen space
- keyboard input still works during combat
- loading and error states still fit the new shell

## Risks

Main risks to watch:

- a fixed viewport can create cramped layouts on shorter screens
- moving logs into a drawer can make debugging slightly less immediate
- over-compressing the HUD can hide important combat information
- global overflow changes can accidentally affect other app routes

## Suggested Rollout Order

1. establish the viewport-locked shell
2. convert the header into a compact game header
3. simplify the default battle screen
4. move setup and logs behind a menu
5. tune responsive layout and spacing
6. add polish and final testing

## Definition Of Done

This work is done when:

- Cloud Arena opens in a full-screen game-like frame
- the battle route does not require scrolling
- the main combat view only shows essential information
- admin controls are available from the header menu
- logs are accessible without occupying the main battlefield layout
- the experience is stable across common desktop viewport sizes
