// 04 · Ledger — 가계부 (로그인 후)

function LedgerHero() {
  return (
    <div style={{
      position: 'relative',
      background: G.heroSky,
      paddingTop: 18, paddingBottom: 36,
      borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      overflow: 'hidden'
    }}>
      <GlassBubble size={56} top={20} right={-16} opacity={0.20} icon={
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="6" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      } />

      <div style={{ padding: '20px 28px 0' }}>
        <MicroLabel color={T.onBlueFaint}>Our Ledger · 04 · 2026.05</MicroLabel>
        <div style={{
          marginTop: 18,
          fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em',
          color: T.onBlue, lineHeight: 1.15
        }}>
          이번 달, 우리 둘<br />
          <span style={{ color: T.onBlueMute, fontWeight: 500 }}>이렇게 살았어요.</span>
        </div>

        {/* balance card */}
        <div style={{
          marginTop: 26,
          padding: '22px 22px 20px',
          borderRadius: 22,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '0 18px 40px -18px rgba(20,40,80,0.30)'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <MicroLabel>Balance</MicroLabel>
            <span style={{ fontSize: 11, color: T.faint }}>2026.05.01 — 18</span>
          </div>
          <div style={{
            marginTop: 12,
            fontSize: 36, fontWeight: 700, letterSpacing: '-0.04em',
            color: T.ink, fontVariantNumeric: 'tabular-nums'
          }}>
            +1,842,300<span style={{ fontSize: 18, fontWeight: 600, color: T.mute, marginLeft: 4 }}>원</span>
          </div>
          <div style={{
            marginTop: 4, fontSize: 11.5, color: T.mute, letterSpacing: '-0.01em'
          }}>
            지난달보다 320,400원 더 모았어요
          </div>

          {/* split: income / expense */}
          <div style={{
            marginTop: 22,
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 14
          }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: T.mute,
                letterSpacing: '0.04em', textTransform: 'uppercase'
              }}>수입</div>
              <div style={{
                marginTop: 6,
                fontSize: 19, fontWeight: 700,
                color: T.accentDeep, letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums'
              }}>+5,820,000</div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(120,140,170,0.16)', paddingLeft: 14 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: T.mute,
                letterSpacing: '0.04em', textTransform: 'uppercase'
              }}>지출</div>
              <div style={{
                marginTop: 6,
                fontSize: 19, fontWeight: 700,
                color: T.expense, letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums'
              }}>−3,977,700</div>
            </div>
          </div>

          {/* progress bar */}
          <div style={{
            marginTop: 18, height: 8, borderRadius: 999,
            background: G.pillIdleOnWhite,
            overflow: 'hidden'
          }}>
            <div style={{
              width: '68%', height: '100%',
              background: G.pillActiveOnWhite,
              borderRadius: 999
            }} />
          </div>
          <div style={{
            marginTop: 8, fontSize: 11, color: T.mute,
            display: 'flex', justifyContent: 'space-between'
          }}>
            <span>지출 / 예산</span>
            <span style={{ fontWeight: 600, color: T.inkSoft, fontVariantNumeric: 'tabular-nums' }}>68%</span>
          </div>
        </div>
      </div>
    </div>);

}

function CategoryRail() {
  const cats = [
  { name: '전체', active: true },
  { name: '식비' },
  { name: '주거' },
  { name: '교통' },
  { name: '쇼핑' },
  { name: '문화' },
  { name: '경조사' }];

  return (
    <div style={{ marginTop: 36 }}>
      <div style={{ padding: '0 28px' }}>
        <MicroLabel>Categories</MicroLabel>
      </div>
      <div style={{
        marginTop: 14,
        display: 'flex', gap: 8, overflowX: 'auto',
        padding: '4px 28px 8px',
        scrollbarWidth: 'none'
      }}>
        {cats.map((c, i) =>
        <Pill key={i} onWhite active={c.active} size={34}>{c.name}</Pill>
        )}
      </div>
    </div>);

}

function LedgerRow({ kind, cat, memo, who, time, amount }) {
  const isIncome = kind === 'in';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 4px',
      borderBottom: '1px solid rgba(120,140,170,0.10)'
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: isIncome ?
        'linear-gradient(135deg, rgba(74,155,224,0.16), rgba(140,200,242,0.10))' :
        'linear-gradient(135deg, rgba(217,126,106,0.16), rgba(240,180,162,0.10))',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {isIncome ?
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12l7-7 7 7" stroke={T.accentDeep} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg> :

        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 19V5M19 12l-7 7-7-7" stroke={T.expense} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 600, color: T.ink,
          letterSpacing: '-0.015em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>{memo}</div>
        <div style={{
          marginTop: 3, fontSize: 11, color: T.mute,
          letterSpacing: '-0.005em'
        }}>{cat} · {who} · {time}</div>
      </div>
      <div style={{
        fontSize: 14, fontWeight: 700,
        color: isIncome ? T.accentDeep : T.expense,
        letterSpacing: '-0.015em',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap'
      }}>
        {isIncome ? '+' : '−'}{amount}
      </div>
    </div>);

}

