import {
  analyticsFunnelSteps,
  inspectAnalyticsPayload,
  type AnalyticsEventName,
  type AnalyticsPayload
} from "@sinhon-os/analytics";
import type { CreateAnalyticsEventInput, ListAnalyticsFunnelQuery } from "@sinhon-os/schemas";
import type { SinhonPrismaClient } from "@sinhon-os/database";
import { ApiError } from "./api-errors.js";

type AnalyticsStore = Pick<SinhonPrismaClient, "coupleMember" | "eventLog" | "user">;

type AnalyticsServiceOptions = {
  now?: () => Date;
  prisma: SinhonPrismaClient;
};

type JsonInputValue =
  | boolean
  | number
  | string
  | JsonInputValue[]
  | { [key: string]: JsonInputValue | null };

function toInputJson(value: unknown): JsonInputValue {
  return JSON.parse(JSON.stringify(value)) as JsonInputValue;
}

function toDateTime(value: string | undefined, fallback: Date) {
  return value ? new Date(value) : fallback;
}

function buildRangeWhere(query: ListAnalyticsFunnelQuery) {
  return {
    occurredAt:
      query.from || query.to
        ? {
            gte: query.from ? new Date(query.from) : undefined,
            lte: query.to ? new Date(query.to) : undefined
          }
        : undefined,
    source: query.source
  };
}

function getPayload(input: CreateAnalyticsEventInput): AnalyticsPayload {
  return JSON.parse(JSON.stringify(input.payload ?? {})) as AnalyticsPayload;
}

function assertSafePayload(payload: Record<string, unknown>) {
  const inspection = inspectAnalyticsPayload(payload);

  if (!inspection.ok) {
    throw new ApiError("VALIDATION_ERROR", "분석 payload에 직접 개인정보를 저장할 수 없습니다.", {
      payload: [...inspection.blockedKeys, ...inspection.blockedValues]
    });
  }
}

async function assertCoupleAccess(store: AnalyticsStore, userId: string, coupleId: string) {
  const [member, user] = await Promise.all([
    store.coupleMember.findFirst({
      where: {
        coupleId,
        status: "active",
        userId
      }
    }),
    store.user.findFirst({
      where: {
        id: userId,
        status: "admin"
      }
    })
  ]);

  if (!member && !user) {
    throw new ApiError("FORBIDDEN", "해당 커플 이벤트를 저장할 수 없습니다.");
  }
}

async function createEvent(
  store: AnalyticsStore,
  input: {
    anonymousId?: string;
    coupleId?: string;
    eventName: AnalyticsEventName;
    occurredAt: Date;
    payload?: AnalyticsPayload;
    source: string;
    userId?: string;
  }
) {
  return store.eventLog.create({
    data: {
      anonymousId: input.anonymousId,
      coupleId: input.coupleId,
      eventName: input.eventName,
      occurredAt: input.occurredAt,
      payload: input.payload ? toInputJson(input.payload) : undefined,
      schemaVersion: 1,
      source: input.source,
      userId: input.userId
    }
  });
}

export function createAnalyticsService({
  now = () => new Date(),
  prisma
}: AnalyticsServiceOptions) {
  return {
    async getFunnel(_adminUserId: string, query: ListAnalyticsFunnelQuery) {
      const groupedEvents = await prisma.eventLog.groupBy({
        _count: {
          _all: true
        },
        by: ["eventName"],
        where: buildRangeWhere(query)
      });
      const countsByEventName = new Map(
        groupedEvents.map((row) => [row.eventName, row._count._all] as const)
      );

      return {
        funnel: analyticsFunnelSteps.map((eventName, index) => ({
          count: countsByEventName.get(eventName) ?? 0,
          eventName,
          step: index + 1
        }))
      };
    },

    async recordEvent(userId: string | undefined, input: CreateAnalyticsEventInput) {
      const payload = getPayload(input);

      assertSafePayload(payload);

      if (input.coupleId && !userId) {
        throw new ApiError("FORBIDDEN", "커플 이벤트는 로그인 후 저장할 수 있습니다.");
      }

      if (input.coupleId && userId) {
        await assertCoupleAccess(prisma, userId, input.coupleId);
      }

      const event = await createEvent(prisma, {
        anonymousId: input.anonymousId,
        coupleId: input.coupleId,
        eventName: input.eventName,
        occurredAt: toDateTime(input.occurredAt, now()),
        payload,
        source: input.source,
        userId
      });

      return {
        accepted: true,
        event: {
          eventName: event.eventName,
          id: event.id,
          occurredAt: event.occurredAt
        }
      };
    }
  };
}

export async function recordAnalyticsEventSafely(
  prisma: SinhonPrismaClient,
  input: {
    anonymousId?: string;
    coupleId?: string;
    eventName: AnalyticsEventName;
    payload?: AnalyticsPayload;
    source?: string;
    userId?: string;
  }
) {
  try {
    const payload = input.payload ?? {};

    assertSafePayload(payload);

    await createEvent(prisma, {
      anonymousId: input.anonymousId,
      coupleId: input.coupleId,
      eventName: input.eventName,
      occurredAt: new Date(),
      payload,
      source: input.source ?? "api",
      userId: input.userId
    });
  } catch {
    return;
  }
}

export type AnalyticsService = ReturnType<typeof createAnalyticsService>;
