# Image Attribution Audit

Updated: 2026-03-29

## Summary

- Unique local card images reviewed: `54`
- Unique local card images with artist filled: `50`
- Unique local card images still unresolved: `4`

This pass filled image-level `artist` metadata where a source work could be confirmed from existing notes and supporting provenance research.

## Confirmed Source Families

- `images/cards/card_0021_adam_first_of_dust.jpg`: Albrecht Dürer
- `images/cards/card_0022_eve_mother_of_the_living.jpg`: Maerten de Vos
- `images/cards/card_0023_cain_marked_exile.jpg`: Titian
- `images/cards/card_0024_seth_seed_of_renewal.jpg`: anonymous printmaker after Hans Sebald Beham
- `images/cards/card_0025_enoch_walker_with_god.jpg`: Gerard Hoet and others
- `images/cards/card_0026_lamech_voice_before_the_flood.jpg`: anonymous printmaker after Hans Sebald Beham
- `images/cards/card_0027_let_there_be_light.png`: Gustave Doré
- `images/cards/card_0028_breath_into_dust.jpg`: Michelangelo
- `images/cards/card_0029_fruit_of_the_forbidden_tree.jpg`: Michelangelo
- `images/cards/card_0030_tree_of_life.jpg`: John Hagerty
- `images/cards/card_0031_tree_of_forbidden_knowledge.jpg`: Lucas Cranach the Elder
- `images/cards/card_0032_flaming_sword_of_the_east.png`: Theodore Poulakis
- `images/cards/card_0034_the_garden_place_of_first_breath.jpg`: Izaak van Oosten
- `images/cards/card_0035_east_of_eden_land_of_exile.jpg`: Lambert de Hondt (I)
- `images/cards/card_0036_watcher_at_edens_gate.jpg`: Domenichino
- `images/cards/card_0037_builder_of_the_tower.jpg`: Pieter Bruegel the Elder
- `images/cards/card_0038_tiller_of_the_cursed_ground.jpg`: Carl Stockmann
- `images/cards/classics/card_0039_noah_keeper_of_the_ark.jpg`: Edward Hicks
- `images/cards/classics/card_0040_methuselah_elder_of_the_long_years.jpg`: Schenck
- `images/cards/classics/card_0041_tubal_cain_forger_of_bronze_and_iron.jpg`: Maarten de Vos
- `images/cards/classics/card_0044_shem_bearer_of_the_line.jpg`: Jan Luyken
- `images/cards/classics/card_0045_ham_father_of_canaan.png`: Guido Cagnacci
- `images/cards/classics/card_0048_the_serpent_whisperer_in_the_garden.png`: Lucas Cranach the Elder
- `images/cards/classics/card_0049_the_flood.jpg`: Gustave Doré
- `images/cards/classics/card_0050_covenant_of_the_rainbow.jpg`: Jan Luyken
- `images/cards/classics/card_0053_naming_of_the_creatures.jpg`: Joachim Wtewael
- `images/cards/classics/card_0054_rib_of_adam.png`: Maerten de Vos
- `images/cards/classics/card_0055_image_of_god.jpg`: Michelangelo
- `images/cards/classics/card_0056_the_fall.png`: Lucas Cranach the Elder
- `images/cards/classics/card_0057_garments_of_skin.jpg`: Lambert de Hondt (I)
- `images/cards/classics/card_0059_dove_with_the_olive_branch.jpg`: Heuman
- `images/cards/classics/card_0064_pishon_river_of_gold.jpg`: Dirc van Delf
- `images/cards/classics/card_0065_gihon_river_of_encircling.jpg`: Dirc van Delf
- `images/cards/classics/card_0066_tigris_swift_water_of_the_east.jpg`: Dirc van Delf
- `images/cards/classics/card_0067_euphrates_river_of_ancient_boundaries.jpg`: Dirc van Delf
- `images/cards/classics/card_0068_the_deep_waters_before_order.jpg`: Gustave Doré
- `images/cards/classics/card_0070_firmament.jpg`: Wenceslaus Hollar

Some cards reuse the same underlying art under multiple filenames or across multiple records. Those were normalized by assigning the same artist across the reused image family.

## Still Unresolved

- `images/cards/card_0003_michael.avif`
  Cards:
  `Michael, Seraph of the First Charge`
  `Gabriel, Trumpet of the Final Dawn`
  `Raphael, Wing of Restored Grace`
  `Uriel, Flamebearer of Revelation`
  `Azrael, Keeper of the Last Veil`

- `images/cards/card_0009_lucifer_fallen_angel_of_light.webp`
  Cards:
  `Lucifer, Fallen Angel of Light`
  `Beelzebub, Lord of Flies`
  `Baal, Tyrant of Storms`
  `Asmodeus, Prince of Desire`
  `Belial, Father of Rebellion`
  `Mammon, Prince of Greed`
  `Lilith, Mother of Night`
  `Samael, Venom of Heaven`
  `Mephistopheles, Bargainer of Damnation`
  `Baphomet, Horned Lord of the Labyrinth`
  `Moloch, Furnace of Sacrifice`

- `images/cards/card_0015_leviathan_abyssal_world_serpent.webp`
  Cards:
  `Leviathan, Abyssal World-Serpent`

- `images/cards/classics/card_0061_ararat_mountain_of_rest.jpg`
  Cards:
  `Ararat, Mountain of Rest`

## Guidance

- Keep unresolved images blank until provenance is confirmed.
- Prefer artist credit for the original artwork creator when the source page identifies one.
- Use `sourceUrl`, `creditText`, and `sourceNotes` for fuller provenance when future passes add them.
