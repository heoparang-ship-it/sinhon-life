# 신혼생활 리디자인 구현 스펙 v1 — "인천 신혼 결정 허브"

> 작성: 2026-05-31 · 대상 브랜치 `claude/adoring-gates-Jy2ua`
> 관점: 10년차 프로덕트 디자이너 + 프론트엔드 엔지니어의 "구현 가능한" 스펙
> 원칙: **새 디자인 토큰·새 라우트·새 DB 컬럼 0개.** 기존 자산을 재배열·재의미화한다.

---

## 0-0. 사업 단계 정합 (★ 최상위 제약 — 모든 우선순위가 여기서 갈림)

> 정책 = **트래픽**(유입 관문). 실제 페이지(5대 결정) = **돈**(웨딩 업체 입점). 단, 돈은 Phase 2.

| | **Phase 1 (지금 — 이 리디자인)** | **Phase 2 (월간 이용자 성장 후 론칭)** |
|---|---|---|
| 정책 페이지 | ★ 100% 집중. 유입·신뢰·SEO·바이럴·재방문 | 유지(관문) |
| 5대 결정 페이지(스드메·예식장·인테리어·혼수·여행) | **가벼운 떡밥**: 콘텐츠·"비슷한 신혼의 선택" 데이터·다음 방문 유도만 | ★ 웨딩 업체 입점 = 매출(리드·송객·견적 매칭·네이티브 광고) |
| AI톡 리드폼(`DecisionLeadCard`) | 코드 유지, **전면 비노출**. 정책이 주인공 | 전면화·업체 매칭 연동 |

**리디자인 행동 규칙**:
1. 홈 ATF·히어로·라우터·진행률 = **전부 정책으로 수렴**. 트래픽이 목적.
2. 5대 결정 카드는 "돈 버는 버튼"이 아니라 "데이터 쌓고 또 오게 하는 콘텐츠". 적극적 견적/리드 CTA 금지.
3. 웨딩 업체 입점·견적 매칭 UI는 **이번 사이클에서 만들지 않음**. Phase 2 신호(MAU 임계) 도달 시 별도 사이클.
4. 단, Phase 2 전환이 쉽도록 5대 결정의 `category`/`seed` 라우팅 구조는 **그대로 보존**(나중에 업체풀만 끼우면 되게).

---

## 0. North Star & 측정 가능한 성공 정의

| 항목 | 현재 | 목표 (리디자인 후) |
|---|---|---|
| 광고→LP→홈 메시지 일관성 | 단절 (홈=매거진) | 3화면 동일 미션·동일 그라데이션 |
| 홈 ATF 첫 의미 | "신혼의 시작 더 가볍게"(막연) | "인천 신혼이면 받는 정책 11개"(구체·돈) |
| 첫 화면 스크롤 0에서 보이는 전환 CTA | 0개 | 2개 (미션 히어로 + 정책 진단) |
| 사용자 자기위치 인지 | 없음 | 생애주기 3분기(결혼/신혼/출산) |
| 재방문 훅 | 없음 | "결정 진행률 N/5 · 다음 할 일" |

핵심 KPI 이벤트(이미 `track()` 존재): `decision_card_click`, `onboarding_step`, `onboarding_complete`, `lead_*`. 이번 리디자인은 **신규 이벤트 3개**만 추가: `home_stage_router_click`, `home_progress_click`, `policy_deeplink_enter`.

---

## 1. 디자인 시스템 — 실제 토큰 고정 (globals.css 기준)

이미 정의된 값만 사용한다. 새 hex 추가 금지. 핵심 팔레트 복기:

```
ink        #1A2433   (제목)
ink-soft   #3A4A5E   (본문 강조)
mute       #7A8696   (보조)
faint      #B5BDC8   (캡션·면책)
blue-accent / blue-deepest  #3B8BCF  (브랜드 포인트)
paper      #F4F8FC   (카드 배경)
surface    #EAF3FB   (active 칩 배경)
hairline   #E2EBF3   (보더)
```

### 1-1. 마스터 그라데이션 (광고-LP-홈-정책 통일) ★
브랜드 "히어로 그라데이션"을 단일 상수로 통일한다. 현재 코드에 3가지 변형이 흩어져 있음:
- LP/홈배너: `linear-gradient(120deg,#2566A8 0%,#3B8BCF 55%,#4F9CDB 100%)`
- 정책 CTA 버튼: `linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)`
- 정책 결과 카드: `linear-gradient(135deg,#2566A8,#3B8BCF)`

