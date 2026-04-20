"use client";

// AuthCard — MY 탭 최상단 로그인/로그아웃/탈퇴 카드
// 비로그인: 카카오 로그인 CTA (노란 그라디언트)
// 로그인: 닉네임 + 프로필 이미지 + 로그아웃 + 탈퇴

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Sparkles, LogOut, Trash2, Loader2 } from "lucide-react";
import { useProfileSync } from "@/lib/profile-sync";

export default function AuthCard() {
  const { data: session, status } = useSession();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 로그인 직후 localStorage → 서버 자동 sync
  useProfileSync();

  // ──────────────────────────────────────────────
  // 로딩 상태
  // ──────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="mx-4 mb-5 rounded-3xl p-5 bg-warm-surface flex items-center justify-center h-24">
        <Loader2 size={20} className="animate-spin text-warm-muted" />
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // 비로그인: 카카오 CTA
  // ──────────────────────────────────────────────
  if (status === "unauthenticated") {
    return (
      <div className="mx-4 mb-5 rounded-3xl p-5 bg-gradient-to-br from-[#FEE500] via-[#FFE98C] to-[#FFF6C8] border border-[#EFC900] relative overflow-hidden">
        <span
          aria-hidden
          className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/40"
        />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-mono uppercase tracking-wider text-[#3A2C00] font-bold">
            <Sparkles size={12} />
            Member · benefits
          </div>
          <h3 className="font-serif text-[20px] font-semibold text-[#2a1a10] tracking-tightest leading-snug mb-2 wb-keep">
            카카오로 가입하면 모두 열려요
          </h3>
          <ul className="text-[12.5px] text-[#3A2C00] leading-relaxed mb-4 space-y-0.5">
            <li>• 부부 프로필·결혼일 클라우드 동기화</li>
            <li>• 체크리스트·가계부 두 기기에서 공유</li>
            <li>• 맞춤 정책 마감 D-day 카톡 알림</li>
          </ul>
          <button
            onClick={() => signIn("kakao")}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#3C1E1E] text-[#FEE500] text-[13px] font-bold rounded-full active:scale-[0.97] transition"
          >
            카카오로 3초 가입하기
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // 로그인 상태: 계정 정보 카드
  // ──────────────────────────────────────────────
  const { nickname, profileImage, email } = session!.user;

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setIsDeleting(true);
    try {
      await fetch("/api/account/delete", { method: "DELETE" });
      await signOut({ callbackUrl: "/" });
    } catch {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-4 mb-5 rounded-3xl p-5 bg-warm-surface border border-warm-border">
      <div className="flex items-center gap-3 mb-4">
        {profileImage ? (
          <Image
            src={profileImage}
            alt={nickname ?? "프로필"}
            width={44}
            height={44}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-coral-100 flex items-center justify-center text-coral-600 font-bold text-sm">
            {(nickname ?? "?")[0]}
          </div>
        )}
        <div>
          <p className="font-semibold text-warm-text text-[15px]">
            {nickname ?? "사용자"}
          </p>
          {email && (
            <p className="text-warm-muted text-[12px] font-mono">{email}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-warm-border text-warm-muted text-[12px] font-medium hover:bg-warm-bg active:scale-[0.97] transition"
        >
          <LogOut size={13} />
          로그아웃
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[12px] font-medium active:scale-[0.97] transition ${
            deleteConfirm
              ? "border-red-300 text-red-500 bg-red-50"
              : "border-warm-border text-warm-muted hover:bg-warm-bg"
          }`}
        >
          {isDeleting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Trash2 size={13} />
          )}
          {deleteConfirm ? "정말 탈퇴할까요?" : "탈퇴"}
        </button>
      </div>

      {deleteConfirm && (
        <p className="text-[11px] text-warm-muted mt-2 leading-relaxed">
          탈퇴하면 체크리스트·가계부 데이터가 30일 후 삭제됩니다.
          <br />
          버튼을 한 번 더 누르면 탈퇴가 진행됩니다.
        </p>
      )}
    </div>
  );
}
