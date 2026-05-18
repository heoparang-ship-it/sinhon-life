# 신혼생활 모바일 서비스 디자인

_Started 2026-05-18 11:19 UTC_

---

## User

신혼부부를 위한 모바일 웹 서비스 "신혼생활(sinhon.life)"의
디자인 시안을 만들어줘. 기존 사이트(정책·AI 상담 콘셉트)는
완전히 버리고 새로 시작하는 거야. 코드 동작이 아니라 화면
비주얼/레이아웃 확정이 목적이야.

[기능은 딱 2개. 이 외 추가 절대 금지]
1. 영상 아카이브: 신혼부부 관련 인스타그램 콘텐츠(릴스/영상)를
   한곳에 모은 피드. 핵심은 "해시태그 검색". 인스타는 영상을
   하나씩 눌러야만 내용을 알 수 있어 검색이 안 되는데, 이
   서비스는 해시태그(#신혼집 #혼수 #스드메 #출산준비 등)로
   원하는 영상을 즉시 검색·필터링하는 게 존재 이유야.
2. 가계부: 신혼부부 공동 가계부. 수입/지출 입력, 카테고리,
   월별 합계. 기본 기능만.

※ AI 챗봇/정책 상담/진단/체크리스트는 만들지 마. 범위 밖.
※ 향후 가입자 데이터(성별·연령대) 활용 예정이니 회원 개념은
   자리만 잡되 지금 구현하진 마.

[로그인]
- 영상 아카이브 열람·검색은 무가입(누구나 가능).
- 가계부 등 '내 데이터가 생기는 기능'은 카카오 로그인 후 사용.
- 카카오 로그인 버튼은 카카오 공식 노란색 톤으로.
- 시안 단계라 실제 인증 연동은 불필요, 화면만.

[화면 — 모바일 우선, 하단 탭 네비]
하단 탭: [홈/아카이브] [검색] [가계부] [MY]
1) 아카이브 홈: 영상 카드 그리드(세로 썸네일) + 상단 인기
   해시태그 칩
2) 검색: 해시태그 입력/선택 → 결과 그리드, 다중 태그 필터
3) 영상 상세: 영상 영역 + 제목 + 해시태그 + 인스타 원본 링크
4) 가계부: 이번 달 요약(수입/지출/잔액) + 내역 리스트 +
   입력 버튼 (비로그인 진입 시 카카오 로그인 유도 화면)
5) MY: 로그인 상태 영역(자리만)

[비주얼 디렉션 — 레퍼런스: COVI(절제된 시네마틱)를 따뜻하게 번역]
· 무드: "시네마틱 미니멀, 단 따뜻하게". 차갑지 않되 요소를
  덜어내 완성. 한 화면 = 한 메시지.
