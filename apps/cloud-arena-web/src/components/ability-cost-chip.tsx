import type { ReactElement } from "react";

import manaTSymbol from "../assets/mtg-symbols/mana/T.svg";
import type { AbilityCostDisplayPart } from "../../../../src/cloud-arena/index.js";

type AbilityCostChipProps = {
  costs: AbilityCostDisplayPart[];
  className?: string;
};

function formatCostLabel(costs: AbilityCostDisplayPart[]): string {
  if (costs.length === 0) {
    return "0";
  }

  return costs
    .map((cost) => {
      if (cost.type === "free") {
        return "0";
      }

      if (cost.type === "tap") {
        return "Tap";
      }

      return `${cost.amount} energy`;
    })
    .join(" + ");
}

export function AbilityCostChip({
  costs,
  className,
}: AbilityCostChipProps): ReactElement {
  const normalizedCosts = costs.length > 0 ? costs : [{ type: "free" as const }];

  return (
    <span
      className={`cloud-arena-ability-cost-chip ${className ?? ""}`.trim()}
      aria-label={`Cost ${formatCostLabel(normalizedCosts)}`}
    >
      {normalizedCosts.map((cost, index) => (
        <span key={`${cost.type}-${index}`} className="cloud-arena-ability-cost-chip-part">
          {index > 0 ? <span className="cloud-arena-ability-cost-chip-separator">+</span> : null}
          {cost.type === "free" ? (
            <span className="cloud-arena-ability-cost-chip-value">0</span>
          ) : cost.type === "tap" ? (
            <span className="cloud-arena-ability-cost-chip-icon" aria-hidden="true">
              <img alt="" draggable="false" src={manaTSymbol} />
            </span>
          ) : (
            <span className="cloud-arena-ability-cost-chip-value">{cost.amount}</span>
          )}
        </span>
      ))}
    </span>
  );
}
