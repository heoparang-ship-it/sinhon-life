"use client";

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PriceCard
} from "@sinhon-os/ui";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../../lib/api";
import type {
  CompareApproval,
  CompareCardSummary,
  CompareComment,
  CompareRoomDetailResponse,
  DecisionLogResponse
} from "../compare-room-types";

type CompareRoomDetailClientProps = {
  compareRoomId: string;
};

type PriceOption = {
  amount?: number;
  includedInEstimatedTotal?: boolean;
  key?: string;
  label: string;
  maxAmount?: number;
  minAmount?: number;
  note?: string;
  pricingType?: string;
};

type IncludedItem = string | { key?: string; label: string; quantity?: number; unit?: string };

const statusLabels: Record<string, string> = {
  archived: "보관됨",
  both_approved: "둘 다 승인",
  draft: "초안",
  rejected: "반려",
  shared: "검토 중",
  waiting_partner: "배우자 대기"
};

const approvalLabels: Record<string, string> = {
  approved: "승인",
  hold: "보류",
  pending: "대기",
  rejected: "반려"
};

const actionLabels: Record<string, string> = {
  add_compare_card: "비교 카드 추가",
  create_compare_comment: "댓글 작성",
  create_compare_room: "비교방 생성",
  refresh_compare_room_after_approval: "승인 상태 반영",
  refresh_compare_room_after_card_add: "카드 추가 반영",
  refresh_compare_room_after_card_remove: "카드 제거 반영",
  refresh_compare_room_after_create: "비교방 상태 확인",
  remove_compare_card: "비교 카드 제거",
  submit_approval: "승인 상태 제출",
  update_compare_room: "비교방 수정"
};

function formatDate(value: string | null) {
  if (!value) return "미기록";
  return new Date(value).toLocaleDateString("ko-KR");
}

function statusLabel(status: string) {
  return statusLabels[status] ?? status;
}

