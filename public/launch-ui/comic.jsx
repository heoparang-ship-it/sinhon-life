/* global React */
// sinhon.life — 4컷만화 (geometric minimal characters), 체크리스트, 영상 쇼츠 카드

const { useState: useState2 } = React;

// ─────────────────────────────────────────
// Characters — geometric, dot-eyes, brand colors
// 랑 (안내자), 봄 (사용자), 준 (파트너), 혜택카드 (카드형)
// ─────────────────────────────────────────
function Char({ who = 'rang', size = 64, mood = 'default' }) {
  const palette = {
    rang: { body: 'var(--parang)',     accent: '#fff',        label: '랑' },   // guide
    bom:  { body: 'var(--peach)',      accent: 'var(--ink)',  label: '봄' },   // wife
    jun:  { body: 'var(--sun-butter)', accent: 'var(--ink)',  label: '준' },   // husband
    card: { body: 'var(--mint)',       accent: '#fff',        label: '혜택' }, // benefit card
  }[who];

  if (who === 'card') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <rect x="10" y="14" width="44" height="36" rx="6" fill={palette.body}/>
        <rect x="10" y="14" width="44" height="10" rx="6" fill="var(--deep-slate)"/>
        <rect x="10" y="18" width="44" height="6" fill="var(--deep-slate)"/>
        <circle cx="20" cy="36" r="2" fill={palette.accent}/>
        <circle cx="28" cy="36" r="2" fill={palette.accent}/>
        <path d="M20 42 Q24 46 28 42" stroke={palette.accent} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <rect x="36" y="34" width="14" height="3" rx="1.5" fill="var(--deep-slate)"/>
        <rect x="36" y="40" width="10" height="3" rx="1.5" fill="var(--deep-slate)" opacity=".5"/>
      </svg>
    );
  }

  // humanoid: round head + rounded-rect body
  const eyesOpen = mood !== 'confused';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {/* body */}
      <rect x="14" y="36" width="36" height="24" rx="10" fill={palette.body}/>
      {/* head */}
      <circle cx="32" cy="26" r="16" fill={palette.body}/>
      {/* hair cap - simple */}
      {who === 'bom' && <path d="M16 22 Q32 10 48 22 Q44 18 32 18 Q20 18 16 22 Z" fill="var(--deep-slate)"/>}
      {who === 'jun' && <path d="M18 22 Q32 14 46 22 Q42 16 32 16 Q22 16 18 22 Z" fill="var(--deep-slate)"/>}
      {who === 'rang' && <circle cx="32" cy="12" r="4" fill="var(--deep-slate)"/>}
      {/* eyes */}
      {eyesOpen ? (
        <>
          <circle cx="26" cy="27" r="1.8" fill={palette.accent}/>
          <circle cx="38" cy="27" r="1.8" fill={palette.accent}/>
        </>
      ) : (
        <>
          <path d="M23 27 L29 27" stroke={palette.accent} strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M35 27 L41 27" stroke={palette.accent} strokeWidth="1.8" strokeLinecap="round"/>
        </>
      )}
      {/* mouth */}
      {mood === 'happy'
        ? <path d="M27 32 Q32 36 37 32" stroke={palette.accent} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        : mood === 'confused'
          ? <path d="M28 33 Q32 31 36 33" stroke={palette.accent} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          : <path d="M29 32 L35 32" stroke={palette.accent} strokeWidth="1.8" strokeLinecap="round"/>}
      {/* name tag */}
      <rect x="24" y="52" width="16" height="8" rx="4" fill="var(--deep-slate)"/>
      <text x="32" y="58" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700" fontFamily="var(--font-kr)">{palette.label}</text>
    </svg>
  );
}

