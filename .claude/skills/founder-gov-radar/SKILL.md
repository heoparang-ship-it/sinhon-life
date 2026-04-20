---
name: founder-gov-radar
description: 허파랑(sinhon.life 운영자) 개인 창업가 전용 K-Startup·정부지원 공고 발굴·누적 대시보드 스킬. 운영자가 운영하는 B2C 신혼부부 플랫폼 스타트업이 지원 가능한 모집중 공고를 매일 1회 전수 스캔해 profile.md 기준으로 매칭 티어(🟢/🟡/🟠/🔴)로 분류하고, 만료 공고는 완전 삭제, 신규는 누적 풀에 upsert해 마크다운+HTML 대시보드를 재생성한다. **중요: 이 스킬의 출력은 "운영자 본인이 받을 지원금"을 찾기 위한 것이며, sinhon.life 앱의 일반 사용자(신혼부부)에게 노출하는 콘텐츠가 아니다.** sinhon.life 앱 내부 챗봇/정책 피드와 절대 혼용하지 않는다. 트리거: "K-Startup", "K스타트업", "공고", "모집공고", "지원사업", "정부지원", "오늘의 공고", "공고 스캔", "공고 업데이트", "새 공고", "지원사업 대시보드", "내가 받을 지원", "내 사업 지원", "founder 지원", "창업자 지원", "사업 알아봐줘", "받을 수 있는 지원", "founder-gov-radar", "kstartup-dashboard", "bizpbanc-ongoing". 타 정부지원사업 스킬(gov-support-workflow, startup-package-advisor)과 달리, 이 스킬은 "발굴·추천·누적 관리" 전용이며 사업계획서 작성에는 관여하지 않는다. ⚠️ **최신 사본은 `신혼생활/.claude/skills/founder-gov-radar/SKILL.md` (v7 — Master-Pack Review Guide, 2026-04-18~)**. 이 사본은 레거시 v2 참고용.
---

# founder-gov-radar v2 (LEGACY — 최신 v7은 신혼생활/.claude/skills/founder-gov-radar/SKILL.md 참고)

> **v7 개정 (2026-04-18)**: classify() 시그니처 (tier, evidence_dict) / 3D프린팅·메이커 false-green 교정 / 마스터팩 기반 deep_summary v4 / master_modules.json 동적 주입 / GitHub Actions workflow_dispatch 추가 (force_regenerate, skip_crawl). 이 레거시 문서의 v2 크롤링(WebFetch 10p + 키워드 보완 스캔)은 **폐기됨** — v3부터 nidview JSON 전수 스캔으로 대체.

**허파랑 개인 창업가용 정부지원 공고 레이더.** 운영자가 운영하는 "B2C 신혼부부 라이프스타일 플랫폼 스타트업" 정체성을 기준으로, K-Startup 모집중 공고를 매일 1회 스캔해 누적 추천 풀을 유지하고 단일 대시보드를 재생성한다.

> ⚠️ **맥락 경계**: 이 스킬 출력은 운영자 본인이 보는 내부 자료. sinhon.life 앱 사용자용 콘텐츠와 절대 섞지 않는다.

## 0. 핵심 불변식 (반드시 지킬 것)

- **정체성은 "B2C 플랫폼 스타트업"** 하나. 유튜브/크리에이터 컨텍스트는 매칭·리포트 어디에도 섞지 않는다.
- **누적**: 추천은 휘발되지 않고 `recommendations.json`에 쌓인다.
- **완전 삭제**: 마감일이 지난 공고는 아카이브 없이 지운다.
- **JSON은 자동 계산만**: `recommendations.json`에는 수동 상태 플래그를 저장하지 않는다. 단, HTML 대시보드 측에서 **브라우저 localStorage** 기반의 사용자 상태(진행중 / 지원완료 / 내 사업)는 허용한다. 서버 측(JSON) 데이터와 클라이언트 측(localStorage) 상태는 분리되어야 한다.
- **단일 뷰**: 사용자는 `founder-gov-radar-dashboard.md` 한 파일만 본다. 채팅 리포트와 내용 중복 금지.
- **🔴은 풀에 저장하지 않는다.** 카운트만 남긴다.
- **타임존**: 모든 날짜 판정은 `Asia/Seoul` 기준. `today = 현재 KST의 YYYY-MM-DD`.