· 색 전략(가장 중요): 화면의 90% 이상을 따뜻한 오프화이트
  (#FAF7F2 계열)·연한 크림·페일 웜그레이로 비운다. 코럴
  (#F97066)은 '단 한 곳'에만 선명하게 — 주요 버튼·활성 태그.
  색을 많이 써서가 아니라 거의 안 써서 세련돼 보이게.
· 캐릭터: 애플 미모지 계열의 부드러운 3D 캐릭터 톤 차용
  (무광 매트 재질, 둥근 형태, 파스텔이되 살짝 웜톤, 은은한
  그림자, 날카로운 모서리 0). 빈 상태·온보딩·프로필에 활용.
· 키비주얼: 첫 진입/온보딩 1장은 시네마틱하게 — 큰 타이포
  한 방 + 여백 + 부드러운 광원. 기능 설명 말고 분위기로 압도.
· 위계: [작은 알약형 라벨] → [큰 제목] → [작고 연한 회색
  본문] 3단을 모든 섹션에서 반복. 제목/본문 크기 대비 과감히.
· 여백: 과감하게. 답답하면 무조건 더 비운다.
· 모서리 14~16px 라운드, 그림자는 큰 blur·낮은 투명도로 거의
  안 보이게. 선보다 여백·그림자로 구분.
· 영상 카드: 세로 9:16 썸네일이 주인공, 카드 위 텍스트 최소
  (해시태그 1~2개 + 짧은 제목). 카드 간격 넉넉히.
· 해시태그 칩: 알약형. 미선택은 외곽선만, 선택 시 코럴 채움.
· 한글 가독성 좋은 산세리프. 자간 약간 좁게, 행간 넉넉히.
· 절대 금지: 차가운 블루 배경, 진한 그라데이션, 알록달록·꽉
  찬 레이아웃, 관공서/정보포털 느낌.
· 한 줄 요약: "COVI의 절제·여백·캐릭터·시네마틱은 가져오되,
  색온도만 따뜻하게."

[작업 순서]
먼저 1번 "아카이브 홈" 화면 하나만 완성도 높게 보여줘.
그 톤을 확정한 다음 나머지 4개 화면을 같은 결로 확장하자.
사진은 플레이스홀더, 콘텐츠는 더미 텍스트로 채워.

## Assistant

_[tool: update_todos]_

_[tool: copy_starter_component]_

먼저 톤 확정용으로 1번 "아카이브 홈"을 완성도 높게 만들어드릴게요. COVI의 절제·여백 무드는 가져오되, 색온도만 따뜻하게 — 오프화이트(#FAF7F2)와 코럴(#F97066)을 단 한 곳에만 쓰는 시네마틱 미니멀로 잡았습니다.

(참고로 첨부주신 Wireframe 스킬은 보통 흑백 스케치 톤이지만, 비주얼 디렉션이 명확하셔서 그쪽을 우선해 hi-fi 모바일 시안으로 진행할게요. 만약 거친 와이어 버전이 따로 필요하시면 말씀해주세요.)

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: list_files]_

_[tool: write_file]_

_[tool: write_file]_

디자인 시스템을 먼저 정리하고 시작할게요.

**Color** (90%+ 따뜻한 오프화이트, 코럴 1곳만)
- BG `#FAF7F2`, Surface `#FFFFFF`, Cream `#F2EBDE`, Divider `#EDE6DA`
- Ink `#1F1B16`, Mute `#8C8275`, Faint `#B8AE9F`
- Accent **Coral `#F97066`** — primary CTA & active chip 단 한 곳

**Type** Pretendard, 자간 -0.01em, 행간 넉넉. 3단(작은 알약 라벨 11px → 제목 28~36px → 13px 연한 회색 본문)

**Shape** Radius 14/16/999, shadow `0 24px 60px -30px rgba(60,40,20,.18)` 정도로 거의 안 보이게.

이제 1번 화면 만들겠습니다.

_[tool: done]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: str_replace_edit]_

전체적으로 톤은 잘 잡혔는데 섹션 헤더("지금, 신혼이 보는 영상")가 어색하게 줄바꿈되네요. 살짝 손볼게요.

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: grep]_

_[tool: show_html]_

1번 **아카이브 홈** 화면 톤 잡았습니다. 핵심 결정사항:

**적용한 디자인 결정**
- 배경 `#FAF7F2` 한 톤으로 통일, 코럴 `#F97066`은 **"# 전체" 활성 칩 하나에만** 사용
- 3단 위계: 모노스페이스 알약 라벨 `THE NEWLYWED ARCHIVE · 01` → 32/700 큰 제목 → 13px `#8C8275` 본문
- 세로 9:16 썸네일이 주인공. 미묘한 사선 스트라이프 + 따뜻한 톤 8가지(피치/세이지/크림/더스티로즈/샌드/토프/뮤트핑크/리넨)로 배리에이션. 각 카드 위는 **태그(코럴 11px) + 제목 2줄** 만
- 모서리 16px, 그림자는 `0 18px 40px -28px` 로 거의 안 보임
- 하단 탭 4개: 아카이브 / 검색 / 가계부 / MY (현재 활성 = 아카이브, 선만 굵게)

