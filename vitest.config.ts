import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      ".claude/**",
      "dist/**",
      "node_modules/**",
      // Heuristic agent is deprecated — these tests no longer need to be maintained
      "tests/cloud-arena/run-simulation.test.ts",
      "tests/cloud-arena/run-batch-simulations.test.ts",
      // scenario-presets uses heuristic agent for a smoke-test simulation; excluded until that test is rewritten
      "tests/cloud-arena/scenario-presets.test.ts",
    ],
  },
});
