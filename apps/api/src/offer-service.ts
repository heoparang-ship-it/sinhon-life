import {
  type CreateOfferInput,
  type CreateOfferPriceVersionInput,
  type CreateVendorInput,
  type ListOffersQuery,
  type ListVendorsQuery,
  type OfferIncludedItem,
  type OfferPriceOption,
  type UpdateOfferInput,
  type UpdateOfferPriceVersionInput,
  type UpdateVendorInput
} from "@sinhon-os/schemas";
import type { SinhonPrismaClient } from "@sinhon-os/database";
import { ApiError } from "./api-errors.js";
import { recordAnalyticsEventSafely } from "./analytics-service.js";
import { calculateEstimatedTotalPrice, getOfferPriceValidity } from "./offer-price-engine.js";

type OfferStore = Pick<
  SinhonPrismaClient,
  "decisionLog" | "offer" | "offerPriceVersion" | "vendor"
>;

type OfferServiceOptions = {
  now?: () => Date;
  prisma: SinhonPrismaClient;
};

type VendorRecord = NonNullable<Awaited<ReturnType<SinhonPrismaClient["vendor"]["findFirst"]>>>;
type OfferRecord = NonNullable<Awaited<ReturnType<SinhonPrismaClient["offer"]["findFirst"]>>>;
type OfferPriceVersionRecord = NonNullable<
  Awaited<ReturnType<SinhonPrismaClient["offerPriceVersion"]["findFirst"]>>
>;

type JsonInputValue =
  | boolean
  | number
  | string
  | JsonInputValue[]
  | { [key: string]: JsonInputValue | null };

type OfferWithRelations = OfferRecord & {
  priceVersions?: OfferPriceVersionRecord[];
  vendor: VendorRecord;
  vendorBranch?: {
    id: string;
    name: string;
    region: string | null;
  } | null;
};

const defaultLimit = 10;

function toInputJson(value: unknown): JsonInputValue {
  return JSON.parse(JSON.stringify(value)) as JsonInputValue;
}

function toDateTime(value: string | undefined) {
  return value ? new Date(value) : undefined;
}

function toDateTimeOrNull(value: string | undefined) {
  return value ? new Date(value) : null;
}

function toNumber(value: bigint | number | null | undefined) {
  return value === null || value === undefined ? null : Number(value);
}

function toBigInt(value: number) {
  return BigInt(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeIncludedItems(value: unknown): OfferIncludedItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): OfferIncludedItem | null => {
      if (typeof item === "string") {
        return {
          key: item,
          label: item
        };
      }

      if (!isObject(item) || typeof item.key !== "string" || typeof item.label !== "string") {
        return null;
      }

      return {
        description: typeof item.description === "string" ? item.description : undefined,
        key: item.key,
        label: item.label,
        quantity: typeof item.quantity === "number" ? item.quantity : undefined,
        unit: typeof item.unit === "string" ? item.unit : undefined
      };
    })
    .filter((item): item is OfferIncludedItem => Boolean(item));
}

function normalizeOptions(value: unknown): OfferPriceOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): OfferPriceOption | null => {
      if (typeof item === "string") {
        return {
          key: item,
          label: item,
          pricingType: "quote_required" as const
        };
      }

      if (!isObject(item) || typeof item.key !== "string" || typeof item.label !== "string") {
        return null;
      }

      return {
        amount: typeof item.amount === "number" ? item.amount : undefined,
        appliesWhen: typeof item.appliesWhen === "string" ? item.appliesWhen : undefined,
        includedInEstimatedTotal:
          typeof item.includedInEstimatedTotal === "boolean"
            ? item.includedInEstimatedTotal
            : undefined,
        key: item.key,
        label: item.label,
        maxAmount: typeof item.maxAmount === "number" ? item.maxAmount : undefined,
        minAmount: typeof item.minAmount === "number" ? item.minAmount : undefined,
        note: typeof item.note === "string" ? item.note : undefined,
        pricingType:
          item.pricingType === "fixed" ||
          item.pricingType === "range" ||
          item.pricingType === "quote_required"
            ? item.pricingType
            : ("quote_required" as const)
      };
    })
    .filter((item): item is OfferPriceOption => Boolean(item));
}