// ─────────────────────────────────────────
// Speech bubble
// ─────────────────────────────────────────
function Bubble({ children, side = 'left', tone = 'white', style = {} }) {
  const tones = {
    white:   { bg: '#fff', fg: 'var(--deep-slate)', border: 'var(--line)' },
    cream:   { bg: '#FFF3E0', fg: '#8A5D45', border: 'transparent' },
    mint:    { bg: 'rgba(123,201,177,.22)', fg: 'var(--fresh-mint-ink)', border: 'transparent' },
    slate:   { bg: 'var(--deep-slate)', fg: '#fff', border: 'transparent' },
  }[tone];
  return (
    <div style={{
      position: 'relative', padding: '8px 11px', borderRadius: 12,
      background: tones.bg, color: tones.fg,
      border: `1px solid ${tones.border}`,
      fontSize: 12, fontWeight: 500, letterSpacing: -0.2, lineHeight: 1.45,
      maxWidth: 180, ...style,
    }}>
      {children}
      <span style={{
        position: 'absolute', bottom: -5,
        [side === 'left' ? 'left' : 'right']: 16,
        width: 0, height: 0,
        borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
        borderTop: `6px solid ${tones.bg}`,
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────
// 4-cut comic (compact card inside policy detail)
// ─────────────────────────────────────────
function FourCutComic({ variant = 'A' }) {
  // Variant A: grid geometric
  // Variant B: single row stripped
  const cuts = [
    { bg: 'var(--baby-sky)', chars: ['bom','jun'], speech: '전세대출... 우리도 되는 거야?', side: 'left', mood: 'confused' },
    { bg: 'var(--butter-cream)', chars: ['rang'], speech: '혼인 7년 이내 · 무주택 · 소득 조건을 볼게요.', side: 'right', mood: 'default' },
    { bg: 'var(--mint-milk)', chars: ['bom','rang'], speech: '조건 충족! 오늘 할 일 정리해드릴게요.', side: 'left', mood: 'happy' },
    { bg: 'var(--peach-milk)', chars: ['card'], speech: '등본 · 혼인관계증명서 준비하기', side: 'right', mood: 'default' },
  ];

  const renderCut = (c, i) => (
    <div key={i} style={{
      background: c.bg, borderRadius: 14, overflow: 'hidden',
      border: '1px solid rgba(38,55,70,.06)',
      padding: 12, position: 'relative',
      minHeight: variant === 'A' ? 132 : 120,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: 'var(--deep-slate)',
          background: 'rgba(255,255,255,.7)', padding: '2px 6px', borderRadius: 6,
        }}>{i + 1}컷</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginTop: 4 }}>
        {c.chars.map((w, j) => <Char key={j} who={w} size={48} mood={c.mood}/>)}
        <div style={{ flex: 1, display: 'flex', justifyContent: c.side === 'left' ? 'flex-start' : 'flex-end', marginBottom: 8 }}>
          <Bubble side={c.side === 'left' ? 'right' : 'left'} tone="white" style={{ fontSize: 11.5 }}>
            {c.speech}
          </Bubble>
        </div>
      </div>
    </div>
  );

  if (variant === 'B') {
    return (
      <div style={{ background: '#fff', borderRadius: 18, padding: 16, border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Badge tone="apricot">4컷으로 보는 정책</Badge>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>전세대출 편</span>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {cuts.map((c, i) => <div key={i} style={{ flex: '0 0 180px' }}>{renderCut(c, i)}</div>)}
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: 16, border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Badge tone="apricot">4컷으로 보는 정책</Badge>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>전세대출 편</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {cuts.map(renderCut)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Shorts / Video card
// ─────────────────────────────────────────
function ShortsCard({ title = '버팀목 전세대출 3분 요약', duration = '3:14', policy = '신혼부부 전세대출', summary = '혼인 7년 이내 · 무주택 · 부부합산 7.5천만원 이하' }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      <div style={{
        height: 140, background: 'var(--baby-sky)',
        position: 'relative', display: 'grid', placeItems: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 99,
          background: 'rgba(255,255,255,.92)', display: 'grid', placeItems: 'center',
          color: 'var(--deep-slate)',
        }}>
          <Ic.play width="18" height="18"/>
        </div>
        <span style={{
          position: 'absolute', bottom: 10, right: 10,
          padding: '3px 8px', borderRadius: 6, background: 'rgba(0,0,0,.55)',
          color: '#fff', fontSize: 11, fontWeight: 600,
        }}>{duration}</span>
        <span style={{
          position: 'absolute', top: 10, left: 10, fontSize: 11,
          color: '#fff', fontWeight: 600, opacity: .85,
        }}>쇼츠로 보는 정책</span>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--deep-slate)', marginBottom: 4, lineHeight: 1.4 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginBottom: 10 }}>연결 정책 · {policy}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 12, lineHeight: 1.5, background: 'var(--surface-2)', padding: '8px 10px', borderRadius: 8 }}>
          <span style={{ color: 'var(--table-blue-ink)', fontWeight: 700 }}>요약 · </span>{summary}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <CTA size="sm" variant="ghost" full>영상 보기</CTA>
          <CTA size="sm" variant="primary" full>요약 보기</CTA>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Today's checklist
// ─────────────────────────────────────────
function Checklist({ items, onToggle, compact = false }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: compact ? 12 : 16, border: '1px solid var(--line)', boxShadow: compact ? 'none' : 'var(--shadow-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--fresh-mint)', display: 'grid', placeItems: 'center', color: '#fff' }}>
          <Ic.check width="12" height="12"/>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--deep-slate)' }}>오늘 할 일</div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-3)' }}>
          {items.filter(i => i.done).length} / {items.length}
        </div>
      </div>
      {items.map((it, i) => (
        <button key={i} onClick={() => onToggle?.(i)} style={{
          width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line-2)',
          textAlign: 'left',
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
            background: it.done ? 'var(--fresh-mint)' : '#fff',
            border: `1.5px solid ${it.done ? 'var(--fresh-mint)' : 'var(--line)'}`,
            display: 'grid', placeItems: 'center', color: '#fff',
          }}>
            {it.done && <Ic.check width="12" height="12"/>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: it.done ? 'var(--ink-4)' : 'var(--deep-slate)', textDecoration: it.done ? 'line-through' : 'none', lineHeight: 1.4 }}>{it.title}</div>
            {it.hint && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{it.hint}</div>}
          </div>
          {it.meta && <span style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 3 }}>{it.meta}</span>}
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { Char, Bubble, FourCutComic, ShortsCard, Checklist });
