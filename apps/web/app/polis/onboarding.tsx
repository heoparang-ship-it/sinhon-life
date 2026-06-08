"use client";

import { useState } from "react";
import { INTERESTS, REGIONS, STAGES, type Profile } from "./profile-store";

export function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [step, setStep] = useState(0);
  const [region, setRegion] = useState("");
  const [stage, setStage] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [name, setName] = useState("");

  const total = 5;
  const canNext =
    step === 0 ||
    (step === 1 && !!region) ||
    (step === 2 && !!stage) ||
    (step === 3 && interests.length > 0) ||
    (step === 4 && name.trim().length > 0);

  function next() {
    if (!canNext) return;
    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    onDone({
      region,
      stage,
      interests,
      name: name.trim() || "나",
      onboardedAt: new Date().toISOString(),
      partner: null
    });
  }

  function toggleInterest(v: string) {
    setInterests((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  return (
    <div className="ob-shell">
      <div className="ob-top">
        <button
          className="ob-back"
          type="button"
          aria-label="이전"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          style={{ visibility: step === 0 ? "hidden" : "visible" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="ob-prog">
          <i style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>
      </div>

      <div className="ob-body">
        {step === 0 && (
          <div className="ob-welcome">
            <div className="ob-logo">
              <span className="mk big" />
            </div>
            <h1>
              신혼,
              <br />
              시작은 <b>혜택부터</b>
            </h1>
            <p>
              전세대출부터 청약, 출산지원까지,
              <br />
              나에게 맞는 정책을 두리AI가 모아드려요.
            </p>
            <div className="ob-pills">
              <span className="ob-pill">버팀목 전세 1.5%</span>
              <span className="ob-pill">첫만남 200만원</span>
              <span className="ob-pill">신생아 특례 5억</span>
              <span className="ob-pill">결혼축하금 100만원</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="ob-step">
            <span className="ob-kicker">STEP 1 지역</span>
            <h2>
              어느 동네에
              <br />
              사시나요?
            </h2>
            <p className="ob-sub">지역마다 결혼, 출산 축하금이 크게 달라요.</p>
            <div className="ob-chips">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`ob-chip${region === r ? " on" : ""}`}
                  onClick={() => setRegion(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="ob-step">
            <span className="ob-kicker">STEP 2 혼인</span>
            <h2>
              결혼은
              <br />
              언제 하셨어요?
            </h2>
            <p className="ob-sub">신혼 혜택은 보통 혼인 7년 이내가 기준이에요.</p>
            <div className="ob-chips">
              {STAGES.map((s) => (
                <button
                  key={s.v}
                  type="button"
                  className={`ob-chip${stage === s.v ? " on" : ""}`}
                  onClick={() => setStage(s.v)}
                >
                  {s.emoji} {s.v}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="ob-step">
            <span className="ob-kicker">STEP 3 관심사</span>
            <h2>
              지금 가장
              <br />
              궁금한 건 뭐예요?
            </h2>
            <p className="ob-sub">여러 개 골라도 좋아요. 골라준 만큼 정확해져요.</p>
            <div className="ob-chips">
              {INTERESTS.map((it) => (
                <button
                  key={it.v}
                  type="button"
                  className={`ob-chip${interests.includes(it.v) ? " on" : ""}`}
                  onClick={() => toggleInterest(it.v)}
                >
                  {it.emoji} {it.v}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="ob-step">
            <span className="ob-kicker">STEP 4 이름</span>
            <h2>
              어떻게
              <br />
              불러드릴까요?
            </h2>
            <p className="ob-sub">혼자 시작해요. 파트너는 나중에 초대할 수 있어요.</p>
            <input
              className="ob-input"
              type="text"
              placeholder="예: 지민"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={16}
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="ob-cta">
        <button className="btn-cta" type="button" disabled={!canNext} onClick={next}>
          {step === total - 1 ? "시작하기" : "다음"}
        </button>
      </div>
    </div>
  );
}
