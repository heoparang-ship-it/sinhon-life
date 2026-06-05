"use client";

import { Button, Card, EmptyState, ErrorState, Input, LoadingState, Select } from "@sinhon-os/ui";
import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../lib/api";
import type {
  CoupleMembersResponse,
  CurrentCoupleResponse,
  DocumentResponse,
  DocumentsResponse,
  WorkspaceDocument,
  WorkspaceMember
} from "../workspace/workspace-types";

type DocumentForm = {
  documentType: string;
  dueAt: string;
  ownerCoupleMemberId: string;
  title: string;
};

const statusOptions = [
  { label: "필요", value: "needed" },
  { label: "준비 중", value: "preparing" },
  { label: "준비됨", value: "ready" },
  { label: "첨부됨", value: "attached" },
  { label: "제출됨", value: "submitted" },
  { label: "만료", value: "expired" }
];

const statusLabels: Record<string, string> = Object.fromEntries(
  statusOptions.map((option) => [option.value, option.label])
);

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

function DocumentItem({
  document,
  isSaving,
  members,
  onAttach,
  onStatusChange
}: {
  document: WorkspaceDocument;
  isSaving: boolean;
  members: WorkspaceMember[];
  onAttach: (document: WorkspaceDocument, file: File) => void;
  onStatusChange: (document: WorkspaceDocument, status: string) => void;
}) {
  function attach(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    onAttach(document, file);
  }

  return (
    <article className={`workspace-list-item status-${document.status}`}>
      <div className="workspace-item-main">
        <span className="workspace-badge">{statusLabels[document.status] ?? document.status}</span>
        <h3>{document.title}</h3>
        <p>
          {document.documentType} · {document.owner?.displayLabel ?? "담당자 미지정"} ·{" "}
          {formatDate(document.dueAt)}
        </p>
        {document.hasAttachment ? <small>첨부 선택됨</small> : null}
      </div>
      <div className="workspace-item-actions">
        <Select
          label="상태"
          onChange={(event) => onStatusChange(document, event.target.value)}
          options={statusOptions}
          value={document.status}
        />
        <label className="file-button">
          첨부 선택
          <input accept=".pdf,.jpg,.jpeg,.png,.heic" onChange={attach} type="file" />
        </label>
        <Select
          disabled
          label="담당자"
          options={memberOptions(members)}
          value={document.ownerCoupleMemberId ?? ""}
        />
        {isSaving ? <span className="workspace-saving">저장 중</span> : null}
      </div>
    </article>
  );
}

export function DocumentsClient() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [couple, setCouple] = useState<CurrentCoupleResponse["couple"]>(null);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [form, setForm] = useState<DocumentForm>({
    documentType: "manual",
    dueAt: "",
    ownerCoupleMemberId: "",
    title: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadWorkspace(token: string) {
    try {
      const currentCouple = await apiRequest<CurrentCoupleResponse>("/couples/current", {
        token
      });
      setCouple(currentCouple.couple);

      if (!currentCouple.couple) return;

      const [memberList, documentList] = await Promise.all([
        apiRequest<CoupleMembersResponse>(`/couples/${currentCouple.couple.id}/members`, {
          token
        }),
        apiRequest<DocumentsResponse>(`/couples/${currentCouple.couple.id}/documents`, {
          token
        })
      ]);
      setMembers(memberList.members);
      setDocuments(documentList.documents);
      setForm((current) => ({
        ...current,
        ownerCoupleMemberId: memberList.members[0]?.id ?? ""
      }));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "문서함을 불러오지 못했습니다."
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

  function updateForm(key: keyof DocumentForm, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function createDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !couple) return;

    setError(null);
    setIsSaving(true);

    try {
      const created = await apiRequest<DocumentResponse>(`/couples/${couple.id}/documents`, {
        body: {
          documentType: form.documentType,
          dueAt: toIsoDateTime(form.dueAt),
          ownerCoupleMemberId: form.ownerCoupleMemberId || undefined,
          title: form.title
        },
        method: "POST",
        token: accessToken
      });
      setDocuments((current) => [created.document, ...current]);
      setForm((current) => ({
        ...current,
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
              message: "문서를 만들지 못했습니다."
            })
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function updateDocumentStatus(document: WorkspaceDocument, status: string) {
    if (!accessToken) return;

    setSavingId(document.id);
    setError(null);

    try {
      const updated = await apiRequest<DocumentResponse>(`/documents/${document.id}`, {
        body: {
          status
        },
        method: "PATCH",
        token: accessToken
      });
      setDocuments((current) =>
        current.map((item) => (item.id === updated.document.id ? updated.document : item))
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "문서 상태를 바꾸지 못했습니다."
            })
      );
    } finally {
      setSavingId(null);
    }
  }

  async function attachDocument(document: WorkspaceDocument, file: File) {
    if (!accessToken) return;

    setSavingId(document.id);
    setError(null);

    try {
      const updated = await apiRequest<DocumentResponse>(
        `/documents/${document.id}/attachments/presign`,
        {
          body: {
            contentType: file.type || "application/octet-stream",
            fileName: file.name,
            size: file.size
          },
          method: "POST",
          token: accessToken
        }
      );
      setDocuments((current) =>
        current.map((item) => (item.id === updated.document.id ? updated.document : item))
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "첨부 선택을 저장하지 못했습니다."
            })
      );
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading) {
    return <LoadingState description="문서함을 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간에 로그인한 뒤 문서함을 사용할 수 있습니다."
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
        description="커플 공간을 만든 뒤 문서 상태를 관리할 수 있습니다."
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

      <Card title="문서 추가" description={couple.displayName}>
        <form className="workspace-form-grid" onSubmit={createDocument}>
          <Input
            label="문서명"
            onChange={(event) => updateForm("title", event.target.value)}
            required
            value={form.title}
          />
          <Input
            label="문서 종류"
            onChange={(event) => updateForm("documentType", event.target.value)}
            required
            value={form.documentType}
          />
          <Select
            label="담당자"
            onChange={(event) => updateForm("ownerCoupleMemberId", event.target.value)}
            options={memberOptions(members)}
            value={form.ownerCoupleMemberId}
          />
          <Input
            label="마감일"
            onChange={(event) => updateForm("dueAt", event.target.value)}
            type="datetime-local"
            value={form.dueAt}
          />
          <Button isLoading={isSaving} type="submit">
            문서 만들기
          </Button>
          <Link className="button-link secondary-link" href="/tasks">
            할 일 보기
          </Link>
        </form>
      </Card>

      {documents.length ? (
        <section className="workspace-list" aria-label="문서 목록">
          {documents.map((document) => (
            <DocumentItem
              document={document}
              isSaving={savingId === document.id}
              key={document.id}
              members={members}
              onAttach={attachDocument}
              onStatusChange={updateDocumentStatus}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          title="준비 중인 문서가 없습니다"
          description="정책 결과에서 서류 할 일을 만들거나 직접 문서를 추가해 주세요."
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
