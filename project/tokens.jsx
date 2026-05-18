// tokens.jsx — 신혼생활 공용 디자인 토큰 + 프리미티브
// 모든 화면에서 import해서 공유 (window 전역으로 노출)

const T = {
  // blue zone
  blue: '#6FB1EA',
  blueDeep: '#5A9DD8',
  blueSoft: '#88C0EE',
  blueDeepest: '#3B8BCF',
  onBlue: '#FFFFFF',
  onBlueMute: 'rgba(255,255,255,0.72)',
  onBlueFaint: 'rgba(255,255,255,0.55)',
  glass: 'rgba(255,255,255,0.20)',

  // white zone
  white: '#FFFFFF',
  paper: '#F4F8FC',
  surface: '#EAF3FB',
  hairline: '#E2EBF3',
  ink: '#1A2433',
  inkSoft: '#3A4A5E',
  mute: '#7A8696',
  faint: '#B5BDC8',
  accentDeep: '#3B8BCF',

  // semantic
  income: '#3B8BCF',
  expense: '#D97E6A',     // muted coral — used ONLY in ledger
  kakao: '#FEE500',
  kakaoText: '#191600',

  font: '"Pretendard Variable", Pretendard, -apple-system, system-ui, sans-serif',
};

// gradients (left → right, deep → soft) — match COVI reaction-pill ref
const G = {
  pillActiveOnWhite: 'linear-gradient(90deg, #4A9BE0 0%, #6FB1EA 55%, #9CC8F2 100%)',
  pillIdleOnWhite:   'linear-gradient(90deg, #E6F0FA 0%, #EEF5FC 60%, #F2F7FC 100%)',
  pillActiveOnBlue:  'linear-gradient(90deg, #FFFFFF 0%, #FAFCFE 60%, #F0F6FC 100%)',
  glassChip:         'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(240,247,253,0.92) 60%, rgba(220,236,250,0.88) 100%)',
  heroSky:           'linear-gradient(180deg, #88C0EE 0%, #6FB1EA 65%, #6AAAE3 100%)',
};

// ─── primitives ─────────────────────────────────────────────
function MicroLabel({ children, color, style }) {
  return (
    <span style={{
      fontFamily: T.font,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
      color: color || T.faint,
      textTransform: 'uppercase',
      ...style,
    }}>{children}</span>
  );
}

function Pill({ children, active, onWhite, style, size = 36 }) {
  const baseOnWhite = {
    background: active ? G.pillActiveOnWhite : G.pillIdleOnWhite,
    color: active ? '#FFFFFF' : T.accentDeep,
  };
  const baseOnBlue = {
    background: active ? G.pillActiveOnBlue : T.glass,
    color: active ? T.ink : T.onBlue,
    backdropFilter: active ? 'none' : 'blur(8px)',
    WebkitBackdropFilter: active ? 'none' : 'blur(8px)',
    boxShadow: active ? '0 6px 18px -10px rgba(20,40,80,0.35)' : 'none',
  };
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', height: size,
      padding: '0 16px', borderRadius: 999,
      fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em',
      whiteSpace: 'nowrap',
      ...(onWhite ? baseOnWhite : baseOnBlue),
      ...style,
    }}>{children}</div>
  );
}

