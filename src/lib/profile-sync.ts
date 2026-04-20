"use client";

// useProfileSync — 로그인 감지 시 localStorage → 서버 자동 sync
// 사용법: MY 탭 또는 SessionProvider 하위 최상위 컴포넌트에서 한 번만 호출

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const SYNC_FLAG_KEY = "sinhon-synced-v1";

export function useProfileSync() {
  const { data: session, status } = useSession();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || hasSynced.current) return;

    // 이미 이번 세션에서 sync 완료면 스킵
    const alreadySynced = sessionStorage.getItem(SYNC_FLAG_KEY);
    if (alreadySynced) {
      hasSynced.current = true;
      return;
    }

    async function doSync() {
      try {
        // localStorage에서 snapshot 수집
        const profile = JSON.parse(
          localStorage.getItem("sinhon-profile-v1") ?? "null"
        );
        const checklist = JSON.parse(
          localStorage.getItem("sinhon-checklist-v1") ?? "null"
        );
        const budget = JSON.parse(
          localStorage.getItem("sinhon-budget-v1") ?? "null"
        );

        const payload = {
          profile: profile
            ? { ...profile, updatedAt: profile.updatedAt ?? Date.now() }
            : undefined,
          checklist: checklist ?? undefined,
          budget: budget ?? undefined,
        };

        const res = await fetch("/api/profile/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.warn("[profile-sync] sync 실패:", res.status);
          return;
        }

        const data = await res.json();

        // 서버 프로필이 더 최신이면 localStorage 덮어쓰기
        if (data.serverProfile) {
          const serverUpdatedAt = new Date(
            data.serverProfile.updatedAt
          ).getTime();
          const localUpdatedAt = profile?.updatedAt ?? 0;
          if (serverUpdatedAt > localUpdatedAt) {
            localStorage.setItem(
              "sinhon-profile-v1",
              JSON.stringify({
                stage: data.serverProfile.stage,
                region: data.serverProfile.region,
                interests: data.serverProfile.interests ?? [],
                partnerName: data.serverProfile.partnerName,
                weddingDate: data.serverProfile.weddingDate,
                completedAt: data.serverProfile.completedAt
                  ? new Date(data.serverProfile.completedAt).getTime()
                  : undefined,
                updatedAt: serverUpdatedAt,
                version: 1,
              })
            );
          }
        }

        sessionStorage.setItem(SYNC_FLAG_KEY, "1");
        hasSynced.current = true;
      } catch (err) {
        console.warn("[profile-sync] 오류:", err);
      }
    }

    doSync();
  }, [status, session]);
}
