import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { createPrismaClient } from "../client";

const client = createPrismaClient();

afterAll(async () => {
  await client.$disconnect();
});

describe("database schema", () => {
  it("persists couple-centered policy, offer, decision, and event records", async () => {
    const ids = {
      compareCard: randomUUID(),
      compareRoom: randomUUID(),
      couple: randomUUID(),
      coupleMember: randomUUID(),
      decisionLog: randomUUID(),
      eligibilityResult: randomUUID(),
      eventLog: randomUUID(),
      offer: randomUUID(),
      offerPriceVersion: randomUUID(),
      policyProgram: randomUUID(),
      policyRuleVersion: randomUUID(),
      user: randomUUID(),
      vendor: randomUUID()
    };
    const now = new Date();

    try {
      await client.user.create({
        data: {
          id: ids.user,
          authProvider: "db-test",
          authProviderUserId: ids.user,
          displayName: "DB Test User",
          emailHash: `hash:${ids.user}`,
          status: "active"
        }
      });

      await client.couple.create({
        data: {
          id: ids.couple,
          createdByUserId: ids.user,
          displayName: "DB Test Couple",
          lifecycleStatus: "preparing",
          onboardingStatus: "completed",
          preferredResidenceRegion: "seoul",
          totalBudgetRange: "100m-150m"
        }
      });

      await client.coupleMember.create({
        data: {
          id: ids.coupleMember,
          coupleId: ids.couple,
          role: "owner",
          status: "active",
          userId: ids.user
        }
      });

      await client.policyProgram.create({
        data: {
          id: ids.policyProgram,
          category: "housing",
          createdByUserId: ids.user,
          name: "DB Test Policy",
          providerName: "DB Test Provider",
          region: "seoul",
          sourceUpdatedAt: now,
          sourceUrl: "https://example.com/db-test-policy",
          status: "active",
          summary: "DB test policy.",
          verifiedAt: now
        }
      });

      await client.policyRuleVersion.create({
        data: {
          id: ids.policyRuleVersion,
          createdByUserId: ids.user,
          eligibilityCriteria: { region: "seoul" },
          policyProgramId: ids.policyProgram,
          ruleSummary: "DB test rule.",
          sourceUpdatedAt: now,
          sourceUrl: "https://example.com/db-test-policy/rules",
          status: "active",
          verifiedAt: now,
          version: 1
        }
      });

      await client.eligibilityResult.create({
        data: {
          id: ids.eligibilityResult,
          checkedAt: now,
          coupleId: ids.couple,
          inputSnapshot: { region: "seoul" },
          policyProgramId: ids.policyProgram,
          policyRuleVersionId: ids.policyRuleVersion,
          resultReason: "DB test eligible.",
          resultStatus: "eligible"
        }
      });

      await client.vendor.create({
        data: {
          id: ids.vendor,
          category: "wedding",
          name: "DB Test Vendor",
          status: "active",
          verificationStatus: "verified",
          verifiedAt: now
        }
      });

      await client.offer.create({
        data: {
          id: ids.offer,
          category: "wedding_studio",
          status: "active",
          summary: "DB test offer.",
          title: "DB Test Offer",
          vendorId: ids.vendor
        }
      });

      await client.offerPriceVersion.create({
        data: {
          id: ids.offerPriceVersion,
          basePrice: 1_000_000n,
          estimatedTotalPrice: 1_200_000n,
          includedItems: ["studio"],
          offerId: ids.offer,
          validFrom: now,
          validUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          verificationStatus: "verified",
          verifiedAt: now,
          version: 1
        }
      });

      await client.compareRoom.create({
        data: {
          id: ids.compareRoom,
          coupleId: ids.couple,
          createdByUserId: ids.user,
          status: "shared",
          title: "DB Test Compare Room"
        }
      });

      await client.compareCard.create({
        data: {
          id: ids.compareCard,
          compareRoomId: ids.compareRoom,
          offerId: ids.offer,
          offerPriceVersionId: ids.offerPriceVersion,
          position: 1,
          snapshotPriceSummary: { estimatedTotalPrice: 1_200_000 },
          snapshotTitle: "DB Test Offer"
        }
      });

      await client.decisionLog.create({
        data: {
          id: ids.decisionLog,
          action: "approve",
          actorCoupleMemberId: ids.coupleMember,
          actorUserId: ids.user,
          afterStatus: "approved",
          beforeStatus: "shared",
          coupleId: ids.couple,
          targetId: ids.compareRoom,
          targetType: "compare_room"
        }
      });

      await client.eventLog.create({
        data: {
          id: ids.eventLog,
          coupleId: ids.couple,
          eventName: "db_test.completed",
          occurredAt: now,
          payload: { containsDirectPersonalData: false },
          source: "vitest",
          userId: ids.user
        }
      });

      const persistedCouple = await client.couple.findUnique({
        include: {
          compareRooms: true,
          eligibilityResults: true,
          eventLogs: true
        },
        where: {
          id: ids.couple
        }
      });
      const persistedPrice = await client.offerPriceVersion.findUnique({
        where: {
          id: ids.offerPriceVersion
        }
      });
      const persistedRule = await client.policyRuleVersion.findUnique({
        where: {
          id: ids.policyRuleVersion
        }
      });

      expect(persistedCouple?.compareRooms).toHaveLength(1);
      expect(persistedCouple?.eligibilityResults).toHaveLength(1);
      expect(persistedCouple?.eventLogs).toHaveLength(1);
      expect(persistedPrice?.validUntil).toBeInstanceOf(Date);
      expect(persistedRule?.sourceUpdatedAt).toBeInstanceOf(Date);
      expect(persistedRule?.verifiedAt).toBeInstanceOf(Date);
    } finally {
      await client.eventLog.deleteMany({ where: { id: ids.eventLog } });
      await client.decisionLog.deleteMany({ where: { id: ids.decisionLog } });
      await client.compareCard.deleteMany({ where: { id: ids.compareCard } });
      await client.compareRoom.deleteMany({ where: { id: ids.compareRoom } });
      await client.eligibilityResult.deleteMany({ where: { id: ids.eligibilityResult } });
      await client.offerPriceVersion.deleteMany({ where: { id: ids.offerPriceVersion } });
      await client.offer.deleteMany({ where: { id: ids.offer } });
      await client.vendor.deleteMany({ where: { id: ids.vendor } });
      await client.policyRuleVersion.deleteMany({ where: { id: ids.policyRuleVersion } });
      await client.policyProgram.deleteMany({ where: { id: ids.policyProgram } });
      await client.coupleMember.deleteMany({ where: { id: ids.coupleMember } });
      await client.couple.deleteMany({ where: { id: ids.couple } });
      await client.user.deleteMany({ where: { id: ids.user } });
    }
  });
});