→ **3종을 의미별로 고정**하고 컴포넌트 상수로 추출:
| 이름 | 값 | 용도 |
|---|---|---|
| `GRAD_HERO` | `linear-gradient(120deg,#2566A8 0%,#3B8BCF 55%,#4F9CDB 100%)` | 큰 히어로/배너 면 |
| `GRAD_CTA` | `linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)` | 풀폭 버튼 |
| `GRAD_PANEL` | `linear-gradient(135deg,#2566A8,#3B8BCF)` | 데이터 강조 패널 |

`src/lib/design/gradients.ts` 신규 — 문자열 상수 export. (디자인 토큰 추가 아님, 기존 값 중복 제거)

### 1-2. 생애주기 색 시맨틱 (신규 의미, 기존 톤 안에서)
보고서의 "결혼→주거→출산 누적 구조"를 **색으로 구분**하되, 브랜드 블루를 깨지 않게 *저채도 파스텔 + 블루 통일 보더*:
| 단계 | value | 배경 | 강조텍스트 | 이모지 |
|---|---|---|---|---|
| 결혼예정 | `engaged` | `#FBF1F4`(연핑크) | `#C77089` | 💍 |
| 신혼(7년내) | `married` | `#EAF3FB`(surface) | `#3B8BCF` | 💑 |
| 출산(2년내) | `newborn` | `#EAF6F0`(연민트) | `#3F9E78` | 👶 |

핑크/민트는 **카드 배경에만** 쓰고 보더·CTA는 전부 blue 유지 → 브랜드 일관성 보존.

### 1-3. 간격·반경 규칙 (기존 코드 관행 채택)
- 화면 좌우 패딩: `px-5` (20px) — 전 화면 통일 (MagazineHome 관행)
- 카드 반경: 큰 면 `rounded-[20px]`, 일반 카드 `rounded-2xl`(16px), 칩 `rounded-full`
- 섹션 세로 간격: `mt-[30px]`(섹션) / `mt-[18px]`(밀접)
- 카드 그림자: `shadow-[0_1px_2px_rgba(26,36,51,0.05)]` (얕은 면) / `shadow-[0_12px_28px_-12px_rgba(43,123,207,0.6)]` (블루 떠있는 CTA)

---

## 2. 정보 구조(IA) 재배치 — 홈

### 2-1. Before / After 섹션 순서

| 순서 | Before (MagazineHome) | After (DecisionHub) | 근거 |
|---|---|---|---|
| 1 | App bar | App bar(유지) | — |
| 2 | Hero carousel(3슬라이드, 막연) | **미션 히어로(단일, 정책 직행)** | 광고 일관성 |
| 3 | Quick row(혼수/여행/AI) | **정책 진단 메가배너 + 생애주기 3칩** | ATF 전환 |
| 4 | 정책 배너(가운데 끼임) | **생애주기 라우터 3카드** | 자기위치 인지 |
| 5 | 지금 많이 찾는 정보 | **내 결정 진행률(로그인) / 시작 유도(비로그인)** | 재방문 훅 |
| 6 | 지금 찾는 꿀팁 | Quick row(유지, 강등) | 보조 도구 |
| 7 | 신혼 매거진 | 5대 결정 카드(스드메·예식장·인테리어·혼수·신혼여행) | 수익 출구 |
| 8 | 푸터 | 꿀팁 매거진(유지) | 콘텐츠 |
| 9 | — | 인스타 영상 1줄(유지) | 콘텐츠 |
| 10 | — | 푸터("인천 신혼 결정 데이터") | 카피 정렬 |

**핵심 이동**: 정책을 4→2·3위로 끌어올리고, 매거진/영상은 그대로 아래에 보존(이탈 방지 콘텐츠). 즉 *제거가 아니라 우선순위 역전.*

### 2-2. ATF(첫 1.3화면) 정의
375×812(iPhone) 기준, 스크롤 0에서 보여야 하는 것:
1. App bar (58px)
2. 미션 히어로 (약 150px, carousel보다 낮게)
3. 정책 진단 메가배너 상단 (~80px 노출)

→ carousel을 212px→150px로 낮추고 정책 배너를 끌어올려 **"정책"이라는 단어가 스크롤 없이 보이게** 하는 것이 ATF 설계의 1순위.

---

## 3. 컴포넌트별 상세 스펙

