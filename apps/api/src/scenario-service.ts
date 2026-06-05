import {
  scenarioItemInputSchema,
  type CreateScenarioInput,
  type EvaluateScenarioInput,
  type ListScenariosQuery,
  type ScenarioItemInput,
  type UpdateScenarioInput
} from "@sinhon-os/schemas";
import type { SinhonPrismaClient } from "@sinhon-os/database";
import { ApiError } from "./api-errors.js";
import { recordAnalyticsEventSafely } from "./analytics-service.js";
import {
  calculateScenario,
  SCENARIO_CALCULATION_VERSION,
  type ScenarioBudgetBasis,
  type ScenarioInputSnapshot,
  type ScenarioOnboardingContext
} from "./scenario-engine.js";

type ScenarioStore = Pick<
  SinhonPrismaClient,
  "couple" | "coupleMember" | "decisionLog" | "scenario" | "scenarioItem"
>;

type ScenarioServiceOptions = {
  now?: () => Date;
  prisma: SinhonPrismaClient;
};

type CoupleRecord = NonNullable<Awaited<ReturnType<SinhonPrismaClient["couple"]["findFirst"]>>>;
type CoupleMemberRecord = NonNullable<
  Awaited<ReturnType<SinhonPrismaClient["coupleMember"]["findFirst"]>>
>;
type ScenarioRecord = NonNullable<Awaited<ReturnType<SinhonPrismaClient["scenario"]["findFirst"]>>>;
type ScenarioItemRecord = NonNullable<
  Awaited<ReturnType<SinhonPrismaClient["scenarioItem"]["findFirst"]>>
>;

type ScenarioWithItems = ScenarioRecord & {
  items: ScenarioItemRecord[];
};

const defaultLimit = 10;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toDateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function isFilled(value: Date | string | null | undefined) {
  return Boolean(value) && value !== "not_set";
}

function toNumber(value: bigint | number | null | undefined) {
  return value === null || value === undefined ? null : Number(value);
}

