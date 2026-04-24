/* global React */
// sinhon.life — Mobile Home / Quiz / Result (v4: 오늘의집 style — white bg, color only in cards)

const { useState: useS3 } = React;

// ─────────────────────────────────────────
// HOME — white bg, search focus blue, hero = white card with Sky/Peach inner tiles
// ─────────────────────────────────────────
function ScreenHome({ go, hero = 'fullbleed' }) {
  return (
    <div style={{ paddingTop: 52, paddingBottom: 90, minHeight: '100%', background: 'var(--bg)' }}>
      {/* top */}
      <div style={{ padding: '8px 16px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <SinhonLogo size={16}/>
        <div style={{ flex: 1 }}/>
        <button style={{ width: 36, height: 36, borderRadius: 99, display: 'grid', placeItems: 'center', color: 'var(--ink-2)' }}>
          <Ic.bookmark width="18" height="18"/>
        </button>
      </div>

      {/* search — section fill, blue icon */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 46, padding: '0 14px',
          background: 'var(--section)', borderRadius: 14,
        }}>
          <Ic.search width="18" height="18" style={{ color: 'var(--primary)' }}/>
          <span style={{ fontSize: 13.5, color: 'var(--ink-3)', flex: 1 }}>정책, 조건, 용어로 검색해보세요</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}>
          {['전세대출', '디딤돌', '신혼특공', '출산지원금', '첫만남이용권'].map(t => (
            <span key={t} style={{
              padding: '6px 11px', borderRadius: 99, background: '#fff',
              border: '1px solid var(--line)', fontSize: 12, color: 'var(--ink-2)',
              fontWeight: 500, whiteSpace: 'nowrap',
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* HERO — white card, color only inside sub-tiles */}
      <div style={{ padding: '6px 16px 4px' }}>
        {hero === 'fullbleed' ? (
          <div onClick={() => go?.('quiz')} style={{
            borderRadius: 22, padding: 20, background: '#fff',
            border: '1px solid var(--line)', cursor: 'pointer',
          }}>
            <Badge tone="sky" size="sm">30초 진단</Badge>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.3, letterSpacing: -0.5, marginTop: 12 }}>
              우리 부부, <span style={{ color: 'var(--primary)' }}>지금 받을 수 있는</span><br/>혜택이 있을까요?
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.55 }}>
              3개 질문으로 우리 부부 혜택을 오늘 할 일로 정리해드릴게요.
            </div>
            {/* sub-cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
              <div style={{ background: 'var(--sky-card)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 10.5, color: 'var(--sky-ink)', fontWeight: 700, letterSpacing: 0.2 }}>정책 번역</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 600, marginTop: 3, lineHeight: 1.35 }}>어려운 용어를<br/>쉬운 말로</div>
              </div>
              <div style={{ background: 'var(--peach-card)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 10.5, color: 'var(--peach-ink)', fontWeight: 700, letterSpacing: 0.2 }}>4컷 만화</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 600, marginTop: 3, lineHeight: 1.35 }}>공문 말고<br/>4컷으로 먼저</div>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <CTA size="md" full icon={<Ic.sparkle width="14" height="14"/>}>우리 혜택 30초만에 찾기</CTA>
            </div>
          </div>
        ) : hero === 'card' ? (
          <div onClick={() => go?.('quiz')} style={{
            borderRadius: 22, padding: 4, background: '#fff', border: '1px solid var(--line)',
          }}>
            <div style={{ padding: 18, borderRadius: 18, background: 'var(--sky-card)' }}>
              <span style={{ display: 'inline-flex', padding: '4px 9px', borderRadius: 99, background: '#fff', color: 'var(--primary-ink)', fontSize: 11, fontWeight: 700 }}>30초 진단</span>
              <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)', marginTop: 10, lineHeight: 1.3 }}>
                우리 부부, 지금 받을 수 있는<br/>혜택이 있을까요?
              </div>
              <div style={{ marginTop: 14 }}>
                <CTA size="md" full>우리 혜택 30초만에 찾기</CTA>
              </div>
            </div>
          </div>
        ) : (
          <div onClick={() => go?.('quiz')} style={{
            borderRadius: 20, padding: 18, background: '#fff', border: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: 'var(--sky-card)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Ic.sparkle width="24" height="24" style={{ color: 'var(--primary)' }}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.35 }}>우리 혜택 30초만에 찾기</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 4 }}>3개 질문만 답하면 끝</div>
            </div>
            <Ic.chevron style={{ color: 'var(--ink-4)' }}/>
          </div>
        )}
      </div>

      {/* 4컷 섹션 */}
      <div style={{ padding: '22px 16px 8px' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.3 }}>공문 말고, 4컷으로 먼저 보기</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>랑·봄·준이 쉬운말로 정리해드려요</div>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginLeft: -16, paddingLeft: 16, paddingRight: 16 }}>
          {[
            { title: '신혼 전세대출', sub: '버팀목 편', bg: 'var(--peach-card)', ch: 'bom' },
            { title: '신혼특공 청약', sub: '소득·자산 편', bg: 'var(--peach-card)', ch: 'jun' },
            { title: '첫만남이용권', sub: '200만원 편', bg: 'var(--peach-card)', ch: 'card' },
          ].map((c, i) => (
            <div key={i} onClick={() => go?.('detail')} style={{
              flex: '0 0 172px', borderRadius: 16, background: c.bg, padding: 14, cursor: 'pointer',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--peach-ink)', letterSpacing: 0.3 }}>{c.sub}</div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)', marginTop: 2, lineHeight: 1.3 }}>{c.title}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.4 }}>4컷으로 3분 이해</div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Char who={c.ch} size={64}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 쇼츠 */}
      <div style={{ padding: '18px 16px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>3분 요약 영상</div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 2 }}>전체 <Ic.chevron width="10" height="10"/></div>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginLeft: -16, paddingLeft: 16, paddingRight: 16 }}>
          {[
            { t: '버팀목 전세대출, 3분 요약', pol: '신혼 전세대출', dur: '3:12' },
            { t: '신혼특공 가점, 이거만 보면 끝', pol: '신혼특공', dur: '2:48' },
            { t: '첫만남이용권 쓰는 법', pol: '출산지원금', dur: '2:05' },
          ].map((v, i) => (
            <div key={i} style={{ flex: '0 0 200px', borderRadius: 14, background: '#fff', border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ height: 110, background: 'var(--sky-card)', position: 'relative', display: 'grid', placeItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 99, background: '#fff', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14"><path d="M4 3 L11 7 L4 11 Z" fill="currentColor"/></svg>
                </div>
                <span style={{ position: 'absolute', bottom: 6, right: 6, fontSize: 10, color: '#fff', background: 'rgba(23,32,51,.75)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>{v.dur}</span>
                <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 10, color: 'var(--primary-ink)', background: '#fff', padding: '3px 7px', borderRadius: 99, fontWeight: 700 }}>#{v.pol}</span>
              </div>
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.35, minHeight: 34 }}>{v.t}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  <button style={{ flex: 1, fontSize: 11, fontWeight: 700, padding: '6px 0', borderRadius: 8, background: 'var(--primary)', color: '#fff' }}>요약 보기</button>
                  <button style={{ flex: 1, fontSize: 11, fontWeight: 600, padding: '6px 0', borderRadius: 8, background: '#fff', color: 'var(--ink-2)', border: '1px solid var(--line)' }}>영상</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 마감 임박 */}
      <div style={{ padding: '18px 16px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>곧 마감이에요</div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 2 }}>전체 <Ic.chevron width="10" height="10"/></div>
        </div>
        {[
          { t: '서울시 신혼부부 임차보증금 이자지원', d: 'D-12', agency: '서울주거포털' },
          { t: '경기도 청년 월세 한시 지원', d: 'D-23', agency: '경기도청' },
        ].map((r, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '12px 14px',
            border: '1px solid var(--line)', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--butter-card)', display: 'grid', placeItems: 'center',
              color: 'var(--butter-ink)', fontSize: 12, fontWeight: 800, letterSpacing: -0.3,
            }}>{r.d}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.t}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{r.agency} · 조건 충족 시</div>
            </div>
            <Ic.chevron style={{ color: 'var(--ink-4)' }}/>
          </div>
        ))}
      </div>

      {/* 많이 저장한 */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>신혼부부가 많이 저장한</div>
        {[
          { n: 1, t: '신혼부부 전세자금대출 (버팀목)', save: 3421 },
          { n: 2, t: '디딤돌 주택구입자금대출', save: 2109 },
          { n: 3, t: '첫만남이용권 200만원', save: 1876 },
        ].map(r => (
          <div key={r.n} onClick={() => go?.('detail')} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
            borderTop: r.n === 1 ? 'none' : '1px solid var(--line-2)', cursor: 'pointer',
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', width: 18 }}>{r.n}</div>
            <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{r.t}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Ic.bookmark width="10" height="10"/> {r.save.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 30초 진단
// ─────────────────────────────────────────
function ScreenQuiz({ go, step, setStep, answers, setAnswers }) {
  const questions = [
    { id: 'status', title: '결혼 상태를 알려주세요', opts: ['결혼 예정', '혼인신고 완료', '신혼 1~7년차'] },
    { id: 'interest', title: '어떤 게 가장 궁금하세요?', sub: '중복 선택 가능', multi: true, opts: ['신혼집', '전세대출', '청약', '출산', '세금'] },
    { id: 'region', title: '지금 사는 지역은 어디세요?', opts: ['서울', '인천', '경기', '기타'] },
  ];
  const q = questions[step];
  const progress = ((step + 1) / questions.length) * 100;
  const selected = answers[q.id];
  const valid = q.multi ? (selected?.length || 0) > 0 : !!selected;

  const choose = (opt) => {
    if (q.multi) {
      const arr = answers[q.id] || [];
      setAnswers({ ...answers, [q.id]: arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt] });
    } else {
      setAnswers({ ...answers, [q.id]: opt });
    }
  };

  return (
    <div style={{ paddingTop: 52, paddingBottom: 90, minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '8px 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => step === 0 ? go?.('home') : setStep(step - 1)} style={{ padding: 6, color: 'var(--ink)' }}><Ic.back/></button>
        <div style={{ flex: 1, height: 4, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width .3s' }}/>
        </div>
        <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{step + 1} / {questions.length}</span>
      </div>

      <div style={{ padding: '16px 20px 20px', flex: 1 }}>
        <div style={{ fontSize: 12, color: 'var(--primary-ink)', fontWeight: 700, letterSpacing: 0.5 }}>STEP {step + 1}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginTop: 6, lineHeight: 1.35, letterSpacing: -0.4 }}>
          {q.title}
        </div>
        {q.sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>{q.sub}</div>}

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.opts.map(opt => {
            const isSel = q.multi ? (selected || []).includes(opt) : selected === opt;
            return (
              <button key={opt} onClick={() => choose(opt)} style={{
                padding: '16px 18px', borderRadius: 14, textAlign: 'left',
                background: isSel ? 'var(--sky-card)' : '#fff',
                color: 'var(--ink)',
                border: `1.5px solid ${isSel ? 'var(--primary)' : 'var(--line)'}`,
                fontSize: 15, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: q.multi ? 6 : 99,
                  border: `1.5px solid ${isSel ? 'var(--primary)' : 'var(--line)'}`,
                  display: 'grid', placeItems: 'center',
                  background: isSel ? 'var(--primary)' : 'transparent', color: '#fff',
                }}>
                  {isSel && <Ic.check width="12" height="12"/>}
                </div>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '14px 20px 26px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
        <CTA size="lg" full
          onClick={() => {
            if (!valid) return;
            if (step < questions.length - 1) setStep(step + 1);
            else go?.('result');
          }}
          style={{ opacity: valid ? 1 : 0.35, pointerEvents: valid ? 'auto' : 'none' }}
        >
          {step === questions.length - 1 ? '맞춤 혜택 보기' : '다음'}
        </CTA>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Result
// ─────────────────────────────────────────
function ScreenResult({ go }) {
  return (
    <div style={{ paddingTop: 52, paddingBottom: 100, minHeight: '100%', background: 'var(--bg)' }}>
      <div style={{ padding: '8px 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => go?.('home')} style={{ padding: 6, color: 'var(--ink)' }}><Ic.back/></button>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)' }}>우리 부부 맞춤 혜택</div>
      </div>

      <div style={{ padding: '8px 16px' }}>
        <div style={{ borderRadius: 20, padding: 20, background: '#fff', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, letterSpacing: 0.3 }}>신혼 1~7년 · 전세대출 · 서울</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginTop: 10, lineHeight: 1.4, letterSpacing: -0.4 }}>
            지금 챙길 수 있는 혜택 <span style={{ color: 'var(--primary)' }}>7개</span>를 찾았어요.
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.55 }}>
            먼저 신혼집과 전세대출부터 같이 볼게요.<br/>조건이 애매한 건 AI가 쉬운말로 확인해드려요.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <div style={{ flex: 1, background: 'var(--mint-card)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 10.5, color: 'var(--mint-ink)', fontWeight: 700 }}>● 가능성 높음</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>3</div>
            </div>
            <div style={{ flex: 1, background: 'var(--butter-card)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 10.5, color: 'var(--butter-ink)', fontWeight: 700 }}>● 확인 필요</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>4</div>
            </div>
            <div style={{ flex: 1, background: 'var(--section)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 700 }}>● 조건 부족</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-3)', marginTop: 2 }}>2</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 16px 8px', fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>먼저 같이 볼 혜택</div>

      <div style={{ padding: '0 16px' }}>
        {[
          { t: '신혼 전세대출 (버팀목)', desc: '신혼집 전세금이 고민이라면, 버팀목부터 같이 볼게요.', tone: 'mint', state: '가능성 높음', amt: '조건 충족 시 최대 2억원', agency: '주택도시기금' },
          { t: '디딤돌 주택구입자금대출', desc: '집을 사기로 했다면 월 이자 부담을 낮출 수 있어요.', tone: 'mint', state: '가능성 높음', amt: '조건 충족 시 최대 4억원', agency: '주택도시기금' },
          { t: '신혼특공 (민영)', desc: '청약 가점과 지역 조건이 애매해요. AI와 같이 확인해봐요.', tone: 'butter', state: '확인 필요', amt: '청약 가점·지역별 상이', agency: '국토교통부' },
          { t: '첫만남이용권', desc: '출생 예정이라면 200만원, 미리 챙겨두세요.', tone: 'mint', state: '가능성 높음', amt: '출생아 1인 200만원', agency: '보건복지부' },
          { t: '서울시 임차보증금 이자지원', desc: '서울 거주 신혼부부라면 이자 일부를 지원받을 수 있어요.', tone: 'butter', state: '확인 필요', amt: '조건 충족 시 연 3% 이자 지원', agency: '서울주거포털' },
        ].map((r, i) => (
          <div key={i} onClick={() => go?.('detail')} style={{
            background: '#fff', borderRadius: 16, padding: 16, marginBottom: 10,
            border: '1px solid var(--line)', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Badge tone={r.tone}>{r.state}</Badge>
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.agency}</span>
              <Ic.chevron style={{ marginLeft: 'auto', color: 'var(--ink-4)' }}/>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.35 }}>{r.t}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.55 }}>{r.desc}</div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--line)', fontSize: 11.5, color: 'var(--ink-3)' }}>{r.amt}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'sticky', bottom: 90, margin: '16px', padding: 4 }}>
        <CTA full icon={<Ic.check width="14" height="14"/>}>오늘 할 일로 담기</CTA>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenHome, ScreenQuiz, ScreenResult });
