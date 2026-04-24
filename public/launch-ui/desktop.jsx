/* global React */
// sinhon.life — Desktop Showroom (v4: 강남언니 style — white page + prominent QR left / phone right)

function DesktopShowroom({ ctaColor = 'var(--primary)', qrStyle = 'card', darkMode = false, tab, setTab, heroStyle, comicVariant }) {
  const bg = darkMode ? '#0E1420' : 'var(--bg)';
  const section = darkMode ? '#1A2332' : 'var(--section)';
  const fg = darkMode ? '#fff' : 'var(--ink)';
  const sub = darkMode ? 'rgba(255,255,255,.72)' : 'var(--ink-2)';
  const muted = darkMode ? 'rgba(255,255,255,.5)' : 'var(--ink-3)';
  const line = darkMode ? 'rgba(255,255,255,.1)' : 'var(--line)';
  const cardBg = darkMode ? 'rgba(255,255,255,.05)' : '#fff';

  return (
    <div style={{ width: 1440, minHeight: 900, background: bg, fontFamily: 'var(--font-kr)' }}>

      {/* ── top nav — white + subtle line ── */}
      <div style={{
        height: 68, display: 'flex', alignItems: 'center', padding: '0 48px', gap: 36,
        borderBottom: `1px solid ${line}`,
        background: bg,
      }}>
        <SinhonLogo size={20} color={fg}/>
        <div style={{ display: 'flex', gap: 26 }}>
          {['홈', '정책 둘러보기', '4컷으로 보는 정책', 'AI톡', '신혼생활 매거진'].map((t, i) => (
            <a key={t} style={{ fontSize: 14, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? 'var(--primary)' : sub, letterSpacing: -0.2 }}>{t}</a>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, height: 40, padding: '0 16px',
          borderRadius: 99, background: section,
          border: `1px solid ${line}`, fontSize: 13, color: muted, width: 280,
        }}>
          <Ic.search width="14" height="14" style={{ color: 'var(--primary)' }}/>
          <span>정책, 조건, 용어 검색</span>
        </div>
        <button style={{ fontSize: 14, fontWeight: 600, color: sub }}>로그인</button>
      </div>

      {/* ── HERO — 강남언니 style: left QR/CTA block, right phone ── */}
      <div style={{ padding: '56px 96px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

        {/* LEFT — copy + CTAs + QR card */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 99, background: 'var(--sky-card)', color: 'var(--primary-ink)', fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            2026 신혼부부 정책 가이드 · BETA
          </div>
          <h1 style={{
            fontSize: 52, fontWeight: 800, color: fg, lineHeight: 1.2,
            letterSpacing: -1.5, margin: '20px 0 18px', textWrap: 'pretty',
          }}>
            어려운 정책을,<br/>
            <span style={{ color: 'var(--primary)' }}>우리 부부 말</span>로 쉽게.
          </h1>
          <p style={{ fontSize: 16, color: sub, lineHeight: 1.7, maxWidth: 520, margin: 0, letterSpacing: -0.3 }}>
            전세대출·청약·세금·출산지원금까지.<br/>
            공문 속 조건을 우리가 이해할 수 있는 말과 오늘 할 일로 정리해드려요.
          </p>

          {/* CTA row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <CTA size="lg" color={ctaColor} icon={<Ic.sparkle width="15" height="15"/>}>우리 혜택 30초만에 찾기</CTA>
            <CTA size="lg" variant="kakao" icon={
              <svg width="15" height="15" viewBox="0 0 16 16"><path d="M8 2C4.1 2 1 4.5 1 7.5c0 2 1.4 3.8 3.5 4.7L3.6 15l3.5-2.2c.3 0 .6.1.9.1 3.9 0 7-2.5 7-5.4S11.9 2 8 2z" fill="#3C1E1E"/></svg>
            }>카카오로 링크 받기</CTA>
          </div>

          {/* QR card — 강남언니 prominent card */}
          <div style={{ marginTop: 36, ...renderQR(qrStyle, fg, muted, line, cardBg, darkMode) }}>
          </div>

          {/* feature row — small, icon + text */}
          <div style={{ display: 'flex', gap: 28, marginTop: 32 }}>
            {[
              { t: '공식 출처 기반', s: '국토부 · 복지부 · HUG', tint: 'var(--sky-card)', c: 'var(--sky-ink)',
                icon: (<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="m6.5 10 2.5 2.5L14 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
              { t: '내 조건별 AI 설명', s: '쉬운말 · 확인 필요 고지', tint: 'var(--peach-card)', c: 'var(--peach-ink)',
                icon: <Ic.sparkle width="18" height="18"/> },
              { t: '서류 체크리스트', s: '오늘 할 일까지 정리', tint: 'var(--mint-card)', c: 'var(--mint-ink)',
                icon: <Ic.check width="18" height="18"/> },
            ].map(t => (
              <div key={t.t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: darkMode ? 'rgba(255,255,255,.08)' : t.tint, color: darkMode ? fg : t.c, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{t.icon}</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: fg, letterSpacing: -0.2 }}>{t.t}</div>
                  <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>{t.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — phone, centered, sits on plain bg */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {/* subtle section plate behind phone only (like 강남언니) */}
          <div style={{
            position: 'absolute', width: 460, height: 700, borderRadius: 32,
            background: section, zIndex: 0,
          }}/>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Phone width={390} height={760} label="Showroom Preview">
              <ScreenHome go={() => {}} hero={heroStyle}/>
              <BottomTabs tab="home" onTab={() => {}}/>
            </Phone>
          </div>
        </div>
      </div>

      {/* ── 3 feature teasers (소프트 카드, 설명형) ── */}
      <div style={{ padding: '32px 96px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { tag: '정책 번역', tagTone: 'sky', t: '공문 말고, 쉬운말로', body: '"무주택세대구성원" 같은 어려운 용어를 우리 부부가 이해할 수 있는 말로 바꿔드려요.' },
            { tag: '4컷만화', tagTone: 'peach', t: '공문 말고, 4컷으로', body: '복잡한 조건을 랑·봄·준·혜택카드 4컷 대화로 풀어드려요.' },
            { tag: '오늘 할 일', tagTone: 'mint', t: '서류부터 은행 예약까지', body: '"오늘 뭐부터 하지?"를 체크리스트로 정리하고 배우자와 같이 봐요.' },
          ].map(c => (
            <div key={c.t} style={{ background: cardBg, border: `1px solid ${line}`, borderRadius: 18, padding: 22 }}>
              <Badge tone={c.tagTone} size="sm">{c.tag}</Badge>
              <div style={{ fontSize: 19, fontWeight: 800, color: fg, marginTop: 12, letterSpacing: -0.3 }}>{c.t}</div>
              <div style={{ fontSize: 13.5, color: sub, marginTop: 6, lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── footer — quiet ── */}
      <div style={{ padding: '24px 96px 36px', borderTop: `1px solid ${line}`, display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: muted, lineHeight: 1.6, flex: 1 }}>
          신혼생활(sinhon.life)은 공공 정책의 공식 안내를 기반으로 쉬운말과 체크리스트를 제공합니다.<br/>
          개인 조건에 따라 결과가 달라질 수 있으며, 최종 신청 전 기관 공식 안내를 반드시 확인해주세요.
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: muted }}>
          <span>© 2026 sinhon.life</span><span>이용약관</span><span>개인정보처리방침</span>
        </div>
      </div>
    </div>
  );
}

// ── QR renderer ──
function renderQR(qrStyle, fg, muted, line, cardBg, darkMode) {
  // This isn't a real return of JSX – it's helper to compute style spread; we inline JSX below via fragment
  return {};
}

// Replace above with proper JSX helper
function QRBlock({ style = 'card' }) {
  if (style === 'card') {
    return (
      <div style={{
        display: 'inline-flex', gap: 18, alignItems: 'center', padding: 18,
        background: '#fff', border: '1px solid var(--line)', borderRadius: 18,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ padding: 10, background: '#fff', borderRadius: 12, border: '1px solid var(--line)' }}>
          <QRCode size={110}/>
        </div>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: 0.6 }}>
            <Ic.download width="11" height="11"/> APP DOWNLOAD
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginTop: 4, lineHeight: 1.35, letterSpacing: -0.3 }}>QR로 앱 바로 열기</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.55 }}>카메라로 비추면 PWA가 바로<br/>열려요. 설치 없이 사용 가능해요.</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <span style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 700 }}>iOS</span>
            <span style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 700 }}>Android</span>
            <span style={{ padding: '3px 8px', borderRadius: 6, background: 'var(--primary)', color: '#fff', fontSize: 10.5, fontWeight: 700 }}>PWA</span>
          </div>
        </div>
      </div>
    );
  }
  if (style === 'line') {
    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        <QRCode size={92}/>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>QR로 앱 바로 열기</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>설치 없이 PWA로 바로 사용 가능</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'inline-flex', gap: 20, alignItems: 'center', padding: 18, background: 'var(--sky-card)', borderRadius: 18, border: '1px solid rgba(33,150,243,.12)' }}>
      <svg width="90" height="70" viewBox="0 0 120 90">
        <rect x="12" y="22" width="52" height="50" rx="6" fill="#fff" stroke="var(--primary)" strokeWidth="1.2" transform="rotate(-3 38 47)"/>
        <rect x="18" y="30" width="40" height="3" rx="1.5" fill="#B8D8F0" transform="rotate(-3 38 47)"/>
        <rect x="18" y="38" width="28" height="3" rx="1.5" fill="#B8D8F0" transform="rotate(-3 38 47)"/>
        <circle cx="86" cy="48" r="14" fill="none" stroke="var(--primary)" strokeWidth="1.5"/>
        <path d="M78 50 q8 10 16 0" stroke="var(--primary)" strokeWidth="1.2" fill="none"/>
      </svg>
      <div style={{ padding: 8, background: '#fff', borderRadius: 10 }}><QRCode size={88}/></div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>QR로 앱 바로 열기</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>설치 없이 30초만에</div>
      </div>
    </div>
  );
}

