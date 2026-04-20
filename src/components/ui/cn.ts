/**
 * Tiny className joiner. We do not pull clsx/classnames to stay inside
 * the RFP §9.3 bundle budget (≤90KB gzipped over baseline).
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