function toBigInt(value: number | null) {
  return value === null ? null : BigInt(value);
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

async function assertActiveMember(store: ScenarioStore, userId: string, coupleId: string) {
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

async function getCouple(store: ScenarioStore, coupleId: string) {
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

async function assertScenarioReady(store: ScenarioStore, userId: string, coupleId: string) {
  const member = await assertActiveMember(store, userId, coupleId);
  const couple = await getCouple(store, coupleId);

  if (!isPersonalInputComplete(member)) {
    throw new ApiError("ONBOARDING_INCOMPLETE", "온보딩 완료 후 시나리오를 만들 수 있습니다.", {
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

function buildOnboardingContext(couple: CoupleRecord): ScenarioOnboardingContext {
  return {
    childrenPlanStatus: couple.childrenPlanStatus,
    housingType: couple.housingType,
    loanConsiderationStatus: couple.loanConsiderationStatus,
    moveInPlanAt: toDateOnly(couple.moveInPlanAt),
    preferredResidenceRegion: couple.preferredResidenceRegion,
    preferredWeddingStyle: couple.preferredWeddingStyle,
    weddingDate: toDateOnly(couple.weddingDate),
    weddingRegion: couple.weddingRegion
  };
}

function buildBudgetBasis(
  couple: CoupleRecord,
  input: { budgetBasis?: { availableBudgetAmount?: number }; useOnboardingDefaults?: boolean }
): ScenarioBudgetBasis {
  return {
    availableBudgetAmount: input.budgetBasis?.availableBudgetAmount,
    cashOnHandRange: input.useOnboardingDefaults === false ? undefined : couple.cashOnHandRange,
    totalBudgetRange: input.useOnboardingDefaults === false ? undefined : couple.totalBudgetRange
  };
}

function getSnapshot(value: unknown): Partial<ScenarioInputSnapshot> {
  if (!isObject(value)) {
    return {};
  }

  return value as Partial<ScenarioInputSnapshot>;
}

function getSnapshotItems(value: unknown) {
  const snapshot = getSnapshot(value);
  return Array.isArray(snapshot.items) ? snapshot.items : [];
}

function findSnapshotItem(item: ScenarioItemRecord, snapshotItems: ScenarioItemInput[]) {
  return snapshotItems.find(
    (snapshotItem) =>
      snapshotItem.category === item.category &&
      snapshotItem.label === item.label &&
      snapshotItem.sortOrder === item.sortOrder
  );
}

function toScenarioItemsForCalculation(scenario: ScenarioWithItems): ScenarioItemInput[] {
  const snapshotItems = getSnapshotItems(scenario.inputSnapshot);

  return scenario.items.map((item) => {
    const snapshotItem = findSnapshotItem(item, snapshotItems);
    const parsed = scenarioItemInputSchema.safeParse({
      amount: Number(item.amount),
      amountType: item.amountType,
      category: item.category,
      frequency: snapshotItem?.frequency ?? "one_time",
      isRequired: item.isRequired,
      label: item.label,
      note: item.note ?? undefined,
      sortOrder: item.sortOrder,
      sourceType: item.sourceType ?? undefined,
      sourceUrl: item.sourceUrl ?? undefined
    });

    if (!parsed.success) {
      throw new ApiError(
        "CONFLICT",
        "이전 형식의 시나리오는 새 계산 규칙으로 재계산할 수 없습니다."
      );
    }

    return parsed.data;
  });
}

function riskFlagCodes(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((item) => (isObject(item) && typeof item.code === "string" ? item.code : null))
        .filter((code): code is string => Boolean(code))
    : [];
}

function nextActions(flags: string[]) {
  const actions: Record<string, string> = {
    budget_range_only: "예산 기준 금액을 입력하면 부족 금액을 더 분명히 볼 수 있습니다.",
    loan_considered_needs_review:
      "대출을 고려 중이면 공식 조건이나 상담 자료를 따로 확인해 주세요.",
    missing_required_item: "금액이 비어 있는 필수 항목을 먼저 채워 주세요.",
    monthly_amount_present: "월 고정 지출은 일회성 준비 비용과 나누어 확인해 주세요.",
    partner_price_snapshot_used: "파트너 가격의 유효기간과 포함 항목을 확인해 주세요.",
    sample_value_used: "샘플 항목을 실제 견적이나 직접 입력값으로 바꿔 주세요.",
    shortfall_present: "예상 총액이 예산 기준보다 큽니다. 항목별 우선순위를 다시 확인해 주세요."
  };

  return flags.map((flag) => actions[flag]).filter((action): action is string => Boolean(action));
}

function toScenarioItemResponse(item: ScenarioItemRecord, snapshotItems: ScenarioItemInput[]) {
  const snapshotItem = findSnapshotItem(item, snapshotItems);

  return {
    amount: Number(item.amount),
    amountType: item.amountType,
    category: item.category,
    frequency: snapshotItem?.frequency ?? "one_time",
    id: item.id,
    isRequired: item.isRequired,
    label: item.label,
    note: item.note,
    sortOrder: item.sortOrder,
    sourceType: item.sourceType,
    sourceUrl: item.sourceUrl
  };
}

function toScenarioDetail(scenario: ScenarioWithItems) {
  const snapshotItems = getSnapshotItems(scenario.inputSnapshot);
  const flags = riskFlagCodes(scenario.riskFlags);

  return {
    archivedAt: scenario.archivedAt,
    calculationVersion: scenario.calculationVersion,
    containsSampleValue: scenario.containsSampleValue,
    createdAt: scenario.createdAt,
    id: scenario.id,
    inputSnapshot: scenario.inputSnapshot,
    items: scenario.items.map((item) => toScenarioItemResponse(item, snapshotItems)),
    monthlyAmount: toNumber(scenario.monthlyAmount),
    nextActions: nextActions(flags),
    riskFlags: scenario.riskFlags ?? [],
    shortfallAmount: toNumber(scenario.shortfallAmount),
    status: scenario.status,
    title: scenario.title,
    totalAmount: toNumber(scenario.totalAmount),
    updatedAt: scenario.updatedAt,
    warnings: flags
  };
}

function toScenarioSummary(scenario: ScenarioRecord) {
  const flags = riskFlagCodes(scenario.riskFlags);

  return {
    calculationVersion: scenario.calculationVersion,
    containsSampleValue: scenario.containsSampleValue,
    createdAt: scenario.createdAt,
    id: scenario.id,
    monthlyAmount: toNumber(scenario.monthlyAmount),
    shortfallAmount: toNumber(scenario.shortfallAmount),
    status: scenario.status,
    title: scenario.title,
    totalAmount: toNumber(scenario.totalAmount),
    warnings: flags
  };
}

function toScenarioItemCreateData(item: ScenarioItemInput) {
  return {
    amount: BigInt(item.amount),
    amountType: item.amountType,
    category: item.category,
    isRequired: item.isRequired,
    label: item.label,
    note: item.note,
    sortOrder: item.sortOrder,
    sourceType: item.sourceType,
    sourceUrl: item.sourceUrl
  };
}

function buildScenarioUpdateData(
  calculation: ReturnType<typeof calculateScenario>,
  status: string = "completed"
) {
  return {
    calculationVersion: SCENARIO_CALCULATION_VERSION,
    containsSampleValue: calculation.containsSampleValue,
    inputSnapshot: calculation.inputSnapshot,
    monthlyAmount: toBigInt(calculation.monthlyAmount),
    riskFlags: calculation.riskFlags,
    shortfallAmount: toBigInt(calculation.shortfallAmount),
    status,
    totalAmount: toBigInt(calculation.totalAmount)
  };
}

async function getScenarioWithAccess(store: ScenarioStore, userId: string, scenarioId: string) {
  const scenario = await store.scenario.findFirst({
    include: {
      items: {
        orderBy: {
          sortOrder: "asc"
        }
      }
    },
    where: {
      deletedAt: null,
      id: scenarioId
    }
  });

  if (!scenario) {
    throw new ApiError("NOT_FOUND", "시나리오를 찾을 수 없습니다.");
  }

  await assertActiveMember(store, userId, scenario.coupleId);

  return scenario;
}

export function createScenarioService({ now = () => new Date(), prisma }: ScenarioServiceOptions) {
  return {
    async archiveScenario(userId: string, scenarioId: string) {
      return prisma.$transaction(async (tx) => {
        const scenario = await getScenarioWithAccess(tx, userId, scenarioId);
        const updated = await tx.scenario.update({
          data: {
            archivedAt: now(),
            status: "archived"
          },
          where: {
            id: scenario.id
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "archive_scenario",
            actorUserId: userId,
            afterStatus: updated.status,
            beforeStatus: scenario.status,
            coupleId: scenario.coupleId,
            targetId: scenario.id,
            targetType: "scenario"
          }
        });

        return {
          scenarioId: updated.id,
          status: updated.status
        };
      });
    },

    async createScenario(userId: string, coupleId: string, input: CreateScenarioInput) {
      const result = await prisma.$transaction(async (tx) => {
        const { couple, member } = await assertScenarioReady(tx, userId, coupleId);
        const calculation = calculateScenario({
          budgetBasis: buildBudgetBasis(couple, input),
          items: input.items,
          onboardingContext: buildOnboardingContext(couple)
        });
        const scenario = await tx.scenario.create({
          data: {
            ...buildScenarioUpdateData(calculation),
            coupleId,
            createdByUserId: userId,
            items: {
              create: input.items.map(toScenarioItemCreateData)
            },
            title: input.title
          },
          include: {
            items: {
              orderBy: {
                sortOrder: "asc"
              }
            }
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "create_scenario",
            actorCoupleMemberId: member.id,
            actorUserId: userId,
            afterStatus: scenario.status,
            coupleId,
            targetId: scenario.id,
            targetType: "scenario"
          }
        });

        return {
          scenario: toScenarioDetail(scenario)
        };
      });

      await recordAnalyticsEventSafely(prisma, {
        coupleId,
        eventName: "scenario_created",
        payload: {
          itemCount: input.items.length,
          scenarioId: result.scenario.id
        },
        userId
      });

      return result;
    },

    async evaluateScenario(userId: string, scenarioId: string, input: EvaluateScenarioInput = {}) {
      if (input.calculationVersion && input.calculationVersion !== SCENARIO_CALCULATION_VERSION) {
        throw new ApiError("CONFLICT", "지원하지 않는 계산 버전입니다.");
      }

      const result = await prisma.$transaction(async (tx) => {
        const scenario = await getScenarioWithAccess(tx, userId, scenarioId);
        const snapshot = getSnapshot(scenario.inputSnapshot);
        const calculation = calculateScenario({
          budgetBasis: snapshot.budgetBasis,
          items: toScenarioItemsForCalculation(scenario),
          onboardingContext: snapshot.onboardingContext
        });
        const updated = await tx.scenario.update({
          data: buildScenarioUpdateData(calculation, scenario.status),
          include: {
            items: {
              orderBy: {
                sortOrder: "asc"
              }
            }
          },
          where: {
            id: scenario.id
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "evaluate_scenario",
            actorUserId: userId,
            afterStatus: updated.status,
            beforeStatus: scenario.status,
            coupleId: scenario.coupleId,
            targetId: scenario.id,
            targetType: "scenario"
          }
        });

        return {
          coupleId: scenario.coupleId,
          response: {
            scenario: toScenarioDetail(updated),
            warnings: calculation.warnings
          }
        };
      });

      await recordAnalyticsEventSafely(prisma, {
        coupleId: result.coupleId,
        eventName: "scenario_evaluated",
        payload: {
          scenarioId,
          warningCodes: result.response.warnings
        },
        userId
      });

      return result.response;
    },

    async getScenario(userId: string, scenarioId: string) {
      const scenario = await getScenarioWithAccess(prisma, userId, scenarioId);

      return {
        scenario: toScenarioDetail(scenario)
      };
    },

    async listScenarios(userId: string, coupleId: string, query: ListScenariosQuery) {
      await assertActiveMember(prisma, userId, coupleId);

      const scenarios = await prisma.scenario.findMany({
        orderBy: {
          createdAt: "desc"
        },
        take: query.limit ?? defaultLimit,
        where: {
          coupleId,
          deletedAt: null,
          status: query.status ?? {
            not: "archived"
          }
        }
      });

      return {
        scenarios: scenarios.map(toScenarioSummary)
      };
    },

    async updateScenario(userId: string, scenarioId: string, input: UpdateScenarioInput) {
      return prisma.$transaction(async (tx) => {
        const scenario = await getScenarioWithAccess(tx, userId, scenarioId);

        if (!input.items && !input.budgetBasis) {
          const updated = await tx.scenario.update({
            data: {
              status: input.status,
              title: input.title
            },
            include: {
              items: {
                orderBy: {
                  sortOrder: "asc"
                }
              }
            },
            where: {
              id: scenario.id
            }
          });

          return {
            scenario: toScenarioDetail(updated)
          };
        }

        const snapshot = getSnapshot(scenario.inputSnapshot);
        const nextItems = input.items ?? toScenarioItemsForCalculation(scenario);
        const calculation = calculateScenario({
          budgetBasis: {
            ...snapshot.budgetBasis,
            ...input.budgetBasis
          },
          items: nextItems,
          onboardingContext: snapshot.onboardingContext
        });

        await tx.scenarioItem.deleteMany({
          where: {
            scenarioId: scenario.id
          }
        });

        const updated = await tx.scenario.update({
          data: {
            ...buildScenarioUpdateData(calculation, input.status ?? scenario.status),
            items: {
              create: nextItems.map(toScenarioItemCreateData)
            },
            title: input.title ?? scenario.title
          },
          include: {
            items: {
              orderBy: {
                sortOrder: "asc"
              }
            }
          },
          where: {
            id: scenario.id
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "update_scenario",
            actorUserId: userId,
            afterStatus: updated.status,
            beforeStatus: scenario.status,
            coupleId: scenario.coupleId,
            targetId: scenario.id,
            targetType: "scenario"
          }
        });

        return {
          scenario: toScenarioDetail(updated)
        };
      });
    }
  };
}

export type ScenarioService = ReturnType<typeof createScenarioService>;
