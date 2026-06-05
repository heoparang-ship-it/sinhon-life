import type { PrismaClient } from "@prisma/client";

export type PolicyProgramRepositoryClient = Pick<
  PrismaClient,
  "policyProgram" | "policyRuleVersion"
>;

export function createPolicyProgramRepository(client: PolicyProgramRepositoryClient) {
  return {
    findActiveRuleVersion(policyProgramId: string) {
      return client.policyRuleVersion.findFirst({
        orderBy: {
          version: "desc"
        },
        where: {
          policyProgramId,
          status: "active"
        }
      });
    },

    listActivePrograms(region?: string) {
      return client.policyProgram.findMany({
        include: {
          ruleVersions: {
            orderBy: {
              version: "desc"
            },
            take: 1,
            where: {
              status: "active"
            }
          }
        },
        orderBy: {
          verifiedAt: "desc"
        },
        where: {
          ...(region ? { region } : {}),
          status: "active"
        }
      });
    }
  };
}
