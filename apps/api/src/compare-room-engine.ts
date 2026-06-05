import type { ApprovalStatus, CompareRoomStatus } from "@sinhon-os/schemas";

export function getCompareRoomReadiness(input: {
  activeCardCount: number;
  activeMemberCount: number;
}) {
  return {
    hasEnoughCards: input.activeCardCount >= 2 && input.activeCardCount <= 4,
    hasPartner: input.activeMemberCount >= 2
  };
}

export function deriveCompareRoomStatus(input: {
  activeCardCount: number;
  activeMemberCount: number;
  approvalStatuses: ApprovalStatus[];
  currentStatus?: string;
}): CompareRoomStatus {
  if (input.currentStatus === "archived") {
    return "archived";
  }

  if (input.approvalStatuses.includes("rejected")) {
    return "rejected";
  }

  if (input.activeCardCount === 0) {
    return "draft";
  }

  if (input.activeMemberCount < 2) {
    return "waiting_partner";
  }

  const readiness = getCompareRoomReadiness(input);
  const allMembersApproved =
    input.approvalStatuses.length >= input.activeMemberCount &&
    input.approvalStatuses
      .slice(0, input.activeMemberCount)
      .every((status) => status === "approved");

  if (readiness.hasEnoughCards && readiness.hasPartner && allMembersApproved) {
    return "both_approved";
  }

  return "shared";
}
