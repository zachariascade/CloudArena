import {
  applyBattleAction,
  buildBattleSummary,
  createBattle,
  formatEnemyIntent,
  formatBattleSummary,
  type BattleAction,
  type BattleEvent,
  type BattleState,
} from "../src/cloud-arena/index.js";

function printSection(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function formatEvent(event: BattleEvent): string {
  switch (event.type) {
    case "battle_created":
      return `turn ${event.turnNumber}: battle created`;
    case "turn_started":
      return `turn ${event.turnNumber}: start turn, drew ${event.cardsDrawn}, energy ${event.energy}, enemy intent ${formatEnemyIntent(event.enemyIntent)}`;
    case "card_drawn":
      return `turn ${event.turnNumber}: player drew ${event.cardId}`;
    case "card_played":
      return `turn ${event.turnNumber}: played ${event.cardId}`;
    case "enemy_card_played":
      return `turn ${event.turnNumber}: enemy played ${event.cardId}`;
    case "block_gained":
      return `turn ${event.turnNumber}: ${event.target}${event.targetId ? ` ${event.targetId}` : ""} gained ${event.amount} block`;
    case "damage_dealt":
      return `turn ${event.turnNumber}: ${event.source}${event.sourceId ? ` ${event.sourceId}` : ""} dealt ${event.amount} damage to ${event.target}${event.targetId ? ` ${event.targetId}` : ""}`;
    case "permanent_summoned":
      return `turn ${event.turnNumber}: summoned ${event.definitionId} as ${event.permanentId} into slot ${event.slotIndex + 1}`;
    case "permanent_acted":
      return `turn ${event.turnNumber}: permanent ${event.permanentId} used ${event.action}`;
    case "enemy_intent_resolved":
      return `turn ${event.turnNumber}: enemy resolved ${formatEnemyIntent(event.intent)}`;
    case "permanent_destroyed":
      return `turn ${event.turnNumber}: permanent ${event.permanentId} (${event.definitionId}) was destroyed`;
    case "turn_ended":
      return `turn ${event.turnNumber}: end turn`;
    case "battle_finished":
      return `turn ${event.turnNumber}: battle finished, winner ${event.winner}, player hp ${event.playerHealth}, enemy hp ${event.enemyHealth}, permanents ${event.permanents.length > 0 ? event.permanents.map((permanent) => `${permanent.permanentId} ${permanent.health}/${permanent.maxHealth}`).join(", ") : "none"}`;
  }

  throw new Error(`Unhandled event ${(event as BattleEvent).type}`);
}

function printAction(label: string, state: BattleState, action: BattleAction): void {
  printSection(label);
  console.log(`action: ${JSON.stringify(action)}`);
  applyBattleAction(state, action);
  console.log(formatBattleSummary(buildBattleSummary(state)));
}

function requireCardInstanceId(state: BattleState, cardId: string): string {
  const card = state.player.hand.find((entry) => entry.definitionId === cardId);

  if (!card) {
    throw new Error(`Expected card ${cardId} in hand.`);
  }

  return card.instanceId;
}

function requirePermanentId(state: BattleState): string {
  const permanent = state.battlefield.find((entry) => entry !== null);

  if (!permanent) {
    throw new Error("Expected a permanent on the battlefield.");
  }

  return permanent.instanceId;
}

function main(): void {
  const battle = createBattle({
    seed: 1,
    playerDeck: [
      "guardian",
      "defend",
      "attack",
      "attack",
      "defend",
      "attack",
      "defend",
      "attack",
    ],
    enemy: {
      name: "Ravaging Demon",
      health: 30,
      basePower: 10,
      behavior: [
        { attackAmount: 10 },
        { attackAmount: 15 },
        { attackAmount: 12 },
      ],
    },
  });

  printSection("Initial State");
  console.log(formatBattleSummary(buildBattleSummary(battle)));

  printAction("Round 1 Play Guardian", battle, {
    type: "play_card",
    cardInstanceId: requireCardInstanceId(battle, "guardian"),
  });
  printAction("Round 1 Play Defend", battle, {
    type: "play_card",
    cardInstanceId: requireCardInstanceId(battle, "defend"),
  });
  printAction("Round 1 End Turn", battle, { type: "end_turn" });

  printAction("Round 2 Guardian Defends", battle, {
    type: "use_permanent_action",
    permanentId: requirePermanentId(battle),
    action: "defend",
  });
  printAction("Round 2 Play Attack", battle, {
    type: "play_card",
    cardInstanceId: requireCardInstanceId(battle, "attack"),
  });
  printAction("Round 2 Play Defend", battle, {
    type: "play_card",
    cardInstanceId: requireCardInstanceId(battle, "defend"),
  });
  printAction("Round 2 Play Attack Again", battle, {
    type: "play_card",
    cardInstanceId: requireCardInstanceId(battle, "attack"),
  });
  printAction("Round 2 End Turn", battle, { type: "end_turn" });

  printSection("Final Summary");
  console.log(formatBattleSummary(buildBattleSummary(battle)));

  printSection("Battle Log");
  for (const event of battle.log) {
    console.log(formatEvent(event));
  }
}

main();
