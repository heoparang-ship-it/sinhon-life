// 02 · Search — 해시태그 다중 필터 + 결과 그리드

function SearchHero({ selected }) {
  return (
    <div style={{
      position: 'relative',
      background: G.heroSky,
      paddingTop: 18,
      paddingBottom: 28,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      overflow: 'hidden',
    }}>
      <GlassBubble size={56} top={20} right={-16} opacity={0.20} icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      } />

      <div style={{ padding: '20px 28px 0' }}>
        <MicroLabel color={T.onBlueFaint}>Tag Search · 02</MicroLabel>
        <div style={{
          marginTop: 16,
          fontSize: 30, fontWeight: 700, letterSpacing: '-0.04em',
          color: T.onBlue, lineHeight: 1.15,
        }}>
          태그로 찾는<br/>
          <span style={{ color: T.onBlueMute, fontWeight: 500 }}>우리만의 신혼 영상.</span>
        </div>

        {/* search input */}
        <div style={{
          marginTop: 22,
          display: 'flex', alignItems: 'center', gap: 10,
          height: 50, padding: '0 18px',
          borderRadius: 16,
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 12px 28px -16px rgba(20,40,80,0.30)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="6.5" stroke={T.accentDeep} strokeWidth="1.6"/>
            <path d="M16 16l4 4" stroke={T.accentDeep} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <span style={{
            color: T.mute, fontSize: 14.5, letterSpacing: '-0.015em',
            fontWeight: 500, flex: 1,
          }}>해시태그를 입력하세요</span>
          <span style={{
            color: T.faint, fontSize: 12, fontWeight: 500,
            paddingLeft: 8, borderLeft: '1px solid rgba(120,140,170,0.18)',
          }}>#</span>
        </div>

        {/* selected (active) filter chips */}
        <div style={{
          marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap',
        }}>
          {selected.map((t, i) => (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 32, padding: '0 6px 0 14px', borderRadius: 999,
              background: G.pillActiveOnBlue,
              color: T.ink, fontSize: 12.5, fontWeight: 600,
              letterSpacing: '-0.01em',
              boxShadow: '0 6px 18px -10px rgba(20,40,80,0.35)',
            }}>
              {t}
              <span style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(26,36,51,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path d="M2 2l6 6M8 2l-6 6" stroke={T.ink} strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SuggestedTags() {
  const groups = [
    { title: '카테고리', tags: [
      ['#예산', '120'], ['#인테리어', '94'], ['#육아', '72'],
      ['#커플일상', '58'], ['#맞벌이', '44'], ['#주말루틴', '36'],
    ] },
  ];
  return (
    <div style={{ padding: '36px 28px 0' }}>
      {groups.map((g, gi) => (
        <div key={gi} style={{ marginBottom: gi === 0 ? 32 : 0 }}>
          <MicroLabel>{g.title}</MicroLabel>
          <div style={{
            marginTop: 14,
            display: 'flex', gap: 8, flexWrap: 'wrap',
          }}>
            {g.tags.map(([t, c], i) => (
              <Pill key={i} onWhite size={34}>
                {t}<span style={{
                  marginLeft: 8, opacity: 0.55, fontSize: 11, fontWeight: 500,
                  fontVariantNumeric: 'tabular-nums',
                }}>{c}</span>
              </Pill>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchResults() {
  const cards = [
    { tags: ['#신혼집', '#셀프인테리어'], title: '15평 빌라, 6개월 셀프 인테리어 기록', dur: '0:48', label: 'reel · 신혼집' },
    { tags: ['#신혼집', '#원룸'],         title: '원룸 신혼집도 충분히 예쁠 수 있다', dur: '0:54', label: 'reel · 신혼집' },
    { tags: ['#신혼집', '#정리'],         title: '드레스룸이 없을 때 옷장 정리법', dur: '0:42', label: 'reel · 정리' },
    { tags: ['#신혼집', '#투자'],         title: '신혼집 첫 1년, 가구 투자 후회 없는 5가지', dur: '1:18', label: 'reel · 가구' },
  ];
  return (
    <div style={{ padding: '20px 22px 180px' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '0 6px', marginBottom: 18,
      }}>
        <div style={{
          fontSize: 20, fontWeight: 600,
          letterSpacing: '-0.03em', color: T.ink,
        }}>#신혼집 영상 248개</div>
        <div style={{
          fontSize: 11, color: T.mute, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          최신순
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        columnGap: 16, rowGap: 32,
      }}>
        {cards.map((c, i) => <VideoCard key={i} {...c} />)}
      </div>
    </div>
  );
}

function SearchScreen() {
  const selected = ['#신혼집'];
  return (
    <ScreenShell tab="search">
      <div style={{ paddingTop: 54, background: T.blueSoft }}>
        <SearchHero selected={selected} />
      </div>
      <SuggestedTags />
      <SearchResults />
    </ScreenShell>
  );
}

window.SearchScreen = SearchScreen;
