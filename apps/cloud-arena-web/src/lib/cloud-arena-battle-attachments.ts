import type { CloudArenaBattleViewModel } from "./cloud-arena-battle-view-model.js";

export type CloudArenaBattlefieldStackAttachment = {
  permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>;
  inspectableKey: string;
};

export type CloudArenaBattlefieldAttachmentState = {
  hiddenPermanentIds: string[];
  stackedAttachmentsByTargetId: Record<string, CloudArenaBattlefieldStackAttachment[]>;
};

export function buildBattlefieldAttachmentState(
  battle: CloudArenaBattleViewModel,
): CloudArenaBattlefieldAttachmentState {
  const hiddenPermanentIds: string[] = [];
  const stackedAttachmentsByTargetId: Record<string, CloudArenaBattlefieldStackAttachment[]> = {};

  for (const permanent of battle.battlefield) {
    if (!permanent?.blockingTargetPermanentId) {
      continue;
    }

    hiddenPermanentIds.push(permanent.instanceId);
    const targetId = permanent.blockingTargetPermanentId;
    const stackedAttachments = stackedAttachmentsByTargetId[targetId] ?? [];

    stackedAttachments.push({
      permanent,
      inspectableKey: `battlefield:${permanent.instanceId}`,
    });

    stackedAttachmentsByTargetId[targetId] = stackedAttachments;
  }

  return {
    hiddenPermanentIds,
    stackedAttachmentsByTargetId,
  };
}