**의도적으로 안 한 것**
- 풀배경 색, 그라데이션, 한 화면에 색 2개 이상 → 시네마틱 미니멀 유지
- AI/정책/체크리스트류 일체 없음
- 회원 흔적은 MY 탭 자리만, 아카이브 열람은 무가입

이 톤이 OK면 다음 작업으로 한 번에 확장하겠습니다:
1. **02 검색** — 태그 입력바 + 다중태그 칩 누적 + 결과 그리드
2. **03 영상 상세** — 9:16 영상 영역 + 제목/태그/인스타 원본 링크
3. **04 가계부** — 이번 달 요약(수입/지출/잔액) + 내역 리스트, 비로그인 진입 시 **카카오 노란색 로그인 유도** 화면
4. **05 MY** — 로그인 상태 자리만

혹시 변경하고 싶은 거 있으세요? (예: 제목 카피, 그리드 컬럼 수 2→3, 탭 라벨, 빈 상태에 들어갈 부드러운 3D 캐릭터 톤 등)

## User

모든 배경은 기본이 화이트야. 좋아, 지금 이 시안을 베이스로 톤만 다시 잡자. 구조·기능·레이아웃은
그대로 두고 색과 질감만 바꿔. 처음부터 다시 만들지 마.

[목표 톤 — COVI의 그 절제된 세련됨, 단 따뜻하게]
지금 화면이 별로인 이유는 색이 과하고 따뜻함이 부족해서야.
다음 기준으로 전면 재조정해줘:

