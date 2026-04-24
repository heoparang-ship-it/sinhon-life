/* global React */
// sinhon.life — Shared components (v4: 강남언니/오늘의집 톤, white-first)

const { useState, useEffect, useRef, useMemo, Fragment } = React;

// ─────────────────────────────────────────
// Logo — clean sky-blue mark + wordmark
// ─────────────────────────────────────────
function SinhonLogo({ size = 22, color = 'var(--ink)' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-kr)' }}>
      <svg width={size + 4} height={size + 4} viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="14" r="13" fill="var(--primary)"/>
        <path d="M8 18 Q14 9 20 18" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
        <circle cx="14" cy="11" r="1.8" fill="#fff"/>
      </svg>
      <span style={{ fontWeight: 700, letterSpacing: -0.3, color, fontSize: size * 0.82 }}>
        sinhon<span style={{ color: 'var(--primary)' }}>.life</span>
      </span>
    </div>
  );
}

// ─────────────────────────────────────────
// Icons — minimal line icons (inherit color)
// ─────────────────────────────────────────
const Ic = {
  search: (p = {}) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...p}><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8"/><path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  sparkle: (p = {}) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}><path d="M9 1.5v4m0 7v4M1.5 9h4m7 0h4M4 4l2.5 2.5M11.5 11.5 14 14M14 4l-2.5 2.5M6.5 11.5 4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  check: (p = {}) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="m3 8 3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bookmark: (p = {}) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M4 2h8v12l-4-2.5L4 14V2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none"/></svg>,
  share: (p = {}) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><circle cx="4" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="4" r="1.8" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="1.8" stroke="currentColor" strokeWidth="1.6"/><path d="m5.5 7 5-2M5.5 9l5 2" stroke="currentColor" strokeWidth="1.6"/></svg>,
  chevron: (p = {}) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="m5 3 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  back: (p = {}) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...p}><path d="m12 4-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: (p = {}) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}><path d="m4 4 10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  home: (p = {}) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" {...p}><path d="M3 10.5 11 4l8 6.5V18a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1v-7.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  gift: (p = {}) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" {...p}><rect x="3" y="8" width="16" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.6"/><path d="M3 12h16M11 8v11" stroke="currentColor" strokeWidth="1.6"/><path d="M7 8c0-2 1.5-3 3-2 1.5 1.5 1 2 1 2s-.5.5-2 0-2-2-2-2zM15 8c0-2-1.5-3-3-2-1.5 1.5-1 2-1 2s.5.5 2 0 2-2 2-2z" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>,
  chat: (p = {}) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" {...p}><path d="M4 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="8" cy="10.5" r="1" fill="currentColor"/><circle cx="12" cy="10.5" r="1" fill="currentColor"/><circle cx="16" cy="10.5" r="1" fill="currentColor"/></svg>,
  user: (p = {}) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" {...p}><circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M4 19c1-4 4-6 7-6s6 2 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  file: (p = {}) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}><path d="M4 2h7l3 3v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M11 2v3h3" stroke="currentColor" strokeWidth="1.6"/></svg>,
  info: (p = {}) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M7 6v4M7 4v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  play: (p = {}) => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" {...p}><path d="M4 3v8l7-4z"/></svg>,
  ext: (p = {}) => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...p}><path d="M4 2h6v6M10 2 4 8M4 4H2v6h6V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  calendar: (p = {}) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><rect x="2" y="3" width="12" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 6h12M5 2v3M11 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  won: (p = {}) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M3 4l2 6 2-6 1 6 2-6M2 8h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  download: (p = {}) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M7 2v8m0 0L4 7m3 3 3-3M2 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  heart: (p = {}) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M8 13.5s-5-3-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 4-5 7-5 7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/></svg>,
};