function LedgerList() {
  const days = [
  {
    date: '5월 18일 · 토',
    day: '−84,200',
    rows: [
    { kind: 'out', cat: '식비', memo: '연남동 브런치', who: '아내', time: '11:20', amount: '48,000' },
    { kind: 'out', cat: '쇼핑', memo: '리빙숍 무드등', who: '남편', time: '15:40', amount: '36,200' }]

  },
  {
    date: '5월 17일 · 금',
    day: '+2,820,000',
    rows: [
    { kind: 'in', cat: '월급', memo: '5월 급여', who: '남편', time: '10:00', amount: '2,820,000' },
    { kind: 'out', cat: '주거', memo: '관리비', who: '공동', time: '18:10', amount: '128,400' },
    { kind: 'out', cat: '식비', memo: '장보기 (홈플)', who: '아내', time: '20:30', amount: '62,800' }]

  },
  {
    date: '5월 16일 · 목',
    day: '−42,100',
    rows: [
    { kind: 'out', cat: '교통', memo: '주유', who: '남편', time: '08:40', amount: '42,100' }]

  }];


  return (
    <div style={{ padding: '32px 26px 200px' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        padding: '0 4px', marginBottom: 18
      }}>
        <div>
          <MicroLabel>Entries</MicroLabel>
          <div style={{
            marginTop: 10, fontSize: 20, fontWeight: 600,
            letterSpacing: '-0.03em', color: T.ink
          }}>최근 내역</div>
        </div>
        <span style={{ fontSize: 11, color: T.faint }}>총 18건</span>
      </div>

      {days.map((d, i) =>
      <div key={i} style={{ marginTop: i === 0 ? 0 : 24 }}>
          <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          padding: '0 4px 6px'
        }}>
            <span style={{
            fontSize: 12, fontWeight: 600, color: T.inkSoft,
            letterSpacing: '-0.01em'
          }}>{d.date}</span>
            <span style={{
            fontSize: 11.5, fontWeight: 600,
            color: d.day.startsWith('+') ? T.accentDeep : T.expense,
            fontVariantNumeric: 'tabular-nums'
          }}>{d.day}</span>
          </div>
          <div>
            {d.rows.map((r, j) => <LedgerRow key={j} {...r} />)}
          </div>
        </div>
      )}
    </div>);

}

function AddFab() {
  return (
    <div style={{
      position: 'absolute', right: 26, bottom: 110,
      width: 60, height: 60, borderRadius: '50%',
      background: G.pillActiveOnWhite,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 16px 32px -10px rgba(74,155,224,0.55), 0 2px 6px rgba(20,40,80,0.10)',
      zIndex: 20
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>);

}

function LedgerScreen() {
  return (
    <ScreenShell tab="ledger">
      <div style={{ paddingTop: 54, background: T.blueSoft }}>
        <LedgerHero />
      </div>
      <CategoryRail />
      <LedgerList />
      <AddFab />
    </ScreenShell>);

}

// ─── 04b · Ledger — 비로그인 진입 (카카오 게이트) ─────────
function LedgerGateScreen() {
  return (
    <ScreenShell tab="ledger">
      {/* full blue zone */}
      <div style={{
        minHeight: '100%',
        background: G.heroSky,
        paddingTop: 54,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <GlassBubble size={64} top={120} right={-14} opacity={0.22} icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="6" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        } />
        <GlassBubble size={44} top={420} left={-18} opacity={0.18} icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        } />

        <div style={{ padding: '32px 28px 0' }}>
          <MicroLabel color={T.onBlueFaint}>Login Required · 04</MicroLabel>
        </div>

        {/* big character */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          marginTop: 56
        }}>
          <CharacterBubble size={160} label={'couple\n3D'} />
        </div>

        <div style={{ padding: '40px 32px 0', textAlign: 'center' }}>
          <div style={{
            fontSize: 30, fontWeight: 700, letterSpacing: '-0.04em',
            color: T.onBlue, lineHeight: 1.2
          }}>
            커플 가계부,<br />
            <span style={{ color: T.onBlueMute, fontWeight: 500 }}>함께 쓸 수 있어요.</span>
          </div>

        </div>

        {/* kakao button */}
        <div style={{
          position: 'absolute', left: 22, right: 22, bottom: 130
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            height: 56, borderRadius: 16,
            background: T.kakao,
            color: T.kakaoText,
            fontSize: 15, fontWeight: 700, letterSpacing: '-0.015em',
            boxShadow: '0 18px 36px -12px rgba(254,229,0,0.45), 0 4px 10px rgba(0,0,0,0.06)'
          }}>
            {/* kakao bubble glyph */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 4C7 4 3 7 3 11c0 2.4 1.6 4.5 4 5.7L6 21l4.8-2.4c.4 0 .8 0 1.2 0 5 0 9-3 9-7s-4-7-9-7z" fill={T.kakaoText} />
            </svg>
            카카오로 시작하기
          </div>
          <div style={{
            marginTop: 14, textAlign: 'center',
            fontSize: 11.5, color: T.onBlueFaint, letterSpacing: '-0.01em'
          }}>
            계속하면 이용약관·개인정보 처리방침에 동의하게 됩니다
          </div>
        </div>
      </div>
    </ScreenShell>);

}

window.LedgerScreen = LedgerScreen;
window.LedgerGateScreen = LedgerGateScreen;