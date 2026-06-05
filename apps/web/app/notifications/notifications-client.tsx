"use client";

import { Button, Card, EmptyState, ErrorState, LoadingState } from "@sinhon-os/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../lib/api";
import type {
  NotificationResponse,
  NotificationsResponse,
  WorkspaceNotification
} from "../workspace/workspace-types";

const statusLabels: Record<string, string> = {
  dismissed: "숨김",
  read: "읽음",
  scheduled: "예정",
  sent: "발송됨"
};

function formatDate(value: string | null) {
  if (!value) return "일정 없음";

  return new Date(value).toLocaleDateString("ko-KR");
}

function NotificationItem({
  isSaving,
  notification,
  onRead
}: {
  isSaving: boolean;
  notification: WorkspaceNotification;
  onRead: (notification: WorkspaceNotification, read: boolean) => void;
}) {
  const isRead = notification.status === "read";

  return (
    <article className={`workspace-list-item status-${notification.status}`}>
      <div className="workspace-item-main">
        <span className="workspace-badge">
          {statusLabels[notification.status] ?? notification.status}
        </span>
        <h3>{notification.title}</h3>
        <p>{formatDate(notification.scheduledAt)}</p>
        {notification.body ? <small>{notification.body}</small> : null}
      </div>
      <div className="workspace-item-actions compact">
        <Button
          isLoading={isSaving}
          onClick={() => onRead(notification, !isRead)}
          variant={isRead ? "secondary" : "primary"}
        >
          {isRead ? "안 읽음" : "읽음"}
        </Button>
      </div>
    </article>
  );
}

export function NotificationsClient() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<WorkspaceNotification[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadNotifications(token: string) {
    try {
      const response = await apiRequest<NotificationsResponse>("/notifications", {
        token
      });
      setNotifications(response.notifications);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "알림을 불러오지 못했습니다."
            })
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(storedToken);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    void loadNotifications(storedToken);
  }, []);

  async function readNotification(notification: WorkspaceNotification, read: boolean) {
    if (!accessToken) return;

    setSavingId(notification.id);
    setError(null);

    try {
      const updated = await apiRequest<NotificationResponse>(
        `/notifications/${notification.id}/read`,
        {
          body: {
            read
          },
          method: "PATCH",
          token: accessToken
        }
      );
      setNotifications((current) =>
        current.map((item) => (item.id === updated.notification.id ? updated.notification : item))
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "알림 상태를 바꾸지 못했습니다."
            })
      );
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading) {
    return <LoadingState description="알림을 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간에 로그인한 뒤 알림을 확인할 수 있습니다."
        action={
          <Link className="button-link" href="/signup">
            가입 시작
          </Link>
        }
      />
    );
  }

  return (
    <div className="workspace-layout">
      {error ? <ErrorState title="확인이 필요합니다" description={error.error.message} /> : null}

      <Card title="마감 알림" description="문서와 할 일 일정 기준으로 저장된 알림입니다.">
        <div className="action-row">
          <Link className="button-link secondary-link" href="/documents">
            문서함
          </Link>
          <Link className="button-link secondary-link" href="/tasks">
            할 일
          </Link>
        </div>
      </Card>

      {notifications.length ? (
        <section className="workspace-list" aria-label="알림 목록">
          {notifications.map((notification) => (
            <NotificationItem
              isSaving={savingId === notification.id}
              key={notification.id}
              notification={notification}
              onRead={readNotification}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          title="알림이 없습니다"
          description="마감일이 있는 문서나 할 일을 만들면 알림이 저장됩니다."
          action={
            <Link className="button-link" href="/tasks">
              할 일 만들기
            </Link>
          }
        />
      )}
    </div>
  );
}
