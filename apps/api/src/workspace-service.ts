import type {
  CompleteTaskInput,
  CreateDocumentInput,
  CreateTaskInput,
  ListDocumentsQuery,
  ListNotificationsQuery,
  ListTasksQuery,
  PrepareDocumentAttachmentInput,
  ReadNotificationInput,
  UpdateDocumentInput,
  UpdateTaskInput
} from "@sinhon-os/schemas";
import type { Prisma, SinhonPrismaClient } from "@sinhon-os/database";
import { ApiError } from "./api-errors.js";
import { recordAnalyticsEventSafely } from "./analytics-service.js";
import { sealSensitive } from "./sensitive-data.js";

type WorkspaceStore = Pick<
  SinhonPrismaClient,
  "coupleMember" | "decisionLog" | "document" | "notification" | "task"
>;

type WorkspaceServiceOptions = {
  now?: () => Date;
  prisma: SinhonPrismaClient;
};

type JsonInputValue =
  | boolean
  | number
  | string
  | JsonInputValue[]
  | { [key: string]: JsonInputValue | null };

const documentInclude = {
  owner: {
    include: {
      user: true
    }
  }
} satisfies Prisma.DocumentInclude;

const taskInclude = {
  assignedTo: {
    include: {
      user: true
    }
  }
} satisfies Prisma.TaskInclude;

const notificationInclude = {
  coupleMember: {
    include: {
      user: true
    }
  }
} satisfies Prisma.NotificationInclude;

const memberInclude = {
  user: true
} satisfies Prisma.CoupleMemberInclude;

type DocumentWithRelations = Prisma.DocumentGetPayload<{
  include: typeof documentInclude;
}>;

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: typeof taskInclude;
}>;

type NotificationWithRelations = Prisma.NotificationGetPayload<{
  include: typeof notificationInclude;
}>;

type CoupleMemberWithUser = Prisma.CoupleMemberGetPayload<{
  include: typeof memberInclude;
}>;

function toInputJson(value: unknown): JsonInputValue {
  return JSON.parse(JSON.stringify(value)) as JsonInputValue;
}

function parseDateTime(value: string | undefined) {
  return value ? new Date(value) : undefined;
}

function parseNullableDateTime(value: string | null | undefined) {
  if (value === null) return null;

  return parseDateTime(value);
}

function buildAttachmentRef(documentId: string, now: Date) {
  return `local-document-attachment:${documentId}:${now.getTime()}`;
}

function reminderTime(dueAt: Date, now: Date) {
  const twoDaysBefore = new Date(dueAt.getTime() - 2 * 24 * 60 * 60 * 1000);

  return twoDaysBefore.getTime() > now.getTime() ? twoDaysBefore : now;
}

function toMemberSummary(member: CoupleMemberWithUser | null | undefined) {
  if (!member) return null;

  return {
    displayLabel: member.displayLabel ?? member.user.displayName ?? "구성원",
    id: member.id,
    role: member.role,
    userId: member.userId
  };
}

function toDocumentResponse(document: DocumentWithRelations) {
  return {
    attachmentFileLabel: document.originalFileNameEncrypted ? "첨부 선택됨" : null,
    attachmentProvider: document.attachmentProvider,
    coupleId: document.coupleId,
    createdAt: document.createdAt,
    documentType: document.documentType,
    dueAt: document.dueAt,
    hasAttachment: Boolean(document.attachmentRefEncrypted),
    id: document.id,
    owner: toMemberSummary(document.owner),
    ownerCoupleMemberId: document.ownerCoupleMemberId,
    sourceId: document.sourceId,
    sourceType: document.sourceType,
    status: document.status,
    title: document.title,
    updatedAt: document.updatedAt
  };
}

function toTaskResponse(task: TaskWithRelations) {
  return {
    assignedCoupleMemberId: task.assignedCoupleMemberId,
    assignedTo: toMemberSummary(task.assignedTo),
    completedAt: task.completedAt,
    coupleId: task.coupleId,
    createdAt: task.createdAt,
    description: task.description,
    dueAt: task.dueAt,
    id: task.id,
    sourceId: task.sourceId,
    sourceType: task.sourceType,
    status: task.status,
    title: task.title,
    updatedAt: task.updatedAt
  };
}