1. 색을 80% 덜어내라.
   - 화면의 90% 이상을 무채색에 가깝게: 따뜻한 오프화이트
     (#FAF7F2), 아주 연한 크림(#F4EFE8), 페일 웜그레이(#E8E3DB).
   - 강조색(코럴 #F97066)은 화면당 '단 한 군데'에만. 주요
     버튼이나 활성 태그 딱 하나. 나머지 색은 전부 빼.
   - 텍스트는 순검정 금지. 진한 웜차콜(#2E2A26).
   - 보조색·아이콘 색·배경 블록색 전부 제거. 색으로 구분하지
     말고 여백과 아주 옅은 그림자로만 구분해.

2. 따뜻하게.
   - 모든 회색·흰색에 미세하게 노란/베이지 기를 섞어
     (쿨그레이 금지). 차가운 블루 톤은 한 픽셀도 쓰지 마.
   - 종이 같은, 부드러운 광이 도는 질감.

3. 여백을 1.5배로.
   - 요소 사이 간격, 섹션 상하 패딩을 지금의 1.5배. 답답한
     곳은 무조건 더 비워. 한 화면에 정보가 적어 보여도 좋다.

4. 질감 정리.
   - 모서리 16px 라운드 통일. 테두리선 제거.
   - 그림자는 거의 안 보이게(큰 blur, 투명도 8% 이하).
   - 그라데이션·광택·진한 음영 전부 제거. 전부 매트하게.

5. 위계만 색 대신 크기로.
   - 강조는 색이 아니라 '글자 크기 대비'로 만들어. 제목은
     과감히 크게, 본문은 작고 연하게.

한 줄 원칙: "거의 흰 종이 위에, 코럴 한 방울. 그 외엔 다 비운다."

먼저 아카이브 홈 한 화면만 이 톤으로 다시 보여줘.

## Assistant

_[tool: read_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

알겠습니다. 구조는 그대로 두고 색·질감만 전면 재조정할게요. 핵심 변경:
- 배경 = 화이트 기본. 코럴은 **활성 칩 단 한 곳**.
- 8가지 썸네일 톤 → **단일 웜 크림** 하나로 통일
- 카드 위 코럴 태그 텍스트 제거 → 모두 웜 차콜
- 인라인 보더 전부 제거, 그림자 거의 0
- 모든 섹션 간 여백 1.5배, 제목 32→40 더 크게

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: grep]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: fork_verifier_agent]_

좋습니다 — 톤 잡혔어요. 핵심 변경 적용 확인:

**Before → After**
- 8가지 톤별 썸네일 → **단일 웜 크림** (#F4EFE8) 하나로 통일, 사선 그레인만 살짝
- 카드 위 코럴 태그 텍스트 + 다크 플레이 버튼 → **아웃라인 플레이** + 차콜 제목/뮤트 태그
- 알약 보더 → 보더 제거, **크림 채움**. 코럴은 활성 칩 단 한 곳
- 텍스트 `#1F1B16` → 웜 차콜 `#2E2A26`
- 제목 32 → **38**, 섹션 간격 1.5배
- 그림자 거의 0 (8% 이하)

이 톤이 맞다면 같은 결로 **02 검색 → 03 영상 상세 → 04 가계부(카카오 로그인 유도 포함) → 05 MY**를 한 번에 만들겠습니다. 더 비울 곳이나 톤 조정 요청 있으면 알려주세요.

_[tool: done]_

_[tool: fork_verifier_agent]_

아카이브 홈 v2 톤 확정용으로 올려드렸습니다. 이 결로 OK면 나머지 4개 화면(검색 / 영상 상세 / 가계부+카카오 로그인 유도 / MY) 한 번에 확장할게요.

## User

화이트랑 블루 컬러가 메인입니다

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

이전 따뜻 톤은 폐기하고 **화이트 + 블루 메인**으로 다시 잡을게요. COVI 레퍼런스 톤에 더 가깝게:

- BG `#FFFFFF` 기본 + 페일 블루 `#EAF3FB` 보조
- 텍스트 슬레이트 `#1A2433` / 뮤트 `#7A8696`
- **메인 블루 `#4DA3F0`** (활성 칩 한 곳)
- 코럴 제거

_[tool: grep]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: done]_

_[tool: save_screenshot]_

_[tool: show_html]_

_[tool: fork_verifier_agent]_

화이트 + 블루 메인으로 톤 다시 잡았습니다.

- 배경 화이트, 페일 블루 `#EAF3FB` (썸네일/칩)
- 활성 칩 한 곳 메인 블루 `#4DA3F0`
- 텍스트 슬레이트 `#1A2433` / 뮤트 `#7A8696`
- 코럴 완전 제거

이 톤이 맞으면 나머지 4화면 한 번에 확장하겠습니다.확인 후 다음 단계로 진행하시겠어요?

## User

이 톤이야.

## Assistant

_[tool: write_file]_

_[tool: write_file]_

알았습니다 — COVI 톤 그대로. **블루 배경 + 화이트 UI**가 메인. 다시 잡을게요.

- BG = 시원한 스카이 블루 메인 (#6BB0EA 톤)
- 모든 텍스트/카드/탭바는 화이트, 보조 텍스트는 화이트 투명도 70%
- 글래스 알약 칩 + 떠 있는 화이트 탭바
- 부드러운 3D 캐릭터 placeholder 살짝

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: done]_

_[tool: save_screenshot]_

_[tool: sleep]_

_[tool: save_screenshot]_

_[tool: fork_verifier_agent]_

COVI 톤(스카이 블루 + 화이트)으로 다시 잡았습니다. 검수 결과 받는대로 다음 화면으로 확장할게요.

## User

Verifier agent check completed

## Assistant

_[tool: str_replace_edit]_

검수 통과. 좌측 envelope 글래스 버블이 "신"자에 살짝 걸친다는 코멘트만 있어서 위치 조정해두겠습니다.사이드 글래스 버블 위치 위로 올렸습니다. 이 톤(스카이 블루 + 화이트) OK이면 나머지 4개 화면(검색 / 영상 상세 / 가계부+카카오 로그인 유도 / MY) 같은 결로 한 번에 확장하겠습니다.

## User

빨간선 아래는 화이트가 백그라운드. 거기에 맞춰서 조화를 맞춰줘

## Assistant

_[tool: write_file]_

알겠습니다. 블루는 히어로 영역까지만, **그 아래는 화이트 배경**으로 전환할게요. 두 존이 어울리도록 색·텍스트 톤을 다시 매칭합니다.

_[tool: done]_

_[tool: save_screenshot]_

_[tool: sleep]_

_[tool: fork_verifier_agent]_

블루 히어로 + 그 아래는 화이트, 두 존이 자연스럽게 이어지도록 정리했습니다. 검수 받아보고 다음 단계 진행할게요.

## User

Verifier agent check completed

## Assistant

검수 통과. 이 톤(블루 히어로 + 화이트 콘텐츠)으로 02 검색 / 03 영상 상세 / 04 가계부 / 05 MY 확장 진행해도 될까요?

## User

아이콘 시간 표기 다음과 같은 톤을 써주세요

모든 폰트 프리텐다드로 통일

## Assistant

_[tool: view_image]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

적용 완료:

- 모든 텍스트 **Pretendard 통일** (모노스페이스 전부 제거)
- **시간 표기**: 다크 칩 → 화이트 글래스 칩 + 블루 굵은 숫자
- **재생 아이콘**: 차콜 → 화이트 + 블루 트라이앵글
- 썸네일 placeholder 라벨도 블루 톤으로

## User

Verifier agent check completed

## Assistant

검수 통과했습니다. 같은 톤으로 02 검색 / 03 영상 상세 / 04 가계부(+카카오 로그인 유도) / 05 MY 확장 진행해도 될까요?

## User

내가 준 이미지는 아주 약간 그라데이션이 있는데 넌 왜 아이콘에 없어?

## Assistant

_[tool: view_image]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

맞아요. 레퍼런스는 알약마다 **좌→우로 살짝 진→연**으로 빠지는 미세한 그라데이션이 있네요. 같은 결로 적용할게요.그라데이션 적용 완료:
- 비활성 칩 (페일 블루) — 좌→우 진→연
- 활성 칩 (메인 블루) — 좌→우 진→연
- 시간 표기 칩 — 화이트→연한 블루 그라데이션
- 재생 버튼 원형 — 동일 그라데이션 + 블루 트라이앵글

## User

Verifier agent check completed

## Assistant

검수 통과. 이 톤(블루 히어로 + 화이트 콘텐츠 + 그라데이션 알약·칩, 프리텐다드 통일)으로 02 검색 / 03 영상 상세 / 04 가계부(+카카오 로그인 유도) / 05 MY 확장 진행할까요?

## User

네 다음

## Assistant

_[tool: copy_starter_component]_

_[tool: update_todos]_

_[tool: grep]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

좋습니다. 공통 토큰 분리하고 5개 화면(가계부는 로그인 + 카카오 게이트 2상태) 한 번에 만들겠습니다.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: done]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: eval_js]_

