import { masterDeckPreset } from "./decks/master-deck.js";
import { mixedGuardianDeckPreset } from "./decks/mixed-guardian.js";
import { tallCreaturesDeckPreset } from "./decks/tall-creatures.js";
import { starterDeckPreset } from "./decks/starter-deck.js";

import type { CloudArenaDeckPreset, CloudArenaDeckPresetId } from "./types.js";

export const cloudArenaDeckPresets: Record<CloudArenaDeckPresetId, CloudArenaDeckPreset> = {
  master_deck: masterDeckPreset,
  starter_deck: starterDeckPreset,
  tall_creatures: tallCreaturesDeckPreset,
  mixed_guardian: mixedGuardianDeckPreset,
};

export function getDeckPreset(deckId: CloudArenaDeckPresetId): CloudArenaDeckPreset {
  return cloudArenaDeckPresets[deckId];
}
