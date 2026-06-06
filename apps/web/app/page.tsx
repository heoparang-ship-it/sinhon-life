import { productName } from "@sinhon-os/config";
import { InstagramArchiveClient } from "./archive/instagram-archive-client";
import { PolicyMatcherClient } from "./policies/policy-matcher-client";

const proofItems = [
  "기존 앱 쉘 감각",
  "AI 없는 정적 정책 룰",
  "공식 인스타 피드·릴스"
];

export default function WebHomePage() {
  return (
    <main className="home-shell">
      <aside className="home-brand-panel" aria-label="신혼생활 소개">
        <div className="brand-mark" aria-hidden="true">
          <span />
          <span />
        </div>
        <p className="micro-label">sinhon.life</p>
        <h1>{productName}</h1>
        <p>
          신혼 준비에 바로 필요한 정책 안내와 공식 인스타 아카이브만 남긴 v1 미니멀 홈입니다.
        </p>
        <div className="brand-proof-list" aria-label="구성">
          {proofItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </aside>

      <section className="home-app-panel" aria-label="신혼생활 원페이지">
        <header className="app-topbar">
          <div className="app-wordmark">
            <span className="mini-rings" aria-hidden="true" />
            <strong>신혼생활</strong>
          </div>
          <nav aria-label="홈 섹션">
            <a href="#policy-talk">정책 톡</a>
            <a href="#instagram-archive">아카이브</a>
          </nav>
        </header>

        <section className="home-hero-card" aria-labelledby="home-hero-title">
          <p className="micro-label">v1 MVP</p>
          <h2 id="home-hero-title">정책은 톡처럼, 인스타는 아카이브처럼.</h2>
          <p>
            11개 기능 허브 대신 지금 필요한 두 가지 흐름만 한 화면에 담았습니다.
          </p>
          <div className="hero-action-row" aria-label="바로가기">
            <a href="#policy-talk">정책 확인</a>
            <a href="#instagram-archive">게시물 보기</a>
          </div>
        </section>

        <section className="one-page-section policy-section" id="policy-talk" aria-labelledby="policy-title">
          <div className="section-heading">
            <p className="micro-label">01 · rule based</p>
            <h2 id="policy-title">정책 톡</h2>
            <p>거주지, 결혼 시기, 소득 구간만 고르면 맞는 정책과 더 확인할 조건을 카카오톡 버블 형태로 정리합니다.</p>
          </div>
          <PolicyMatcherClient />
        </section>

        <section
          className="one-page-section archive-section"
          id="instagram-archive"
          aria-labelledby="archive-title"
        >
          <div className="section-heading">
            <p className="micro-label">02 · @sinhon.life</p>
            <h2 id="archive-title">인스타 아카이브</h2>
            <p>신혼생활 공식 계정의 피드와 릴스를 불러와 한 곳에서 확인합니다.</p>
          </div>
          <InstagramArchiveClient />
        </section>
      </section>
    </main>
  );
}
