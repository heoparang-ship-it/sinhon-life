export type AdminLeadRequest = {
  compareCard: {
    id: string;
    offerId: string;
    snapshotTitle: string;
  } | null;
  contactNameMasked: string | null;
  contactPhoneMasked: string | null;
  histories: Array<{
    createdAt: string;
    fromStatus: string | null;
    id: string;
    reason: string | null;
    toStatus: string;
  }>;
  id: string;
  messagePreview: string | null;
  preferredContactMethod: string;
  status: string;
  submittedAt: string;
  vendor: {
    id: string;
    name: string;
    region: string | null;
  };
};

export type AdminLeadRequestListResponse = {
  leadRequests: AdminLeadRequest[];
};

export type AdminLeadRequestResponse = {
  leadRequest: AdminLeadRequest;
};
