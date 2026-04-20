"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Moon, Info, Shield, Trash2, ExternalLink } from "lucide-react";
import { ListRow, Toggle, Divider, Button, Modal, useToast } from "@/components/ui";

const PROFILE_KEY = "sinhon-profile-v1";
const SETTINGS_KEY = "sinhon-settings-v1";

interface Settings {
  pushEnabled: boolean;
  darkMode: boolean;
  reduceMotion: boolean;
}
const DEFAULT_SETTINGS: Settings = {
  pushEnabled: false,
  darkMode: false,
  reduceMotion: false,
};

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * /my/settings — push, display, data, about. All preferences are local.
 */
export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => setS(loadSettings()), []);

  const update = (patch: Partial<Settings>) => {
    const next = { ...s, ...patch };
    setS(next);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {
      /* storage full / denied — silent */
    }
  };

  const resetAll = () => {
    [
      PROFILE_KEY,
      SETTINGS_KEY,
      "sinhon-saved-policies-v1",
      "sinhon-liked-policies-v1",
      "sinhon-search-recent-v1",
      "sinhon-checklist-v1",
      "sinhon-budget-v1",
    ].forEach((k) => localStorage.removeItem(k));
    toast.show({ kind: "success", message: "모든 데이터를 초기화했어요" });
    setConfirmOpen(false);
    setTimeout(() => router.replace("/onboarding"), 800);
  };

  return (
    <main className="min-h-screen bg-paper-alt pb-2xl">
      <div className="sticky top-0 z-nav bg-paper-alt/95 backdrop-blur border-b border-paper-line">
        <div className="flex items-center gap-xs px-md py-sm">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로"
            className="p-xs -ml-xs rounded-full hover:bg-paper-line/60"
          >
            <ArrowLeft className="h-5 w-5 text-ink" />
          </button>
          <h1 className="text-subtitle font-semibold text-ink">설정</h1>
        </div>
      </div>

      <section className="mt-md">
        <h2 className="px-md pb-2xs text-caption font-medium text-ink-soft">알림</h2>
        <div className="bg-paper-surface border-y border-paper-line">
          <ListRow
            leading={<Bell className="h-4 w-4 text-ink-muted" />}
            title="푸시 알림"
            subtitle="새 정책·만료 전 공고 알림"
            trailing={
              <Toggle
                checked={s.pushEnabled}
                onChange={(e) => update({ pushEnabled: e.target.checked })}
                aria-label="푸시 알림 토글"
              />
            }
            chevron={false}
          />
        </div>
      </section>

      <section className="mt-md">
        <h2 className="px-md pb-2xs text-caption font-medium text-ink-soft">화면</h2>
        <div className="bg-paper-surface border-y border-paper-line">
          <ListRow
            leading={<Moon className="h-4 w-4 text-ink-muted" />}
            title="저녁 모드"
            subtitle="디스플레이 색상 반전 (준비 중)"
            trailing={
              <Toggle
                checked={s.darkMode}
                onChange={(e) => update({ darkMode: e.target.checked })}
                aria-label="저녁 모드 토글"
              />
            }
            chevron={false}
          />
          <ListRow
            leading={<Moon className="h-4 w-4 text-ink-muted" />}
            title="모션 줄이기"
            subtitle="멀미·집중력 민감 사용자용"
            trailing={
              <Toggle
                checked={s.reduceMotion}
                onChange={(e) => update({ reduceMotion: e.target.checked })}
                aria-label="모션 줄이기 토글"
              />
            }
            chevron={false}
          />
        </div>
      </section>

      <section className="mt-md">
        <h2 className="px-md pb-2xs text-caption font-medium text-ink-soft">정보</h2>
        <div className="bg-paper-surface border-y border-paper-line">
          <ListRow
            leading={<Info className="h-4 w-4 text-ink-muted" />}
            title="서비스 소개"
            href="/guide"
          />
          <ListRow
            leading={<Shield className="h-4 w-4 text-ink-muted" />}
            title="개인정보 처리방침"
            href="/privacy"
          />
          <ListRow
            leading={<ExternalLink className="h-4 w-4 text-ink-muted" />}
            title="문의 · 제휴"
            subtitle="heoparang@gmail.com"
            href="mailto:heoparang@gmail.com"
          />
        </div>
      </section>

      <Divider className="my-lg" />

      <section className="px-md">
        <Button
          variant="destructive"
          fullWidth
          onClick={() => setConfirmOpen(true)}
          leftIcon={<Trash2 className="h-4 w-4" />}
        >
          모든 데이터 초기화
        </Button>
        <p className="mt-xs text-caption text-ink-muted text-center">
          프로필·저장·체크리스트·가계부가 삭제되고 온보딩으로 돌아갑니다.
        </p>
      </section>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="정말 초기화할까요?">
        <p className="text-body text-ink-soft mb-md">
          이 작업은 되돌릴 수 없어요. 저장한 정책·체크리스트·가계부 기록이 모두 사라집니다.
        </p>
        <div className="flex gap-xs justify-end">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            취소
          </Button>
          <Button variant="destructive" onClick={resetAll}>
            초기화
          </Button>
        </div>
      </Modal>
    </main>
  );
}