function priceMatchesBudgetRange(
  price: number | null,
  budgetRange: ListOffersQuery["budgetRange"]
) {
  if (!budgetRange || price === null) {
    return true;
  }

  const ranges: Record<NonNullable<ListOffersQuery["budgetRange"]>, (value: number) => boolean> = {
    "1m_3m": (value) => value >= 1_000_000 && value < 3_000_000,
    "3m_5m": (value) => value >= 3_000_000 && value < 5_000_000,
    "5m_10m": (value) => value >= 5_000_000 && value < 10_000_000,
    over_10m: (value) => value >= 10_000_000,
    under_1m: (value) => value < 1_000_000
  };

  return ranges[budgetRange](price);
}

function toVendorSummary(vendor: VendorRecord) {
  return {
    category: vendor.category,
    description: vendor.description,
    id: vendor.id,
    name: vendor.name,
    region: vendor.region,
    status: vendor.status,
    verificationStatus: vendor.verificationStatus,
    verifiedAt: vendor.verifiedAt
  };
}

function toPriceVersionResponse(priceVersion: OfferPriceVersionRecord | null, now: Date) {
  if (!priceVersion) {
    return null;
  }

  return {
    additionalCostNote: priceVersion.additionalCostNote,
    basePrice: toNumber(priceVersion.basePrice),
    cancellationPolicySummary: priceVersion.cancellationPolicySummary,
    estimatedTotalPrice: toNumber(priceVersion.estimatedTotalPrice),
    id: priceVersion.id,
    includedItems: normalizeIncludedItems(priceVersion.includedItems),
    optionalOptions: normalizeOptions(priceVersion.optionalOptions),
    requiredOptions: normalizeOptions(priceVersion.requiredOptions),
    sourceType: priceVersion.sourceType,
    sourceUrl: priceVersion.sourceUrl,
    validFrom: priceVersion.validFrom,
    validityStatus: getOfferPriceValidity({
      now,
      validUntil: priceVersion.validUntil
    }),
    validUntil: priceVersion.validUntil,
    verificationStatus: priceVersion.verificationStatus,
    verifiedAt: priceVersion.verifiedAt,
    version: priceVersion.version
  };
}

function selectCurrentPriceVersion(
  offer: OfferWithRelations,
  options: {
    includeUnverified?: boolean;
    now: Date;
    validOnly?: boolean;
  }
) {
  return (
    offer.priceVersions?.find((priceVersion) => {
      const visibilityMatches = options.includeUnverified
        ? priceVersion.verificationStatus !== "rejected"
        : priceVersion.verificationStatus === "verified";
      const validMatches =
        options.validOnly === false ||
        getOfferPriceValidity({
          now: options.now,
          validUntil: priceVersion.validUntil
        }) !== "expired";

      return visibilityMatches && validMatches;
    }) ?? null
  );
}

function toOfferSummary(
  offer: OfferWithRelations,
  options: {
    includeUnverified?: boolean;
    now: Date;
    validOnly?: boolean;
  }
) {
  const currentPriceVersion = selectCurrentPriceVersion(offer, options);
  const priceVersionResponse = toPriceVersionResponse(currentPriceVersion, options.now);

  return {
    category: offer.category,
    currentPriceVersion: priceVersionResponse,
    id: offer.id,
    region: offer.region,
    status: offer.status,
    summary: offer.summary,
    title: offer.title,
    vendor: {
      id: offer.vendor.id,
      name: offer.vendor.name,
      region: offer.vendor.region,
      verificationStatus: offer.vendor.verificationStatus,
      verifiedAt: offer.vendor.verifiedAt
    },
    vendorBranch: offer.vendorBranch
      ? {
          id: offer.vendorBranch.id,
          name: offer.vendorBranch.name,
          region: offer.vendorBranch.region
        }
      : null
  };
}

