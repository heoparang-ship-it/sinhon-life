/**
 * Instagram Graph API 얇은 클라이언트.
 *
 * 엔드포인트는 두 가지만 쓴다:
 *   1) GET /{ig-user-id}/media     — 내 미디어 리스트 (썸네일/비디오 URL 포함)
 *   2) GET /refresh_access_token   — Long-Lived Token 자동 갱신 (50일 이내면 새 토큰)
 *
 * 인스타 비즈/크리에이터 계정 + Long-Lived User Access Token 전제.
 * 토큰은 60일 유효. cron 으로 매주 갱신 시도.
 */

export type IGMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";

export interface IGMedia {
  id: string;
  media_type: IGMediaType;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

export interface IGMediaResponse {
  data: IGMedia[];
  paging?: { cursors?: { before?: string; after?: string }; next?: string };
}

const FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_url",
  "thumbnail_url",
  "permalink",
  "timestamp",
].join(",");

function ensureFullUrl(graphVersion: string, path: string): string {
  return `https://graph.instagram.com/${graphVersion}${path}`;
}

export async function fetchMyMedia(opts: {
  graphVersion: string;
  igUserId: string;
  accessToken: string;
  limit: number;
}): Promise<IGMedia[]> {
  const url = new URL(
    ensureFullUrl(opts.graphVersion, `/${encodeURIComponent(opts.igUserId)}/media`)
  );
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("limit", String(opts.limit));
  url.searchParams.set("access_token", opts.accessToken);

  // Cloudflare Workers fetch — Meta 가 CF-* 헤더에 민감해서 cf 옵션으로 최소화
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "User-Agent": "facebookexternalua",
    },
  } as RequestInit);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IG /media ${res.status}: ${text.slice(0, 400)}`);
  }
  const body = (await res.json()) as IGMediaResponse;
  return body.data ?? [];
}

/**
 * Long-Lived Token 자동 갱신.
 * 인스타 정책상 발급일로부터 24h 이후 ~ 만료 전 사이에 호출하면
 * 동일 권한의 새 60일 토큰을 발급한다.
 * 응답: { access_token, token_type: "bearer", expires_in: <초> }
 */
export interface IGRefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function refreshLongLivedToken(opts: {
  graphVersion: string;
  accessToken: string;
}): Promise<IGRefreshResponse> {
  const url = new URL(ensureFullUrl(opts.graphVersion, `/refresh_access_token`));
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", opts.accessToken);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IG /refresh_access_token ${res.status}: ${text.slice(0, 400)}`);
  }
  return (await res.json()) as IGRefreshResponse;
}
