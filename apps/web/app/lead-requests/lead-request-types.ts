export type LeadHistory = {
  changedByRole: string | null;
  createdAt: string;
  fromStatus: string | null;
  id: string;
  reason: string | null;
  toStatus: string;
};

export type LeadRequestDetail = {
  compareCard: {
    id: string;
    offerId: string;
    snapshotTitle: string;
  } | null;
  compareCardId: string | null;
  compareRoom: {
    id: string;
    status: string;
    title: string;
  };
  compareRoomId: string;
  contactNameMasked: string | null;
  contactPhoneMasked: string | null;
  createdAt: string;
  expiresAt: string | null;
  histories: LeadHistory[];
  id: string;
  messagePreview: string | null;
  offer: {
    category: string;
    id: string;
    title: string;
  } | null;
  offerId: string | null;
  offerPriceVersionId: string | null;
  preferredContactDates: unknown;
  preferredContactMethod: string;
  status: string;
  submittedAt: string;
  vendor: {
    category: string;
    id: string;
    name: string;
    region: string | null;
  };
};

export type LeadRequestResponse = {
  leadRequest: LeadRequestDetail;
};