### 3-A. `DecisionHubScreen.tsx` (신규, MagazineHome 90% 재사용)

파일을 새로 만들되 기존 `MagazineRow`, 꿀팁 매거진, 영상 피드 JSX는 **그대로 복사**한다. 신규/변경 블록만 아래 명세.

#### A-1. 미션 히어로 (carousel 대체)
```
<Link href="/policy" onClick={track('decision_card_click',{from:'home_hero'})}>
  높이 150px, GRAD_HERO, rounded-[20px], mx-5 mt-1
  좌측(60%):
    kicker: "인천 신혼 전용" (12px, white/72)
    title: "받을 수 있는 정책,\n다 챙기셨어요?" (24px extrabold, white, leading 1.2)
    sub: "정책 11개 무료 확인 · 5대 결정 데이터" (12.5px, white/72)
  우측(40%): 🏠 이모지 64px + 살짝 회전 그림자
  우하단: "1분 진단 →" pill (white/18 backdrop)
```
- 모션: mount 시 `fade-up`(translateY 8px→0, 280ms). carousel 자동재생 로직 **삭제**(useEffect 2개 제거) → 성능·복잡도↓.
- 접근성: `<Link aria-label="인천 신혼 정책 진단 시작">`.

#### A-2. 정책 진단 메가배너 + 생애주기 3칩 (Quick row 자리)
구조: 카드 안에 헤드라인 + 가로 3칩.
```
카드: rounded-[20px] border-hairline bg-paper p-[18px] mx-5 mt-[18px]
  헤드라인: "어디까지 해당되세요?" (16px extrabold ink)
  서브: "고르면 받을 수 있는 정책만 모아드려요" (12.5px mute)
  칩 3개(가로 grid-cols-3 gap-2):
    💍 결혼예정 / 💑 신혼 / 👶 출산
    각 칩 클릭 → router.push(`/policy?stages=${stageMap}`)
      engaged → "engaged"
      married → "married"
      newborn → "newborn"
    track('home_stage_router_click',{stage})
  하단 텍스트링크: "전체 11개 정책 보기 →" → /policy
```
칩 디자인: 1-2의 생애주기 색 적용(연핑크/surface/연민트 배경 + blue 보더 1px).

#### A-3. 생애주기 라우터 3카드 (신규 풀카드)
A-2의 칩이 "빠른 트리거"라면, 여기는 "설명형 카드". 세로 3장 또는 가로 스냅 스크롤.
```
각 카드: rounded-2xl p-4, 배경=생애주기색, 보더 hairline
  상단: 이모지 28px + 단계명(15.5px extrabold)
  중단: 핵심 정책 1줄 요약
    결혼예정 → "신혼부부 구입자금·보금자리론 우대"
    신혼     → "천원주택·전세보증료 40만원"
    출산     → "신생아 특례대출·산후조리비 150만원"
  하단: "내 정책 보기 →" (blue-deepest 13px)
  클릭 → /policy?stages=<value> + track
```
요약 문구는 **하드코딩이 아니라** `matchPolicies({stages:[value]})`에서 상위 2개 `policy.name`을 뽑아 생성 → 데이터 변경 시 자동 반영.

```ts
// 헬퍼 (DecisionHubScreen 내부 or data.ts에 추가)
function stageHeadlinePolicies(stage: LifeStage): string {
  return matchPolicies({ stages: [stage] }).slice(0, 2).map(p => p.name).join(" · ");
}
```

#### A-4. 내 결정 진행률 (로그인/비로그인 분기)
`useUserProfile()`의 `completedDecisions` + `hydrated` 사용.
```
hydrated === false → 스켈레톤(높이 고정 88px, animate-pulse) — CLS 방지
로그인 OR 온보딩 완료(profile.onboardedAt 존재):
  카드: GRAD_PANEL, rounded-[20px], text-white
    "내 결정 진행" (12.5px white/72)
    "{completed}/5 완료" (28px extrabold)
    진행바: completed/5 비율, 흰색 bar
    다음 추천: 미완료 중 첫 카테고리 → "다음: 예식장 알아보기 →"
       클릭 → /ai?seed=<해당 seed>
    track('home_progress_click',{next})
비로그인 + 미온보딩:
  카드: bg-paper border-hairline
    "아직 결정을 시작하지 않았어요"
    "1분이면 내 정책과 다음 할 일을 알려드려요"
    버튼 "시작하기 →" → /policy (또는 온보딩 트리거)
```
※ 진행률은 **로컬 프로필 기반**이므로 SSR 불가 → `hydrated` 가드 필수. 깜빡임 방지 위해 서버 마크업은 스켈레톤과 동일 높이.

