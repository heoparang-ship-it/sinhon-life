import { InstagramArchiveClient } from "./archive/instagram-archive-client";
import { PolicyMatcherClient } from "./policies/policy-matcher-client";

export default function WebHomePage() {
  return (
    <main className="mag-shell">
      <header className="mag-topbar">
        <a className="mag-wordmark" href="/" aria-label="신혼생활 홈">
          신혼생활
        </a>
        <nav className="mag-nav" aria-label="주요 섹션">
          <a href="#policy">AI 정책 톡</a>
          <a href="#magazine">매거진</a>
        </nav>
      </header>

      <section className="mag-section mag-section--hero" id="policy" aria-labelledby="policy-title">
        <div className="mag-section-head">
          <p className="mag-kicker">AI POLICY TALK</p>
          <h1 id="policy-title" className="mag-section-title">AI 정책 톡</h1>
          <p className="mag-section-lede">
            거주지·결혼 시기·소득만 고르면, 받을 수 있는 정책을 톡 버블로 정리합니다.
          </p>
        </div>
        <PolicyMatcherClient />
      </section>

      <section className="mag-section mag-section--alt" id="magazine" aria-labelledby="mag-title">
        <div className="mag-section-head">
          <p className="mag-kicker">WEDDING MAGAZINE</p>
          <h2 id="mag-title" className="mag-section-title">웨딩 매거진</h2>
          <p className="mag-section-lede">
            공식 인스타그램에서 모은 신혼 준비 이야기, 새로 올라오는 순서대로.
          </p>
        </div>
        <InstagramArchiveClient />
      </section>

      <footer className="mag-footer">
        <p className="mag-footer-mark">신혼생활</p>
        <p className="mag-footer-meta">© sinhon.life · 신혼을 준비하는 모든 순간</p>
      </footer>
    </main>
  );
}
