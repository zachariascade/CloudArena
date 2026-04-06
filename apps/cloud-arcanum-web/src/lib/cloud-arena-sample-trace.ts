import {
  chooseHeuristicDecision,
  getScenarioPreset,
  runSimulation,
  type SimulationTrace,
} from "../../../../src/cloud-arena/index.js";

const mixedGuardianScenario = getScenarioPreset("mixed_guardian");

export const mixedGuardianSampleTrace: SimulationTrace = runSimulation({
  seed: 7,
  playerHealth: mixedGuardianScenario.playerHealth,
  playerDeck: mixedGuardianScenario.deck,
  enemy: mixedGuardianScenario.enemy,
  maxSteps: mixedGuardianScenario.recommendedMaxSteps,
  agentName: "heuristic_baseline",
  agent: chooseHeuristicDecision,
}).trace;

export const cloudArenaSampleTrace = mixedGuardianSampleTrace;
