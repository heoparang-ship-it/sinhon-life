"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Heart,
  ChevronRight,
  Compass,
  MessageCircle,
  CheckSquare,
  Wallet,
  ExternalLink,
  Settings,
  Mail,
  Bell,
  Shield,
  RotateCcw,
} from "lucide-react";
import Eyebrow from "@/components/design/Eyebrow";
import ProfileHero from "@/components/my/ProfileHero";
import EditProfileModal from "@/components/my/EditProfileModal";
import MenuGroup, { type MenuItem } from "@/components/my/MenuGroup";
import AuthCard from "@/components/my/AuthCard";
import { BRAND, POLICIES } from "@/lib/constants";
import { getSavedIds } from "@/lib/storage";
import {
  getProfile,
  getGreetingName,
  hasCompletedOnboarding,
  resetProfile,
  type Profile,
} from "@/lib/profile";
import { useCoupleProfile } from "@/lib/design/useCoupleProfile";

const STAGE_LABEL: Record<string, string> = {
  planning: "결혼 준비 중",
  newly: "신혼부부",
  parenting: "임신·출산·육아",
};
const REGION_LABEL: Record<string, string> = {
  seoul: "서울",
  incheon: "인천",
  gyeonggi: "경기",
  busan: "부산",
  daegu: "대구",
  etc: "그 외",
};
const INTEREST_LABEL: Record<string, string> = {
  housing: "신혼집·청약",
  finance: "절약·재테크",
  tax: "세금·연말정산",
  baby: "출산·육아",
  wedding: "예식·스드메",
  honeymoon: "신혼여행",
};

