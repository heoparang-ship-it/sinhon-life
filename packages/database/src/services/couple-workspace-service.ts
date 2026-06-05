import type { PrismaClient } from "@prisma/client";
import { createCoupleRepository } from "../repositories/couples.js";
import { createOfferRepository } from "../repositories/offers.js";
import { createPolicyProgramRepository } from "../repositories/policy-programs.js";

export type CoupleWorkspaceServiceClient = Pick<
  PrismaClient,
  "couple" | "decisionLog" | "offer" | "offerPriceVersion" | "policyProgram" | "policyRuleVersion"
>;

export function createCoupleWorkspaceService(client: CoupleWorkspaceServiceClient) {
  const couples = createCoupleRepository(client);
  const offers = createOfferRepository(client);
  const policies = createPolicyProgramRepository(client);

  return {
    async getWorkspaceSummary(coupleId: string) {
      const couple = await couples.findById(coupleId);

      return {
        couple,
        readiness: {
          hasActiveCompareRoom: Boolean(
            couple?.compareRooms.some((room) => room.status !== "archived")
          ),
          hasOpenTask: Boolean(couple?.tasks.some((task) => task.status !== "completed")),
          hasScenario: Boolean(couple?.scenarios.length)
        }
      };
    },

    listActiveOffers: offers.listActiveOffers,
    listActivePolicyPrograms: policies.listActivePrograms,
    recordDecision: couples.recordDecision
  };
}
