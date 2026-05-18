// 01 · Archive Home — 신혼생활(sinhon.life)

function ArchiveHero() {
  return (
    <div style={{
      position: 'relative',
      background: G.heroSky,
      paddingTop: 18,
      paddingBottom: 44,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      overflow: 'hidden',
    }}>
      <GlassBubble size={64} top={120} right={-14} opacity={0.22} icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 9a3 3 0 013-3h8a3 3 0 013 3v6a3 3 0 01-3 3H8a3 3 0 01-3-3V9z" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M5 13H3M21 13h-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      } />
      <GlassBubble size={42} top={-10} left={-18} opacity={0.18} icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" stroke="currentColor" strokeWidth="1.4"/>
        </svg>
      } />

      <div style={{ padding: '20px 28px 0' }}>
        <MicroLabel color={T.onBlueFaint}>The Newlywed Archive · 01</MicroLabel>
        <div style={{
          marginTop: 24,
          fontSize: 38, fontWeight: 700, letterSpacing: '-0.045em',
          color: T.onBlue, lineHeight: 1.1,
        }}>
          신혼의 모든 순간,<br/>
          <span style={{ color: T.onBlueMute, fontWeight: 500 }}>
            해시태그로 펼쳐보다.
          </span>
        </div>
        <div style={{
          marginTop: 22, fontSize: 13.5, color: T.onBlueMute,
          lineHeight: 1.7, letterSpacing: '-0.01em', maxWidth: 270,
        }}>
          인스타에 흩어진 신혼 영상을 한 곳에 모았어요.<br/>
          태그 하나로 원하는 장면만 골라 보세요.
        </div>
      </div>

      <div style={{ position: 'absolute', right: 18, bottom: 18 }}>
        <CharacterBubble size={108} />
      </div>
    </div>
  );
}

function ArchiveTagRail() {
  const tags = [
    { label: '# 전체', active: true, count: '1.2k' },
    { label: '# 신혼집', count: '324' },
    { label: '# 혼수',  count: '218' },
    { label: '# 스드메', count: '186' },
    { label: '# 출산준비', count: '142' },
    { label: '# 청약',  count: '98' },
    { label: '# 살림',  count: '76' },
    { label: '# 신혼여행', count: '64' },
  ];
  return (
    <div style={{ marginTop: 40 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '0 28px',
      }}>
        <MicroLabel>Popular Tags</MicroLabel>
        <span style={{ fontSize: 11, color: T.faint, letterSpacing: '-0.01em' }}>실시간</span>
      </div>
      <div style={{
        marginTop: 16,
        display: 'flex', gap: 8, overflowX: 'auto',
        padding: '4px 28px 8px',
        scrollbarWidth: 'none',
      }}>
        {tags.map((t, i) => (
          <Pill key={i} onWhite active={t.active}>
            {t.label}{t.count ? <span style={{
              marginLeft: 10, opacity: 0.85, fontSize: 11, fontWeight: 400,
            }}>{t.count}</span> : null}
          </Pill>
        ))}
      </div>
    </div>
  );
}

function ArchiveGrid() {
  const cards = [
    { tags: ['#신혼집', '#셀프인테리어'], title: '15평 빌라, 우리만의 무드로 채운 6개월', dur: '0:48', label: 'reel · 신혼집' },
    { tags: ['#스드메'],                title: '스드메 1,200만 원, 어디서 줄였나 (현실편)', dur: '1:12', label: 'reel · 스드메' },
    { tags: ['#혼수', '#가전'],          title: '꼭 사야 했던 가전 5 / 안 사도 됐던 것 4', dur: '0:36', label: 'reel · 혼수' },
    { tags: ['#출산준비'],              title: '출산 4주 전 체크리스트, 솔직 후기', dur: '1:05', label: 'reel · 출산' },
    { tags: ['#살림', '#루틴'],          title: '맞벌이 부부의 주말 살림 루틴', dur: '0:52', label: 'reel · 살림' },
    { tags: ['#청약'],                  title: '신혼특공 당첨까지, 6개월의 기록', dur: '1:24', label: 'reel · 청약' },
    { tags: ['#신혼여행'],              title: '예산 200으로 다녀온 오키나와 8박', dur: '0:58', label: 'reel · 여행' },
    { tags: ['#신혼집', '#정리'],        title: '드레스룸이 없을 때, 옷장 정리법', dur: '0:42', label: 'reel · 정리' },
  ];
  return (
    <div style={{ padding: '44px 22px 180px' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        padding: '0 6px', marginBottom: 24, gap: 12,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <MicroLabel>This Week</MicroLabel>
          <div style={{
            marginTop: 10, fontSize: 20, fontWeight: 600,
            letterSpacing: '-0.03em', color: T.ink,
            whiteSpace: 'nowrap',
          }}>지금, 신혼이 보는 영상</div>
        </div>
        <span style={{
          fontSize: 11, color: T.faint, whiteSpace: 'nowrap',
          paddingBottom: 4, letterSpacing: '-0.01em',
        }}>총 {cards.length}개</span>
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

function ArchiveHomeScreen() {
  return (
    <ScreenShell tab="home">
      <div style={{ paddingTop: 54, background: T.blueSoft }}>
        <ArchiveHero />
      </div>
      <ArchiveTagRail />
      <ArchiveGrid />
    </ScreenShell>
  );
}

window.ArchiveHomeScreen = ArchiveHomeScreen;