## 1. 파일 레이아웃

```
신혼생활/.claude/skills/founder-gov-radar/
  ├ SKILL.md              # 이 파일 (워크플로우)
  ├ profile.md            # 매칭 기준 단일 소스
  └ recommendations.json  # 누적 풀

신혼생활/
  ├ founder-gov-radar-dashboard.md   # 매 실행 전체 재생성되는 마크다운 대시보드 (보조)
  └ founder-gov-radar-dashboard.html # 매 실행 전체 재생성되는 HTML 대시보드 (사용자 주 뷰)
```

절대 경로는 `/sessions/trusting-kind-rubin/mnt/신혼생활/...`. 사용자에게 링크 전달 시 **HTML을 우선** 안내: `computer:///sessions/trusting-kind-rubin/mnt/신혼생활/founder-gov-radar-dashboard.html`. 마크다운 링크는 보조로 첨부.

## 2. recommendations.json 스키마 (v2)

```json
{
  "schema_version": 2,
  "last_updated": "YYYY-MM-DD",
  "items": [
    {
      "pbancSn": "174321",
      "detail_url": "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schM=view&pbancSn=174321",
      "title": "...",
      "agency": "...",
      "deadline": "YYYY-MM-DD",
      "category": "...",
      "tier": "green|yellow|orange",
      "note": "...",
      "connect": "신혼생활(sinhon.life) 연결 포인트 — 1~2문장. B2C 신혼부부 라이프스타일 플랫폼 관점에서 이 공고를 어떻게 활용/포지셔닝할지.",
      "first_seen": "YYYY-MM-DD",
      "last_seen": "YYYY-MM-DD"
    }
  ],
  "red_count_today": 0
}
```

**매칭 키 우선순위 (위에서부터)**:
1. `pbancSn` (있으면 이것만 사용)
2. `normalize(title) + "|" + normalize(agency)` (pbancSn 없을 때 폴백)

**normalize 규칙** (정규식 순서대로 적용):
1. 소문자화
2. `\(.*?\)` 및 `\[.*?\]` 제거 (괄호 내용 전부)
3. `(19|20)\d{2}` 제거 (연도)
4. `\bv?\d+차\b`, `\bv\d+(\.\d+)?\b`, `\b[IVXⅠⅡⅢⅣⅤⅥ]+기\b`, `\b\d+기\b` 제거 (차수/버전)
5. 특수문자/공백 전부 제거 (`[^\w가-힣]` → ``)

결과적으로 `"2026년 제2기 초기창업패키지(서울)"` 과 `"초기창업패키지 2차"` 가 동일 키로 매칭된다.

## 3. 일일 실행 파이프라인

### Step 0. LOAD PROFILE
- `profile.md`를 Read. **모든 분류 기준은 이 문서에서만** 가져온다. SKILL.md에 기준을 하드코딩하지 말 것.

### Step 1. LOAD POOL
- `recommendations.json` Read.
- 없거나 `schema_version < 2`이면 `{schema_version:2, last_updated: today, items: [], red_count_today: 0}`로 초기화. (5장 마이그레이션 참조)

### Step 2. SNAPSHOT EXPIRING (삭제 전 캡처)
- `items` 중 `deadline < today` 인 항목의 `title` 리스트를 `expired_titles` 변수에 복사.
- 이유: Step 9 채팅 리포트에서 "만료 삭제 M건 제목 리스트"를 출력해야 하므로 삭제 전에 잡아둬야 한다.

### Step 3. EXPIRE
- `items`에서 `deadline < today` 인 항목을 **완전 삭제**.
- 추가: `last_seen`이 `today - 14일` 이전인 항목도 "stale"로 간주해 삭제. (조기마감/취소로 리스트에서 사라진 공고의 영구 잔류 방지)

### Step 4. CRAWL (1~10p 병렬 WebFetch)

Base URL: `https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do`

