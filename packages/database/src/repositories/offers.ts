import type { PrismaClient } from "@prisma/client";

export type OfferRepositoryClient = Pick<PrismaClient, "offer" | "offerPriceVersion">;

export type OfferSearchInput = {
  category?: string;
  region?: string;
};

export function createOfferRepository(client: OfferRepositoryClient) {
  return {
    findLatestVerifiedPriceVersion(offerId: string, now = new Date()) {
      return client.offerPriceVersion.findFirst({
        orderBy: {
          version: "desc"
        },
        where: {
          offerId,
          verificationStatus: "verified",
          OR: [{ validUntil: null }, { validUntil: { gte: now } }]
        }
      });
    },

    listActiveOffers(input: OfferSearchInput = {}) {
      return client.offer.findMany({
        include: {
          priceVersions: {
            orderBy: {
              version: "desc"
            },
            take: 1,
            where: {
              verificationStatus: "verified"
            }
          },
          vendor: true,
          vendorBranch: true
        },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        where: {
          ...(input.category ? { category: input.category } : {}),
          deletedAt: null,
          ...(input.region ? { region: input.region } : {}),
          status: "active"
        }
      });
    }
  };
}
