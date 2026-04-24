/* global React */
// sinhon.life — Detail, AI chat, Checklist detail, MY — v2 sunlit

const { useState: useS4 } = React;

// ─────────────────────────────────────────
// 정책 상세 (버팀목 전세대출)
// ─────────────────────────────────────────
function ScreenDetail({ go, comicVariant = 'A' }) {
  return (
    <div style={{ paddingTop: 52, paddingBottom: 120, minHeight: '100%', background: 'var(--pure-white)' }}>
      <div style={{ padding: '8px 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => go?.('result')} style={{ padding: 6, color: 'var(--ink)' }}><Ic.back/></button>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>정책 상세</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button style={{ width: 34, height: 34, borderRadius: 99, color: 'var(--ink-2)', display: 'grid', placeItems: 'center' }}><Ic.bookmark width="16" height="16"/></button>
          <button style={{ width: 34, height: 34, borderRadius: 99, color: 'var(--ink-2)', display: 'grid', placeItems: 'center' }}><Ic.share width="16" height="16"/></button>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* title — lifestyle framing first */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>주택도시기금 · 버팀목</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginTop: 4, lineHeight: 1.3, letterSpacing: -0.5 }}>
            신혼부부 전용 전세자금대출
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.6 }}>
            신혼집 전세금이 고민이라면,<br/>
            버팀목 전세대출부터 같이 확인해보세요.
          </div>
        </div>

        {/* 10초 요약 — morning sky soft */}
        <div style={{ background: 'var(--baby-sky)', borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--parang-ink)', letterSpacing: 0.5, marginBottom: 6 }}>☕︎ 10초 요약</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.55, fontWeight: 500 }}>
            혼인 7년 이내 무주택 신혼부부가 전세보증금의 최대 80%를<br/>
            연 1.5~3.3% 금리로 빌릴 수 있어요.
          </div>
        </div>

        {/* 가능성 카드 — cream bg, not loan product */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Badge tone="mint" size="md">● 가능성 높음</Badge>
            <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>내 조건 기준</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>우리 부부, 신청 가능성이 높아요</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
            혼인 4년차 · 무주택 · 부부합산 6,200만원 조건으로 볼 때<br/>
            주요 요건을 대부분 충족해요.
          </div>
          {/* 금액은 보조 정보로 */}
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--cloud-white)', borderRadius: 12, display: 'flex', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 600 }}>조건 충족 시 최대</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.3 }}>2<span style={{ fontSize: 12, fontWeight: 600 }}>억</span> 원까지</div>
            </div>
            <div style={{ flex: 1 }}/>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>연 금리</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--parang-ink)' }}>1.5 ~ 3.3%</div>
            </div>
          </div>
        </div>

        {/* 핵심 조건 */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid var(--line)', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>핵심 조건</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { k: '혼인기간', v: '7년 이내', ok: true },
              { k: '주택 소유', v: '무주택 세대', ok: true },
              { k: '부부합산소득', v: '연 7,500만원 이하', ok: true },
              { k: '순자산', v: '3.37억원 이하', ok: null },
              { k: '대상 주택', v: '전용 85㎡ 이하', ok: null },
              { k: '지역 제한', v: '전국', ok: true },
            ].map(r => (
              <div key={r.k} style={{ padding: 10, borderRadius: 10, background: 'var(--cloud-white)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>{r.k}</span>
                  {r.ok === true && <div style={{ width: 12, height: 12, borderRadius: 99, background: 'var(--mint)', display: 'grid', placeItems: 'center', color: '#fff' }}><Ic.check width="8" height="8"/></div>}
                  {r.ok === null && <Ic.info width="11" height="11" style={{ color: 'var(--peach-ink)' }}/>}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>{r.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 정책 번역 */}
        <div style={{ marginBottom: 12 }}>
          <TranslationCard items={[
            { official: '무주택세대구성원', easy: '나와 배우자, 같이 사는 가족 모두 집이 없어야 해요.', warn: '전세나 월세는 상관없지만 본인 소유 주택은 안 돼요.' },
            { official: '부부합산 연소득', easy: '남편과 아내 소득을 더한 한 해 총소득이에요.', warn: '세전 기준이에요. 실수령액이 아니라 원천징수영수증상 금액을 확인해요.' },
            { official: '임차보증금의 80% 이내', easy: '전세금의 80%까지 빌릴 수 있어요.', warn: '수도권은 3억, 그 외 지역은 2억이 한도예요.' },
          ]}/>
        </div>

        {/* 4컷만화 — 크게, 섹션 제목 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ padding: '4px 4px 10px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3 }}>공문 말고, 4컷으로 먼저 보기</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>랑·봄·준이 버팀목 전세대출을 쉬운말로 정리해드려요</div>
          </div>
          <FourCutComic variant={comicVariant}/>
        </div>

        {/* 영상 — 요약이 먼저 */}
        <div style={{ marginBottom: 12 }}>
          <ShortsCard/>
        </div>

        {/* 오늘 할 일 */}
        <div style={{ marginBottom: 12 }}>
          <Checklist items={[
            { title: '주민등록등본 발급', hint: '정부24에서 무료', done: true },
            { title: '혼인관계증명서(상세) 발급', hint: '대법원 전자가족관계등록시스템', done: false },
            { title: '부부 소득자료 확인', hint: '원천징수영수증 또는 소득금액증명', done: false },
            { title: '은행 상담 예약', hint: '우리/국민/기업/농협/신한', done: false, meta: 'D-7' },
          ]}/>
        </div>

        {/* source — most emphasized */}
        <div style={{ marginBottom: 16 }}>
          <SourceCard agency="국토교통부 · 주택도시보증공사" date="2026.04.22" url="nhuf.molit.go.kr"/>
        </div>
      </div>

      {/* sticky CTA — single primary */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 78,
        padding: '10px 16px', background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--line)', display: 'flex', gap: 8,
      }}>
        <button style={{ width: 46, height: 46, borderRadius: 12, border: '1px solid var(--line)', background: '#fff', color: 'var(--ink)', display: 'grid', placeItems: 'center' }}>
          <Ic.bookmark width="18" height="18"/>
        </button>
        <CTA size="md" full icon={<Ic.sparkle width="14" height="14"/>}
          onClick={() => go?.('ai')}>AI에게 내 조건 물어보기</CTA>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// AI 톡
// ─────────────────────────────────────────
function ScreenAI({ go }) {
  const [messages, setM] = useS4([
    { role: 'ai', text: '안녕하세요, 저는 신혼생활 정책을 쉬운말로 풀어주는 랑이에요.\n우리 부부 조건을 알려주시면 가능성부터 같이 확인해드릴게요.' },
    { role: 'user', text: '저희 부부가 신혼부부 전세대출 받을 수 있을까요?' },
    { role: 'ai', verify: true, text: '가능성부터 같이 볼게요. 신혼부부 전세대출은 보통 혼인 7년 이내, 무주택, 부부합산소득, 보증금 조건을 함께 봐요.\n먼저 혼인신고 여부와 부부합산 연소득을 알려주시면 조건을 쉬운말로 확인해드릴게요.', actions: true },
    { role: 'user', text: '부부합산소득은 세전 기준이에요?' },
    { role: 'ai', verify: true, text: '대부분 세전 소득 기준으로 봐요. 쉽게 말하면 통장에 들어오는 실수령액이 아니라, 원천징수영수증이나 소득금액증명에 잡히는 금액을 확인하는 방식이에요.\n정확한 기준은 상품과 기관별로 다를 수 있어 공식 안내도 함께 확인해야 해요.', actions: true },
  ]);
  const [input, setI] = useS4('');

  return (
    <div style={{ paddingTop: 52, paddingBottom: 78, minHeight: '100%', background: 'var(--pure-white)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--line)', background: 'var(--pure-white)' }}>
        <button onClick={() => go?.('detail')} style={{ padding: 6, color: 'var(--ink)' }}><Ic.back/></button>
        <div style={{ width: 36, height: 36, borderRadius: 99, background: 'var(--parang-soft)', display: 'grid', placeItems: 'center' }}>
          <Char who="rang" size={30}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
            신혼생활 AI 랑
            <span style={{ fontSize: 10, color: '#fff', background: 'var(--mint-ink)', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>BETA</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>공식 출처 기반으로 답변해요</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '14px 16px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end' }}>
            {m.role === 'ai' && (
              <div style={{ width: 28, height: 28, borderRadius: 99, background: 'var(--parang-soft)', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                <Char who="rang" size={22}/>
              </div>
            )}
            <div style={{ maxWidth: 260 }}>
              <div style={{
                padding: '10px 13px', borderRadius: 14,
                background: m.role === 'user' ? 'var(--parang)' : 'var(--pure-white)',
                color: m.role === 'user' ? '#fff' : 'var(--ink)',
                border: m.role === 'ai' ? '1px solid var(--line)' : 'none',
                fontSize: 13.5, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                borderBottomLeftRadius: m.role === 'ai' ? 4 : 14,
                borderBottomRightRadius: m.role === 'user' ? 4 : 14,
              }}>
                {m.text}
                {m.verify && (
                  <div style={{ marginTop: 8, padding: '5px 8px', background: 'var(--baby-sky)', borderRadius: 8, fontSize: 11, color: 'var(--parang-ink)', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    <Ic.info width="10" height="10"/> 공식 확인 필요
                  </div>
                )}
              </div>
              {m.actions && (
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button style={{ padding: '6px 10px', borderRadius: 99, border: '1px solid var(--line)', background: '#fff', fontSize: 11.5, color: 'var(--ink)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Ic.check width="10" height="10"/> 체크리스트 담기
                  </button>
                  <button style={{ padding: '6px 10px', borderRadius: 99, border: '1px solid var(--line)', background: '#fff', fontSize: 11.5, color: 'var(--ink)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Ic.share width="10" height="10"/> 배우자와 같이 보기
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6, fontWeight: 600 }}>이렇게도 물어볼 수 있어요</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['우리 부부도 전세대출 가능해?', '혼인신고 전인데 신청 가능해?', '필요서류 뭐부터 준비해?'].map(t => (
              <button key={t} onClick={() => {
                setM([...messages, { role: 'user', text: t }, { role: 'ai', verify: true, text: '좋은 질문이에요. 조건을 간단히 쉬운말로 정리해드릴게요. (데모에서는 샘플 답변만 제공해요.)', actions: true }]);
              }} style={{ padding: '8px 12px', borderRadius: 99, border: '1px solid var(--parang)', background: '#fff', color: 'var(--parang-ink)', fontSize: 12, fontWeight: 600 }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 12px 14px', background: 'var(--pure-white)', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 48, padding: '0 4px 0 16px', borderRadius: 99, border: '1px solid var(--line)', background: 'var(--cloud-white)' }}>
          <input value={input} onChange={e => setI(e.target.value)} placeholder="우리 부부 조건을 쉬운말로 물어보세요" style={{ flex: 1, border: 0, background: 'transparent', fontSize: 13.5, outline: 'none', color: 'var(--ink)' }}/>
          <button onClick={() => { if(!input) return; setM([...messages, {role:'user', text: input}, {role:'ai', verify: true, text:'조건을 쉬운말로 정리해드릴게요. (데모 답변)', actions: true}]); setI(''); }} style={{ width: 40, height: 40, borderRadius: 99, background: 'var(--parang)', color: '#fff', display: 'grid', placeItems: 'center' }}>
            <Ic.sparkle width="16" height="16"/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 체크리스트 상세
// ─────────────────────────────────────────
function ScreenChecklist({ go }) {
  const [items, setIt] = useS4([
    { title: '주민등록등본 발급', hint: '정부24에서 무료 발급 가능', done: true, cat: '서류' },
    { title: '혼인관계증명서(상세) 발급', hint: '대법원 전자가족관계등록시스템', done: true, cat: '서류' },
    { title: '부부 소득자료 확인', hint: '원천징수영수증 · 소득금액증명', done: false, cat: '서류' },
    { title: '임대차계약서 준비', hint: '확정일자 포함', done: false, cat: '서류' },
    { title: '은행 상담 예약', hint: '기금e든든 → 기금취급은행 선택', done: false, cat: '행동', meta: 'D-7' },
    { title: '전세금 안심대출 보증 확인', hint: 'HUG 전세보증금반환보증', done: false, cat: '행동' },
  ]);
  const toggle = (i) => setIt(items.map((t, j) => j === i ? { ...t, done: !t.done } : t));
  const done = items.filter(i => i.done).length;
  const pct = (done / items.length) * 100;
  return (
    <div style={{ paddingTop: 52, paddingBottom: 120, minHeight: '100%', background: 'var(--pure-white)' }}>
      <div style={{ padding: '8px 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => go?.('detail')} style={{ padding: 6, color: 'var(--ink)' }}><Ic.back/></button>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' }}>오늘 할 일</div>
      </div>
      <div style={{ padding: '0 16px' }}>
        {/* progress — sunlit */}
        <div style={{
          borderRadius: 18, padding: 18,
          background: 'var(--pure-white)',
          marginBottom: 14, border: '1px solid var(--line)', boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700 }}>신혼부부 전세대출 준비</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: 'var(--ink)' }}>{done}<span style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 600 }}> / {items.length}</span> 완료</div>
          <div style={{ height: 6, background: 'var(--cloud-white)', borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--parang)' }}/>
          </div>
          <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 99, background: 'var(--butter-cream)' }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--butter-ink)' }}/>
            <span style={{ fontSize: 11.5, color: 'var(--butter-ink)', fontWeight: 700 }}>은행 상담 예약 D-7</span>
          </div>
        </div>

        {['서류', '행동'].map(cat => (
          <div key={cat} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700, margin: '0 4px 8px', letterSpacing: 0.2 }}>{cat}</div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
              {items.map((it, i) => it.cat !== cat ? null : (
                <button key={i} onClick={() => toggle(i)} style={{
                  width: '100%', padding: '14px 14px', display: 'flex', gap: 10, alignItems: 'flex-start',
                  textAlign: 'left', borderTop: i === 0 ? 'none' : '1px solid var(--line-2)',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    background: it.done ? 'var(--mint)' : '#fff',
                    border: `1.5px solid ${it.done ? 'var(--mint)' : 'var(--line)'}`,
                    display: 'grid', placeItems: 'center', color: '#fff',
                  }}>{it.done && <Ic.check width="13" height="13"/>}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: it.done ? 'var(--ink-4)' : 'var(--ink)', textDecoration: it.done ? 'line-through' : 'none' }}>{it.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{it.hint}</div>
                  </div>
                  {it.meta && <Badge tone="apricot">{it.meta}</Badge>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 78, padding: '10px 16px', background: 'rgba(255,255,255,.96)', borderTop: '1px solid var(--line)', backdropFilter: 'blur(10px)' }}>
        <CTA size="md" full icon={<Ic.share width="14" height="14"/>}>배우자와 같이 보기</CTA>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MY
// ─────────────────────────────────────────
function ScreenMy({ go }) {
  return (
    <div style={{ paddingTop: 52, paddingBottom: 90, minHeight: '100%', background: 'var(--pure-white)' }}>
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5 }}>MY</div>
      </div>

      <div style={{ padding: '14px 16px 8px' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 99, background: 'rgba(255,180,157,.22)', display: 'grid', placeItems: 'center' }}>
              <Char who="bom" size={40}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>봄 · 준 부부</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>신혼 4년차 · 서울 · 무주택</div>
            </div>
            <button style={{ fontSize: 11.5, color: 'var(--parang-ink)', fontWeight: 600 }}>편집</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 14 }}>
            {[{k:'저장',v:12},{k:'진행중',v:3},{k:'마감임박',v:2}].map(r => (
              <div key={r.k} style={{ padding: '10px 8px', background: 'var(--cloud-white)', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{r.v}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{r.k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>저장한 정책</div>
        {[
          { t: '신혼 전세대출 (버팀목)', tone: 'mint', state: '가능성 높음', prog: 50 },
          { t: '디딤돌 주택구입자금대출', tone: 'mint', state: '가능성 높음', prog: 0 },
          { t: '서울시 임차보증금 이자지원', tone: 'apricot', state: 'D-12 · 확인 필요', prog: 30 },
        ].map(r => (
          <div key={r.t} onClick={() => go?.('detail')} style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid var(--line)', marginBottom: 8, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Badge tone={r.tone}>{r.state}</Badge>
              <Ic.chevron style={{ marginLeft: 'auto', color: 'var(--ink-4)' }}/>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{r.t}</div>
            {r.prog > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 4, background: 'var(--line-2)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${r.prog}%`, height: '100%', background: 'var(--mint)' }}/>
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 4 }}>오늘 할 일 {r.prog}% 진행</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>해야 할 서류</div>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
          {[
            { t: '부부 소득자료 확인', by: '전세대출', done: false },
            { t: '임대차계약서 준비', by: '전세대출', done: false },
            { t: '혼인관계증명서 발급', by: '전세대출', done: true },
          ].map((r, i) => (
            <div key={i} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, borderTop: i === 0 ? 'none' : '1px solid var(--line-2)' }}>
              <div style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                background: r.done ? 'var(--mint)' : '#fff',
                border: `1.5px solid ${r.done ? 'var(--mint)' : 'var(--line)'}`,
                display: 'grid', placeItems: 'center', color: '#fff',
              }}>{r.done && <Ic.check width="11" height="11"/>}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: r.done ? 'var(--ink-4)' : 'var(--ink)', textDecoration: r.done ? 'line-through' : 'none' }}>{r.t}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.by}</div>
              </div>
              <Ic.chevron style={{ color: 'var(--ink-4)' }}/>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '10px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>배우자에게 공유한 항목</div>
        <div style={{ background: 'rgba(255,180,157,.22)', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,180,157,.35)' }}>
          <Char who="jun" size={42}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>준님이 3개 항목을 확인했어요</div>
            <div style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 2 }}>가장 최근: 은행 상담 예약</div>
          </div>
          <CTA size="sm" variant="outline">보기</CTA>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenDetail, ScreenAI, ScreenChecklist, ScreenMy });