// Redefine showroom to actually use QRBlock (rather than stub helper)
function DesktopShowroomV4({ ctaColor = 'var(--primary)', qrStyle = 'card', darkMode = false, heroStyle }) {
  const bg = darkMode ? '#0E1420' : 'var(--bg)';
  const section = darkMode ? '#1A2332' : 'var(--section)';
  const fg = darkMode ? '#fff' : 'var(--ink)';
  const sub = darkMode ? 'rgba(255,255,255,.72)' : 'var(--ink-2)';
  const muted = darkMode ? 'rgba(255,255,255,.5)' : 'var(--ink-3)';
  const line = darkMode ? 'rgba(255,255,255,.1)' : 'var(--line)';
  const cardBg = darkMode ? 'rgba(255,255,255,.05)' : '#fff';

  return (
    <div style={{ width: 1440, minHeight: 900, background: bg, fontFamily: 'var(--font-kr)' }}>
      {/* top nav */}
      <div style={{
        height: 68, display: 'flex', alignItems: 'center', padding: '0 48px', gap: 36,
        borderBottom: `1px solid ${line}`, background: bg,
      }}>
        <SinhonLogo size={20} color={fg}/>
        <div style={{ display: 'flex', gap: 26 }}>
          {['홈', '정책 둘러보기', '4컷으로 보는 정책', 'AI톡', '신혼생활 매거진'].map((t, i) => (
            <a key={t} style={{ fontSize: 14, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? 'var(--primary)' : sub, letterSpacing: -0.2 }}>{t}</a>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, height: 40, padding: '0 16px',
          borderRadius: 99, background: section,
          border: `1px solid ${line}`, fontSize: 13, color: muted, width: 280,
        }}>
          <Ic.search width="14" height="14" style={{ color: 'var(--primary)' }}/>
          <span>정책, 조건, 용어 검색</span>
        </div>
        <button style={{ fontSize: 14, fontWeight: 600, color: sub }}>로그인</button>
      </div>

      {/* hero */}
      <div style={{ padding: '56px 96px 40px', display: 'grid', gridTemplateColumns: '1fr 520px', gap: 72, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 99, background: 'var(--sky-card)', color: 'var(--primary-ink)', fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            2026 신혼부부 정책 가이드 · BETA
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: fg, lineHeight: 1.2, letterSpacing: -1.5, margin: '20px 0 18px' }}>
            어려운 정책을,<br/><span style={{ color: 'var(--primary)' }}>우리 부부 말</span>로 쉽게.
          </h1>
          <p style={{ fontSize: 16, color: sub, lineHeight: 1.7, maxWidth: 520, margin: 0, letterSpacing: -0.3 }}>
            전세대출·청약·세금·출산지원금까지.<br/>공문 속 조건을 우리가 이해할 수 있는 말과 오늘 할 일로 정리해드려요.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <CTA size="lg" color={ctaColor} icon={<Ic.sparkle width="15" height="15"/>}>우리 혜택 30초만에 찾기</CTA>
            <CTA size="lg" variant="kakao" icon={
              <svg width="15" height="15" viewBox="0 0 16 16"><path d="M8 2C4.1 2 1 4.5 1 7.5c0 2 1.4 3.8 3.5 4.7L3.6 15l3.5-2.2c.3 0 .6.1.9.1 3.9 0 7-2.5 7-5.4S11.9 2 8 2z" fill="#3C1E1E"/></svg>
            }>카카오로 링크 받기</CTA>
          </div>

          {/* QR */}
          <div style={{ marginTop: 36 }}>
            <QRBlock style={qrStyle}/>
          </div>

          {/* feature row */}
          <div style={{ display: 'flex', gap: 24, marginTop: 36 }}>
            {[
              { t: '공식 출처 기반', s: '국토부 · 복지부 · HUG', tint: 'var(--sky-card)', c: 'var(--sky-ink)',
                icon: (<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="m6.5 10 2.5 2.5L14 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
              { t: '내 조건별 AI 설명', s: '쉬운말 · 확인 필요 고지', tint: 'var(--peach-card)', c: 'var(--peach-ink)', icon: <Ic.sparkle width="18" height="18"/> },
              { t: '서류 체크리스트', s: '오늘 할 일까지 정리', tint: 'var(--mint-card)', c: 'var(--mint-ink)', icon: <Ic.check width="18" height="18"/> },
            ].map(t => (
              <div key={t.t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: darkMode ? 'rgba(255,255,255,.08)' : t.tint, color: darkMode ? fg : t.c, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{t.icon}</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: fg, letterSpacing: -0.2 }}>{t.t}</div>
                  <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>{t.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right column — phone with section plate */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: 800 }}>
          <div style={{
            position: 'absolute', width: 460, height: 760, borderRadius: 32,
            background: section, zIndex: 0,
          }}/>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Phone width={360} height={740} label="Showroom Preview">
              <ScreenHome go={() => {}} hero={heroStyle}/>
              <BottomTabs tab="home" onTab={() => {}}/>
            </Phone>
          </div>
        </div>
      </div>

      {/* feature teasers */}
      <div style={{ padding: '32px 96px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { tag: '정책 번역', tagTone: 'sky', t: '공문 말고, 쉬운말로', body: '"무주택세대구성원" 같은 어려운 용어를 우리 부부가 이해할 수 있는 말로 바꿔드려요.' },
            { tag: '4컷만화', tagTone: 'peach', t: '공문 말고, 4컷으로', body: '복잡한 조건을 랑·봄·준·혜택카드 4컷 대화로 풀어드려요.' },
            { tag: '오늘 할 일', tagTone: 'mint', t: '서류부터 은행 예약까지', body: '"오늘 뭐부터 하지?"를 체크리스트로 정리하고 배우자와 같이 봐요.' },
          ].map(c => (
            <div key={c.t} style={{ background: cardBg, border: `1px solid ${line}`, borderRadius: 18, padding: 22 }}>
              <Badge tone={c.tagTone} size="sm">{c.tag}</Badge>
              <div style={{ fontSize: 19, fontWeight: 800, color: fg, marginTop: 12, letterSpacing: -0.3 }}>{c.t}</div>
              <div style={{ fontSize: 13.5, color: sub, marginTop: 6, lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* footer */}
      <div style={{ padding: '24px 96px 36px', borderTop: `1px solid ${line}`, display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: muted, lineHeight: 1.6, flex: 1 }}>
          신혼생활(sinhon.life)은 공공 정책의 공식 안내를 기반으로 쉬운말과 체크리스트를 제공합니다.<br/>
          개인 조건에 따라 결과가 달라질 수 있으며, 최종 신청 전 기관 공식 안내를 반드시 확인해주세요.
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: muted }}>
          <span>© 2026 sinhon.life</span><span>이용약관</span><span>개인정보처리방침</span>
        </div>
      </div>
    </div>
  );
}

// Shorts screen — all white
function ScreenShorts({ go }) {
  return (
    <div style={{ paddingTop: 52, paddingBottom: 90, minHeight: '100%', background: 'var(--bg)' }}>
      <div style={{ padding: '8px 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => go?.('home')} style={{ padding: 6, color: 'var(--ink)' }}><Ic.back/></button>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' }}>3분 요약 영상</div>
      </div>
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ fontSize: 12, color: 'var(--primary-ink)', lineHeight: 1.55, background: 'var(--sky-card)', padding: '12px 14px', borderRadius: 12 }}>
          영상은 정책 이해를 돕는 보조 자료예요. 요약과 AI 질문으로 빠르게 확인할 수 있어요.
        </div>
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ShortsCard title="버팀목 전세대출 3분 요약" duration="3:14" policy="신혼부부 전세대출" summary="혼인 7년 이내 · 무주택 · 부부합산 7.5천만원 이하"/>
        <ShortsCard title="신혼특공 · 소득·자산 기준" duration="2:48" policy="신혼특별공급" summary="가구 월평균소득 140% · 부동산 3.31억원 이하"/>
        <ShortsCard title="첫만남이용권 200만원 쓰는 법" duration="1:52" policy="첫만남이용권" summary="국민행복카드로 1년 이내 사용 · 예외 업종 있음"/>
      </div>
    </div>
  );
}

// Alias name the HTML imports as DesktopShowroom
const _DesktopShowroomAlias = DesktopShowroomV4;
Object.assign(window, { DesktopShowroom: DesktopShowroomV4, ScreenShorts, QRBlock });