function toOfferDetail(offer: OfferWithRelations, now: Date) {
  return {
    ...toOfferSummary(offer, {
      includeUnverified: false,
      now,
      validOnly: true
    }),
    description: offer.description,
    priceVersions: (offer.priceVersions ?? []).map((priceVersion) =>
      toPriceVersionResponse(priceVersion, now)
    )
  };
}

function priceVersionInclude() {
  return {
    priceVersions: {
      orderBy: {
        version: "desc" as const
      }
    },
    vendor: true,
    vendorBranch: {
      select: {
        id: true,
        name: true,
        region: true
      }
    }
  };
}

function buildVendorCreateData(input: CreateVendorInput) {
  return {
    category: input.category,
    description: input.description,
    name: input.name,
    region: input.region,
    status: input.status,
    verificationStatus: input.verificationStatus,
    verifiedAt: toDateTime(input.verifiedAt)
  };
}

function buildVendorUpdateData(input: UpdateVendorInput) {
  return {
    category: input.category,
    description: input.description,
    name: input.name,
    region: input.region,
    status: input.status,
    verificationStatus: input.verificationStatus,
    verifiedAt: toDateTime(input.verifiedAt)
  };
}

function buildOfferCreateData(input: CreateOfferInput, vendorId: string) {
  return {
    category: input.category,
    description: input.description,
    displayOrder: input.displayOrder,
    region: input.region,
    status: input.status,
    summary: input.summary,
    title: input.title,
    vendorBranchId: input.vendorBranchId,
    vendorId
  };
}

function buildOfferUpdateData(input: UpdateOfferInput) {
  return {
    category: input.category,
    description: input.description,
    displayOrder: input.displayOrder,
    region: input.region,
    status: input.status,
    summary: input.summary,
    title: input.title,
    vendorBranchId: input.vendorBranchId
  };
}

function buildPriceVersionCreateData(
  input: CreateOfferPriceVersionInput,
  options: {
    createdByUserId: string;
    offerId: string;
    version: number;
  }
) {
  const requiredOptions = input.requiredOptions.map((option) => ({
    ...option,
    includedInEstimatedTotal: option.includedInEstimatedTotal !== false
  }));
  const estimatedTotalPrice = calculateEstimatedTotalPrice({
    basePrice: input.basePrice,
    requiredOptions
  });

  return {
    additionalCostNote: input.additionalCostNote,
    basePrice: toBigInt(input.basePrice),
    cancellationPolicySummary: input.cancellationPolicySummary,
    createdByUserId: options.createdByUserId,
    estimatedTotalPrice: toBigInt(estimatedTotalPrice),
    includedItems: toInputJson(input.includedItems),
    offerId: options.offerId,
    optionalOptions: toInputJson(
      input.optionalOptions.map((option) => ({
        ...option,
        includedInEstimatedTotal: option.includedInEstimatedTotal === true
      }))
    ),
    requiredOptions: toInputJson(requiredOptions),
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    validFrom: toDateTimeOrNull(input.validFrom),
    validUntil: toDateTimeOrNull(input.validUntil),
    verificationStatus: input.verificationStatus,
    verifiedAt: toDateTimeOrNull(input.verifiedAt),
    version: options.version
  };
}

async function getOfferWithRelations(store: OfferStore, offerId: string) {
  const offer = await store.offer.findFirst({
    include: priceVersionInclude(),
    where: {
      deletedAt: null,
      id: offerId
    }
  });

  if (!offer) {
    throw new ApiError("NOT_FOUND", "상품을 찾을 수 없습니다.");
  }

  return offer;
}

