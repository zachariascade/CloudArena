import { demonPackEnemyPreset } from "./enemies/demon-pack.js";
import { bruiserDemonEnemyPreset } from "./enemies/bruiser-demon.js";
import { fallenAngelCabanelEnemyPreset } from "./enemies/fallen-angel-cabanel.js";
import { satanAsTheFallenAngelEnemyPreset } from "./enemies/satan-as-the-fallen-angel.js";
import { satanExultingOverEveEnemyPreset } from "./enemies/satan-exulting-over-eve.js";
import { satanCallingUpHisLegionsEnemyPreset } from "./enemies/satan-calling-up-his-legions.js";
import { numberOfTheBeast666EnemyPreset } from "./enemies/number-of-the-beast-666.js";
import { saturnDevouringHisSonGoyaEnemyPreset } from "./enemies/saturn-devouring-his-son-goya.js";
import { medusaCaravaggioEnemyPreset } from "./enemies/medusa-caravaggio.js";
import { greatRedDragonBeastFromSeaEnemyPreset } from "./enemies/great-red-dragon-beast-from-sea.js";
import { greatRedDragonDragonOfTheSunEnemyPreset } from "./enemies/great-red-dragon-dragon-of-the-sun.js";
import { gardenOfEarthlyDelightsHellDetailEnemyPreset } from "./enemies/garden-of-earthly-delights-hell-detail.js";
import { triumphOfDeathEnemyPreset } from "./enemies/triumph-of-death.js";
import { satanInCocytusEnemyPreset } from "./enemies/satan-in-cocytus.js";
import { gruntDemonEnemyPreset } from "./enemies/grunt-demon.js";
import { lakeOfIceEnemyPreset } from "./enemies/lake-of-ice.js";
import { impCallerEnemyPreset } from "./enemies/imp-caller.js";
import { malchiorBinderOfWillsEnemyPreset } from "./enemies/malchior-binder-of-wills.js";
import { longBattleDemonEnemyPreset } from "./enemies/long-battle-demon.js";
import { rebelAngelEnemyPreset } from "./enemies/rebel-angel.js";
import { warderDemonEnemyPreset } from "./enemies/warder-demon.js";
import { viperShadeEnemyPreset } from "./enemies/viper-shade.js";

import type { CloudArenaEnemyPreset, CloudArenaEnemyPresetId } from "./types.js";

export const cloudArenaEnemyPresets: Record<CloudArenaEnemyPresetId, CloudArenaEnemyPreset> = {
  demon_pack: demonPackEnemyPreset,
  fallen_angel_cabanel: fallenAngelCabanelEnemyPreset,
  satan_as_the_fallen_angel: satanAsTheFallenAngelEnemyPreset,
  satan_exulting_over_eve: satanExultingOverEveEnemyPreset,
  satan_calling_up_his_legions: satanCallingUpHisLegionsEnemyPreset,
  number_of_the_beast_666: numberOfTheBeast666EnemyPreset,
  saturn_devouring_his_son_goya: saturnDevouringHisSonGoyaEnemyPreset,
  medusa_caravaggio: medusaCaravaggioEnemyPreset,
  great_red_dragon_beast_from_sea: greatRedDragonBeastFromSeaEnemyPreset,
  great_red_dragon_dragon_of_the_sun: greatRedDragonDragonOfTheSunEnemyPreset,
  garden_of_earthly_delights_hell_detail: gardenOfEarthlyDelightsHellDetailEnemyPreset,
  triumph_of_death: triumphOfDeathEnemyPreset,
  satan_in_cocytus: satanInCocytusEnemyPreset,
  lake_of_ice: lakeOfIceEnemyPreset,
  grunt_demon: gruntDemonEnemyPreset,
  bruiser_demon: bruiserDemonEnemyPreset,
  warder_demon: warderDemonEnemyPreset,
  imp_caller: impCallerEnemyPreset,
  malchior_binder_of_wills: malchiorBinderOfWillsEnemyPreset,
  rebel_angel: rebelAngelEnemyPreset,
  long_battle_demon: longBattleDemonEnemyPreset,
  viper_shade: viperShadeEnemyPreset,
};

export function getEnemyPreset(enemyId: CloudArenaEnemyPresetId): CloudArenaEnemyPreset {
  return cloudArenaEnemyPresets[enemyId];
}