#### A-5. Quick row (강등·유지)
기존 3칸 그대로. 위치만 A-4 아래로. 카피 변경 없음.

#### A-6. 5대 결정 카드 그리드 (INFO_CARDS 확장) — ★Phase 1 톤다운
> 이 섹션은 "돈"이 아니라 "떡밥"이다(0-0 규칙). 견적/리드로 밀어붙이지 말 것.
> Phase 2 웨딩 업체 입점 때 이 자리에 업체풀·견적 매칭이 들어간다. 지금은 콘텐츠·데이터만.

현재 3개(신혼집·스드메·체크리스트) → **5대 결정 정합**으로 재구성:
```
2열 그리드 또는 가로 스냅. 카드 5장:
  📸 스드메 추천      "187쌍이 고른 옵션"   → /ai?seed=sdm
  💒 예식장 비교      "인천 예식장"         → /ai?seed=venue
  🛋️ 신혼집 인테리어  "3천~5천만원대"       → /ai?seed=interior
  🧺 혼수 가전·가구    "빠짐없이 한 번에"     → /ai?seed=goods
  ✈️ 신혼여행          "허니문 패키지"        → /ai?seed=honeymoon
```
"187쌍의 선택" 카피 유지(Choice Share 시드). 각 클릭 `track('decision_card_click',{category, from:'home_decision_grid'})`.

#### A-7. 푸터 카피
`"sinhon.life · 부평·송도 신혼 결정 데이터"` → `"sinhon.life · 인천 신혼 결정 데이터"`.
(HERO_SLIDES의 "부평·송도" 카피도 carousel 삭제로 함께 제거됨)

---

### 3-B. `PolicyHubScreen.tsx` — deeplink 수신 + 카피 정렬

#### B-1. URL 파라미터 자동 진단
`useSearchParams()`로 `?stages=` 수신. 값이 있으면 **intro/diagnose 건너뛰고 곧장 result**.
```ts
const sp = useSearchParams();
const initialStages = useMemo(() => parseStages(sp.get("stages")), [sp]);
const [phase, setPhase] = useState<Phase>(initialStages.length ? "result" : "intro");
const [stages, setStages] = useState<LifeStage[]>(initialStages);
// parseStages: 쉼표분리 + LifeStage 화이트리스트 필터 (잘못된 값 무시)
useEffect(() => { if (initialStages.length) track('policy_deeplink_enter',{stages:initialStages.join(',')}); }, []);
```
→ 홈 라우터/칩에서 들어오면 **즉시 매칭 결과**를 보여줌 (마찰 0). `page.tsx`는 이미 client component인지 확인 필요 — 아니면 Suspense 래핑(이미 LP에서 한 패턴 재사용).

#### B-2. 카피 LP와 통일
헤더 "내가 받을 수 있는 / 정책부터 챙기세요" → 유지(좋음). intro 3불릿(천원주택/신생아/현금성) → LP의 5하이라이트와 동일 셋으로 맞춤(천원주택·신생아 특례대출·전세보증료·산후조리비·청년 임차보증금).

#### B-3. 결과 하단 "AI톡 상담" 강조
현재 SPEND_BRIDGE 4칩 위에 **AI톡 풀폭 카드** 1개 추가:
```
GRAD_CTA 버튼: "AI톡으로 내 상황 물어보기 →" → /ai?seed=정책 받은 다음 뭐부터 할까요?
```

---

### 3-C. `AiTalkScreen.tsx` — 빈 상태 + 정책 칩

- 빈 상태 헤드 카피 → "인천 신혼의 결정, 무엇이든 물어보세요"
- 시작 칩 배열에 맨 앞 **"🏠 정책 받기"** 추가 → 클릭 시 `router.push('/policy')` (seed 주입 아님, 정책 허브로 이동)
- 나머지 5대 칩·LEAD_CTA 파싱 로직 **변경 없음** (회귀 위험 격리)

---

### 3-D. `MyScreen.tsx` — 미세 정렬

1. Hero 보조 카피: `"로그인 전 · 둘이서 시작해요"` 유지. 단 stat 라벨 `"Choice Share"` → `"완료율"`(현재 ratio% 표시인데 라벨이 오해 소지).
2. Menu 섹션에서 **"인천 신혼 정책" 행을 Account 섹션 최상단**(내 정보 위)으로 이동 + badge "NEW" 유지.
3. "약관 및 정책" 행 href `/my` → `/terms` 연결(현재 깨진 링크 수정, 부수 개선).