_[tool: multi_screenshot]_

_[tool: get_webview_logs]_

_[tool: eval_js]_

_[tool: fork_verifier_agent]_

캔버스는 정상이고 5개 아트보드 모두 렌더되었습니다(첫 화면만 뷰포트에 보이고, 나머지는 패닝/스크롤로 이동). 검수에 맡길게요.5개 화면 전부 동일 톤으로 만들었습니다. 디자인 캔버스에서 패닝/스크롤로 이동하시면 됩니다.

- **01 Archive Home** — 기존 그대로
- **02 Search** — 글래스 검색 입력 + 선택 태그 칩(X 제거) + 추천 태그 그룹 + 결과 그리드
- **03 Video Detail** — 9:16 영상 영역 + 메타 + 인스타 원본 그라데이션 CTA + 관련 영상 가로 레일
- **04 Ledger** — 두 상태 모두
  - **A · 비로그인 진입**: 풀 블루 + 큰 캐릭터 + **카카오 노란색** "카카오로 시작하기"
  - **B · 로그인 후**: 잔액 카드(수입 블루/지출 코럴) + 카테고리 + 일자별 내역 + + FAB
- **05 MY** — 캐릭터 + 닉네임 자리 + 통계 자리(저장영상/이번달내역/함께한일) + 계정·서포트 메뉴 + 버전

