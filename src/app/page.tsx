import type { Metadata } from "next";
import Script from "next/script";
import TopSearchBar from "@/components/TopSearchBar";
import PersonalizedHome from "@/components/PersonalizedHome";
import { POLICIES, HUB_CATEGORIES } from "@/lib/constants";

const SITE_URL = "https://sinhon.life";

export const metadata: Metadata = {
  title: "신혼생활 — 신혼부부·신랑신부를 위한 2026 정책·혜택 AI 플랫폼",
  description:
    "신혼생활은 대한민국 신혼부부·예비부부·신랑신부가 결혼·신혼집·출산·세금까지 꼭 챙겨야 할 2026 정부 지원금을 AI가 맞춤으로 안내하는 신혼 전용 플랫폼입니다. 신혼부부 특공·전세대출·출산지원금·부모급여를 3초만에 확인하세요.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "신혼생활 — 신혼부부·신랑신부를 위한 2026 정책·혜택 AI 플랫폼",
    description:
      "신혼부부·신랑신부가 받을 수 있는 2026년 전국 정책·혜택을 AI가 30초 진단으로 맞춤 안내합니다.",
    url: SITE_URL,
    type: "website",
  },
};

// 홈 페이지용 FAQ 구조화 데이터 (리치 스니펫 타깃: "신혼부부", "신혼생활" 검색)
const HOME_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: "신혼생활 — 신혼부부 정책·혜택 AI 상담 플랫폼",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "ko-KR",
      description:
        "신혼부부, 신랑, 신부를 위한 2026 정부 지원 정책·혜택 AI 상담 서비스. 청약, 전세대출, 출산지원금, 부모급여, 연말정산을 한 번에.",
      primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/icon-1024.png` },
      datePublished: "2026-01-01",
      dateModified: new Date().toISOString(),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "신혼생활이란 어떤 서비스인가요?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "신혼생활(sinhon.life)은 대한민국 신혼부부·예비부부·신랑·신부가 결혼부터 신혼집, 출산, 육아, 세금까지 꼭 챙겨야 할 정부·지자체 지원 정책을 AI가 맞춤으로 알려주는 전국 유일의 신혼 전용 플랫폼입니다. 회원가입 없이 30초 진단으로 내 상황에 맞는 혜택을 바로 확인할 수 있습니다.",
          },
        },
        {
          "@type": "Question",
          name: "신혼부부가 꼭 받아야 할 혜택은 무엇인가요?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "2026년 기준 신혼부부가 꼭 챙겨야 할 대표 혜택은 ① 신혼부부 특별공급(새 아파트 우선 배정), ② 신생아 특공(소득 무관 100% 추첨), ③ 버팀목·신생아 특례 전세대출(연 1.1%~), ④ 첫만남이용권 200만원, ⑤ 부모급여 월 100만원, ⑥ 혼인신고 세액공제입니다.",
          },
        },
        {
          "@type": "Question",
          name: "신랑·신부가 결혼 전에 해야 할 금융 준비는?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "혼인신고 전이라도 청약통장 가입·유지, 신혼부부 전세대출 자격 확인, 맞벌이 소득 기준 점검, 연말정산 공제 전략, 지자체별 결혼장려금 확인을 추천드립니다. 신혼생활 AI에게 물어보면 커플 상황에 맞춰 순서를 정리해줍니다.",
          },
        },
        {
          "@type": "Question",
          name: "신혼생활은 무료인가요?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "네. 신혼생활의 모든 정책 정보와 AI 맞춤 상담은 무료입니다. 회원가입·로그인도 필요 없습니다.",
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <div className="pb-4">
      {/* 검색 엔진용 시맨틱 헤더 (시각적으로도 읽히게 hidden-accessible 구성) */}
      <header className="sr-only">
        <h1>신혼생활 — 신혼부부·신랑신부를 위한 2026 정책·혜택 AI 상담 플랫폼</h1>
        <p>
          대한민국 신혼부부, 예비부부, 신랑, 신부가 결혼 준비부터 신혼집, 출산,
          육아, 세금까지 꼭 챙겨야 할 정부·지자체 지원 정책·혜택을 AI가 맞춤으로
          안내합니다. 신혼부부 특공, 신생아 특공, 버팀목·디딤돌 대출, 첫만남이용권,
          부모급여, 연말정산 혜택을 3초 만에 확인하세요.
        </p>
      </header>

      <TopSearchBar />
      <PersonalizedHome />

      {/* SEO용 크롤러 친화 콘텐츠 섹션 — 핵심 키워드를 자연스럽게 배치 */}
      <section
        aria-label="신혼생활 서비스 소개"
        className="px-5 pt-6 pb-10 space-y-6 border-t border-warm-border/40 mt-8"
      >
        <div className="space-y-3">
          <h2 className="text-[15px] font-extrabold text-warm-text">
            신혼생활이 신혼부부·신랑신부에게 필요한 이유
          </h2>
          <p className="text-[12px] leading-[1.8] text-warm-text-secondary">
            결혼과 신혼생활은 인생에서 돈이 가장 많이 드는 시기입니다. 그런데
            신혼부부가 받을 수 있는 지원금·세액공제·특별공급은 정부·지자체·은행에
            흩어져 있어 챙기기 어렵습니다. <strong>신혼생활(sinhon.life)</strong>은
            신랑·신부가 꼭 알아야 할 2026 신혼부부 정책을 AI가 한 번에 정리해
            알려주는 대한민국 대표 신혼 플랫폼입니다. 회원가입 없이 30초 진단으로
            내 상황에 맞는 혜택만 골라 드립니다.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[15px] font-extrabold text-warm-text">
            신혼부부가 가장 많이 찾는 6개 허브
          </h2>
          <ul className="grid grid-cols-2 gap-2 text-[12px]">
            {HUB_CATEGORIES.map((hub) => (
              <li key={hub.id}>
                <a
                  href={`/category/${hub.id}`}
                  className="block bg-white border border-warm-border rounded-lg px-3 py-2 hover:shadow-sm"
                >
                  <span aria-hidden className="mr-1.5">
                    {hub.emoji}
                  </span>
                  <strong className="font-bold text-warm-text">{hub.title}</strong>
                  <span className="block text-[11px] text-warm-text-muted mt-0.5">
                    {hub.subtitle}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-[15px] font-extrabold text-warm-text">
            신혼부부·신랑신부가 많이 검색하는 2026년 혜택
          </h2>
          <ul className="space-y-1.5 text-[12px] text-warm-text-secondary leading-[1.7]">
            {POLICIES.slice(0, 8).map((p) => (
              <li key={p.slug} className="flex gap-1.5">
                <span className="text-coral">·</span>
                <a
                  href={`/policy/${p.slug}`}
                  className="hover:text-coral hover:underline"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-[15px] font-extrabold text-warm-text">
            자주 묻는 질문
          </h2>
          <details className="bg-white border border-warm-border rounded-lg p-3">
            <summary className="text-[13px] font-bold cursor-pointer">
              신혼생활은 어떤 서비스인가요?
            </summary>
            <p className="text-[12px] text-warm-text-secondary mt-2 leading-[1.7]">
              신혼생활(sinhon.life)은 신혼부부·예비부부·신랑·신부가 받을 수 있는
              정부·지자체 지원 정책과 혜택을 AI가 맞춤으로 안내하는 플랫폼입니다.
              청약, 전세대출, 출산지원금, 부모급여, 연말정산 혜택을 한 곳에서
              확인할 수 있습니다.
            </p>
          </details>
          <details className="bg-white border border-warm-border rounded-lg p-3">
            <summary className="text-[13px] font-bold cursor-pointer">
              신혼부부 특공과 신생아 특공은 어떻게 다른가요?
            </summary>
            <p className="text-[12px] text-warm-text-secondary mt-2 leading-[1.7]">
              신혼부부 특공은 혼인 7년 이내 무주택 가구가 소득 기준을 만족하면
              신청할 수 있습니다. 신생아 특공은 2년 이내 출산 가구라면 소득에
              상관없이 100% 추첨 방식으로 신청 가능합니다.
            </p>
          </details>
          <details className="bg-white border border-warm-border rounded-lg p-3">
            <summary className="text-[13px] font-bold cursor-pointer">
              신혼생활 이용은 무료인가요?
            </summary>
            <p className="text-[12px] text-warm-text-secondary mt-2 leading-[1.7]">
              네, 완전 무료입니다. 회원가입·로그인 없이 바로 사용할 수 있습니다.
            </p>
          </details>
        </div>

        <p className="text-[11px] text-warm-text-muted leading-relaxed pt-2">
          © 2026 신혼생활 (sinhon.life) · 신혼부부·신랑·신부를 위한 AI 정책 상담
          플랫폼 · 대한민국
        </p>
      </section>

      <Script
        id="ld-json-home"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSONLD) }}
      />
    </div>
  );
}
