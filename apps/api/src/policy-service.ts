import {
  type CreateEligibilityDocumentTasksInput,
  type CreatePolicyProgramInput,
  type CreatePolicyRuleVersionInput,
  type ListEligibilityResultsQuery,
  type ListPolicyProgramsQuery,
  type RunPolicyCheckInput,
  type UpdatePolicyProgramInput
} from "@sinhon-os/schemas";
import type { SinhonPrismaClient } from "@sinhon-os/database";
import { ApiError } from "./api-errors.js";
import { recordAnalyticsEventSafely } from "./analytics-service.js";
import {
  evaluatePolicyRule,
  POLICY_DISCLAIMER,
  type EligibilityInput,
  type PolicyEvaluation
} from "./policy-rule-engine.js";

type PolicyStore = Pick<
  SinhonPrismaClient,
  | "couple"
  | "coupleMember"
  | "decisionLog"
  | "document"
  | "eligibilityResult"
  | "notification"
  | "policyProgram"
  | "policyRuleVersion"
  | "task"
>;

type PolicyServiceOptions = {
  now?: () => Date;
  prisma: SinhonPrismaClient;
};

type CoupleRecord = NonNullable<Awaited<ReturnType<SinhonPrismaClient["couple"]["findFirst"]>>>;
type CoupleMemberRecord = NonNullable<
  Awaited<ReturnType<SinhonPrismaClient["coupleMember"]["findFirst"]>>
>;
type PolicyProgramRecord = NonNullable<
  Awaited<ReturnType<SinhonPrismaClient["policyProgram"]["findFirst"]>>
>;
type PolicyRuleVersionRecord = NonNullable<
  Awaited<ReturnType<SinhonPrismaClient["policyRuleVersion"]["findFirst"]>>
>;
type EligibilityResultRecord = NonNullable<
  Awaited<ReturnType<SinhonPrismaClient["eligibilityResult"]["findFirst"]>>
>;
type TaskRecord = NonNullable<Awaited<ReturnType<SinhonPrismaClient["task"]["findFirst"]>>>;

type JsonInputValue =
  | boolean
  | number
  | string
  | JsonInputValue[]
  | { [key: string]: JsonInputValue | null };

type PolicyProgramWithRules = PolicyProgramRecord & {
  ruleVersions?: PolicyRuleVersionRecord[];
};

type EligibilityResultWithRelations = EligibilityResultRecord & {
  policyProgram: PolicyProgramRecord;
  policyRuleVersion: PolicyRuleVersionRecord;
};

const defaultLimit = 10;

const ACTIVE_RULE_INCLUDE = {
  ruleVersions: {
    orderBy: {
      version: "desc" as const
    },
    take: 1,
    where: {
      status: "active"
    }
  }
} as const;

const RULE_VERSIONS_INCLUDE = {
  ruleVersions: {
    orderBy: {
      version: "desc" as const
    }
  }
} as const;

const ELIGIBILITY_RESULT_INCLUDE = {
  policyProgram: true,
  policyRuleVersion: true
} as const;

function toInputJson(value: unknown): JsonInputValue {
  return JSON.parse(JSON.stringify(value)) as JsonInputValue;
}

function parseDateTime(value: string | undefined) {
  return value ? new Date(value) : undefined;
}