// ─────────────────────────────────────────
// Buttons — primary blue, ghost white, kakao yellow
// ─────────────────────────────────────────
function CTA({ children, variant = 'primary', size = 'lg', full = false, color, onClick, icon, style = {} }) {
  const palette = {
    primary: { bg: color || 'var(--primary)', fg: '#fff', border: 'transparent' },
    ghost:   { bg: '#fff', fg: 'var(--ink)', border: 'var(--line)' },
    outline: { bg: '#fff', fg: 'var(--primary-ink)', border: 'var(--primary)' },
    kakao:   { bg: 'var(--kakao-yellow)', fg: '#3C1E1E', border: 'transparent' },
    dark:    { bg: 'var(--ink)', fg: '#fff', border: 'transparent' },
  }[variant] || {};
  const sizes = {
    sm: { h: 36, px: 14, fs: 13, r: 10 },
    md: { h: 44, px: 18, fs: 14.5, r: 12 },
    lg: { h: 52, px: 22, fs: 15.5, r: 14 },
    xl: { h: 58, px: 26, fs: 16.5, r: 16 },
  }[size];
  return (
    <button onClick={onClick} style={{
      height: sizes.h, padding: `0 ${sizes.px}px`, borderRadius: sizes.r,
      background: palette.bg, color: palette.fg,
      border: `1px solid ${palette.border}`,
      fontSize: sizes.fs, fontWeight: 700, letterSpacing: -0.3,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      width: full ? '100%' : 'auto', transition: 'transform .1s, filter .1s',
      ...style,
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(.98)'}
    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {icon}{children}
    </button>
  );
}

// ─────────────────────────────────────────
// Badge — soft pill in card tints
// ─────────────────────────────────────────
function Badge({ children, tone = 'mint', size = 'sm' }) {
  const tones = {
    mint:    { bg: 'var(--mint-card)',   fg: 'var(--mint-ink)' },    // 가능성/완료
    sky:     { bg: 'var(--sky-card)',    fg: 'var(--sky-ink)' },     // 정책/AI
    butter:  { bg: 'var(--butter-card)', fg: 'var(--butter-ink)' },  // 마감/주의
    peach:   { bg: 'var(--peach-card)',  fg: 'var(--peach-ink)' },   // 4컷/부부
    neutral: { bg: 'var(--section)',     fg: 'var(--ink-3)' },
    primary: { bg: 'var(--primary)',     fg: '#fff' },
    // legacy aliases
    apricot: { bg: 'var(--butter-card)', fg: 'var(--butter-ink)' },
    sierra:  { bg: 'var(--sky-card)',    fg: 'var(--sky-ink)' },
    slate:   { bg: 'var(--section)',     fg: 'var(--ink-3)' },
    cream:   { bg: 'var(--butter-card)', fg: 'var(--butter-ink)' },
    sun:     { bg: 'var(--butter-card)', fg: 'var(--butter-ink)' },
  }[tone] || {};
  const s = size === 'md'
    ? { fs: 12.5, px: 10, h: 24 }
    : { fs: 11.5, px: 9, h: 22 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: s.h, padding: `0 ${s.px}px`, borderRadius: 999,
      background: tones.bg, color: tones.fg,
      fontSize: s.fs, fontWeight: 700, letterSpacing: -0.2,
    }}>{children}</span>
  );
}

