/**
 * 공공 API 응답 in-memory TTL 캐시 (Phase 3+).
 * Phase 1에서는 참조만 되고 실제 캐싱은 없음.
 *
 * Next.js serverless 환경에서는 cold start마다 새로 만들어지므로 완벽한 캐시는 아니지만,
 * warm instance 안에서는 동일 질문 반복 호출을 충분히 막아준다.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/** 기본 TTL: 15분 */
const DEFAULT_TTL_MS = 15 * 60 * 1_000;

/** 최대 엔트리 수 — 초과 시 가장 오래된 것부터 제거 */
const MAX_ENTRIES = 500;

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
  if (store.size >= MAX_ENTRIES) {
    // evict oldest — Map preserves insertion order
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) store.delete(oldestKey);
  }
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** 디버깅/테스트용 전체 비움 */
export function cacheClear(): void {
  store.clear();
}

export function cacheStats(): { size: number; maxEntries: number } {
  return { size: store.size, maxEntries: MAX_ENTRIES };
}

/**
 * 편의 함수: getOrFetch — 캐시에 있으면 즉시 반환, 없으면 fetcher 실행 후 저장.
 */
export async function getOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<{ value: T; cacheHit: boolean }> {
  const cached = cacheGet<T>(key);
  if (cached !== null) return { value: cached, cacheHit: true };
  const value = await fetcher();
  cacheSet(key, value, ttlMs);
  return { value, cacheHit: false };
}
