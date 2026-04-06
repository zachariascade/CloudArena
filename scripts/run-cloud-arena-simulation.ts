import {
  chooseHeuristicDecision,
  formatEnemyIntent,
  formatBattleSummary,
  getScenarioPreset,
  runSimulation,
  type BattleEvent,
  type CloudArenaScenarioId,
  type SimulationActionRecord,
} from "../src/cloud-arena/index.js";

type SimulationConfig = {
  scenarioId: CloudArenaScenarioId;
  seed: number;
  maxSteps?: number;
  agentName: string;
  printTraceJson: boolean;
};

const SIMULATION_CONFIG: SimulationConfig = {
  scenarioId: "mixed_guardian",
  seed: 7,
  maxSteps: undefined,
  agentName: "heuristic_baseline",
  printTraceJson: false,
};

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

function main(): void {
  const scenario = getScenarioPreset(SIMULATION_CONFIG.scenarioId);
  const result = runSimulation({
    seed: SIMULATION_CONFIG.seed,
    maxSteps: SIMULATION_CONFIG.maxSteps ?? scenario.recommendedMaxSteps,
    agentName: SIMULATION_CONFIG.agentName,
    playerHealth: scenario.playerHealth,
    playerDeck: scenario.deck,
    enemy: scenario.enemy,
    agent: chooseHeuristicDecision,
  });

  console.log("=== Config ===");
  console.log(
    JSON.stringify(
      {
        ...SIMULATION_CONFIG,
        maxSteps: SIMULATION_CONFIG.maxSteps ?? scenario.recommendedMaxSteps,
        scenario,
      },
      null,
      2,
    ),
  );

  console.log("\n=== Result ===");
  console.log(
    JSON.stringify(
      {
        phase: result.finalState.phase,
        turnNumber: result.finalState.turnNumber,
        playerHealth: result.finalState.player.health,
        enemyHealth: result.finalState.enemy.health,
        actionsTaken: result.actionHistory.length,
      },
      null,
      2,
    ),
  );

  console.log("\n=== Summary ===");
  console.log(formatBattleSummary(result.summary));

  console.log("\n=== Action History ===");
  for (const record of result.actionHistory as SimulationActionRecord[]) {
    if (record.action.type === "play_card") {
      console.log(
        `turn ${record.turnNumber} (${record.phase}): play ${record.action.cardInstanceId}${record.reason ? ` // ${record.reason}` : ""}`,
      );
      continue;
    }

    if (record.action.type === "use_permanent_action") {
      console.log(
        `turn ${record.turnNumber} (${record.phase}): ${record.action.permanentId} ${record.action.action}${record.reason ? ` // ${record.reason}` : ""}`,
      );
      continue;
    }

    console.log(
      `turn ${record.turnNumber} (${record.phase}): end turn${record.reason ? ` // ${record.reason}` : ""}`,
    );
  }

  console.log("\n=== Battle Log ===");
  for (const event of result.log) {
    console.log(formatEvent(event));
  }

  if (SIMULATION_CONFIG.printTraceJson) {
    console.log("\n=== Trace JSON ===");
    console.log(JSON.stringify(result.trace, null, 2));
  }
}

main();