function GlassBubble({ size, top, left, right, opacity = 0.22, icon }) {
  return (
    <div style={{
      position: 'absolute', top, left, right,
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,${opacity + 0.18}) 0%, rgba(255,255,255,${opacity}) 55%, rgba(255,255,255,${opacity * 0.4}) 100%)`,
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(255,255,255,0.78)',
      pointerEvents: 'none',
    }}>{icon}</div>
  );
}

// 3D character bubble placeholder (Memoji-feel, light & matte)
function CharacterBubble({ size = 108, label = '3D\ncharacter', style }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.32) 55%, rgba(255,255,255,0.14) 100%)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      boxShadow: '0 22px 40px -18px rgba(20,40,80,0.40), inset 0 1px 0 rgba(255,255,255,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        fontFamily: T.font,
        fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.82)', textAlign: 'center', lineHeight: 1.5,
        whiteSpace: 'pre-line',
      }}>{label}</div>
    </div>
  );
}

// ─── tab bar ───────────────────────────────────────────────
function TabIcon({ name, active }) {
  const c = active ? T.ink : 'rgba(26,36,51,0.36)';
  const sw = 1.5;
  if (name === 'home') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 11l8-6 8 6v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z" stroke={c} strokeWidth={sw} strokeLinejoin="round"/>
    </svg>
  );
  if (name === 'search') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke={c} strokeWidth={sw}/>
      <path d="M16 16l4 4" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  );
  if (name === 'ledger') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke={c} strokeWidth={sw}/>
      <path d="M8 10h8M8 14h5" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="9" r="3.5" stroke={c} strokeWidth={sw}/>
      <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  );
}

function TabBar({ current = 'home' }) {
  const items = [
    { key: 'home', label: '아카이브' },
    { key: 'search', label: '검색' },
    { key: 'ledger', label: '가계부' },
    { key: 'my', label: 'MY' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 14, right: 14, bottom: 26,
      background: T.white,
      borderRadius: 26,
      padding: '12px 8px 10px',
      boxShadow: '0 18px 40px -14px rgba(20,40,80,0.22), 0 2px 6px rgba(20,40,80,0.05)',
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      zIndex: 30,
    }}>
      {items.map(it => {
        const active = it.key === current;
        return (
          <div key={it.key} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 6,
          }}>
            <TabIcon name={it.key} active={active} />
            <div style={{
              fontSize: 10.5, fontWeight: active ? 600 : 500,
              color: active ? T.ink : 'rgba(26,36,51,0.40)',
              letterSpacing: '-0.01em',
            }}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── shared video card ─────────────────────────────────────
function VideoThumb({ label }) {
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '9 / 16',
      borderRadius: 16, overflow: 'hidden',
      background: T.surface,
      boxShadow: '0 18px 40px -28px rgba(20,40,80,0.22)',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(135deg, rgba(90,130,180,0.06) 0 1px, transparent 1px 16px)',
      }} />
      <div style={{ position: 'absolute', top: 14, left: 16 }}>
        <span style={{
          fontFamily: T.font,
          fontSize: 10.5, fontWeight: 600, letterSpacing: '0.02em',
          color: '#3B8BCF', opacity: 0.65,
          textTransform: 'uppercase',
        }}>{label}</span>
      </div>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <defs>
            <linearGradient id="playGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
              <stop offset="60%" stopColor="#F0F7FD" stopOpacity="0.92"/>
              <stop offset="100%" stopColor="#DCECFA" stopOpacity="0.88"/>
            </linearGradient>
          </defs>
          <circle cx="22" cy="22" r="21.5" fill="url(#playGrad)" stroke="rgba(59,139,207,0.20)" strokeWidth="1"/>
          <path d="M19 15L28 22L19 29V15Z" fill="#3B8BCF" opacity="0.85"/>
        </svg>
      </div>
    </div>
  );
}

function VideoCard({ tags, title, dur, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'relative' }}>
        <VideoThumb label={label} />
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          padding: '5px 12px', borderRadius: 999,
          background: G.glassChip,
          color: T.accentDeep,
          fontSize: 11, fontWeight: 700,
          letterSpacing: '-0.005em',
          fontVariantNumeric: 'tabular-nums',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px -6px rgba(20,40,80,0.20)',
        }}>{dur}</div>
      </div>
      <div style={{ padding: '0 4px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{
          fontSize: 14.5, color: T.ink, fontWeight: 500,
          lineHeight: 1.45, letterSpacing: '-0.02em',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{title}</div>
        <div style={{
          fontSize: 11.5, color: T.mute, fontWeight: 400,
          letterSpacing: '-0.005em',
        }}>{tags.join('  ')}</div>
      </div>
    </div>
  );
}

// ─── screen shell ──────────────────────────────────────────
function ScreenShell({ children, tab = 'home' }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: T.white,
      position: 'relative', overflow: 'hidden',
      fontFamily: T.font, color: T.ink,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        overflowY: 'auto',
      }}>
        {children}
      </div>
      <TabBar current={tab} />
    </div>
  );
}

Object.assign(window, {
  T, G,
  MicroLabel, Pill, GlassBubble, CharacterBubble,
  TabIcon, TabBar,
  VideoThumb, VideoCard,
  ScreenShell,
});
