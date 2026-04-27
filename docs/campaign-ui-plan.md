# Campaign UI Plan

## Player Flow

1. From the start screen, replace or supplement `New Run` with `Campaign`.
2. `Campaign` opens a new campaign page showing a vertical progression of levels, starting at `1` and climbing upward.
3. The player begins with a fixed starter deck and sees a small deck summary on that page.
4. Clicking the first unlocked level launches a battle using that deck and full health.
5. On victory, the current finish modal is followed by a `Choose a Reward` modal with 3 random card choices.
6. The player picks 1 card, it is added to the campaign deck, and the modal closes.
7. The app returns to the campaign page, marks the cleared level complete, and unlocks the next one.
8. The next level launches with the updated deck and full health again.
9. After the last battle, show a final campaign-complete modal.

## New UI Surfaces

### Start Page

- Add a `Campaign` button next to the existing options.

### Campaign Page

- Main column: ascending level track with locked, unlocked, current, and completed states.
- Side panel: starter/current deck summary, card count, maybe a few visible card thumbnails.
- Header strip: campaign title, progress like `3 / 8 cleared`.

### Reward Modal

- Title: `Choose a Reward`
- Subtitle: short reward copy like `Pick 1 card to add to your deck`
- Three large card choices
- One click selects and confirms immediately, or select then click `Continue`

### Final Victory Modal

- Title: `Campaign Complete`
- Summary of cleared levels and final deck size
- CTA back to start or restart campaign

## State Model

Add a persistent campaign run object, separate from a single battle session:

- `campaignId`
- `currentLevelIndex`
- `unlockedLevelIndices`
- `completedLevelIndices`
- `deckCardIds` or full deck record
- `starterDeckId` or starter deck seed data
- `status`: `in_progress | reward_pending | complete`
- `pendingRewardOptions`
- `selectedScenarioId`
- `maxLevelCount`

A battle remains a normal session, but it should know it belongs to a campaign:

- `mode: battle | campaign`
- `campaignId`
- `levelIndex`

## Route Plan

- Add a new route like `/campaign`
- Add battle entry support like `/battle?campaign=<id>&level=<n>` or carry campaign context in app state
- On victory, don’t just end the battle flow; route back through campaign reward resolution first

## Page Behavior

- Level nodes should show:
- `Completed`
- `Unlocked`
- `Locked`
- maybe `Current`
- Only the next unlocked level is clickable
- Completed levels can optionally be reviewable, but not replayable at first
- Deck preview should always reflect the latest campaign deck

## Reward Rules

Keep the first version simple:

- Reward pool sampled from a defined campaign reward set
- 3 unique random cards
- No rerolls
- Card is added permanently to the campaign deck
- Reward must be chosen before returning to the map

## Interaction With Existing Battle UI

Use the current battle page mostly as-is, with these additions:

- Battle launched from campaign uses the campaign deck, not the setup page
- On victory:
- current victory modal appears
- then reward modal appears
- On defeat:
- simplest first version is `Retry Level`
- keep campaign progress, but do not grant reward or unlock next level

## Implementation Slices

1. Add `Campaign` button to the start page.
2. Create a static campaign page with hardcoded levels and visual states.
3. Add a starter deck definition for campaign runs.
4. Add campaign run state and storage.
5. Launch battles from campaign without going through setup.
6. Detect campaign victory and show reward modal.
7. Add reward generation and deck update flow.
8. Return to campaign page and unlock next level.
9. Add final campaign-complete modal.

## Design Notes

- The campaign page should feel more like a progression board than a menu.
- Make the level path rise upward visually so advancement feels tangible.
- Keep the deck panel compact and readable; it’s there to reinforce growth, not become a full deckbuilder.
- The reward moment should feel celebratory and clean, since that’s the core loop payoff.

## Recommended First Version

Ship the smallest loop first:

- 5 levels
- 1 fixed starter deck
- 1 linear unlock path
- 3 random rewards after each win
- full heal between battles
- no gold, shops, branching, or relic systems yet
