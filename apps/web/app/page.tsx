import { InstagramArchiveClient } from "./archive/instagram-archive-client";
import { PolicyChatClient } from "./policies/policy-chat-client";

export default function WebHomePage() {
  return (
    <main className="edit-shell">
      <header className="edit-topbar">
        <a className="edit-wordmark" href="/" aria-label="신혼생활 홈">
          신혼생활
          <span className="edit-wordmark-sub">SINHON LIFE</span>
        </a>
        <nav className="edit-nav" aria-label="주요 섹션">
          <a href="#policy">AI 정책 톡</a>
          <a href="#magazine">매거진</a>
          <a href="#editors">에디터</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <section className="edit-hero" id="policy" aria-labelledby="policy-title">
        <aside className="edit-hero-left">
          <p className="edit-kicker">EDITOR'S PICK · 01</p>
          <h1 id="policy-title" className="edit-hero-title">
            신혼을 준비하는<br />가장 차분한 안내.
          </h1>
          <p className="edit-hero-lede">
            결혼·신혼·출산 정책을 톡 한 번으로 정리합니다.<br />
            거주지·시기·소득만 알려주면, 받을 수 있는 정책을 차근히 추려드려요.
          </p>
          <div className="edit-byline">
            <span className="edit-byline-avatar" aria-hidden="true">신</span>
            <div>
              <p>by 신혼생활 에디터팀</p>
              <small>SINHON LIFE EDITORS</small>
            </div>
          </div>
          <a className="edit-hero-cta" href="#policy-chat">정책 톡 시작 ↓</a>
        </aside>

        <aside className="edit-hero-right" id="policy-chat">
          <PolicyChatClient />
        </aside>
      </section>

      <section className="edit-section" id="magazine" aria-labelledby="mag-title">
        <div className="edit-section-head">
          <div>
            <p className="edit-kicker">02 · MAGAZINE</p>
            <h2 id="mag-title" className="edit-section-title">웨딩 매거진</h2>
          </div>
          <p className="edit-section-lede">
            공식 인스타그램에서 모은 신혼 준비 이야기.<br />
            새로 올라오는 순서대로 봅니다.
          </p>
        </div>
        <InstagramArchiveClient />
      </section>

      <section className="edit-section edit-section--alt" id="editors" aria-labelledby="ed-title">
        <div className="edit-section-head">
          <div>
            <p className="edit-kicker">03 · EDITORS</p>
            <h2 id="ed-title" className="edit-section-title">에디터의 한 줄</h2>
          </div>
          <p className="edit-section-lede">
            신혼생활을 만드는 사람들.
          </p>
        </div>
        <ul className="edit-editors-row">
          <li>
            <span className="edit-editor-avatar" aria-hidden="true">영</span>
            <strong>이영림</strong>
            <small>FOUNDING EDITOR</small>
            <p>신혼은 한 번뿐이니까, 가장 정확한 정보로.</p>
          </li>
          <li>
            <span className="edit-editor-avatar" aria-hidden="true">신</span>
            <strong>신혼생활 팀</strong>
            <small>POLICY · MAGAZINE</small>
            <p>정책과 콘텐츠를 매일 업데이트합니다.</p>
          </li>
        </ul>
      </section>

      <footer className="edit-footer" id="about">
        <div className="edit-footer-grid">
          <div>
            <p className="edit-footer-mark">신혼생활</p>
            <p className="edit-footer-tag">신혼을 준비하는 모든 순간 — 정책과 매거진.</p>
          </div>
          <nav aria-label="푸터 메뉴">
            <a href="#policy">AI 정책 톡</a>
            <a href="#magazine">매거진</a>
            <a href="#editors">에디터</a>
            <a href="https://instagram.com/sinhon.life" target="_blank" rel="noreferrer">Instagram ↗</a>
          </nav>
        </div>
        <p className="edit-footer-meta">© sinhon.life · made with care for newlyweds</p>
      </footer>
    </main>
  );
}
