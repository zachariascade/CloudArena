import { describe, expect, it } from "vitest";

import { buildBattlefieldAttachmentState } from "../../apps/cloud-arena-web/src/lib/cloud-arena-battle-attachments.js";
import type { CloudArenaBattleViewModel } from "../../apps/cloud-arena-web/src/lib/cloud-arena-battle-view-model.js";

describe("cloud arena battlefield attachments", () => {
  it("hides blocking permanents from the player side and stacks them under the target enemy", () => {
    const battle = {
      battlefield: [
        {
          instanceId: "guardian_1",
          blockingTargetPermanentId: "enemy_leader_1",
        },
        {
          instanceId: "angel_2",
          blockingTargetPermanentId: null,
        },
      ],
    } as unknown as CloudArenaBattleViewModel;

    const attachmentState = buildBattlefieldAttachmentState(battle);

    expect(attachmentState.hiddenPermanentIds).toEqual(["guardian_1"]);
    expect(attachmentState.stackedAttachmentsByTargetId.enemy_leader_1).toHaveLength(1);
    expect(attachmentState.stackedAttachmentsByTargetId.enemy_leader_1?.[0]?.permanent.instanceId).toBe("guardian_1");
    expect(attachmentState.stackedAttachmentsByTargetId.enemy_leader_1?.[0]?.inspectableKey).toBe(
      "battlefield:guardian_1",
    );
    expect(attachmentState.stackedAttachmentsByTargetId.enemy_leader_1?.[0]?.permanent.blockingTargetPermanentId).toBe(
      "enemy_leader_1",
    );
  });
});
