"use client";

import { useState } from "react";
import { track } from "@/lib/analytics/track";

type Category = "sdm" | "venue" | "interior" | "goods" | "honeymoon";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "sdm", label: "스드메" },
  { value: "venue", label: "예식장" },
  { value: "interior", label: "인테리어" },
  { value: "goods", label: "혼수 가전·가구" },
  { value: "honeymoon", label: "신혼여행" },
];

const REGIONS = [
  { value: "incheon-bupyeong", label: "인천 부평" },
  { value: "incheon-songdo", label: "인천 송도" },
  { value: "incheon-etc", label: "인천(기타)" },
  { value: "etc", label: "기타" },
];

const VALUE_PROPS = [
  { num: "01", title: "성과형 송객", body: "리드 매칭 성사 시에만 수수료. 광고비 선납 X." },
  { num: "02", title: "결정의 순간 노출", body: "검색·광고 아님. AI가 '추천하는 자리'에 직접 노출." },
  { num: "03", title: "Choice Share 가시화", body: "비슷한 신혼이 무엇을 얼마에 선택했는지 함께 표시 — 전환율 ↑." },
  { num: "04", title: "하이퍼로컬", body: "부평·송도부터 시작. 지역 특화 신뢰." },
];

export function PartnersScreen() {
  const [companyName, setCompanyName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("incheon-bupyeong");
  const [categories, setCategories] = useState<Category[]>([]);
  const [volume, setVolume] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCat = (c: Category) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const canSubmit =
    companyName.trim().length > 0 &&
    representativeName.trim().length > 0 &&
    /^[0-9+\-\s()]{9,20}$/.test(phone.trim()) &&
    consent &&
    !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          representativeName: representativeName.trim(),
          contactPhone: phone.trim(),
          contactEmail: email.trim() || undefined,
          categories,
          region,
          monthlyVolume: volume ? Number(volume) : undefined,
          message: message.trim() || undefined,
          consent: true,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "접수 실패");
        setSubmitting(false);
        return;
      }
      track("partner_loi_submitted", { categories: categories.join(","), region });
      setDone(true);
    } catch {
      setError("네트워크 오류");
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main className="mx-auto min-h-[100dvh] max-w-[480px] bg-white px-5 pb-20 pt-20 text-center">
        <div className="text-[40px]">🤝</div>
        <h1 className="mt-3 text-[22px] font-extrabold leading-tight text-ink">
          입점 의향 접수했어요
        </h1>
        <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-mute">
          영업일 기준 2~3일 안에 입점 담당자가 연락드릴게요.
          <br />
          더 빠른 컨택을 원하시면 partners@sinhon.life 로 메일 주세요.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[100dvh] max-w-[480px] bg-white pb-[140px]">
      {/* Hero */}
      <section
        className="px-5 pb-8 pt-10"
        style={{
          background:
            "linear-gradient(180deg,#EAF3FB 0%,#F4F8FC 60%,#FFFFFF 100%)",
        }}
      >
        <div className="text-[10.5px] font-bold tracking-wide text-blue-deepest">
          SINHON.LIFE · PARTNERS
        </div>
        <h1 className="mt-2 text-[26px] font-extrabold leading-tight text-ink">
          부평·송도 신혼의 <span className="text-blue-deepest">결정 슬롯</span>에<br />
          노출되세요.
        </h1>
        <p className="mt-3 text-[14px] font-medium leading-relaxed text-ink-soft">
          광고가 아닙니다. <b className="text-ink">AI가 '추천하는 자리'</b>에 노출되어,
          <b className="text-ink"> 결정의 순간에</b> 매칭됩니다. 성과형 송객, 광고비 선납 없음.
        </p>
      </section>

      {/* Value Props */}
      <section className="grid grid-cols-2 gap-2.5 px-5 pt-2">
        {VALUE_PROPS.map((v) => (
          <div
            key={v.num}
            className="rounded-[16px] border border-[#E8EFF6] bg-white p-3.5"
          >
            <div className="text-[10px] font-bold tracking-wide text-blue-deepest">
              {v.num}
            </div>
            <div className="mt-1 text-[14px] font-extrabold leading-tight text-ink">
              {v.title}
            </div>
            <div className="mt-1 text-[11px] font-medium leading-snug text-mute">
              {v.body}
            </div>
          </div>
        ))}
      </section>

      {/* Form */}
      <section className="mt-7 px-5">
        <h2 className="text-[16px] font-extrabold text-ink">입점 의향 등록</h2>
        <p className="mt-1 text-[12px] font-medium text-mute">
          3분이면 끝나요. 제출 후 운영진이 직접 연락드려요.
        </p>

        <div className="mt-4 flex flex-col gap-2.5">
          <Field label="업체명 (필수)">
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              maxLength={80}
              placeholder="예: 부평 디어웨딩 스튜디오"
              className={inputCls}
            />
          </Field>
          <Field label="담당자명 (필수)">
            <input
              value={representativeName}
              onChange={(e) => setRepresentativeName(e.target.value)}
              maxLength={30}
              placeholder="홍길동"
              className={inputCls}
            />
          </Field>
          <Field label="연락처 (필수)">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              maxLength={20}
              placeholder="010-0000-0000"
              className={inputCls}
            />
          </Field>
          <Field label="이메일 (선택)">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              maxLength={120}
              placeholder="partner@example.com"
              className={inputCls}
            />
          </Field>
          <Field label="지역 (필수)">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={inputCls}
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="카테고리 (복수 선택 가능)">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const active = categories.includes(c.value);
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => toggleCat(c.value)}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition active:scale-[0.97] ${
                      active
                        ? "bg-blue-accent text-white"
                        : "border border-[#D8E5F0] bg-white text-ink-soft"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="월 평균 신혼 고객 수 (선택)">
            <input
              value={volume}
              onChange={(e) => setVolume(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              maxLength={6}
              placeholder="예: 20"
              className={inputCls}
            />
          </Field>
          <Field label="추가 메시지 (선택)">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="서비스·가격대·상담 가능 시간 등 자유롭게 적어 주세요."
              className={inputCls + " resize-none"}
            />
          </Field>
        </div>

        <label className="mt-3 flex items-start gap-1.5 text-[11px] font-medium leading-snug text-mute">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-blue-accent"
          />
          <span>
            개인정보 수집·이용 동의 (필수). 목적: 입점 검토 및 연락 / 항목: 업체명·담당자·연락처·이메일·메시지
            / 보유기간: 입점 완료 또는 거절 후 12개월 / 위탁: 없음
          </span>
        </label>

        {error && (
          <p className="mt-2 text-[12px] font-semibold text-[#D24A4A]">{error}</p>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="mt-3 w-full rounded-full py-3 text-[14px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(43,123,197,0.55)] transition disabled:opacity-40"
          style={{
            background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)",
          }}
        >
          {submitting ? "보내는 중…" : "입점 의향 보내기"}
        </button>
      </section>
    </main>
  );
}

const inputCls =
  "w-full rounded-[12px] border border-[#D8E5F0] bg-white px-3 py-2.5 text-[14px] font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#9CC7EA]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11.5px] font-bold text-ink-soft">{label}</div>
      {children}
    </label>
  );
}
