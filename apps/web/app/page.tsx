import { productName } from "@sinhon-os/config";
import { InstagramArchiveClient } from "./archive/instagram-archive-client";
import { PolicyChatClient } from "./policies/policy-chat-client";

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
        <p>신혼 준비에 바로 필요한 정책 안내와 공식 인스타 아카이브만 남긴 v1 홈입니다.</p>
        <div className="brand-proof-list" aria-label="구성">
          <span>기존 앱 쉘 감각</span>
          <span>AI 정책 톡</span>
          <span>공식 인스타 피드·릴스</span>
        </div>
      </aside>

      <section className="home-app-panel" aria-label="신혼생활 원페이지">
        <header className="app-topbar">
          <div className="app-wordmark">
            <span className="mini-rings" aria-hidden="true" />
            <strong>신혼생활</strong>
          </div>
          <nav aria-label="홈 섹션">
            <a href="#policy-chat">정책 톡</a>
            <a href="#instagram-archive">아카이브</a>
          </nav>
        </header>

        <section className="home-hero-card home-hero-card--chat" id="policy-chat" aria-labelledby="policy-title">
          <div className="home-hero-copy">
            <p className="micro-label">01 · AI policy talk</p>
            <h2 id="policy-title">정책은 톡처럼, 필요한 조건만 정확하게.</h2>
            <p>
              결혼·신혼·출산 정책을 대화로 정리합니다. 거주지·시기·소득을 말하면 다음 확인 조건까지 이어서 봅니다.
            </p>
          </div>
          <aside className="home-hero-chat" aria-label="AI 정책 톡">
            <PolicyChatClient />
          </aside>
        </section>

        <section className="one-page-section archive-section" id="instagram-archive" aria-labelledby="archive-title">
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
