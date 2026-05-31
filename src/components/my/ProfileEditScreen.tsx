"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { T } from "@/lib/design/tokens";
import { useUserProfile, type Region } from "@/lib/profile/useUserProfile";

const REGIONS: { value: Region; label: string }[] = [
  { value: "incheon-bupyeong", label: "인천 부평" },
  { value: "incheon-songdo", label: "인천 송도" },
  { value: "incheon-etc", label: "인천 그 외" },
];

export function ProfileEditScreen() {
  const router = useRouter();
  const { profile, hydrated, update } = useUserProfile();
  const [userNickname, setUserNickname] = useState("");
  const [partnerNickname, setPartnerNickname] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [region, setRegion] = useState<Region | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setUserNickname(profile.userNickname ?? "");
    setPartnerNickname(profile.partnerNickname ?? "");
    setWeddingDate(profile.weddingDate ?? "");
    setRegion(profile.region);
  }, [hydrated, profile.userNickname, profile.partnerNickname, profile.weddingDate, profile.region]);

  const onSave = () => {
    update({
      userNickname: userNickname.trim() || null,
      partnerNickname: partnerNickname.trim() || null,
      weddingDate: weddingDate || null,
      region,
    });
    setSaved(true);
    setTimeout(() => router.push("/my"), 600);
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: T.white,
        fontFamily: T.font,
        color: T.ink,
        paddingBottom: 140,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "54px 16px 16px",
          background: T.white,
          borderBottom: `1px solid ${T.hairline}`,
        }}
      >
        <Link
          href="/my"
          aria-label="뒤로"
          style={{
            display: "inline-flex",
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            color: T.ink,
          }}
        >
          <ChevronLeft size={22} />
        </Link>
        <h1 style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em" }}>내 정보</h1>
      </header>

      <section style={{ padding: "22px 22px 0" }}>
        <Field label="내 닉네임">
          <input
            value={userNickname}
            onChange={(e) => setUserNickname(e.target.value)}
            maxLength={20}
            placeholder="예: 신랑"
            style={inputStyle}
          />
        </Field>

        <Field label="파트너 닉네임">
          <input
            value={partnerNickname}
            onChange={(e) => setPartnerNickname(e.target.value)}
            maxLength={20}
            placeholder="예: 신부"
            style={inputStyle}
          />
        </Field>

        <Field label="예식 예정일">
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="거주(예정) 지역">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {REGIONS.map((r) => {
              const active = region === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRegion(r.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                    border: active ? "none" : `1px solid ${T.hairline}`,
                    background: active ? T.accentDeep : T.white,
                    color: active ? T.white : T.inkSoft,
                    cursor: "pointer",
                    fontFamily: T.font,
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </Field>

        <button
          type="button"
          onClick={onSave}
          disabled={saved}
          style={{
            marginTop: 28,
            width: "100%",
            height: 52,
            border: "none",
            borderRadius: 14,
            background: saved ? "#6FB1EA" : T.accentDeep,
            color: T.white,
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            cursor: saved ? "default" : "pointer",
            fontFamily: T.font,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {saved && <Check size={18} />}
          {saved ? "저장됐어요" : "저장하기"}
        </button>

        <p style={{ marginTop: 14, fontSize: 11.5, color: T.mute, lineHeight: 1.55 }}>
          이 정보는 이 기기에만 저장돼요. 추후 카카오 계정과 연동되면 둘이서 함께 쓸 수 있게 돼요.
        </p>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid #E2EBF3",
  background: "#F8FAFC",
  fontSize: 15,
  color: T.ink,
  fontFamily: T.font,
  outline: "none",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: T.inkSoft,
          letterSpacing: "-0.01em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