function parseDateTimeOrNull(value: string | undefined) {
  return value ? new Date(value) : null;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function reminderTime(dueAt: Date, nowDate: Date) {
  const twoDaysBefore = new Date(dueAt.getTime() - 2 * 24 * 60 * 60 * 1000);

  return twoDaysBefore.getTime() > nowDate.getTime() ? twoDaysBefore : nowDate;
}

function isFilled(value: Date | string | null | undefined) {
  return Boolean(value) && value !== "not_set";
}

function toDateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function isPersonalInputComplete(member: CoupleMemberRecord) {
  return (
    isFilled(member.displayLabel) &&
    isFilled(member.workRegion) &&
    isFilled(member.incomeRange) &&
    isFilled(member.assetRange) &&
    member.onboardingStatus === "completed"
  );
}

function isCoupleInputComplete(couple: CoupleRecord) {
  return (
    isFilled(couple.weddingDate) &&
    isFilled(couple.weddingRegion) &&
    isFilled(couple.preferredResidenceRegion) &&
    isFilled(couple.housingType) &&
    isFilled(couple.totalBudgetRange) &&
    isFilled(couple.cashOnHandRange) &&
    isFilled(couple.familySupportType) &&
    isFilled(couple.loanConsiderationStatus) &&
    isFilled(couple.childrenPlanStatus) &&
    isFilled(couple.preferredWeddingStyle) &&
    isFilled(couple.moveInPlanAt)
  );
}

async function assertActiveMember(store: PolicyStore, userId: string, coupleId: string) {
  const member = await store.coupleMember.findFirst({
    where: {
      coupleId,
      status: "active",
      userId
    }
  });

  if (!member) {
    throw new ApiError("FORBIDDEN", "해당 커플에 접근할 수 없습니다.");
  }

  return member;
}

async function getCouple(store: PolicyStore, coupleId: string) {
  const couple = await store.couple.findFirst({
    where: {
      deletedAt: null,
      id: coupleId
    }
  });

  if (!couple) {
    throw new ApiError("NOT_FOUND", "커플 공간을 찾을 수 없습니다.");
  }

  return couple;
}

async function assertPolicyReady(store: PolicyStore, userId: string, coupleId: string) {
  const member = await assertActiveMember(store, userId, coupleId);
  const couple = await getCouple(store, coupleId);

  if (!isPersonalInputComplete(member)) {
    throw new ApiError("ONBOARDING_INCOMPLETE", "온보딩 완료 후 정책 조건을 확인할 수 있습니다.", {
      personal: ["개인 입력을 저장하고 온보딩 완료 처리를 먼저 진행해 주세요."]
    });
  }

  if (!isCoupleInputComplete(couple)) {
    throw new ApiError("ONBOARDING_INCOMPLETE", "커플 공통 입력을 먼저 채워 주세요.", {
      couple: ["결혼일, 지역, 주거, 예산, 현금, 계획 정보를 확인해 주세요."]
    });
  }

  return {
    couple,
    member
  };
}

function buildEligibilityInput(
  couple: CoupleRecord,
  member: CoupleMemberRecord,
  additionalInputs: Record<string, unknown>
): EligibilityInput {
  return {
    ...additionalInputs,
    assetRange: member.assetRange,
    cashOnHandRange: couple.cashOnHandRange,
    childrenPlanStatus: couple.childrenPlanStatus,
    familySupportType: couple.familySupportType,
    housingType: couple.housingType,
    incomeRange: member.incomeRange,
    loanConsiderationStatus: couple.loanConsiderationStatus,
    moveInPlanAt: toDateOnly(couple.moveInPlanAt),
    preferredResidenceRegion: couple.preferredResidenceRegion,
    preferredWeddingStyle: couple.preferredWeddingStyle,
    totalBudgetRange: couple.totalBudgetRange,
    weddingDate: toDateOnly(couple.weddingDate),
    weddingRegion: couple.weddingRegion,
    workRegion: member.workRegion
  };
}

function toPolicyProgramSummary(program: PolicyProgramWithRules) {
  const activeRuleVersion = program.ruleVersions?.[0] ?? null;

  return {
    activeRuleVersion: activeRuleVersion
      ? {
          id: activeRuleVersion.id,
          sourceUpdatedAt: activeRuleVersion.sourceUpdatedAt,
          sourceUrl: activeRuleVersion.sourceUrl,
          verifiedAt: activeRuleVersion.verifiedAt,
          version: activeRuleVersion.version
        }
      : null,
    applicationEndAt: program.applicationEndAt,
    applicationStartAt: program.applicationStartAt,
    category: program.category,
    cautionText: program.cautionText,
    id: program.id,
    name: program.name,
    providerName: program.providerName,
    region: program.region,
    requiredDocumentsSummary: program.requiredDocumentsSummary ?? [],
    sourceUpdatedAt: program.sourceUpdatedAt,
    sourceUrl: program.sourceUrl,
    status: program.status,
    summary: program.summary,
    verifiedAt: program.verifiedAt
  };
}

function toPolicyProgramDetail(program: PolicyProgramWithRules) {
  return {
    ...toPolicyProgramSummary(program),
    ruleVersions: (program.ruleVersions ?? []).map((ruleVersion) => ({
      createdAt: ruleVersion.createdAt,
      effectiveFrom: ruleVersion.effectiveFrom,
      effectiveTo: ruleVersion.effectiveTo,
      id: ruleVersion.id,
      requiredDocuments: ruleVersion.requiredDocuments ?? [],
      requiredInputs: ruleVersion.requiredInputs ?? [],
      ruleSummary: ruleVersion.ruleSummary,
      sourceUpdatedAt: ruleVersion.sourceUpdatedAt,
      sourceUrl: ruleVersion.sourceUrl,
      status: ruleVersion.status,
      verifiedAt: ruleVersion.verifiedAt,
      version: ruleVersion.version
    }))
  };
}

function toEligibilityResultDetail(result: EligibilityResultWithRelations) {
  return {
    checkedAt: result.checkedAt,
    disclaimer: POLICY_DISCLAIMER,
    expiresAt: result.expiresAt,
    id: result.id,
    inputSnapshot: result.inputSnapshot,
    missingInputs: result.missingInputs ?? [],
    policyProgram: {
      category: result.policyProgram.category,
      id: result.policyProgram.id,
      name: result.policyProgram.name,
      providerName: result.policyProgram.providerName,
      region: result.policyProgram.region,
      sourceUpdatedAt: result.policyProgram.sourceUpdatedAt,
      sourceUrl: result.policyProgram.sourceUrl,
      summary: result.policyProgram.summary,
      verifiedAt: result.policyProgram.verifiedAt
    },
    policyRuleVersion: {
      id: result.policyRuleVersion.id,
      sourceUpdatedAt: result.policyRuleVersion.sourceUpdatedAt,
      sourceUrl: result.policyRuleVersion.sourceUrl,
      verifiedAt: result.policyRuleVersion.verifiedAt,
      version: result.policyRuleVersion.version
    },
    requiredDocuments: result.requiredDocuments ?? [],
    resultReason: result.resultReason,
    resultStatus: result.resultStatus
  };
}

function toEligibilityResultSummary(result: EligibilityResultWithRelations) {
  return {
    checkedAt: result.checkedAt,
    disclaimer: POLICY_DISCLAIMER,
    expiresAt: result.expiresAt,
    id: result.id,
    missingInputs: result.missingInputs ?? [],
    policyProgram: {
      category: result.policyProgram.category,
      id: result.policyProgram.id,
      name: result.policyProgram.name,
      providerName: result.policyProgram.providerName,
      region: result.policyProgram.region
    },
    requiredDocuments: result.requiredDocuments ?? [],
    resultReason: result.resultReason,
    resultStatus: result.resultStatus
  };
}

function toTaskSummary(task: TaskRecord) {
  return {
    dueAt: task.dueAt,
    id: task.id,
    sourceId: task.sourceId,
    sourceType: task.sourceType,
    status: task.status,
    title: task.title
  };
}

function buildProgramCreateData(input: CreatePolicyProgramInput, userId: string) {
  return {
    applicationEndAt: parseDateTime(input.applicationEndAt),
    applicationStartAt: parseDateTime(input.applicationStartAt),
    category: input.category,
    cautionText: input.cautionText,
    createdByUserId: userId,
    name: input.name,
    providerName: input.providerName,
    region: input.region,
    requiredDocumentsSummary: input.requiredDocumentsSummary
      ? toInputJson(input.requiredDocumentsSummary)
      : undefined,
    sourceUpdatedAt: parseDateTime(input.sourceUpdatedAt),
    sourceUrl: input.sourceUrl,
    status: input.status,
    summary: input.summary,
    verifiedAt: parseDateTime(input.verifiedAt)
  };
}

function buildProgramUpdateData(input: UpdatePolicyProgramInput) {
  return {
    applicationEndAt: parseDateTime(input.applicationEndAt),
    applicationStartAt: parseDateTime(input.applicationStartAt),
    category: input.category,
    cautionText: input.cautionText,
    name: input.name,
    providerName: input.providerName,
    region: input.region,
    requiredDocumentsSummary: input.requiredDocumentsSummary
      ? toInputJson(input.requiredDocumentsSummary)
      : undefined,
    sourceUpdatedAt: parseDateTime(input.sourceUpdatedAt),
    sourceUrl: input.sourceUrl,
    status: input.status,
    summary: input.summary,
    verifiedAt: parseDateTime(input.verifiedAt)
  };
}

function buildRuleCreateData(
  input: CreatePolicyRuleVersionInput,
  options: {
    policyProgramId: string;
    userId: string;
    version: number;
  }
) {
  return {
    createdByUserId: options.userId,
    effectiveFrom: parseDateTimeOrNull(input.effectiveFrom),
    effectiveTo: parseDateTimeOrNull(input.effectiveTo),
    eligibilityCriteria: toInputJson(input.eligibilityCriteria),
    policyProgramId: options.policyProgramId,
    requiredDocuments: toInputJson(input.requiredDocuments),
    requiredInputs: toInputJson(input.requiredInputs),
    resultReasonTemplate: toInputJson(input.resultReasonTemplate),
    ruleSummary: input.ruleSummary,
    sourceUpdatedAt: parseDateTimeOrNull(input.sourceUpdatedAt),
    sourceUrl: input.sourceUrl,
    status: input.status,
    verifiedAt: parseDateTimeOrNull(input.verifiedAt),
    version: options.version
  };
}

async function getProgramWithRules(store: PolicyStore, policyProgramId: string) {
  const program = await store.policyProgram.findFirst({
    include: RULE_VERSIONS_INCLUDE,
    where: {
      id: policyProgramId
    }
  });

  if (!program) {
    throw new ApiError("NOT_FOUND", "정책을 찾을 수 없습니다.");
  }

  return program;
}

async function getEligibilityResultWithAccess(
  store: PolicyStore,
  userId: string,
  eligibilityResultId: string
) {
  const result = await store.eligibilityResult.findFirst({
    include: ELIGIBILITY_RESULT_INCLUDE,
    where: {
      id: eligibilityResultId
    }
  });

  if (!result) {
    throw new ApiError("NOT_FOUND", "정책 결과를 찾을 수 없습니다.");
  }

  await assertActiveMember(store, userId, result.coupleId);

  return result;
}

function buildResultCreateData(options: {
  coupleId: string;
  evaluation: PolicyEvaluation;
  policyProgramId: string;
  ruleVersionId: string;
}) {
  return {
    checkedAt: new Date(),
    coupleId: options.coupleId,
    expiresAt: options.evaluation.expiresAt,
    inputSnapshot: toInputJson(options.evaluation.inputSnapshot),
    missingInputs: toInputJson(options.evaluation.missingInputs),
    policyProgramId: options.policyProgramId,
    policyRuleVersionId: options.ruleVersionId,
    requiredDocuments: toInputJson(options.evaluation.requiredDocuments),
    resultReason: options.evaluation.resultReason,
    resultStatus: options.evaluation.resultStatus
  };
}

export function createPolicyService({ now = () => new Date(), prisma }: PolicyServiceOptions) {
  return {
    async createDocumentTasks(
      userId: string,
      eligibilityResultId: string,
      input: CreateEligibilityDocumentTasksInput
    ) {
      return prisma.$transaction(async (tx) => {
        const result = await getEligibilityResultWithAccess(tx, userId, eligibilityResultId);
        const requiredDocuments = Array.isArray(result.requiredDocuments)
          ? result.requiredDocuments
          : [];

        if (requiredDocuments.length === 0) {
          return {
            tasks: []
          };
        }

        const existingTasks = await tx.task.findMany({
          orderBy: {
            createdAt: "asc"
          },
          where: {
            coupleId: result.coupleId,
            deletedAt: null,
            sourceId: result.id,
            sourceType: "eligibility_result"
          }
        });

        if (existingTasks.length > 0) {
          return {
            tasks: existingTasks.map(toTaskSummary)
          };
        }

        const dueAt = addDays(now(), input.dueInDays);
        const member = await assertActiveMember(tx, userId, result.coupleId);
        const tasks = await Promise.all(
          requiredDocuments.map((document) => {
            const label =
              typeof document === "object" &&
              document !== null &&
              "label" in document &&
              typeof document.label === "string"
                ? document.label
                : "정책 필요 서류";
            const documentType =
              typeof document === "object" &&
              document !== null &&
              "key" in document &&
              typeof document.key === "string"
                ? document.key
                : "policy_document";

            return tx.task
              .create({
                data: {
                  assignedCoupleMemberId: member.id,
                  coupleId: result.coupleId,
                  createdByUserId: userId,
                  description: `${result.policyProgram.name} 결과에 필요한 서류입니다.`,
                  dueAt,
                  sourceId: result.id,
                  sourceType: "eligibility_result",
                  status: "open",
                  title: `서류 준비: ${label}`
                }
              })
              .then(async (task) => {
                await tx.document.create({
                  data: {
                    coupleId: result.coupleId,
                    documentType,
                    dueAt,
                    ownerCoupleMemberId: member.id,
                    sourceId: result.id,
                    sourceType: "eligibility_result",
                    status: "needed",
                    title: label
                  }
                });

                await tx.notification.create({
                  data: {
                    body: "마감일이 다가오면 정책 필요 서류를 확인해 주세요.",
                    channel: "in_app",
                    coupleId: result.coupleId,
                    coupleMemberId: member.id,
                    metadata: toInputJson({
                      eligibilityResultId: result.id,
                      taskId: task.id
                    }),
                    scheduledAt: reminderTime(dueAt, now()),
                    status: "scheduled",
                    title: "정책 서류 마감 알림",
                    type: "task_due",
                    userId
                  }
                });

                return task;
              });
          })
        );

        return {
          tasks: tasks.map(toTaskSummary)
        };
      });
    },

    async createPolicyProgram(userId: string, input: CreatePolicyProgramInput) {
      const policyProgram = await prisma.policyProgram.create({
        data: buildProgramCreateData(input, userId),
        include: ACTIVE_RULE_INCLUDE
      });

      return {
        policyProgram: toPolicyProgramSummary(policyProgram)
      };
    },

    async createPolicyRuleVersion(
      userId: string,
      policyProgramId: string,
      input: CreatePolicyRuleVersionInput
    ) {
      return prisma.$transaction(async (tx) => {
        const program = await tx.policyProgram.findFirst({
          where: {
            id: policyProgramId
          }
        });

        if (!program) {
          throw new ApiError("NOT_FOUND", "정책을 찾을 수 없습니다.");
        }

        const latest = await tx.policyRuleVersion.findFirst({
          orderBy: {
            version: "desc"
          },
          where: {
            policyProgramId
          }
        });
        const version = input.version ?? (latest?.version ?? 0) + 1;

        if (input.status === "active") {
          await tx.policyRuleVersion.updateMany({
            data: {
              status: "retired"
            },
            where: {
              policyProgramId,
              status: "active"
            }
          });
        }

        const ruleVersion = await tx.policyRuleVersion.create({
          data: buildRuleCreateData(input, {
            policyProgramId,
            userId,
            version
          })
        });

        await tx.decisionLog.create({
          data: {
            action: "create_policy_rule_version",
            actorUserId: userId,
            afterStatus: ruleVersion.status,
            targetId: ruleVersion.id,
            targetType: "policy_rule_version"
          }
        });

        return {
          policyRuleVersion: {
            id: ruleVersion.id,
            policyProgramId: ruleVersion.policyProgramId,
            status: ruleVersion.status,
            version: ruleVersion.version
          }
        };
      });
    },

    async getEligibilityResult(userId: string, eligibilityResultId: string) {
      const result = await getEligibilityResultWithAccess(prisma, userId, eligibilityResultId);

      return {
        eligibilityResult: toEligibilityResultDetail(result)
      };
    },

    async getPolicyProgram(_userId: string, policyProgramId: string) {
      const policyProgram = await getProgramWithRules(prisma, policyProgramId);

      return {
        policyProgram: toPolicyProgramDetail(policyProgram)
      };
    },

    async listEligibilityResults(
      userId: string,
      coupleId: string,
      query: ListEligibilityResultsQuery
    ) {
      await assertActiveMember(prisma, userId, coupleId);

      const results = await prisma.eligibilityResult.findMany({
        include: ELIGIBILITY_RESULT_INCLUDE,
        orderBy: {
          checkedAt: "desc"
        },
        take: query.limit ?? defaultLimit,
        where: {
          coupleId,
          policyProgramId: query.policyProgramId,
          resultStatus: query.resultStatus
        }
      });

      return {
        eligibilityResults: results.map(toEligibilityResultSummary)
      };
    },

    async listPolicyPrograms(_userId: string, query: ListPolicyProgramsQuery) {
      const policyPrograms = await prisma.policyProgram.findMany({
        include: ACTIVE_RULE_INCLUDE,
        orderBy: {
          updatedAt: "desc"
        },
        take: query.limit ?? defaultLimit,
        where: {
          category: query.category,
          region: query.region,
          status: query.includeInactive ? undefined : "active"
        }
      });

      return {
        policyPrograms: policyPrograms.map(toPolicyProgramSummary)
      };
    },

    async runPolicyCheck(userId: string, coupleId: string, input: RunPolicyCheckInput) {
      await recordAnalyticsEventSafely(prisma, {
        coupleId,
        eventName: "policy_check_started",
        payload: {
          selectedPolicyCount: input.policyProgramIds?.length ?? null
        },
        userId
      });

      const result = await prisma.$transaction(async (tx) => {
        const { couple, member } = await assertPolicyReady(tx, userId, coupleId);
        const eligibilityInput = buildEligibilityInput(couple, member, input.additionalInputs);
        const policyPrograms = await tx.policyProgram.findMany({
          include: ACTIVE_RULE_INCLUDE,
          orderBy: {
            updatedAt: "desc"
          },
          where: {
            id: input.policyProgramIds ? { in: input.policyProgramIds } : undefined,
            status: "active"
          }
        });
        const eligibilityResults: ReturnType<typeof toEligibilityResultDetail>[] = [];

        for (const policyProgram of policyPrograms) {
          const activeRuleVersion = policyProgram.ruleVersions[0];

          if (!activeRuleVersion) {
            continue;
          }

          const evaluation = evaluatePolicyRule({
            input: eligibilityInput,
            now: now(),
            policyProgram,
            ruleVersion: activeRuleVersion
          });
          const created = await tx.eligibilityResult.create({
            data: {
              ...buildResultCreateData({
                coupleId,
                evaluation,
                policyProgramId: policyProgram.id,
                ruleVersionId: activeRuleVersion.id
              }),
              checkedAt: now()
            },
            include: {
              ...ELIGIBILITY_RESULT_INCLUDE
            }
          });

          eligibilityResults.push(toEligibilityResultDetail(created));
        }

        await tx.decisionLog.create({
          data: {
            action: "run_policy_check",
            actorCoupleMemberId: member.id,
            actorUserId: userId,
            afterStatus: "checked",
            coupleId,
            targetId: coupleId,
            targetType: "couple"
          }
        });

        return {
          disclaimer: POLICY_DISCLAIMER,
          eligibilityResults
        };
      });

      await recordAnalyticsEventSafely(prisma, {
        coupleId,
        eventName: "policy_check_completed",
        payload: {
          resultCount: result.eligibilityResults.length
        },
        userId
      });

      return result;
    },

    async updatePolicyProgram(
      userId: string,
      policyProgramId: string,
      input: UpdatePolicyProgramInput
    ) {
      return prisma.$transaction(async (tx) => {
        const current = await tx.policyProgram.findFirst({
          where: {
            id: policyProgramId
          }
        });

        if (!current) {
          throw new ApiError("NOT_FOUND", "정책을 찾을 수 없습니다.");
        }

        const policyProgram = await tx.policyProgram.update({
          data: buildProgramUpdateData(input),
          include: ACTIVE_RULE_INCLUDE,
          where: {
            id: policyProgramId
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "update_policy_program",
            actorUserId: userId,
            afterStatus: policyProgram.status,
            beforeStatus: current.status,
            targetId: policyProgram.id,
            targetType: "policy_program"
          }
        });

        return {
          policyProgram: toPolicyProgramSummary(policyProgram)
        };
      });
    }
  };
}

export type PolicyService = ReturnType<typeof createPolicyService>;