function approvalLabel(status: string) {
  return approvalLabels[status] ?? status;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeIncludedItems(value: unknown[]): IncludedItem[] {
  return value
    .map((item): IncludedItem | null => {
      if (typeof item === "string") return item;
      if (!isObject(item) || typeof item.label !== "string") return null;

      return {
        key: typeof item.key === "string" ? item.key : item.label,
        label: item.label,
        quantity: typeof item.quantity === "number" ? item.quantity : undefined,
        unit: typeof item.unit === "string" ? item.unit : undefined
      };
    })
    .filter((item): item is IncludedItem => Boolean(item));
}

function normalizeOptions(value: unknown[]): PriceOption[] {
  return value
    .map((item): PriceOption | null => {
      if (!isObject(item) || typeof item.label !== "string") return null;

      return {
        amount: typeof item.amount === "number" ? item.amount : undefined,
        includedInEstimatedTotal:
          typeof item.includedInEstimatedTotal === "boolean"
            ? item.includedInEstimatedTotal
            : undefined,
        key: typeof item.key === "string" ? item.key : item.label,
        label: item.label,
        maxAmount: typeof item.maxAmount === "number" ? item.maxAmount : undefined,
        minAmount: typeof item.minAmount === "number" ? item.minAmount : undefined,
        note: typeof item.note === "string" ? item.note : undefined,
        pricingType: typeof item.pricingType === "string" ? item.pricingType : "quote_required"
      };
    })
    .filter((item): item is PriceOption => Boolean(item));
}

function ApprovalPanel({ approvals }: { approvals: CompareApproval[] }) {
  return (
    <div className="compare-approval-list">
      {approvals.map((approval) => (
        <article className={`compare-approval-item ${approval.status}`} key={approval.userId}>
          <span className="offer-badge">{approval.isMine ? "나" : "배우자"}</span>
          <strong>{approval.displayLabel}</strong>
          <p>{approvalLabel(approval.status)}</p>
          {approval.comment ? <small>{approval.comment}</small> : null}
        </article>
      ))}
    </div>
  );
}

function CompareCardItem({
  card,
  disabled,
  onRemove
}: {
  card: CompareCardSummary;
  disabled: boolean;
  onRemove: (cardId: string) => void;
}) {
  return (
    <article className="compare-card-item">
      <PriceCard
        basePriceAmount={card.snapshotPriceSummary.basePrice}
        description={`${card.offer.vendor.name}${card.offer.region ? ` · ${card.offer.region}` : ""}`}
        estimatedTotalPriceAmount={card.snapshotPriceSummary.estimatedTotalPrice}
        includedItems={normalizeIncludedItems(card.snapshotIncludedItems)}
        optionalOptions={normalizeOptions(card.snapshotOptionalOptions)}
        requiredOptions={normalizeOptions(card.snapshotRequiredOptions)}
        sourceLabel="비교 시점 스냅샷"
        sourceUpdatedAt={card.snapshotPriceSummary.verifiedAt ?? undefined}
        title={card.snapshotTitle}
        validUntil={card.snapshotPriceSummary.validUntil ?? undefined}
        vendorName={card.offer.vendor.name}
        verificationStatus={card.snapshotPriceSummary.verificationStatus}
        verifiedAt={card.snapshotPriceSummary.verifiedAt ?? undefined}
      />
      <div className="compare-card-actions">
        <span className="offer-badge">v{card.snapshotPriceSummary.version}</span>
        <Link className="text-link" href={`/offers/${card.offerId}`}>
          상품 상세
        </Link>
        <Button disabled={disabled} onClick={() => onRemove(card.id)} type="button" variant="ghost">
          제거
        </Button>
      </div>
    </article>
  );
}

function CommentList({ comments }: { comments: CompareComment[] }) {
  if (!comments.length) {
    return <p className="muted-copy">아직 댓글이 없습니다.</p>;
  }

  return (
    <div className="compare-comment-list">
      {comments.map((comment) => (
        <article className="compare-comment-item" key={comment.id}>
          <span>
            <strong>{comment.displayLabel}</strong>
            <small>{formatDate(comment.createdAt)}</small>
          </span>
          <p>{comment.body}</p>
        </article>
      ))}
    </div>
  );
}

export function CompareRoomDetailClient({ compareRoomId }: CompareRoomDetailClientProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [decisionLogs, setDecisionLogs] = useState<DecisionLogResponse["logs"]>([]);
  const [detail, setDetail] = useState<CompareRoomDetailResponse | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function loadDetail(token: string) {
    const [roomDetail, logs] = await Promise.all([
      apiRequest<CompareRoomDetailResponse>(`/compare-rooms/${compareRoomId}`, {
        token
      }),
      apiRequest<DecisionLogResponse>(`/compare-rooms/${compareRoomId}/decision-logs`, {
        token
      })
    ]);
    setDetail(roomDetail);
    setDecisionLogs(logs.logs);
  }

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(storedToken);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const token = storedToken;

    async function load() {
      try {
        await loadDetail(token);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "비교방을 불러오지 못했습니다."
              })
        );
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [compareRoomId]);

  async function refreshAfterAction(token: string) {
    await loadDetail(token);
  }

  async function submitApproval(status: "approved" | "hold" | "rejected") {
    if (!accessToken) return;

    setError(null);
    setPendingAction(status);

    try {
      await apiRequest<CompareRoomDetailResponse>(`/compare-rooms/${compareRoomId}/approvals/me`, {
        body: {
          comment: approvalComment || undefined,
          status
        },
        method: "POST",
        token: accessToken
      });
      setApprovalComment("");
      await refreshAfterAction(accessToken);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "승인 상태를 저장하지 못했습니다."
            })
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function createComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !commentBody.trim()) return;

    setError(null);
    setPendingAction("comment");

    try {
      await apiRequest(`/compare-rooms/${compareRoomId}/comments`, {
        body: {
          body: commentBody
        },
        method: "POST",
        token: accessToken
      });
      setCommentBody("");
      await refreshAfterAction(accessToken);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "댓글을 저장하지 못했습니다."
            })
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function removeCard(cardId: string) {
    if (!accessToken) return;

    setError(null);
    setPendingAction(cardId);

    try {
      await apiRequest(`/compare-cards/${cardId}`, {
        method: "DELETE",
        token: accessToken
      });
      await refreshAfterAction(accessToken);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "비교 카드를 제거하지 못했습니다."
            })
      );
    } finally {
      setPendingAction(null);
    }
  }

  if (isLoading) {
    return <LoadingState description="비교방 상태를 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간에 로그인한 뒤 비교방을 확인할 수 있습니다."
        action={
          <Link className="button-link" href="/signup">
            가입 시작
          </Link>
        }
      />
    );
  }

  if (error && !detail) {
    return <ErrorState title="확인이 필요합니다" description={error.error.message} />;
  }

  if (!detail) {
    return (
      <EmptyState
        title="비교방을 찾을 수 없습니다"
        description="비교방 목록에서 다시 선택해 주세요."
        action={
          <Link className="button-link" href="/compare-rooms">
            비교방 목록
          </Link>
        }
      />
    );
  }

  const room = detail.compareRoom;
  const isFinal = room.status === "both_approved" || room.status === "archived";

  return (
    <div className="compare-detail-layout">
      {error ? <ErrorState title="확인이 필요합니다" description={error.error.message} /> : null}

      <section className="compare-detail-main" aria-label="비교 카드">
        <Card
          title={room.title}
          description={`${statusLabel(room.status)} · 상품 ${room.cardCount}개`}
        >
          <div className="metric-grid">
            <div className="metric-tile">
              <span>상품 수</span>
              <strong>{room.cardCount}/4</strong>
            </div>
            <div className="metric-tile">
              <span>배우자</span>
              <strong>{room.partnerStatus === "connected" ? "참여" : "대기"}</strong>
            </div>
            <div className="metric-tile">
              <span>상담 신청</span>
              <strong>{room.canRequestLead ? "가능" : "대기"}</strong>
            </div>
          </div>

          {room.partnerStatus === "waiting_partner" ? (
            <div className="notice-box" style={{ marginTop: 14 }}>
              배우자를 초대한 뒤 공동 승인을 받을 수 있습니다.
              <div className="action-row" style={{ marginTop: 10 }}>
                <Link className="button-link secondary-link" href="/invite">
                  초대 만들기
                </Link>
              </div>
            </div>
          ) : null}

          {!room.readiness.hasEnoughCards ? (
            <div className="notice-box" style={{ marginTop: 14 }}>
              승인하려면 상품을 2개 이상 담아야 합니다.
              <div className="action-row" style={{ marginTop: 10 }}>
                <Link className="button-link secondary-link" href="/offers">
                  상품 더 담기
                </Link>
              </div>
            </div>
          ) : null}

          {room.canRequestLead ? (
            <div className="notice-box" style={{ marginTop: 14 }}>
              둘 다 승인된 비교방입니다. 선택한 상품으로 상담 신청을 진행할 수 있습니다.
              <div className="action-row" style={{ marginTop: 10 }}>
                <Link className="button-link" href={`/compare-rooms/${compareRoomId}/lead-request`}>
                  상담 신청
                </Link>
              </div>
            </div>
          ) : null}
        </Card>

        <section className="compare-card-grid" aria-label="비교 상품 카드">
          {detail.cards.map((card) => (
            <CompareCardItem
              card={card}
              disabled={Boolean(pendingAction) || isFinal}
              key={card.id}
              onRemove={removeCard}
            />
          ))}
        </section>
      </section>

      <aside className="compare-side-panel" aria-label="승인과 댓글">
        <Card title="공동 승인" description="둘 다 승인하면 상담 신청 단계로 넘어갈 수 있습니다.">
          <ApprovalPanel approvals={detail.approvals} />
          <div className="form-stack" style={{ marginTop: 14 }}>
            <Input
              label="의견"
              onChange={(event) => setApprovalComment(event.target.value)}
              placeholder="결정 이유를 짧게 남겨 주세요"
              value={approvalComment}
            />
            <div className="action-row">
              <Button
                disabled={Boolean(pendingAction)}
                isLoading={pendingAction === "approved"}
                onClick={() => void submitApproval("approved")}
                type="button"
              >
                승인
              </Button>
              <Button
                disabled={Boolean(pendingAction)}
                isLoading={pendingAction === "hold"}
                onClick={() => void submitApproval("hold")}
                type="button"
                variant="secondary"
              >
                보류
              </Button>
              <Button
                disabled={Boolean(pendingAction)}
                isLoading={pendingAction === "rejected"}
                onClick={() => void submitApproval("rejected")}
                type="button"
                variant="danger"
              >
                반려
              </Button>
            </div>
          </div>
        </Card>

        <Card title="댓글" description="가격 조건이나 상담 전 확인할 내용을 남깁니다.">
          <form className="form-stack" onSubmit={createComment}>
            <Input
              label="댓글"
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder="확인할 내용을 입력해 주세요"
              value={commentBody}
            />
            <Button isLoading={pendingAction === "comment"} type="submit">
              댓글 남기기
            </Button>
          </form>
          <div style={{ marginTop: 16 }}>
            <CommentList comments={detail.comments} />
          </div>
        </Card>

        <Card title="결정 로그" description="누가 언제 어떤 상태를 남겼는지 확인합니다.">
          {decisionLogs.length ? (
            <div className="compare-log-list">
              {decisionLogs.slice(0, 8).map((log) => (
                <article className="compare-log-item" key={log.id}>
                  <strong>{actionLabels[log.action] ?? log.action}</strong>
                  <span>
                    {log.actorDisplayName} · {formatDate(log.createdAt)}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted-copy">아직 결정 로그가 없습니다.</p>
          )}
        </Card>
      </aside>
    </div>
  );
}
