// 03 · Video Detail — 9:16 영상 + 메타 + 인스타 원본 링크

function DetailTopBar() {
  return (
    <div style={{
      position: 'absolute', top: 54, left: 0, right: 0,
      padding: '12px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      zIndex: 10,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 18px -8px rgba(20,40,80,0.25)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke={T.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{
        display: 'flex', gap: 8,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 18px -8px rgba(20,40,80,0.25)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" stroke={T.ink} strokeWidth="1.6"/>
          </svg>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 18px -8px rgba(20,40,80,0.25)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 12h16M4 6h16M4 18h16" stroke={T.ink} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function VideoStage() {
  return (
    <div style={{
      position: 'relative',
      background: G.heroSky,
      paddingTop: 104, paddingBottom: 14,
      paddingLeft: 10, paddingRight: 10,
      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'relative', width: '100%',
        aspectRatio: '9 / 16',
        borderRadius: 16, overflow: 'hidden',
        background: T.surface,
        boxShadow: '0 30px 60px -28px rgba(20,40,80,0.45)',
      }}>
        {/* faint grain */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(135deg, rgba(90,130,180,0.05) 0 1px, transparent 1px 18px)',
        }} />
        {/* big play */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <defs>
              <linearGradient id="bigPlay" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
                <stop offset="60%" stopColor="#F0F7FD" stopOpacity="0.92"/>
                <stop offset="100%" stopColor="#DCECFA" stopOpacity="0.88"/>
              </linearGradient>
            </defs>
            <circle cx="36" cy="36" r="35" fill="url(#bigPlay)" stroke="rgba(59,139,207,0.20)" strokeWidth="1"/>
            <path d="M30 24L48 36L30 48V24Z" fill="#3B8BCF" opacity="0.85"/>
          </svg>
        </div>
        {/* duration */}
        <div style={{
          position: 'absolute', bottom: 16, right: 16,
          padding: '6px 14px', borderRadius: 999,
          background: G.glassChip,
          color: T.accentDeep,
          fontSize: 12, fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          boxShadow: '0 4px 12px -6px rgba(20,40,80,0.20)',
        }}>0:48</div>
        {/* placeholder label */}
        <div style={{ position: 'absolute', top: 18, left: 20 }}>
          <span style={{
            fontFamily: T.font,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
            color: '#3B8BCF', opacity: 0.65, textTransform: 'uppercase',
          }}>reel · 신혼집</span>
        </div>
      </div>
    </div>
  );
}

function DetailMeta() {
  const tags = ['#신혼집', '#셀프인테리어', '#15평'];
  return (
    <div style={{ padding: '36px 28px 0' }}>
      <MicroLabel>Newlywed Reel</MicroLabel>
      <div style={{
        marginTop: 12,
        fontSize: 22, fontWeight: 700, letterSpacing: '-0.035em',
        color: T.ink, lineHeight: 1.3,
      }}>
        15평 빌라, 우리만의 무드로<br/>채운 6개월의 기록
      </div>

      <div style={{
        marginTop: 16,
        display: 'flex', gap: 8, flexWrap: 'wrap',
      }}>
        {tags.map((t, i) => (
          <Pill key={i} onWhite size={32} style={{ fontSize: 12 }}>
            {t}<span style={{
              marginLeft: 8, opacity: 0.55, fontSize: 10.5, fontWeight: 500,
              fontVariantNumeric: 'tabular-nums',
            }}>{['248','62','34'][i] || ''}</span>
          </Pill>
        ))}
      </div>

      {/* creator */}
      <div style={{
        marginTop: 24,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: G.pillIdleOnWhite,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.accentDeep, fontSize: 14, fontWeight: 700,
          letterSpacing: '-0.01em',
        }}>@</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, letterSpacing: '-0.01em' }}>
            @newlywed_diary
          </div>
          <div style={{ fontSize: 11.5, color: T.mute }}>
            인스타그램 · 4일 전
          </div>
        </div>
      </div>

      {/* description */}
      <div style={{
        marginTop: 22,
        fontSize: 13.5, color: T.inkSoft,
        lineHeight: 1.75, letterSpacing: '-0.01em',
      }}>
        예산 800만 원으로 시작한 첫 신혼집.<br/>
        벽지부터 가구 배치까지, 둘이 결정한 모든 것을 6개월 동안 기록했어요.
        가장 후회 없는 선택과, 다시 한다면 바꿀 한 가지를 솔직하게 정리했습니다.
      </div>

      {/* primary CTA */}
      <div style={{ marginTop: 28 }}>
        <a style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          height: 54, borderRadius: 16,
          background: G.pillActiveOnWhite,
          color: '#FFFFFF',
          fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.015em',
          boxShadow: '0 18px 36px -16px rgba(74,155,224,0.55)',
          textDecoration: 'none',
        }}>
          인스타그램에서 원본 보기
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

function RelatedRail() {
  const cards = [
    { tags: ['#신혼집'], title: '원룸 신혼집도 충분히 예쁠 수 있다', dur: '0:54', label: 'reel' },
    { tags: ['#정리'],   title: '드레스룸이 없을 때 옷장 정리법',    dur: '0:42', label: 'reel' },
    { tags: ['#가전'],   title: '꼭 사야 했던 가전 5 / 아닌 것 4',   dur: '0:36', label: 'reel' },
  ];
  return (
    <div style={{ padding: '40px 22px 180px' }}>
      <div style={{ padding: '0 6px' }}>
        <MicroLabel>Related</MicroLabel>
        <div style={{
          marginTop: 10, fontSize: 18, fontWeight: 600,
          letterSpacing: '-0.03em', color: T.ink,
        }}>비슷한 결의 영상</div>
      </div>
      <div style={{
        marginTop: 22,
        display: 'flex', gap: 14, overflowX: 'auto',
        padding: '0 6px 8px',
        scrollbarWidth: 'none',
      }}>
        {cards.map((c, i) => (
          <div key={i} style={{ flex: '0 0 132px' }}>
            <VideoCard {...c} />
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoDetailScreen() {
  return (
    <div style={{
      width: '100%', height: '100%', background: T.white,
      position: 'relative', overflow: 'hidden',
      fontFamily: T.font, color: T.ink,
    }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
        <VideoStage />
        <DetailMeta />
        <RelatedRail />
      </div>
      <DetailTopBar />
    </div>
  );
}

window.VideoDetailScreen = VideoDetailScreen;