export default function MyPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { partnerA, partnerB, marriageDate, update, ready } = useCoupleProfile();

  useEffect(() => {
    setSavedIds(getSavedIds());
    setProfile(getProfile());
    setOnboarded(hasCompletedOnboarding());
    setMounted(true);
  }, []);

  const savedPolicies = useMemo(
    () => POLICIES.filter((p) => savedIds.includes(p.slug)),
    [savedIds],
  );

  const greetingName = profile ? getGreetingName(profile) : "";

  const handleResetProfile = () => {
    if (confirm("프로필을 초기화할까요? 다시 온보딩을 진행해야 해요.")) {
      resetProfile();
      setProfile(null);
      setOnboarded(false);
    }
  };

  const exploreMenu: MenuItem[] = [
    { icon: <Compass size={17} className="text-coral-500" />, label: "혜택 탐색", href: "/explore" },
    { icon: <CheckSquare size={17} className="text-mint-700" />, label: "결혼 체크리스트", href: "/checklist", right: "18항목" },
    { icon: <Wallet size={17} className="text-coral-700" />, label: "부부 가계부", href: "/budget", right: "베타" },
    { icon: <MessageCircle size={17} className="text-ink" />, label: "AI톡에게 물어보기", href: "/chat" },
  ];

  const communityMenu: MenuItem[] = [
    { icon: <ExternalLink size={17} className="text-[#B08400]" />, label: "카카오톡 오픈채팅", href: BRAND.kakaoLink, external: true },
    { icon: <Heart size={17} className="text-coral-500" />, label: "인스타그램 팔로우", href: BRAND.instagram, external: true },
  ];

  const profileMenu: MenuItem[] = [
    {
      icon: <Settings size={17} className="text-ink-soft" />,
      label: onboarded ? "관심사·지역 수정" : "30초 온보딩 시작",
      href: "/onboarding?next=/my",
    },
    onboarded
      ? {
          icon: <RotateCcw size={17} className="text-ink-soft" />,
          label: "프로필 초기화",
          onClick: handleResetProfile,
        }
      : null,
  ].filter(Boolean) as MenuItem[];

  const settingsMenu: MenuItem[] = [
    { icon: <Bell size={17} className="text-ink-soft" />, label: "알림 (준비중)", right: "soon" },
    { icon: <Shield size={17} className="text-ink-soft" />, label: "개인정보 처리방침", href: "/privacy" },
    { icon: <Shield size={17} className="text-ink-soft" />, label: "이용약관", href: "/terms" },
    { icon: <Mail size={17} className="text-ink-soft" />, label: "문의: sinhon.life@gmail.com", href: "mailto:sinhon.life@gmail.com" },
  ];

  return (
    <div className="pt-6 pb-24">
      <div className="px-5 mb-5">
        <Eyebrow tone="coral">my space</Eyebrow>
        <h1 className="font-serif text-[28px] leading-tight tracking-tightest text-ink mt-1 wb-keep">
          우리 둘의 작은 사무실
        </h1>
        <p className="text-[13px] text-ink-muted mt-1">
          부부 프로필·저장한 혜택·체크리스트까지 한 곳에서.
        </p>
      </div>

      {ready && (
        <ProfileHero
          partnerA={partnerA}
          partnerB={partnerB}
          marriageDate={marriageDate}
          onEdit={() => setEditOpen(true)}
        />
      )}

      <AuthCard />

      {mounted && onboarded && profile && (
        <div className="mx-4 mb-5 p-4 rounded-2xl bg-paper-surface border border-paper-line">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10.5px] font-mono uppercase tracking-wider text-ink-muted font-bold mb-1">
                profile · {greetingName}
              </div>
              <h3 className="font-serif text-[16px] font-semibold text-ink tracking-tight">
                지금 맞춤 정렬 기준
              </h3>
            </div>
            <Link
              href="/onboarding?next=/my"
              className="text-[11px] text-coral-700 font-bold active:scale-95"
            >
              수정
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.stage && (
              <span className="text-[11px] font-bold text-coral-700 bg-coral-50 px-2.5 py-1 rounded-lg">
                {STAGE_LABEL[profile.stage]}
              </span>
            )}
            {profile.region && (
              <span className="text-[11px] font-bold text-mint-700 bg-mint-50 px-2.5 py-1 rounded-lg">
                📍 {REGION_LABEL[profile.region]}
              </span>
            )}
            {profile.interests.slice(0, 3).map((i) => (
              <span
                key={i}
                className="text-[11px] font-medium text-ink bg-paper px-2.5 py-1 rounded-lg border border-paper-line"
              >
                {INTEREST_LABEL[i] || i}
              </span>
            ))}
            {profile.interests.length > 3 && (
              <span className="text-[11px] font-medium text-ink-muted bg-paper px-2.5 py-1 rounded-lg">
                +{profile.interests.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {savedPolicies.length > 0 && (
        <div className="mx-4 mb-5">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Heart size={13} className="text-coral-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted font-bold">
              saved · {savedPolicies.length}
            </span>
          </div>
          <div className="bg-paper-surface border border-paper-line rounded-2xl overflow-hidden">
            {savedPolicies.slice(0, 5).map((p, i) => (
              <Link
                key={p.slug}
                href={`/policy/${p.slug}`}
                className={`flex items-center gap-3 px-4 py-3 active:bg-paper transition ${
                  i !== 0 ? "border-t border-paper-line" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13.5px] font-semibold text-ink tracking-tight truncate">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-1">
                    {p.summary}
                  </p>
                </div>
                <ChevronRight size={14} className="text-ink-muted flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <MenuGroup title="우리 둘 공간" items={exploreMenu} />
      <MenuGroup title="커뮤니티" items={communityMenu} />
      <MenuGroup title="프로필" items={profileMenu} />
      <MenuGroup title="설정" items={settingsMenu} />

      <div className="text-center mt-6 mb-2 space-y-1">
        <p className="text-[11px] text-ink-muted font-mono">신혼생활 v3.1 reskin</p>
        <p className="text-[10px] text-ink-muted">문의: sinhon.life@gmail.com</p>
      </div>

      <EditProfileModal
        open={editOpen}
        initialPartnerA={partnerA}
        initialPartnerB={partnerB}
        initialMarriageDate={marriageDate}
        onClose={() => setEditOpen(false)}
        onSave={(data) => update(data)}
      />
    </div>
  );
}
