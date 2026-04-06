import { mixedGuardianDeckPreset } from "./decks/mixed-guardian.js";

import type { CloudArenaDeckPreset, CloudArenaDeckPresetId } from "./types.js";

export const cloudArenaDeckPresets: Record<CloudArenaDeckPresetId, CloudArenaDeckPreset> = {
  mixed_guardian: mixedGuardianDeckPreset,
};

export function getDeckPreset(deckId: CloudArenaDeckPresetId): CloudArenaDeckPreset {
  return cloudArenaDeckPresets[deckId];
}