function toNotificationResponse(notification: NotificationWithRelations) {
  return {
    body: notification.body,
    channel: notification.channel,
    coupleId: notification.coupleId,
    coupleMember: toMemberSummary(notification.coupleMember),
    coupleMemberId: notification.coupleMemberId,
    createdAt: notification.createdAt,
    id: notification.id,
    metadata: notification.metadata,
    readAt: notification.readAt,
    scheduledAt: notification.scheduledAt,
    sentAt: notification.sentAt,
    status: notification.status,
    title: notification.title,
    type: notification.type,
    userId: notification.userId
  };
}

async function assertActiveMember(store: WorkspaceStore, userId: string, coupleId: string) {
  const member = await store.coupleMember.findFirst({
    include: memberInclude,
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

async function getActiveMemberById(
  store: WorkspaceStore,
  coupleId: string,
  coupleMemberId: string
) {
  const member = await store.coupleMember.findFirst({
    include: memberInclude,
    where: {
      coupleId,
      id: coupleMemberId,
      status: "active"
    }
  });

  if (!member) {
    throw new ApiError("VALIDATION_ERROR", "담당자를 확인해 주세요.", {
      assignedCoupleMemberId: ["커플에 속한 활성 구성원만 지정할 수 있습니다."]
    });
  }

  return member;
}

async function resolveOptionalMember(
  store: WorkspaceStore,
  coupleId: string,
  coupleMemberId: string | null | undefined,
  fallbackMember: CoupleMemberWithUser
) {
  if (coupleMemberId === null) return null;
  if (!coupleMemberId) return fallbackMember;

  return getActiveMemberById(store, coupleId, coupleMemberId);
}

async function assertDocumentAccess(store: WorkspaceStore, userId: string, documentId: string) {
  const document = await store.document.findFirst({
    include: documentInclude,
    where: {
      deletedAt: null,
      id: documentId
    }
  });

  if (!document) {
    throw new ApiError("NOT_FOUND", "문서를 찾을 수 없습니다.");
  }

  const member = await assertActiveMember(store, userId, document.coupleId);

  return {
    document,
    member
  };
}

async function assertTaskAccess(store: WorkspaceStore, userId: string, taskId: string) {
  const task = await store.task.findFirst({
    include: taskInclude,
    where: {
      deletedAt: null,
      id: taskId
    }
  });

  if (!task) {
    throw new ApiError("NOT_FOUND", "할 일을 찾을 수 없습니다.");
  }

  const member = await assertActiveMember(store, userId, task.coupleId);

  return {
    member,
    task
  };
}

async function createDecisionLog(
  store: WorkspaceStore,
  options: {
    action: string;
    afterStatus?: string | null;
    beforeStatus?: string | null;
    coupleId: string;
    memberId: string;
    metadata?: Record<string, unknown>;
    targetId: string;
    targetType: string;
    userId: string;
  }
) {
  await store.decisionLog.create({
    data: {
      action: options.action,
      actorCoupleMemberId: options.memberId,
      actorUserId: options.userId,
      afterStatus: options.afterStatus,
      beforeStatus: options.beforeStatus,
      coupleId: options.coupleId,
      metadata: options.metadata ? toInputJson(options.metadata) : undefined,
      targetId: options.targetId,
      targetType: options.targetType
    }
  });
}

async function createDueNotification(
  store: WorkspaceStore,
  options: {
    assignedMember: CoupleMemberWithUser | null;
    body: string;
    coupleId: string;
    dueAt: Date | null | undefined;
    metadata: Record<string, unknown>;
    now: Date;
    title: string;
    type: string;
    userId: string;
  }
) {
  if (!options.dueAt) return;

  await store.notification.create({
    data: {
      body: options.body,
      channel: "in_app",
      coupleId: options.coupleId,
      coupleMemberId: options.assignedMember?.id,
      metadata: toInputJson(options.metadata),
      scheduledAt: reminderTime(options.dueAt, options.now),
      status: "scheduled",
      title: options.title,
      type: options.type,
      userId: options.assignedMember?.userId ?? options.userId
    }
  });
}

export type WorkspaceService = ReturnType<typeof createWorkspaceService>;

export function createWorkspaceService({
  now = () => new Date(),
  prisma
}: WorkspaceServiceOptions) {
  return {
    async completeTask(userId: string, taskId: string, input: CompleteTaskInput) {
      const result = await prisma.$transaction(async (tx) => {
        const { member, task } = await assertTaskAccess(tx, userId, taskId);
        const nowDate = now();
        const updated = await tx.task.update({
          data: {
            completedAt: input.completed ? nowDate : null,
            status: input.completed ? "done" : "open"
          },
          include: taskInclude,
          where: {
            id: task.id
          }
        });

        await createDecisionLog(tx, {
          action: input.completed ? "complete_task" : "reopen_task",
          afterStatus: updated.status,
          beforeStatus: task.status,
          coupleId: task.coupleId,
          memberId: member.id,
          targetId: task.id,
          targetType: "task",
          userId
        });

        return {
          task: toTaskResponse(updated)
        };
      });

      if (input.completed) {
        await recordAnalyticsEventSafely(prisma, {
          coupleId: result.task.coupleId,
          eventName: "task_completed",
          payload: {
            sourceType: result.task.sourceType,
            taskId
          },
          userId
        });
      }

      return result;
    },

    async createDocument(userId: string, coupleId: string, input: CreateDocumentInput) {
      return prisma.$transaction(async (tx) => {
        const member = await assertActiveMember(tx, userId, coupleId);
        const owner = await resolveOptionalMember(tx, coupleId, input.ownerCoupleMemberId, member);
        const dueAt = parseDateTime(input.dueAt);
        const document = await tx.document.create({
          data: {
            coupleId,
            documentType: input.documentType,
            dueAt,
            ownerCoupleMemberId: owner?.id,
            sourceId: input.sourceId,
            sourceType: input.sourceType,
            status: "needed",
            title: input.title
          },
          include: documentInclude
        });

        await createDecisionLog(tx, {
          action: "create_document",
          afterStatus: document.status,
          coupleId,
          memberId: member.id,
          targetId: document.id,
          targetType: "document",
          userId
        });

        await createDueNotification(tx, {
          assignedMember: owner,
          body: "마감일이 다가오면 문서 준비 상태를 확인해 주세요.",
          coupleId,
          dueAt,
          metadata: {
            documentId: document.id
          },
          now: now(),
          title: "문서 마감 알림",
          type: "document_due",
          userId
        });

        return {
          document: toDocumentResponse(document)
        };
      });
    },

    async createTask(userId: string, coupleId: string, input: CreateTaskInput) {
      return prisma.$transaction(async (tx) => {
        const member = await assertActiveMember(tx, userId, coupleId);
        const assignedMember = await resolveOptionalMember(
          tx,
          coupleId,
          input.assignedCoupleMemberId,
          member
        );
        const dueAt = parseDateTime(input.dueAt);
        const task = await tx.task.create({
          data: {
            assignedCoupleMemberId: assignedMember?.id,
            coupleId,
            createdByUserId: userId,
            description: input.description,
            dueAt,
            sourceId: input.sourceId,
            sourceType: input.sourceType,
            status: "open",
            title: input.title
          },
          include: taskInclude
        });

        await createDecisionLog(tx, {
          action: "create_task",
          afterStatus: task.status,
          coupleId,
          memberId: member.id,
          targetId: task.id,
          targetType: "task",
          userId
        });

        await createDueNotification(tx, {
          assignedMember,
          body: "마감일이 다가오면 할 일을 확인해 주세요.",
          coupleId,
          dueAt,
          metadata: {
            taskId: task.id
          },
          now: now(),
          title: "할 일 마감 알림",
          type: "task_due",
          userId
        });

        return {
          task: toTaskResponse(task)
        };
      });
    },

    async deleteDocument(userId: string, documentId: string) {
      return prisma.$transaction(async (tx) => {
        const { document, member } = await assertDocumentAccess(tx, userId, documentId);
        const deletedAt = now();

        await tx.document.update({
          data: {
            deletedAt
          },
          where: {
            id: document.id
          }
        });

        await createDecisionLog(tx, {
          action: "delete_document",
          beforeStatus: document.status,
          coupleId: document.coupleId,
          memberId: member.id,
          targetId: document.id,
          targetType: "document",
          userId
        });

        return {
          deletedAt,
          documentId: document.id
        };
      });
    },

    async deleteTask(userId: string, taskId: string) {
      return prisma.$transaction(async (tx) => {
        const { member, task } = await assertTaskAccess(tx, userId, taskId);
        const deletedAt = now();

        await tx.task.update({
          data: {
            deletedAt
          },
          where: {
            id: task.id
          }
        });

        await createDecisionLog(tx, {
          action: "delete_task",
          beforeStatus: task.status,
          coupleId: task.coupleId,
          memberId: member.id,
          targetId: task.id,
          targetType: "task",
          userId
        });

        return {
          deletedAt,
          taskId: task.id
        };
      });
    },

    async listCoupleMembers(userId: string, coupleId: string) {
      await assertActiveMember(prisma, userId, coupleId);
      const members = await prisma.coupleMember.findMany({
        include: memberInclude,
        orderBy: {
          createdAt: "asc"
        },
        where: {
          coupleId,
          status: "active"
        }
      });

      return {
        members: members.map((member) => toMemberSummary(member))
      };
    },

    async listDocuments(userId: string, coupleId: string, query: ListDocumentsQuery) {
      await assertActiveMember(prisma, userId, coupleId);
      const documents = await prisma.document.findMany({
        include: documentInclude,
        orderBy: [
          {
            dueAt: "asc"
          },
          {
            createdAt: "desc"
          }
        ],
        take: query.limit,
        where: {
          coupleId,
          deletedAt: null,
          sourceType: query.sourceType,
          status: query.status
        }
      });

      return {
        documents: documents.map(toDocumentResponse)
      };
    },

    async listNotifications(userId: string, query: ListNotificationsQuery) {
      const memberships = await prisma.coupleMember.findMany({
        select: {
          coupleId: true,
          id: true
        },
        where: {
          status: "active",
          userId
        }
      });
      const coupleIds = memberships.map((membership) => membership.coupleId);
      const coupleMemberIds = memberships.map((membership) => membership.id);
      const notifications = await prisma.notification.findMany({
        include: notificationInclude,
        orderBy: [
          {
            scheduledAt: "asc"
          },
          {
            createdAt: "desc"
          }
        ],
        take: query.limit,
        where: {
          OR: [
            {
              userId
            },
            {
              coupleMemberId: {
                in: coupleMemberIds
              }
            },
            {
              coupleId: {
                in: coupleIds
              }
            }
          ],
          status: query.status
        }
      });

      return {
        notifications: notifications.map(toNotificationResponse)
      };
    },

    async listTasks(userId: string, coupleId: string, query: ListTasksQuery) {
      const member = await assertActiveMember(prisma, userId, coupleId);
      const assignedCoupleMemberId =
        query.assignee === "me"
          ? member.id
          : query.assignee === "unassigned"
            ? null
            : query.assignee;

      const tasks = await prisma.task.findMany({
        include: taskInclude,
        orderBy: [
          {
            dueAt: "asc"
          },
          {
            createdAt: "desc"
          }
        ],
        take: query.limit,
        where: {
          assignedCoupleMemberId,
          coupleId,
          deletedAt: null,
          dueAt: query.dueBefore
            ? {
                lte: parseDateTime(query.dueBefore)
              }
            : undefined,
          status: query.status
        }
      });

      return {
        tasks: tasks.map(toTaskResponse)
      };
    },

    async prepareDocumentAttachment(
      userId: string,
      documentId: string,
      input: PrepareDocumentAttachmentInput
    ) {
      return prisma.$transaction(async (tx) => {
        const { document, member } = await assertDocumentAccess(tx, userId, documentId);
        const nowDate = now();
        const attachmentRef = buildAttachmentRef(document.id, nowDate);
        const updated = await tx.document.update({
          data: {
            attachmentProvider: "local_pending",
            attachmentRefEncrypted: sealSensitive(attachmentRef),
            originalFileNameEncrypted: sealSensitive(input.fileName),
            status: "attached"
          },
          include: documentInclude,
          where: {
            id: document.id
          }
        });

        await createDecisionLog(tx, {
          action: "prepare_document_attachment",
          afterStatus: updated.status,
          beforeStatus: document.status,
          coupleId: document.coupleId,
          memberId: member.id,
          metadata: {
            contentType: input.contentType,
            size: input.size
          },
          targetId: document.id,
          targetType: "document",
          userId
        });

        return {
          attachment: {
            attachmentRef,
            expiresAt: new Date(nowDate.getTime() + 15 * 60 * 1000),
            uploadUrl: null
          },
          document: toDocumentResponse(updated)
        };
      });
    },

    async readNotification(userId: string, notificationId: string, input: ReadNotificationInput) {
      const notification = await prisma.notification.findFirst({
        include: notificationInclude,
        where: {
          id: notificationId
        }
      });

      if (!notification) {
        throw new ApiError("NOT_FOUND", "알림을 찾을 수 없습니다.");
      }

      if (notification.userId !== userId && notification.coupleId) {
        await assertActiveMember(prisma, userId, notification.coupleId);
      } else if (notification.userId !== userId && !notification.coupleId) {
        throw new ApiError("FORBIDDEN", "알림에 접근할 수 없습니다.");
      }

      const updated = await prisma.notification.update({
        data: {
          readAt: input.read ? now() : null,
          status: input.read ? "read" : "scheduled"
        },
        include: notificationInclude,
        where: {
          id: notification.id
        }
      });

      return {
        notification: toNotificationResponse(updated)
      };
    },

    async updateDocument(userId: string, documentId: string, input: UpdateDocumentInput) {
      return prisma.$transaction(async (tx) => {
        const { document, member } = await assertDocumentAccess(tx, userId, documentId);
        const owner =
          input.ownerCoupleMemberId === undefined
            ? undefined
            : await resolveOptionalMember(tx, document.coupleId, input.ownerCoupleMemberId, member);
        const dueAt = parseNullableDateTime(input.dueAt);
        const updated = await tx.document.update({
          data: {
            dueAt,
            ownerCoupleMemberId: owner === undefined ? undefined : owner?.id,
            status: input.status,
            title: input.title
          },
          include: documentInclude,
          where: {
            id: document.id
          }
        });

        await createDecisionLog(tx, {
          action: "update_document",
          afterStatus: updated.status,
          beforeStatus: document.status,
          coupleId: document.coupleId,
          memberId: member.id,
          targetId: document.id,
          targetType: "document",
          userId
        });

        if (dueAt instanceof Date) {
          await createDueNotification(tx, {
            assignedMember: owner === undefined ? document.owner : owner,
            body: "마감일이 다가오면 문서 준비 상태를 확인해 주세요.",
            coupleId: document.coupleId,
            dueAt,
            metadata: {
              documentId: document.id
            },
            now: now(),
            title: "문서 마감 알림",
            type: "document_due",
            userId
          });
        }

        return {
          document: toDocumentResponse(updated)
        };
      });
    },

    async updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
      return prisma.$transaction(async (tx) => {
        const { member, task } = await assertTaskAccess(tx, userId, taskId);
        const assignedMember =
          input.assignedCoupleMemberId === undefined
            ? undefined
            : await resolveOptionalMember(tx, task.coupleId, input.assignedCoupleMemberId, member);
        const dueAt = parseNullableDateTime(input.dueAt);
        const completedAt =
          input.status === "done" ? (task.completedAt ?? now()) : input.status ? null : undefined;
        const updated = await tx.task.update({
          data: {
            assignedCoupleMemberId: assignedMember === undefined ? undefined : assignedMember?.id,
            completedAt,
            description: input.description,
            dueAt,
            status: input.status,
            title: input.title
          },
          include: taskInclude,
          where: {
            id: task.id
          }
        });

        await createDecisionLog(tx, {
          action: "update_task",
          afterStatus: updated.status,
          beforeStatus: task.status,
          coupleId: task.coupleId,
          memberId: member.id,
          targetId: task.id,
          targetType: "task",
          userId
        });

        if (dueAt instanceof Date) {
          await createDueNotification(tx, {
            assignedMember: assignedMember === undefined ? task.assignedTo : assignedMember,
            body: "마감일이 다가오면 할 일을 확인해 주세요.",
            coupleId: task.coupleId,
            dueAt,
            metadata: {
              taskId: task.id
            },
            now: now(),
            title: "할 일 마감 알림",
            type: "task_due",
            userId
          });
        }

        return {
          task: toTaskResponse(updated)
        };
      });
    }
  };
}
