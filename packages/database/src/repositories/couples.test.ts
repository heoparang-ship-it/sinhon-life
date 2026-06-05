import { describe, expect, it, vi } from "vitest";
import { createCoupleRepository, type CoupleRepositoryClient } from "./couples";

describe("createCoupleRepository", () => {
  it("queries active couples by user membership", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const client = {
      couple: {
        findMany
      },
      decisionLog: {
        create: vi.fn()
      }
    } as unknown as CoupleRepositoryClient;

    const repository = createCoupleRepository(client);
    await repository.listActiveForUser("user-1");

    expect(findMany).toHaveBeenCalledWith({
      orderBy: {
        updatedAt: "desc"
      },
      where: {
        deletedAt: null,
        members: {
          some: {
            status: "active",
            userId: "user-1"
          }
        }
      }
    });
  });

  it("records append-only decision logs", async () => {
    const create = vi.fn().mockResolvedValue({ id: "decision-1" });
    const client = {
      couple: {
        findFirst: vi.fn(),
        findMany: vi.fn()
      },
      decisionLog: {
        create
      }
    } as unknown as CoupleRepositoryClient;

    const repository = createCoupleRepository(client);
    await repository.recordDecision({
      action: "approve",
      afterStatus: "approved",
      coupleId: "couple-1",
      targetId: "00000000-0000-4000-8000-000000000001",
      targetType: "compare_room"
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        action: "approve",
        afterStatus: "approved",
        coupleId: "couple-1",
        targetId: "00000000-0000-4000-8000-000000000001",
        targetType: "compare_room"
      }
    });
  });
});
