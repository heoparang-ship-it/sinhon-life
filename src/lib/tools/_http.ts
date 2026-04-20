/**
 * 공공 API 호출용 fetch 래퍼 (Phase 3+에서 사용).
 * Phase 1에서는 참조만 되고 실제 호출은 없음.
 */

export interface HttpOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: unknown;
  /** 요청 타임아웃 (ms). 기본 10초. */
  timeoutMs?: number;
  /** 최대 재시도 횟수. 기본 2 (총 3번 시도). */
  maxRetries?: number;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public url: string,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * 공공 API 호출 공통 래퍼. Phase 3+에서 실제 활성화.
 * - AbortController 기반 타임아웃
 * - 5xx/429는 exponential backoff 재시도
 * - 4xx는 즉시 throw
 */
export async function httpJson<T = unknown>(
  url: string,
  opts: HttpOptions = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body, timeoutMs = 10_000, maxRetries = 2 } = opts;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        headers: { Accept: 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        return (await res.json()) as T;
      }

      // 4xx: don't retry
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        throw new HttpError(res.status, url, `HTTP ${res.status}: ${await res.text()}`);
      }

      lastError = new HttpError(res.status, url, `HTTP ${res.status}`);
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof HttpError && err.status < 500 && err.status !== 429) {
        throw err;
      }
      lastError = err;
    }

    if (attempt < maxRetries) {
      const delayMs = 2 ** attempt * 500; // 500, 1000, 2000
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  throw lastError ?? new Error(`httpJson failed for ${url}`);
}

/**
 * Kakao Local/Mobility 공통 헤더 빌더 (Phase 3+).
 */
export function buildKakaoHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `KakaoAK ${apiKey}`,
  };
}

/**
 * data.go.kr 엔드포인트 URL 빌더 — serviceKey + params (Phase 3+).
 */
export function buildDataGoKrUrl(
  base: string,
  serviceKey: string,
  params: Record<string, string | number>
): string {
  const usp = new URLSearchParams();
  usp.set('serviceKey', serviceKey);
  for (const [k, v] of Object.entries(params)) {
    usp.set(k, String(v));
  }
  return `${base}?${usp.toString()}`;
}