function Chip({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 13px', borderRadius: 999,
      background: active ? 'var(--primary)' : '#fff',
      color: active ? '#fff' : 'var(--ink-2)',
      border: `1px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
      fontSize: 13, fontWeight: 600, letterSpacing: -0.2,
    }}>{children}</button>
  );
}

// ─────────────────────────────────────────
// Mobile device frame — lighter bezel, white interior
// ─────────────────────────────────────────
function Phone({ children, width = 390, height = 800, label, bg = 'var(--bg)', statusDark = false }) {
  return (
    <div style={{
      width: width + 14, borderRadius: 44,
      background: '#0E1420',
      padding: 7,
      boxShadow: '0 30px 60px rgba(23,32,51,.14), 0 10px 24px rgba(23,32,51,.08)',
      position: 'relative',
    }}>
      <div data-screen-label={label} style={{
        width, height, borderRadius: 38, overflow: 'hidden',
        background: bg, position: 'relative',
      }}>
        {/* status bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 44, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 26px 0', pointerEvents: 'none',
          color: statusDark ? '#fff' : 'var(--ink)',
          fontSize: 14.5, fontWeight: 600,
        }}>
          <span>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="17" height="11" viewBox="0 0 17 11" fill="none"><rect x="0" y="7" width="3" height="4" rx=".6" fill="currentColor"/><rect x="4.5" y="5" width="3" height="6" rx=".6" fill="currentColor"/><rect x="9" y="2.5" width="3" height="8.5" rx=".6" fill="currentColor"/><rect x="13.5" y="0" width="3" height="11" rx=".6" fill="currentColor"/></svg>
            <svg width="24" height="11" viewBox="0 0 24 11" fill="none"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="currentColor" fill="none"/><rect x="2" y="2" width="17" height="7" rx="1.3" fill="currentColor"/><path d="M22 3.5v4c.7-.2 1.2-.9 1.2-2s-.5-1.8-1.2-2z" fill="currentColor"/></svg>
          </div>
        </div>
        {/* dynamic island */}
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 110, height: 30, borderRadius: 22, background: '#0E1420', zIndex: 40,
        }}/>
        {/* screen content */}
        {children}
        {/* home indicator */}
        <div style={{
          position: 'absolute', bottom: 7, left: '50%', transform: 'translateX(-50%)',
          width: 128, height: 4.5, borderRadius: 99, background: 'rgba(23,32,51,.22)', zIndex: 50,
        }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Bottom tab nav — active = primary blue
// ─────────────────────────────────────────
function BottomTabs({ tab, onTab }) {
  const tabs = [
    { id: 'home', label: '홈', icon: Ic.home },
    { id: 'benefit', label: '혜택', icon: Ic.gift },
    { id: 'ai', label: 'AI톡', icon: Ic.chat },
    { id: 'my', label: 'MY', icon: Ic.user },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 78,
      background: 'rgba(255,255,255,.98)', backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--line)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start',
      paddingTop: 10, zIndex: 20,
    }}>
      {tabs.map(t => {
        const active = t.id === tab;
        return (
          <button key={t.id} onClick={() => onTab?.(t.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: active ? 'var(--primary)' : 'var(--ink-4)',
            width: 68,
          }}>
            {t.icon({ width: 24, height: 24 })}
            <span style={{ fontSize: 11, fontWeight: active ? 800 : 500, letterSpacing: -0.2 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────
// Trust / Source card — 네이비 텍스트, only small blue check icon
// ─────────────────────────────────────────
function SourceCard({ agency = '국토교통부 · 주택도시보증공사', date = '2026.04.22', url = 'www.hf.go.kr/hf', compact = false }) {
  return (
    <div style={{
      background: 'var(--bg)', borderRadius: 14,
      padding: compact ? '12px 14px' : '14px 16px',
      border: '1px solid var(--line)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--primary)', display: 'grid', placeItems: 'center', color: '#fff' }}>
          <Ic.check width="10" height="10"/>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.2 }}>공식 출처 기반</span>
        <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 'auto' }}>확인일 {date}</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600, lineHeight: 1.4 }}>{agency}</div>
      <a style={{ fontSize: 12, color: 'var(--primary-ink)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
        {url} <Ic.ext/>
      </a>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.5 }}>
        개인 조건에 따라 결과가 달라질 수 있어요.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Policy translation — Sky Card tint
// ─────────────────────────────────────────
function TranslationCard({ items }) {
  return (
    <div style={{ background: 'var(--sky-card)', borderRadius: 18, padding: 18, border: '1px solid rgba(33,150,243,.12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 99, background: '#fff', color: 'var(--primary-ink)', fontSize: 11.5, fontWeight: 700 }}>정책 번역</span>
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>어려운 용어를 우리 말로</span>
      </div>
      {items.map((it, i) => (
        <div key={i} style={{
          marginBottom: i === items.length - 1 ? 0 : 16,
          paddingBottom: i === items.length - 1 ? 0 : 16,
          borderBottom: i === items.length - 1 ? 'none' : '1px dashed rgba(33,150,243,.22)',
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, width: 48 }}>공문 용어</span>
            <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500, flex: 1 }}>{it.official}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--primary-ink)', fontWeight: 700, width: 48 }}>쉬운말</span>
            <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600, lineHeight: 1.5, flex: 1 }}>{it.easy}</span>
          </div>
          {it.warn && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, padding: '8px 10px', background: 'var(--butter-card)', borderRadius: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--butter-ink)', fontWeight: 700, width: 48 }}>주의</span>
              <span style={{ fontSize: 12.5, color: 'var(--butter-ink)', lineHeight: 1.5, flex: 1 }}>{it.warn}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// MorningTable kept as no-op for legacy compatibility (no longer used)
function MorningTable() { return null; }

// ─────────────────────────────────────────
// QR code — deterministic
// ─────────────────────────────────────────
function QRCode({ size = 140, dark = 'var(--ink)', light = '#fff' }) {
  const N = 25;
  const cell = size / N;
  const rng = (i, j) => ((i * 31 + j * 17 + (i ^ j) * 13) % 7) < 3;
  const squares = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const inFinder = (i < 7 && j < 7) || (i < 7 && j > N - 8) || (i > N - 8 && j < 7);
    if (inFinder) continue;
    if (rng(i, j)) squares.push(<rect key={`${i}-${j}`} x={j*cell} y={i*cell} width={cell} height={cell} fill={dark}/>);
  }
  const finder = (x, y) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7*cell} height={7*cell} fill={dark}/>
      <rect x={x+cell} y={y+cell} width={5*cell} height={5*cell} fill={light}/>
      <rect x={x+2*cell} y={y+2*cell} width={3*cell} height={3*cell} fill={dark}/>
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <rect width={size} height={size} fill={light}/>
      {squares}
      {finder(0, 0)}
      {finder((N-7)*cell, 0)}
      {finder(0, (N-7)*cell)}
    </svg>
  );
}

Object.assign(window, {
  SinhonLogo, Ic, CTA, Badge, Chip, Phone, BottomTabs,
  SourceCard, TranslationCard, MorningTable, QRCode,
});