export function createOfferService({ now = () => new Date(), prisma }: OfferServiceOptions) {
  return {
    async createOffer(userId: string, vendorId: string, input: CreateOfferInput) {
      return prisma.$transaction(async (tx) => {
        const vendor = await tx.vendor.findFirst({
          where: {
            deletedAt: null,
            id: vendorId
          }
        });

        if (!vendor) {
          throw new ApiError("NOT_FOUND", "파트너를 찾을 수 없습니다.");
        }

        const offer = await tx.offer.create({
          data: buildOfferCreateData(input, vendorId),
          include: priceVersionInclude()
        });

        await tx.decisionLog.create({
          data: {
            action: "create_offer",
            actorUserId: userId,
            afterStatus: offer.status,
            targetId: offer.id,
            targetType: "offer"
          }
        });

        return {
          offer: toOfferDetail(offer, now())
        };
      });
    },

    async createOfferPriceVersion(
      userId: string,
      offerId: string,
      input: CreateOfferPriceVersionInput
    ) {
      return prisma.$transaction(async (tx) => {
        const offer = await tx.offer.findFirst({
          where: {
            deletedAt: null,
            id: offerId
          }
        });

        if (!offer) {
          throw new ApiError("NOT_FOUND", "상품을 찾을 수 없습니다.");
        }

        const latest = await tx.offerPriceVersion.findFirst({
          orderBy: {
            version: "desc"
          },
          where: {
            offerId
          }
        });
        const version = input.version ?? (latest?.version ?? 0) + 1;
        const priceVersion = await tx.offerPriceVersion.create({
          data: buildPriceVersionCreateData(input, {
            createdByUserId: userId,
            offerId,
            version
          })
        });

        await tx.decisionLog.create({
          data: {
            action: "create_offer_price_version",
            actorUserId: userId,
            afterStatus: priceVersion.verificationStatus,
            targetId: priceVersion.id,
            targetType: "offer_price_version"
          }
        });

        return {
          priceVersion: toPriceVersionResponse(priceVersion, now())
        };
      });
    },

    async createVendor(userId: string, input: CreateVendorInput) {
      const vendor = await prisma.vendor.create({
        data: buildVendorCreateData(input)
      });

      await prisma.decisionLog.create({
        data: {
          action: "create_vendor",
          actorUserId: userId,
          afterStatus: vendor.status,
          targetId: vendor.id,
          targetType: "vendor"
        }
      });

      return {
        vendor: toVendorSummary(vendor)
      };
    },

    async getCurrentPriceVersion(_userId: string, offerId: string) {
      const offer = await getOfferWithRelations(prisma, offerId);
      const priceVersion = selectCurrentPriceVersion(offer, {
        now: now(),
        validOnly: true
      });

      return {
        priceVersion: toPriceVersionResponse(priceVersion, now())
      };
    },

    async getOffer(userId: string, offerId: string) {
      const offer = await getOfferWithRelations(prisma, offerId);

      await recordAnalyticsEventSafely(prisma, {
        eventName: "offer_viewed",
        payload: {
          category: offer.category,
          offerId,
          vendorId: offer.vendorId
        },
        userId
      });

      return {
        offer: toOfferDetail(offer, now())
      };
    },

    async getVendor(_userId: string, vendorId: string) {
      const vendor = await prisma.vendor.findFirst({
        where: {
          deletedAt: null,
          id: vendorId
        }
      });

      if (!vendor) {
        throw new ApiError("NOT_FOUND", "파트너를 찾을 수 없습니다.");
      }

      return {
        vendor: toVendorSummary(vendor)
      };
    },

    async listOffers(_userId: string, query: ListOffersQuery) {
      const currentTime = now();
      const offers = await prisma.offer.findMany({
        include: priceVersionInclude(),
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        take: Math.min((query.limit ?? defaultLimit) * 3, 100),
        where: {
          category: query.category,
          deletedAt: null,
          region: query.region,
          status: "active",
          vendor: {
            deletedAt: null,
            status: "active"
          },
          vendorId: query.vendorId
        }
      });
      const offerSummaries = offers
        .map((offer) =>
          toOfferSummary(offer, {
            includeUnverified: query.includeUnverified,
            now: currentTime,
            validOnly: query.validOnly
          })
        )
        .filter((offer) => {
          const price = offer.currentPriceVersion?.estimatedTotalPrice ?? null;

          if (!query.includeUnverified && !offer.currentPriceVersion) {
            return false;
          }

          return priceMatchesBudgetRange(price, query.budgetRange);
        })
        .slice(0, query.limit ?? defaultLimit);

      return {
        offers: offerSummaries
      };
    },

    async listAdminOffers(_userId: string, query: ListOffersQuery) {
      const currentTime = now();
      const offers = await prisma.offer.findMany({
        include: priceVersionInclude(),
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        take: Math.min((query.limit ?? defaultLimit) * 3, 100),
        where: {
          category: query.category,
          deletedAt: null,
          region: query.region,
          vendor: {
            deletedAt: null
          },
          vendorId: query.vendorId
        }
      });
      const offerSummaries = offers
        .map((offer) =>
          toOfferSummary(offer, {
            includeUnverified: true,
            now: currentTime,
            validOnly: false
          })
        )
        .filter((offer) => {
          const price = offer.currentPriceVersion?.estimatedTotalPrice ?? null;

          return priceMatchesBudgetRange(price, query.budgetRange);
        })
        .slice(0, query.limit ?? defaultLimit);

      return {
        offers: offerSummaries
      };
    },

    async listVendors(_userId: string, query: ListVendorsQuery) {
      const vendors = await prisma.vendor.findMany({
        orderBy: {
          createdAt: "desc"
        },
        take: query.limit ?? defaultLimit,
        where: {
          category: query.category,
          deletedAt: null,
          region: query.region,
          status: query.includeInactive ? undefined : "active",
          verificationStatus: query.verificationStatus
        }
      });

      return {
        vendors: vendors.map(toVendorSummary)
      };
    },

    async updateOffer(userId: string, offerId: string, input: UpdateOfferInput) {
      return prisma.$transaction(async (tx) => {
        const current = await tx.offer.findFirst({
          where: {
            deletedAt: null,
            id: offerId
          }
        });

        if (!current) {
          throw new ApiError("NOT_FOUND", "상품을 찾을 수 없습니다.");
        }

        const offer = await tx.offer.update({
          data: buildOfferUpdateData(input),
          include: priceVersionInclude(),
          where: {
            id: offerId
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "update_offer",
            actorUserId: userId,
            afterStatus: offer.status,
            beforeStatus: current.status,
            targetId: offer.id,
            targetType: "offer"
          }
        });

        return {
          offer: toOfferDetail(offer, now())
        };
      });
    },

    async updateOfferPriceVersion(
      userId: string,
      offerPriceVersionId: string,
      input: UpdateOfferPriceVersionInput
    ) {
      return prisma.$transaction(async (tx) => {
        const current = await tx.offerPriceVersion.findFirst({
          where: {
            id: offerPriceVersionId
          }
        });

        if (!current) {
          throw new ApiError("NOT_FOUND", "가격 버전을 찾을 수 없습니다.");
        }

        const priceVersion = await tx.offerPriceVersion.update({
          data: {
            verificationStatus: input.verificationStatus,
            verifiedAt:
              input.verifiedAt !== undefined
                ? toDateTimeOrNull(input.verifiedAt)
                : input.verificationStatus === "verified"
                  ? now()
                  : undefined
          },
          where: {
            id: offerPriceVersionId
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "update_offer_price_version",
            actorUserId: userId,
            afterStatus: priceVersion.verificationStatus,
            beforeStatus: current.verificationStatus,
            targetId: priceVersion.id,
            targetType: "offer_price_version"
          }
        });

        return {
          priceVersion: toPriceVersionResponse(priceVersion, now())
        };
      });
    },

    async updateVendor(userId: string, vendorId: string, input: UpdateVendorInput) {
      return prisma.$transaction(async (tx) => {
        const current = await tx.vendor.findFirst({
          where: {
            deletedAt: null,
            id: vendorId
          }
        });

        if (!current) {
          throw new ApiError("NOT_FOUND", "파트너를 찾을 수 없습니다.");
        }

        const vendor = await tx.vendor.update({
          data: buildVendorUpdateData(input),
          where: {
            id: vendorId
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "update_vendor",
            actorUserId: userId,
            afterStatus: vendor.status,
            beforeStatus: current.status,
            targetId: vendor.id,
            targetType: "vendor"
          }
        });

        return {
          vendor: toVendorSummary(vendor)
        };
      });
    }
  };
}

export type OfferService = ReturnType<typeof createOfferService>;
