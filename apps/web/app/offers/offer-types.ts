export type OfferIncludedItem = {
  description?: string;
  key: string;
  label: string;
  quantity?: number;
  unit?: string;
};

export type OfferPriceOption = {
  amount?: number;
  includedInEstimatedTotal?: boolean;
  key: string;
  label: string;
  maxAmount?: number;
  minAmount?: number;
  note?: string;
  pricingType: "fixed" | "quote_required" | "range" | string;
};

export type OfferPriceVersion = {
  additionalCostNote: string | null;
  basePrice: number | null;
  cancellationPolicySummary: string | null;
  estimatedTotalPrice: number | null;
  id: string;
  includedItems: OfferIncludedItem[];
  optionalOptions: OfferPriceOption[];
  requiredOptions: OfferPriceOption[];
  sourceType: string;
  sourceUrl: string | null;
  validFrom: string | null;
  validityStatus: string;
  validUntil: string | null;
  verificationStatus: string;
  verifiedAt: string | null;
  version: number;
};

export type OfferSummary = {
  category: string;
  currentPriceVersion: OfferPriceVersion | null;
  id: string;
  region: string | null;
  status: string;
  summary: string | null;
  title: string;
  vendor: {
    id: string;
    name: string;
    region: string | null;
    verificationStatus: string;
    verifiedAt: string | null;
  };
  vendorBranch: {
    id: string;
    name: string;
    region: string | null;
  } | null;
};

export type OfferDetail = OfferSummary & {
  description: string | null;
  priceVersions: OfferPriceVersion[];
};

export type OfferListResponse = {
  offers: OfferSummary[];
};

export type OfferDetailResponse = {
  offer: OfferDetail;
};