검수 결과 받으면 잡고 마무리할게요.

## User

태그 옆에 콘텐츠수 표기.

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

모든 태그 알약에 콘텐츠 수 추가했습니다:

- **01 Archive Home** 인기 태그: `# 신혼집 324`, `# 혼수 218` …
- **02 Search** 추천/카테고리 태그: 각각 카운트 (예: `#신혼집 324`, `#예산 120`)
- **03 Video Detail** 영상의 태그: `#신혼집 248`, `#셀프인테리어 62`, `#15평 34`

## User

Apply drawing

## Assistant

_[tool: str_replace_edit]_

_[tool: done]_

02 Search 화면의 "많이 찾는 태그" 섹션 삭제했습니다. (히어로 영역 인기 태그와 중복이라 정리하니 더 깔끔하네요.) 카테고리 섹션만 남아있어요.

## User

Apply drawing

## User

여백 제거

## Assistant

_[tool: str_replace_edit]_

_[tool: done]_

"RESULTS" 라벨 제거하고 상단 패딩도 36→20으로 줄여서 카테고리 ↔ 결과 사이 여백 좁혔습니다.

## User

Apply drawing

## User

우리의 키컬러를 갖고 있지만, 영상 바깥쪽 테두리 얇게. 인스타그램 영상 그대로 가져올것임

## Assistant

_[tool: str_replace_edit]_

_[tool: done]_

03 영상 상세의 블루 여백을 얇게 (좌우 22→10, 하단 28→14)으로 줄였습니다. 인스타그램 영상이 들어왔을 때 영상 자체가 주인공이 되도록, 키컬러 블루는 얇은 액자처럼만 남겼습니다.

## User

Apply 2 direct edits:
1. In ledger.jsx (near line 336, <div>): change the text from "내 데이터가 쌓이는 기능은 카카오로 시작하세요." to "".
<mentioned-element>
react:    DCViewport › DCSection › DCArtboardFrame › IOSDevice › ScreenShell
dom:      body › … › div › div › div.dc-card › div › div › div › div › div › div › div › div › span.__om-t[3/3]
text:     "내 데이터가 쌓이는 기능은 카카오로 시작하세요."
children: text
selector: div:nth-child(5) >div:nth-child(2) >span:nth-child(3)
id:       cc-5
</mentioned-element>
2. In tokens.jsx (near line 107, <div>): change the text from "ME\n3D" to "캐릭터\n만들기".
<mentioned-element>
react:    DCViewport › DCSection › DCArtboardFrame › IOSDevice › ScreenShell › MyHero › CharacterBubble
dom:      body › … › div › div › div.dc-card › div › div › div › div › div › div › div › div › div › div › div
text:     "ME 3D"
children: text
selector: #root > div:nth-child(1) > div:nth-child(1) > div:nth-child(6) > div:nth-child(2) > div:nth-child(1…
id:       cc-11
</mentioned-element>

## User

Save as standalone HTML: Sinhon Life App Launch UI.html

## Assistant

## User

Save as standalone HTML: Sinhon Life App Launch UI.html

## Assistant

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: copy_files]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: super_inline_html]_

_[tool: show_html]_

_[tool: sleep]_

_[tool: get_webview_logs]_

_[tool: present_fs_item_for_download]_

다운로드 준비됐습니다 ↑

## User

Save as standalone HTML: the current design

## Assistant

_[tool: super_inline_html]_

_[tool: present_fs_item_for_download]_

최신 수정사항 반영해 다시 번들했습니다 ↑

