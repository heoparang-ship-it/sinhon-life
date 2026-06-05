"use client";

import { Button, Card, EmptyState, ErrorState, Input, LoadingState, Select } from "@sinhon-os/ui";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../lib/api";
import type {
  CoupleMembersResponse,
  CurrentCoupleResponse,
  TaskResponse,
  TasksResponse,
  WorkspaceMember,
  WorkspaceTask
} from "../workspace/workspace-types";

type TaskForm = {
  assignedCoupleMemberId: string;
  description: string;
  dueAt: string;
  title: string;
};

const statusLabels: Record<string, string> = {
  canceled: "취소",
  done: "완료",
  in_progress: "진행 중",
  open: "열림"
};

function formatDate(value: string | null) {
  if (!value) return "마감일 없음";

  return new Date(value).toLocaleDateString("ko-KR");
}

function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

function memberOptions(members: WorkspaceMember[]) {
  return members.map((member) => ({
    label: member.displayLabel,
    value: member.id
  }));
}

function TaskItem({
  isSaving,
  onComplete,
  task
}: {
  isSaving: boolean;
  onComplete: (task: WorkspaceTask, completed: boolean) => void;
  task: WorkspaceTask;
}) {
  const isDone = task.status === "done";

  return (
    <article className={`workspace-list-item status-${task.status}`}>
      <div className="workspace-item-main">
        <span className="workspace-badge">{statusLabels[task.status] ?? task.status}</span>
        <h3>{task.title}</h3>
        <p>
          {task.assignedTo?.displayLabel ?? "담당자 미지정"} · {formatDate(task.dueAt)}
        </p>
        {task.description ? <small>{task.description}</small> : null}
      </div>
      <div className="workspace-item-actions compact">
        <Button
          isLoading={isSaving}
          onClick={() => onComplete(task, !isDone)}
          variant={isDone ? "secondary" : "primary"}
        >
          {isDone ? "다시 열기" : "완료"}
        </Button>
      </div>
    </article>
  );
}

export function TasksClient() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [couple, setCouple] = useState<CurrentCoupleResponse["couple"]>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [form, setForm] = useState<TaskForm>({
    assignedCoupleMemberId: "",
    description: "",
    dueAt: "",
    title: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);

  async function loadWorkspace(token: string) {
    try {
      const currentCouple = await apiRequest<CurrentCoupleResponse>("/couples/current", {
        token
      });
      setCouple(currentCouple.couple);

      if (!currentCouple.couple) return;

      const [memberList, taskList] = await Promise.all([
        apiRequest<CoupleMembersResponse>(`/couples/${currentCouple.couple.id}/members`, {
          token
        }),
        apiRequest<TasksResponse>(`/couples/${currentCouple.couple.id}/tasks`, {
          token
        })
      ]);
      setMembers(memberList.members);
      setTasks(taskList.tasks);
      setForm((current) => ({
        ...current,
        assignedCoupleMemberId: memberList.members[0]?.id ?? ""
      }));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "할 일을 불러오지 못했습니다."
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

    void loadWorkspace(storedToken);
  }, []);

  function updateForm(key: keyof TaskForm, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !couple) return;

    setError(null);
    setIsSaving(true);

    try {
      const created = await apiRequest<TaskResponse>(`/couples/${couple.id}/tasks`, {
        body: {
          assignedCoupleMemberId: form.assignedCoupleMemberId || undefined,
          description: form.description || undefined,
          dueAt: toIsoDateTime(form.dueAt),
          title: form.title
        },
        method: "POST",
        token: accessToken
      });
      setTasks((current) => [created.task, ...current]);
      setForm((current) => ({
        ...current,
        description: "",
        dueAt: "",
        title: ""
      }));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "할 일을 만들지 못했습니다."
            })
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function completeTask(task: WorkspaceTask, completed: boolean) {
    if (!accessToken) return;

    setSavingId(task.id);
    setError(null);

    try {
      const updated = await apiRequest<TaskResponse>(`/tasks/${task.id}/complete`, {
        body: {
          completed
        },
        method: "POST",
        token: accessToken
      });
      setTasks((current) => current.map((item) => (item.id === task.id ? updated.task : item)));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "할 일 상태를 바꾸지 못했습니다."
            })
      );
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading) {
    return <LoadingState description="할 일을 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간에 로그인한 뒤 할 일을 사용할 수 있습니다."
        action={
          <Link className="button-link" href="/signup">
            가입 시작
          </Link>
        }
      />
    );
  }

  if (!couple) {
    return (
      <EmptyState
        title="커플 공간이 필요합니다"
        description="커플 공간을 만든 뒤 준비 작업을 관리할 수 있습니다."
        action={
          <Link className="button-link" href="/signup">
            커플 공간 만들기
          </Link>
        }
      />
    );
  }

  return (
    <div className="workspace-layout">
      {error ? <ErrorState title="확인이 필요합니다" description={error.error.message} /> : null}

      <Card title="할 일 추가" description={couple.displayName}>
        <form className="workspace-form-grid" onSubmit={createTask}>
          <Input
            label="할 일"
            onChange={(event) => updateForm("title", event.target.value)}
            required
            value={form.title}
          />
          <Select
            label="담당자"
            onChange={(event) => updateForm("assignedCoupleMemberId", event.target.value)}
            options={memberOptions(members)}
            value={form.assignedCoupleMemberId}
          />
          <Input
            label="마감일"
            onChange={(event) => updateForm("dueAt", event.target.value)}
            type="datetime-local"
            value={form.dueAt}
          />
          <Input
            label="메모"
            onChange={(event) => updateForm("description", event.target.value)}
            value={form.description}
          />
          <Button isLoading={isSaving} type="submit">
            할 일 만들기
          </Button>
          <Link className="button-link secondary-link" href="/notifications">
            알림 보기
          </Link>
        </form>
      </Card>

      {tasks.length ? (
        <section className="workspace-list" aria-label="할 일 목록">
          {tasks.map((task) => (
            <TaskItem
              isSaving={savingId === task.id}
              key={task.id}
              onComplete={completeTask}
              task={task}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          title="할 일이 없습니다"
          description="정책 결과에서 서류 할 일을 만들거나 직접 할 일을 추가해 주세요."
          action={
            <Link className="button-link" href="/policies">
              정책 확인
            </Link>
          }
        />
      )}
    </div>
  );
}