---

### 3-E. `OnboardingFlow.tsx` — 정책 미리보기 화면 추가

현재 step 0~5. **step 5(완료) 앞에 "정책 미리보기" 삽입** → step 인덱스 재배치 대신 **Done 화면 상단에 블록 추가**(인덱스 변경 최소화, 회귀 위험↓).

`Done` 컴포넌트에 매칭 정책 미리보기 추가:
```ts
// onboarding 답변(decisions/region) → LifeStage 추론
function inferStages(decisions: DecisionCategory[], hasWeddingDate: boolean): LifeStage[] {
  const s: LifeStage[] = ["married"];        // 신혼 기본
  if (hasWeddingDate) s.push("engaged");
  if (decisions.includes("interior")) s.push("renting");
  return s;
}
const preview = matchPolicies({ stages }).slice(0, 3);
```
Done 화면:
```
완료 체크 애니메이션(유지)
"{닉네임}님, 준비 끝!"(유지)
+ 신규 블록:
  "받을 수 있는 정책 미리보기" 라벨
  정책 카드 3개(축약형: 이름 + amountOrRate)
  "홈에서 전체 보기 →"
```
※ 정책 매칭은 온보딩에서 **stages를 명시 수집하지 않으므로** decisions/weddingDate로 추론. 완벽하진 않지만 "맛보기"로 충분. (정식 stages 수집은 DEFER)

---

## 4. 라우팅 & 데이터 흐름

```
[메타광고]
   │ utm_*
   ▼
/lp/incheon-policy  ── 자가진단(LifeStage 멀티선택) ── fbq:Lead
   │ "전체 정책 더보기"
   ▼
/policy?stages=...  ── deeplink → result 즉시
   │ SPEND_BRIDGE / AI톡 카드
   ▼
/ai?seed=...        ── LEAD_CTA → DecisionLeadCard → /api/leads
   ↑
[홈 /]  미션히어로·생애주기라우터·진행률 ──┘ (모든 정책 동선이 /policy로 수렴)
```
- **단일 수렴점**: 모든 "정책" 클릭은 `/policy`(파라미터만 다름)로. 분기 최소화 → 유지보수·추적 단순.
- `stages` 파라미터 규약: 쉼표분리 LifeStage. 화이트리스트 외 값은 silently drop.
- 프로필은 전부 `localStorage`(`sinhon.user.profile.v1`) → 서버 무관, `hydrated` 가드로 CLS 방지.

---

## 5. 모션 스펙 (절제된, 60fps)

| 요소 | 모션 | 값 |
|---|---|---|
| 미션 히어로 | mount fade-up | translateY 8→0, opacity 0→1, 280ms ease-out |
| 생애주기 카드 | tap | active:scale-[0.98] (기존 관행) |
| 진행바 | width 채움 | transition-[width] 400ms ease-out |
| 칩 선택 | 배경/보더 | transition 150ms |
| 정책 결과 진입 | 리스트 stagger | 카드별 40ms 지연 fade-up (선택적, 성능 보고 결정) |

carousel 자동재생 `setInterval` **제거** → 리렌더·배터리·복잡도 동시 절감. Framer 등 신규 의존성 도입 금지, CSS transition만.

---

## 6. 상태 매트릭스 (각 화면 필수 처리)

| 화면 | loading | empty | 비로그인 | 로그인 | error |
|---|---|---|---|---|---|
| 홈 진행률 | 스켈레톤 88px | "시작하기" 카드 | 시작 유도 | N/5 패널 | (로컬이라 N/A) |
| 정책 결과 | — | stages 0개면 전체 노출 | 동일 | 동일 | 잘못된 param → intro로 |
| 온보딩 미리보기 | — | 매칭 0이면 블록 숨김 | 동일 | 동일 | — |
| AI톡 | 기존 | 빈 상태 칩 | 게스트 세션 | 기존 | 기존 |

---

## 7. 접근성 (a11y)