**캐시 회피 파라미터 순서 (페이지 번호별)**:
- 홀수 페이지(1,3,5,7,9): `?page=N&pbancClssCd=PBC010`
- 짝수 페이지(2,4,6,8,10): `?pbancClssCd=PBC010&page=N`

**추출 필드**: `pbancSn`(상세 링크 쿼리스트링에서 추출), `title`, `agency`(주관기관), `deadline`(YYYY-MM-DD), `category`(분야).

**중복 응답 검증**:
- 각 페이지의 `pbancSn` 집합을 수집.
- 두 페이지의 `pbancSn` 집합이 50% 이상 겹치면 "캐시 히트"로 간주 → 해당 페이지만 파라미터 순서를 반대로 뒤집어 1회 재시도.
- 재시도 후에도 중복이면 해당 페이지는 스킵하고 Step 9 리포트에 `⚠️ pN 크롤링 실패(캐시)` 명시.

**부분 실패**: 10개 페이지 중 6개 이상 성공해야 진행. 5개 이하면 EXPIRE/SAVE 커밋하지 말고 전체 실행 중단하고 사용자에게 알림.

### Step 4-B. KEYWORD FALLBACK SCAN (크롤링 실패 시 필수)

Step 4에서 **실패한 페이지가 1개라도 있으면**, 그 페이지에 있을 수 있는 🟡/🟢 공고를 놓치지 않기 위해 다음 키워드 기반 보완 스캔을 반드시 실행한다. 이 단계는 **선택이 아니라 필수**. (과거 사고: 사회적기업 창업지원사업 pbancSn=177132 누락 → 대표가 직접 발견 → hotfix 2026-04-15)

**필수 키워드 리스트 (8종 코어 + 8종 보조)**:

```
[코어 8] 사회적 · 예비창업 · 초기창업 · 모두의 · 오픈이노베이션 · 인천 · 청년창업 · 액셀러레이팅
[보조 8] TIPS/팁스 · AX · LLM · AI · 글로벌 · 멘토링 · 바우처 · 공공
```

> 실측 (2026-04-15): 코어 8개 키워드는 거의 동일 결과셋을 반환하는 경향. 16개 키워드를 돌려도 코어 8개 커버리지가 전체 결과의 90%+를 차지. **코어 8개는 반드시 병렬 WebFetch**, 보조 8개는 코어 결과 dedupe 후 남는 슬롯에 보완.

**URL 패턴**: `https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schStr=<URL인코딩키워드>&pbancClssCd=PBC010`

각 검색 결과에서 **Step 4 크롤링으로 이미 수집된 pbancSn 집합에 없는** 신규 공고만 후보로 편입. 편입 후 Step 5 분류에 동일하게 투입.

**판정 유의 사항 (실측 학습)**:
- "공공시장 진출 교육/조달시장 진출 교육" → profile.md §🔴 "B2G 공공시장 진출 전용" 해당 → **🔴 제외**. 신혼생활(sinhon.life)은 B2C 플랫폼이므로 B2G 조달 교육은 정체성 불일치.
- "OASIS/외국인/이민자" → 🔴 자격 한정.
- "글로벌 팁스 (해외 투자 30만 달러+)" → 🔴 단계 불일치(Series A+).
- "수행사/수행기관 공모" → 🔴 성격 불일치.
- "서울 도봉/구로/금천/동대문/성남/파주/부산/대구/경남 등 지자체 단독" → 🔴 지역 한정.
- "팹리스/반도체/전통문화/ICT 특정 분야 한정" → 🔴 업종 한정.
- **tier 판정은 subagent가 틀릴 수 있으므로, 'B2G/공공시장/수행기관/지자체 단독' 키워드 포함 공고는 재검증 필수.**

이 보완 스캔은 크롤링 실패가 0건이어도 권장(주 2회 이상). 만기 D-7 이내 🟡 누락은 즉시 복구 불가이므로, 크롤링 신뢰도보다 recall을 우선시한다.

