// 05 · MY — 로그인 상태 자리 (회원 자리만)

function MyHero() {
  return (
    <div style={{
      position: 'relative',
      background: G.heroSky,
      paddingTop: 18, paddingBottom: 56,
      borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      overflow: 'hidden',
    }}>
      <GlassBubble size={48} top={30} right={-12} opacity={0.18} icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      } />

      <div style={{ padding: '20px 28px 0' }}>
        <MicroLabel color={T.onBlueFaint}>My Profile · 05</MicroLabel>

        <div style={{
          marginTop: 28,
          display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <CharacterBubble size={84} label={'캐릭터\n만들기'} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 22, fontWeight: 700, letterSpacing: '-0.035em',
              color: T.onBlue, lineHeight: 1.2,
            }}>닉네임 자리</div>
            <div style={{
              marginTop: 6, fontSize: 12.5, color: T.onBlueMute,
              letterSpacing: '-0.01em',
            }}>kakao · 결혼 2년차 · 둘이서 이용중</div>
          </div>
        </div>

        {/* stats — placeholder, no real data */}
        <div style={{
          marginTop: 26,
          padding: '16px 18px',
          borderRadius: 18,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        }}>
          {[
            { label: '저장한 영상', value: '24' },
            { label: '이번달 내역', value: '18' },
            { label: '함께한 일', value: '2년 3개월' },
          ].map((s, i) => (
            <div key={i} style={{
              borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.22)',
              paddingLeft: i === 0 ? 0 : 14,
              paddingRight: i === 2 ? 0 : 8,
            }}>
              <div style={{
                fontSize: 16, fontWeight: 700, color: T.onBlue,
                letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
              }}>{s.value}</div>
              <div style={{
                marginTop: 4, fontSize: 10.5, fontWeight: 500,
                color: T.onBlueMute, letterSpacing: '-0.005em',
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MyMenuItem({ icon, title, sub, badge }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '16px 4px',
      borderBottom: '1px solid rgba(120,140,170,0.10)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: G.pillIdleOnWhite,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.accentDeep,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: T.ink,
          letterSpacing: '-0.015em',
        }}>{title}</div>
        {sub && (
          <div style={{
            marginTop: 3, fontSize: 11.5, color: T.mute,
            letterSpacing: '-0.005em',
          }}>{sub}</div>
        )}
      </div>
      {badge && (
        <span style={{
          fontSize: 10.5, fontWeight: 600,
          padding: '4px 10px', borderRadius: 999,
          background: G.pillIdleOnWhite, color: T.accentDeep,
          letterSpacing: '-0.005em',
        }}>{badge}</span>
      )}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M9 5l7 7-7 7" stroke={T.faint} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function MyMenu() {
  return (
    <div style={{ padding: '36px 28px 0' }}>
      <MicroLabel>Account</MicroLabel>
      <div style={{ marginTop: 14 }}>
        <MyMenuItem
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>}
          title="내 정보"
          sub="닉네임, 결혼 시기, 알림 설정"
        />
        <MyMenuItem
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" stroke="currentColor" strokeWidth="1.6"/></svg>}
          title="저장한 영상"
          sub="나중에 다시 볼 영상 모음"
          badge="24"
        />
        <MyMenuItem
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>}
          title="가계부 설정"
          sub="예산, 카테고리, 함께 쓰는 파트너"
        />
      </div>

      <div style={{ marginTop: 36 }}>
        <MicroLabel>Support</MicroLabel>
        <div style={{ marginTop: 14 }}>
          <MyMenuItem
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M10 9.5a2 2 0 113 1.7c-.6.3-1 .8-1 1.5v.3M12 16.2v.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>}
            title="도움말 & 문의"
          />
          <MyMenuItem
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M5 12h14M5 17h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>}
            title="약관 및 정책"
          />
        </div>
      </div>

      <div style={{
        marginTop: 40, marginBottom: 160,
        textAlign: 'center',
      }}>
        <span style={{
          fontSize: 12, color: T.faint, fontWeight: 500,
          letterSpacing: '-0.005em',
        }}>로그아웃</span>
        <div style={{
          marginTop: 18, fontSize: 11, color: T.faint,
          letterSpacing: '0.02em',
        }}>sinhon.life · v0.1.0</div>
      </div>
    </div>
  );
}

function MyScreen() {
  return (
    <ScreenShell tab="my">
      <div style={{ paddingTop: 54, background: T.blueSoft }}>
        <MyHero />
      </div>
      <MyMenu />
    </ScreenShell>
  );
}

window.MyScreen = MyScreen;