- 모든 이모지 장식은 `aria-hidden`, 의미는 텍스트로 중복 제공
- 생애주기 칩/카드 = `<button>`/`<Link>` (div+onClick 금지)
- 색만으로 단계 구분 금지 → 이모지+텍스트 라벨 동반 (색약 대응)
- 대비: white on GRAD_HERO 최저 지점(#4F9CDB)에서 흰 텍스트 대비 ≥ 3:1 검증(큰 글씨 한정), 본문은 white/72 대신 필요시 white 승격
- 터치 타겟 ≥ 44px (칩 py-3.5 = 약 48px OK)
- `prefers-reduced-motion` → fade-up·stagger 비활성

---

## 8. 구현 순서 (PR 단위, 각 단계 빌드 그린 유지)

> 한 PR(#13)에 누적 push하되 커밋은 단계별 분리. 각 커밋 후 `lint+typecheck+build`.

**커밋 1 — 기반 정리 (위험 0)**
- `src/lib/design/gradients.ts` 신규 (GRAD_HERO/CTA/PANEL)
- `parseStages` 유틸 + `matchPolicies` 기반 헬퍼를 `data.ts`에 추가
- 기존 그라데이션 하드코딩을 상수로 치환 (LP·정책·홈배너)

**커밋 2 — 정책 허브 deeplink (독립·테스트 쉬움)**
- `PolicyHubScreen`에 `?stages=` 수신 + result 점프
- `/policy/page.tsx` Suspense 가드 확인
- 결과 하단 AI톡 카드 추가

**커밋 3 — 홈 DecisionHub 전환 (핵심)**
- `DecisionHubScreen.tsx` 신규 (미션히어로/메가배너/라우터/진행률/5대카드)
- `app/page.tsx` import 교체
- `MagazineHomeScreen.tsx`는 보존(미사용)

**커밋 4 — 주변 정렬 (저위험)**
- AI톡 빈 상태·정책 칩
- MyScreen 메뉴 순서·라벨·`/terms` 링크
- 온보딩 Done 정책 미리보기
- "부평·송도" → "인천" 카피 grep 일괄

**커밋 5 — QA 반영 & 폴리시**
- 실기기 시뮬레이션 결과 미세조정
- 모션 `prefers-reduced-motion` 가드

---

## 9. QA 체크리스트 (머지 전)

광고 동선:
- [ ] 시크릿창 `…/lp/incheon-policy?utm_source=meta&...` → 진단 → "전체 보기" → `/policy?stages=…` result 즉시
- [ ] `/policy?stages=engaged` 직접 진입 시 결과 화면
- [ ] `/policy?stages=garbage` 잘못된 값 → intro (크래시 X)

홈:
- [ ] 375px 폭에서 스크롤 0에 "정책" 단어 노출
- [ ] 비로그인 첫 진입 → 진행률 자리 "시작하기" 카드
- [ ] 온보딩 완료 후 → 진행률 N/5 패널, 하이드레이션 깜빡임 없음
- [ ] 생애주기 3카드 → 올바른 stages로 `/policy` 이동

회귀:
- [ ] AI톡 LEAD_CTA·리드폼 정상 (변경 격리 확인)
- [ ] 가계부/체크리스트/아카이브 무변화
- [ ] 온보딩 1~4 step 정상, Done 미리보기 노출

빌드:
- [ ] `npm run lint && npm run typecheck && npm run build` green
- [ ] Lighthouse 모바일 Performance 회귀 없음 (carousel 제거로 개선 기대)

---

## 10. 리스크 & 완화

| 리스크 | 영향 | 완화 |
|---|---|---|
| 홈 컴포넌트 전면 교체 회귀 | 高 | MagazineHome 보존, import만 스왑 → 즉시 롤백 |
| `useSearchParams` SSR 빌드 에러 | 中 | Suspense 래핑(LP 패턴 재사용) |
| 진행률 하이드레이션 CLS | 中 | `hydrated` 가드 + 동일높이 스켈레톤 |
| 온보딩 stages 추론 부정확 | 低 | "미리보기"로 포지셔닝, 정식 매칭은 /policy |
| 생애주기 파스텔이 브랜드 깸 | 低 | 배경만 파스텔, 보더·CTA 전부 blue 유지 |

---

## 11. 의도적 비범위 (다음 사이클)

- 군구별 정책 SEO 페이지 `/policy/incheon/[district]`
- Choice Share 실데이터(`chat_logs`+`decision_leads`) 집계
- 온보딩 정식 LifeStage 수집 step
- 가계부 인터럽터 / 영상 시그널
- 인천 랜드마크 일러스트 토큰
- 정책 12~14 추가(연수구 청년월세, 아이플러스)