**핵심 원칙**: 대표 소재지(인천)·B2C 플랫폼·사회적기업·예비/초기창업·AX 관련 공고는 **절대 놓치면 안 된다**. 크롤링 실패 페이지가 있으면 최소한 위 키워드 전부 돌려서 보완하고, Step 9 리포트에 "✅ 키워드 보완 스캔 N건 검색 / M건 신규 편입 / K건 🔴 제외" 로 보고.

### Step 5. CLASSIFY & RE-CLASSIFY

크롤된 신규 후보 + **풀 내 기존 모든 항목**을 합쳐서 현재 `profile.md` 기준으로 전부 재분류한다.

- 이유: profile.md가 수정되면 기존 풀 항목의 티어도 최신 기준에 맞춰 재평가되어야 한다.
- 티어: `green`/`yellow`/`orange`/`red`
- **재분류 결과 `red`가 된 기존 풀 항목은 제거**한다.
- `red` 신규 후보는 풀에 들어가지 않는다. 카운트만 `red_count_today`에 누적.

(선택 2차) 경계에 있는 후보는 `detail_url`을 한 번 더 WebFetch해 본문 기반으로 티어 재조정.

### Step 6. UPSERT
- 매칭 키(2장)로 기존 항목 조회.
- 있으면: `deadline`, `tier`, `category`, `note`, `connect`, `last_seen=today` 갱신. `first_seen`은 절대 덮어쓰지 않음.
- 없으면: `first_seen=last_seen=today`로 신규 추가. `pbancSn`, `detail_url`, `connect` 저장.

**connect 필드 작성 규칙**: 모든 풀 항목에 필수. 1~2문장, 신혼생활(sinhon.life) B2C 신혼부부 라이프스타일 플랫폼 관점에서 이 공고를 어떻게 활용할지(포지셔닝/제휴/지원 전략). 유튜브/크리에이터 컨텍스트 사용 금지. 예: "신혼 AI 비서 기능을 AX 수직화로 서술 → LLM 분야 직접 매칭", "와이프 예창 트랙으로 동일 아이템 이중 제출".

### Step 7. SAVE
- `recommendations.json` 쓰기. `last_updated=today`, `red_count_today=<오늘 걸러낸 red 개수>`.

### Step 8. RENDER DASHBOARDS (MD + HTML 동시)

**두 파일을 모두 재생성한다.** 어느 한쪽만 갱신하면 안 된다.

#### 8-A. `신혼생활/founder-gov-radar-dashboard.md` 재생성. 구조:

```markdown
# 🗂️ K-Startup 추천·진행 대시보드

> 마지막 갱신 YYYY-MM-DD (KST) | 총 N건 | 🟢A 🟡B 🟠C | 오늘 🔴 제외 X건

## 🆕 오늘 신규 (first_seen == today)
| 공고 | 마감(D-n) | 주관 | 티어 | 메모 |
| --- | --- | --- | --- | --- |
| [제목](detail_url) | YYYY-MM-DD (D-n) | ... | 🟢 | ... |

## ⏰ 임박 마감 (D-0 ~ D-3, 오늘 신규 제외)

## 🟢 1순위 강력 추천

## 🟡 2순위 검토 추천

## 🟠 3순위 AI 포지셔닝
```

**D-n 계산**: `n = (deadline - today).days` (KST 기준). D-0 = 마감 당일 포함. "D-3 이내"는 `0 ≤ n ≤ 3`.

**섹션 배치 규칙**:
- 🆕 오늘 신규 섹션은 `first_seen == today`인 항목만. 티어 무관 전부 포함.
- ⏰ 임박 마감 섹션은 D-0~D-3 중 🆕 섹션에 이미 들어간 건 제외.
- 🟢/🟡/🟠 섹션은 전체 풀을 티어별로 분류. 🆕나 ⏰에 이미 나온 공고도 **중복 표시**(사용자가 티어별로 훑어볼 때 빠짐 방지).
- 모든 섹션 테이블은 **마감일 오름차순** 정렬.

**공고 컬럼**: `[제목](detail_url)` 형식의 마크다운 링크. detail_url이 없으면 링크 없이 제목만.

#### 8-B. `신혼생활/founder-gov-radar-dashboard.html` 재생성

