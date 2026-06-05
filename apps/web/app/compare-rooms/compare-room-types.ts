export type CompareRoomSummary = {
  bothApprovedAt: string | null;
  canRequestLead: boolean;
  cardCount: number;
  createdAt: string;
  id: string;
  myApprovalStatus: string;
  partnerApprovalStatus: string | null;
  partnerStatus: "connected" | "waiting_partner";
  readiness: {
    hasEnoughCards: boolean;
    hasPartner: boolean;
  };
  status: string;
  title: string;
  updatedAt: string;
};

export type CompareCardSummary = {
  createdAt: string;
  id: string;
  offer: {
    category: string;
    id: string;
    region: string | null;
    title: string;
    vendor: {
      id: string;
      name: string;
      region: string | null;
    };
  };
  offerId: string;
  offerPriceVersionId: string;
  position: number;
  snapshotIncludedItems: unknown[];
  snapshotOptionalOptions: unknown[];
  snapshotPriceSummary: {
    basePrice: number | null;
    currency: "KRW";
    estimatedTotalPrice: number | null;
    validUntil: string | null;
    verificationStatus: string;
    verifiedAt: string | null;
    version: number;
  };
  snapshotRequiredOptions: unknown[];
  snapshotTitle: string;
};

export type CompareApproval = {
  comment: string | null;
  decidedAt: string | null;
  displayLabel: string;
  id: string | null;
  isMine: boolean;
  status: string;
  userId: string;
};

export type CompareComment = {
  body: string;
  compareCardId: string | null;
  createdAt: string;
  displayLabel: string;
  id: string;
  isMine: boolean;
  userId: string;
};

export type CompareRoomDetailResponse = {
  approvals: CompareApproval[];
  cards: CompareCardSummary[];
  comments: CompareComment[];
  compareRoom: CompareRoomSummary;
};

export type CompareRoomListResponse = {
  compareRooms: CompareRoomSummary[];
};

export type CurrentCoupleResponse = {
  couple: {
    displayName: string;
    id: string;
    onboardingStatus: string;
  } | null;
  partnerStatus: "connected" | "waiting_partner" | null;
};

export type DecisionLogResponse = {
  logs: Array<{
    action: string;
    actorDisplayName: string;
    afterStatus: string | null;
    beforeStatus: string | null;
    createdAt: string;
    id: string;
    targetId: string;
    targetType: string;
  }>;
};
