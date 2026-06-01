export function krw(amount: number, suffix = true): string {
  const v = Math.round(amount || 0);
  return v.toLocaleString("ko-KR") + (suffix ? "원" : "");
}

export function formatAmountInput(value: string | number): string {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits).toLocaleString("ko-KR") : "";
}

export function parseAmountInput(value: string | number): number {
  return Number(String(value ?? "").replace(/[^\d]/g, "")) || 0;
}

export function krwHangul(n: number): string {
  const v = Math.abs(Math.round(Number(n) || 0));
  if (v === 0) return "";
  if (v >= 100_000_000) {
    const eok = v / 100_000_000;
    const trimmed = v % 100_000_000 === 0 ? eok.toFixed(0) : eok.toFixed(1).replace(/\.0$/, "");
    return `약 ${trimmed}억원`;
  }
  if (v >= 10_000) {
    const man = Math.floor(v / 10_000);
    return `약 ${man.toLocaleString("ko-KR")}만원`;
  }
  return "";
}

export function formatLedgerDate(date: string): string {
  const d = new Date(date + "T00:00:00");
  const week = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 · ${week}`;
}
