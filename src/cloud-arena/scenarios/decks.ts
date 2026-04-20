import { masterDeckPreset } from "./decks/master-deck.js";
import { mixedGuardianDeckPreset } from "./decks/mixed-guardian.js";
import { tallCreaturesDeckPreset } from "./decks/tall-creatures.js";
import { wideAngelsDeckPreset } from "./decks/wide-angels.js";

import type { CloudArenaDeckPreset, CloudArenaDeckPresetId } from "./types.js";

export const cloudArenaDeckPresets: Record<CloudArenaDeckPresetId, CloudArenaDeckPreset> = {
  master_deck: masterDeckPreset,
  wide_angels: wideAngelsDeckPreset,
  tall_creatures: tallCreaturesDeckPreset,
  mixed_guardian: mixedGuardianDeckPreset,
};

export function getDeckPreset(deckId: CloudArenaDeckPresetId): CloudArenaDeckPreset {
  return cloudArenaDeckPresets[deckId];
}
