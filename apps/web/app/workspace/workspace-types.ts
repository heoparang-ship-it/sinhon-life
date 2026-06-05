export type CurrentCoupleResponse = {
  couple: {
    displayName: string;
    id: string;
  } | null;
  member: WorkspaceMember | null;
};

export type WorkspaceMember = {
  displayLabel: string;
  id: string;
  role: string;
  userId: string;
};

export type CoupleMembersResponse = {
  members: WorkspaceMember[];
};

export type WorkspaceDocument = {
  attachmentFileLabel: string | null;
  attachmentProvider: string | null;
  createdAt: string;
  documentType: string;
  dueAt: string | null;
  hasAttachment: boolean;
  id: string;
  owner: WorkspaceMember | null;
  ownerCoupleMemberId: string | null;
  status: string;
  title: string;
  updatedAt: string;
};

export type WorkspaceTask = {
  assignedCoupleMemberId: string | null;
  assignedTo: WorkspaceMember | null;
  completedAt: string | null;
  createdAt: string;
  description: string | null;
  dueAt: string | null;
  id: string;
  status: string;
  title: string;
  updatedAt: string;
};

export type WorkspaceNotification = {
  body: string | null;
  channel: string;
  createdAt: string;
  id: string;
  readAt: string | null;
  scheduledAt: string | null;
  status: string;
  title: string;
  type: string;
};

export type DocumentsResponse = {
  documents: WorkspaceDocument[];
};

export type DocumentResponse = {
  document: WorkspaceDocument;
};

export type TasksResponse = {
  tasks: WorkspaceTask[];
};

export type TaskResponse = {
  task: WorkspaceTask;
};

export type NotificationsResponse = {
  notifications: WorkspaceNotification[];
};

export type NotificationResponse = {
  notification: WorkspaceNotification;
};