사용자 주 뷰. **순수 흑백(Black & White only) 미니멀 테마** 단일 HTML 파일 (외부 CDN/스크립트 의존성 없음).

**디자인 원칙 — 절대 준수**:
- 기본 색상은 **검정(#000)과 흰색(#fff), 중간 회색(#666 muted, #e5e5e5 soft line, #f5f5f5 hover)만** 사용.
- **예외**: 1/2/3순위·제외 심볼(● ◐ ○ ×) 4종에만 색 허용 — 녹색 `#16a34a`, 노랑 `#eab308`, 주황 `#ea580c`, 빨강 `#dc2626`. 색은 심볼 문자에만 적용하고 배경/테두리/텍스트에는 사용하지 않는다.
- 티어 구분은 위 4색 심볼 + **패턴(반복 그라디언트 스트라이프)** 좌측 마커로 표현.
- 타이포그래피 위주, 굵은 검정선과 격자(border)로 레이아웃.
- 배지는 outline 박스 또는 검정 solid 박스로만 표현. 배경색 팔레트 금지.

**필수 구성 요소**:
- `<title>`와 `<h1>`: "K-Startup 추천·진행 대시보드" (이모지 없이)
- 헤더 메타: `마지막 갱신 YYYY-MM-DD (KST) · 신혼생활(sinhon.life) · 소재지 인천 · 이중 트랙(예비 / 초기)`
- 크롤링 실패 페이지가 있으면 `.warn` (검정 테두리 박스)로 경고 표시
- 통계 바: Total / ● 1순위 / ◐ 2순위 / ○ AI / × 제외 — 한 줄 5칸, 검정 테두리 분할
- 필터 버튼: [전체 / ● 1순위 / ◐ 2순위 / ○ AI 포지셔닝 / NEW 오늘 신규 / ⏰ D-3 이내] — 활성화 시 검정 배경·흰 글씨 반전
- 카드 그리드: 격자형(border collapse 스타일). 카드 좌측에 4px 티어 마커:
  - green → solid 검정 bar
  - yellow → 대각선 스트라이프 패턴
  - orange → 수평선 스트라이프 패턴
- 카드 내용: 제목(링크, hover 시 밑줄 애니메이션), 배지 3종(티어 solid / 마감일+D-n / NEW), 주관기관(모노스페이스), 메모
- 임박 마감(D-0~D-3) 배지는 검정 solid 반전 표시
- 정렬: 마감일 오름차순
- Footer: 좌측 "founder-gov-radar v2 · 매일 18:00 KST 자동 갱신", 우측 raw data 링크

**데이터 임베딩**: `<script>` 태그 안에 `const items = [...]`로 풀 전체를 인라인 임베드. `TODAY` 상수로 오늘 날짜 하드코딩. JS로 D-n 계산 및 필터링.

**CSS 변수 토큰**:
```
--bg:#ffffff --fg:#000000 --muted:#666666 --line:#000000 --line-soft:#e5e5e5 --hover:#f5f5f5
```

**폰트**: `-apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif`. 배지·주관기관·footer는 `"SF Mono", Menlo, monospace`.

**중요**: HTML 전체를 매 실행마다 **완전 재생성**한다. 부분 수정 금지(스크립트 내 데이터가 갱신되지 않을 위험). 기존 파일을 Write로 덮어쓴다. 사용자가 명시적으로 컬러 테마를 요청하지 않는 한 흑백 원칙을 유지.

**인터랙티브 기능 (localStorage 기반 — 재생성 시 반드시 유지)**:

재생성 시에도 다음 JS 구조를 **반드시 동일하게 유지**한다. 재생성이 사용자 상태를 초기화하면 안 되므로 `STORAGE_KEY`, 상태 스키마, 렌더 로직을 절대 변경하지 말 것.

- **STORAGE_KEY**: `'sinhon_kstartup_state_v1'` (절대 변경 금지)
- **state 구조**:
  ```js
  { statuses: { [id]: { status: 'in_progress'|'completed', snapshot: <item>, moved_at: 'YYYY-MM-DD' } },
    userItems: [ { id: 'user_<timestamp>', title, agency, deadline, detail_url, tier, note, connect, first_seen } ] }
  ```
- **상태 전이**:
  - `pool` → `in_progress`: "▶ 진행중으로" 버튼. 이 순간 item 전체를 `snapshot`에 복사 저장(JSON에서 사라져도 카드 유지되도록).
  - `in_progress` → `completed`: "✓ 지원완료로" 버튼.
  - `in_progress` → `pool`: "↶ 되돌리기" 버튼.
  - `completed` → `in_progress`: "↶ 진행중으로" 버튼.
  - `completed` → 완전 삭제: "🗑 삭제 (미지원)" 버튼. 실제 지원 안 한 경우용.
- **사용자 사업 추가/편집/삭제**: 모달 폼(title, agency, deadline, url, tier, note, connect). `userItems`에 저장. id는 `'user_' + Date.now()`. 티어 마커는 `user`=violet `#7c3aed` 90° 스트라이프.
- **필터 버튼 (9종)**: 전체 / ● 1순위 / ◐ 2순위 / ○ AI / ◆ 내 사업 / NEW / ⏰ D-3 이내 / ▶ 진행중 / ✓ 지원완료. 각 버튼 옆에 카운트 표시.
- **통계 바 (7칸)**: Total / ● 1순위 / ◐ 2순위 / ○ AI / ▶ 진행중 / ✓ 완료 / × 제외.
- **D-n 계산**: 진행중/완료 항목은 snapshot의 deadline을 기준으로 계속 D-n 갱신 표기.
- **색상 예외 추가**: 기본 4색 외에 `--c-blue:#2563eb`(진행중 뱃지), `--c-violet:#7c3aed`(내 사업 심볼/마커) 2색만 추가 허용.

### Step 9. CHAT REPORT (짧게)

채팅에는 다음만 출력. 대시보드 본문 중복 금지.

```
✅ 공고 풀 갱신 완료 (YYYY-MM-DD KST)

🆕 신규 N건:
- 제목1
- 제목2

🗑️ 만료 삭제 M건:
- 제목1

📊 현재 풀: 총 K건 (🟢A 🟡B 🟠C) | 오늘 🔴 제외 X건
⚠️ 크롤링 실패 페이지: (있을 경우만)

🔗 [HTML 대시보드 열기](computer:///sessions/trusting-kind-rubin/mnt/신혼생활/founder-gov-radar-dashboard.html) · [마크다운 보기](computer:///sessions/trusting-kind-rubin/mnt/신혼생활/founder-gov-radar-dashboard.md)

Sources:
- [K-Startup 1p](https://...)
... (10개)
```

## 4. profile.md 수정 시 동작

사용자가 profile.md를 수정하면 다음 실행 시 Step 5에서 전체 재분류되어 자동 반영된다. 별도 마이그레이션 불필요.

## 5. 마이그레이션 (최초 1회)

- `last_snapshot.json`이 있으면 `last_snapshot.json.deprecated`로 rename.
- `recommendations.json`이 없거나 `schema_version < 2`이면 빈 풀로 부트스트랩하고 오늘자 크롤링 결과로 채운다.
- `founder-gov-radar-dashboard.md`를 최초 생성.

## 6. 하지 말 것 (Anti-Patterns)

- `recommendations.json`(서버 풀)에 수동 상태 플래그를 저장하지 말 것. 사용자 상태(진행중/지원완료/내 사업)는 **HTML의 localStorage에서만** 관리한다.
- 매일 HTML을 재생성할 때 localStorage 기반 상태 관리 JS 코드를 절대 삭제하지 말 것. (재생성은 `items` 데이터와 `TODAY` 상수만 교체하는 효과여야 함)
- 만료 아카이브 섹션 생성 금지.
- 🔴을 풀에 저장 금지.
- 유튜브/크리에이터 스토리를 매칭·리포트에 섞지 말 것.
- 대시보드 본문을 채팅 리포트에 중복으로 붙이지 말 것.
- SKILL.md에 매칭 기준 하드코딩 금지(반드시 profile.md에서만).
- 타임존 혼용 금지(전부 Asia/Seoul).
