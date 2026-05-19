/**
 * 캡션 텍스트에서 해시태그 추출.
 *
 *  - 한글/영문/숫자/언더스코어 허용
 *  - 길이 1~50자
 *  - 중복 제거 + 원래 등장 순서 유지
 *  - 결과는 lowercase 처리 (검색 일관성)
 *
 *  설계 메모
 *   - 인스타 캡션은 보통 "#a #b #c" 처럼 공백으로 구분되므로 conservative 한 규칙으로 충분.
 *   - URL 프래그먼트(`/#anchor`) 는 명시적으로 제외: # 앞이 `/` 또는 `?` 면 스킵.
 *   - `#x#y` 연속 패턴은 의도적으로 두 번째를 무시 (혼동 방지 — 인스타 본가도 보통 첫 글자만 인식).
 */
const TAG_RE = /(?<![\p{L}\p{N}_/?&=])#([\p{L}\p{N}_]{1,50})/gu;

export function parseHashtags(caption: string | null | undefined): string[] {
  if (!caption) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of caption.matchAll(TAG_RE)) {
    const t = m[1].toLowerCase();
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}
