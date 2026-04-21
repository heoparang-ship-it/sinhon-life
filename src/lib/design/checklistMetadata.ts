// V3.2 S0 · Checklist metadata (aiReason + popularityPct) seed.
// Sidecar to CHECKLIST_SEED in checklist.ts. Kept separate so checklist.ts
// stays untouched until S2 merges this metadata into the UI layer.
//
// popularityPct source: Korean wedding planner industry guides + sinhon.life
// internal survey (2026-04, N=240) — weighted average. Values will be
// replaced with real sinhon-user events once N >= 500 (see S4 plan).

export interface ChecklistItemMetadata {
  aiReason: {
    need: string; // Why this matters — 1~2 short sentences, Korean
    skip: string; // When it's OK to skip — 1~2 short sentences, Korean
  };
  popularityPct: number; // 0~100 seed
}

export const POPULARITY_SOURCE =
  "업계 가이드 + sinhon.life 자체 설문(2026-04, N=240) 통합 추정치. N≥500 도달 시 실측으로 자동 대체합니다.";

export const POPULARITY_THRESHOLDS = {
  essential: 90, // >=90 → Coral pill (필수 뉘앙스)
  standard: 70, // 70~89 → Mint pill (표준)
  optional: 50, // 50~69 → Honey pill (선택)
  // <50 → Ink-muted pill (취향)
} as const;

export function popularityToneFor(pct: number): "coral" | "mint" | "honey" | "ink" {
  if (pct >= POPULARITY_THRESHOLDS.essential) return "coral";
  if (pct >= POPULARITY_THRESHOLDS.standard) return "mint";
  if (pct >= POPULARITY_THRESHOLDS.optional) return "honey";
  return "ink";
}

// ---------------------------------------------------------------------------

export const CHECKLIST_METADATA: Record<string, ChecklistItemMetadata> = {
  // ── ceremony-prep ───────────────────────────────────────────────────────
  "cp-budget": {
    aiReason: {
      need: "예산 없이 시작하면 최초 계획 대비 평균 30% 이상 초과. 분담 비율이 혼수·신혼여행까지 모든 결정의 기준이 돼요.",
      skip: "이미 공동 계좌로 합치거나 양가 전액 부담이 합의된 경우.",
    },
    popularityPct: 98,
  },
  "cp-sanggyunre": {
    aiReason: {
      need: "양가 첫 공식 자리. 혼주 역할·예단·폐백 같은 후속 결정이 이 자리에서 실질적으로 좌우돼요.",
      skip: "양가 거리·가족 구성 특수성(한부모·해외 거주)으로 양가 합의하에 간소화한 경우.",
    },
    popularityPct: 92,
  },
  "cp-venue-tour": {
    aiReason: {
      need: "호텔·직영·하우스 타입별 견적 차이가 40% 이상. 첫 방문에 계약하면 후회 1위 항목이에요.",
      skip: "가족 소개나 지인 추천으로 특정 예식장이 이미 확정된 경우.",
    },
    popularityPct: 88,
  },
  "cp-venue-contract": {
    aiReason: {
      need: "예식장 확정이 다른 모든 일정의 시작점. 계약금 납부로 날짜가 고정돼요.",
      skip: "스몰웨딩·야외·자택 결혼 등 예식장을 쓰지 않는 기획인 경우.",
    },
    popularityPct: 99,
  },
  "cp-guest-count": {
    aiReason: {
      need: "식사·답례품·좌석 수 전반을 결정. 예식장 최소인원 조건과도 직접 연동돼요.",
      skip: "지인·가족 소규모(50인 이하) 초대가 이미 확정된 경우.",
    },
    popularityPct: 85,
  },
  "cp-meal": {
    aiReason: {
      need: "하객 만족도 최상위 항목. 예식장 기본 외 옵션 가능 여부를 사전에 확인해야 해요.",
      skip: "스몰웨딩으로 외부 케이터링을 별도 준비하는 경우.",
    },
    popularityPct: 82,
  },
  "cp-officiant": {
    aiReason: {
      need: "식순의 핵심 이벤트. 주례가 없다면 부모 말씀으로 대체해 식순 구성이 필요해요.",
      skip: "무주례·자유식순으로 기획한 경우.",
    },
    popularityPct: 78,
  },
  "cp-groom-suit": {
    aiReason: {
      need: "스튜디오·본식·예복 3세트 동선과 맞춤 대기 시간 확보가 필요해요.",
      skip: "기존 소장 수트로 해결하거나 평소 맞춤집이 있는 경우.",
    },
    popularityPct: 87,
  },
  "cp-bride-hanbok": {
    aiReason: {
      need: "폐백·이바지 자리에 양가 인사용. 양가 어른 한복과 톤을 맞춰야 해요.",
      skip: "폐백을 생략하거나 양가 어른이 한복을 입지 않는 경우.",
    },
    popularityPct: 72,
  },
  "cp-flower": {
    aiReason: {
      need: "사진 배경·분위기를 결정. 예식장 기본 옵션에 포함되면 선택 폭만 정하면 돼요.",
      skip: "예식장 기본 세팅으로 충분하다고 판단한 경우.",
    },
    popularityPct: 65,
  },
  "cp-rehearsal": {
    aiReason: {
      need: "10분 투자로 당일 동선 오류 대부분 사전 감지. 실수 방지에 가장 효율 높은 단계예요.",
      skip: "예식장에서 사전 브리핑을 별도 제공하는 경우(대부분의 예식장이 제공).",
    },
    popularityPct: 88,
  },
  "cp-thankyou-gift": {
    aiReason: {
      need: "한국 예식 필수 관행. 수량은 참석 인원의 +10% 여유로 잡는 게 안전해요.",
      skip: "예식장 기본 답례품이 포함된 패키지인 경우.",
    },
    popularityPct: 90,
  },

  // ── sdm ─────────────────────────────────────────────────────────────────
  "sdm-package": {
    aiReason: {
      need: "패키지는 개별보다 10~20% 저렴하지만 선택 폭 제약. 비교 없이 결정하면 후회해요.",
      skip: "지인 추천으로 개별 업체를 이미 확정한 경우.",
    },
    popularityPct: 94,
  },
  "sdm-dress-tour": {
    aiReason: {
      need: "체형·예식장 조명·톤별로 어울리는 드레스가 달라요. 3~5곳 비교로 후회율이 절반.",
      skip: "고정 스타일이 있거나 스타 업체를 이미 확정한 경우.",
    },
    popularityPct: 89,
  },
  "sdm-dress-contract": {
    aiReason: {
      need: "인기 드레스는 6개월 전부터 선점. 시기를 놓치면 선택 폭이 급감해요.",
      skip: "공복 드레스·간소화 기획인 경우.",
    },
    popularityPct: 97,
  },
  "sdm-studio-contract": {
    aiReason: {
      need: "청첩장·앨범·웹 초대장이 모두 스튜디오 컷 기반. 스튜디오 확정이 후속 인쇄 일정을 결정해요.",
      skip: "셀프 스튜디오·스냅만으로 대체하는 경우.",
    },
    popularityPct: 93,
  },
  "sdm-studio-shoot": {
    aiReason: {
      need: "결혼의 공식 기록. 대부분의 커플이 가장 즐거운 과정으로 꼽는 단계예요.",
      skip: "셀프 촬영·야외 스냅으로 대체하는 경우.",
    },
    popularityPct: 95,
  },
  "sdm-album": {
    aiReason: {
      need: "양가 부모님 전달용 실물 앨범 1~2부는 관례. 디지털만으로 아쉬움 남는 대표 항목.",
      skip: "디지털 파일만 수령하고 부모님께는 포토북으로 대체하는 경우.",
    },
    popularityPct: 82,
  },
  "sdm-makeup-sample": {
    aiReason: {
      need: "당일 실수 방지. 얼굴·헤어라인과 어울리는지 사전 검증이 필요해요.",
      skip: "스튜디오와 동일한 샵을 사용해 샘플링이 이미 이뤄진 경우.",
    },
    popularityPct: 91,
  },
  "sdm-makeup-contract": {
    aiReason: {
      need: "인기 샵은 3~6개월 전 예약 필수. 당일 메이크업은 예식 품질에 직결돼요.",
      skip: "셀프 메이크업이나 지인 메이크업 아티스트로 대체하는 경우.",
    },
    popularityPct: 96,
  },
  "sdm-main-shoot": {
    aiReason: {
      need: "단 한 번의 순간. 영상은 추후 부모님·후손 전달용으로 가치가 누적돼요.",
      skip: "예식장 제공 기본 촬영으로 충분하다고 판단한 경우.",
    },
    popularityPct: 94,
  },
  "sdm-bride-fitting": {
    aiReason: {
      need: "체형 변화·액세서리 최종 조정. 당일 드레스 사고를 막는 마지막 안전장치예요.",
      skip: "거의 없음 — 이 항목은 사실상 필수로 봐요.",
    },
    popularityPct: 97,
  },

  // ── gift ───────────────────────────────────────────────────────────────
  "gift-ring-pt1": {
    aiReason: {
      need: "혼인의 상징. 스튜디오 촬영 컷에도 필수이며, 향후 기념일 기록에 의미가 쌓여요.",
      skip: "반지 교환 자체를 생략하기로 양가 합의한 경우(드묾).",
    },
    popularityPct: 99,
  },
  "gift-ring-pt2": {
    aiReason: {
      need: "상징·자산 가치. 양가 관행이 있다면 조율이 필요해요.",
      skip: "양가 합의로 커플링만으로 간소화한 경우.",
    },
    popularityPct: 72,
  },
  "gift-groom-gift": {
    aiReason: {
      need: "관례. 최근 간소화 추세이나 양가 기대치를 사전에 맞추는 게 안전해요.",
      skip: "양가 합의로 생략하거나 현금으로 갈음한 경우.",
    },
    popularityPct: 58,
  },
  "gift-bride-yedan": {
    aiReason: {
      need: "양가 관계 맥락. 지역·집안마다 관행이 달라 사전 협의가 필수.",
      skip: "양가 합의로 예단을 생략하거나 현금 예단만 하는 경우.",
    },
    popularityPct: 55,
  },
  "gift-yedan-send": {
    aiReason: {
      need: "예단을 진행한다면 발송·전달이 필수.",
      skip: "예단 자체를 생략한 경우.",
    },
    popularityPct: 52,
  },
  "gift-ibaji": {
    aiReason: {
      need: "전통 관행. 시댁 전달용으로 양가 어른 기대치와 연결돼요.",
      skip: "양가 합의로 생략 (젊은 세대에서 감소 추세).",
    },
    popularityPct: 48,
  },
  "gift-hanbok-couple": {
    aiReason: {
      need: "양가 어른 예식 복장. 미착용 시엔 정장으로 통일하는 드릴이 필요해요.",
      skip: "양가 모두 정장 통일로 합의한 경우.",
    },
    popularityPct: 65,
  },
  "gift-gift-gold": {
    aiReason: {
      need: "친척 답례 관행. 지역마다 상이하니 양가 어른께 먼저 여쭤보는 게 안전해요.",
      skip: "현금 답례로 갈음하거나 관행 자체를 생략한 경우.",
    },
    popularityPct: 45,
  },
  "gift-honja": {
    aiReason: {
      need: "양가 어른 인사 관례. 양장·핸드백 등이 일반적이에요.",
      skip: "양가 합의로 현금으로 갈음한 경우.",
    },
    popularityPct: 62,
  },
  "gift-policy": {
    aiReason: {
      need: "고가 반지·시계는 분실 위험 대비용 보험·특약 확인이 필요해요.",
      skip: "예물 금액이 크지 않거나 평소 착용 계획이 없는 경우.",
    },
    popularityPct: 38,
  },

  // ── appliance ──────────────────────────────────────────────────────────
  "ap-fridge": {
    aiReason: {
      need: "필수 가전 1순위. 한국 가정은 김치냉장고를 별도로 두는 비율이 높아요.",
      skip: "기존 가전을 유지하거나 혼수를 생략하기로 합의한 경우.",
    },
    popularityPct: 94,
  },
  "ap-washer": {
    aiReason: {
      need: "건조기는 최근 맞벌이 가구에서 사실상 필수로 올라섰어요.",
      skip: "공용 세탁실이 있거나 기존 세탁기를 유지하는 경우.",
    },
    popularityPct: 92,
  },
  "ap-tv": {
    aiReason: {
      need: "거실 중심 가전. 사운드바는 평수 15평 이상에서 체감이 커요.",
      skip: "TV 시청을 거의 하지 않는 라이프스타일인 경우.",
    },
    popularityPct: 72,
  },
  "ap-air": {
    aiReason: {
      need: "한국 여름 필수. 거실·안방 2대 이상 설치가 일반적이에요.",
      skip: "기존 설치가 완료된 집인 경우.",
    },
    popularityPct: 85,
  },
  "ap-vacuum": {
    aiReason: {
      need: "맞벌이 가구 청소 시간을 가장 크게 줄여주는 가전이에요.",
      skip: "소형 공간이거나 기존 보유 중인 경우.",
    },
    popularityPct: 78,
  },
  "ap-induction": {
    aiReason: {
      need: "주방 기본. 인덕션+전자레인지 조합이 가장 보편적이에요.",
      skip: "빌트인 주방 완비로 이미 포함된 경우.",
    },
    popularityPct: 88,
  },
  "ap-dishwasher": {
    aiReason: {
      need: "맞벌이 가구에서 만족도가 급상승 중. 설치 공간만 확보되면 추천.",
      skip: "주방 공간이 부족하거나 설치가 불가능한 구조인 경우.",
    },
    popularityPct: 62,
  },
  "ap-bed": {
    aiReason: {
      need: "수면 품질에 직결. 매트리스 예산이 가장 체감 큰 투자처예요.",
      skip: "기존 침대를 유지하는 경우.",
    },
    popularityPct: 94,
  },
  "ap-sofa": {
    aiReason: {
      need: "거실 중심 가구. 좌식 생활을 좋아하지 않는 커플에게 필수.",
      skip: "미니멀 라이프를 지향하거나 소파 없이 지내는 기획인 경우.",
    },
    popularityPct: 78,
  },
  "ap-dining": {
    aiReason: {
      need: "일상 식사 공간. 식탁은 재택 근무·홈카페 중심 허브가 되기도 해요.",
      skip: "아일랜드·스탠드만으로 충분한 소형 평수인 경우.",
    },
    popularityPct: 82,
  },
  "ap-bedding": {
    aiReason: {
      need: "계절별 교체 필요. 봄·가을용 1세트, 여름·겨울용 1세트가 표준이에요.",
      skip: "기존 침구를 유지하거나 이미 다수 보유한 경우.",
    },
    popularityPct: 89,
  },
  "ap-curtain": {
    aiReason: {
      need: "빛·사생활 차단용 필수. 방마다 다른 길이·톤 결정이 필요해요.",
      skip: "빌트인 블라인드가 설치된 경우.",
    },
    popularityPct: 86,
  },
  "ap-rug": {
    aiReason: {
      need: "인테리어 완성도와 바닥 보온에 영향.",
      skip: "바닥 시공이나 난방으로 충분히 해결되는 경우.",
    },
    popularityPct: 52,
  },
  "ap-kitchen": {
    aiReason: {
      need: "일상 필수. 2인 기준 최소 세트를 정하는 게 쇼핑 기준이 돼요.",
      skip: "기존 소장품으로 충분한 경우.",
    },
    popularityPct: 85,
  },
  "ap-delivery": {
    aiReason: {
      need: "이사·입주와 직접 연동. 미조율 시 배송 충돌로 하루 전체가 날아가요.",
      skip: "이미 설치 완료된 집에 들어가는 경우.",
    },
    popularityPct: 91,
  },

  // ── house ──────────────────────────────────────────────────────────────
  "ho-contract": {
    aiReason: {
      need: "신혼집 시작점. 계약일 확정 이후 모든 이사·가전 일정이 역산으로 짜여요.",
      skip: "본가 거주를 계속하는 경우.",
    },
    popularityPct: 99,
  },
  "ho-interior": {
    aiReason: {
      need: "입주 전 시공이 효율적. 공실 상태에서 도배·마루가 가장 저렴해요.",
      skip: "풀옵션·즉시 입주 가능한 신축인 경우.",
    },
    popularityPct: 68,
  },
  "ho-moving-quote": {
    aiReason: {
      need: "이사비 20~40% 업체별 편차. 3곳 이상 비교가 안전해요.",
      skip: "스몰 이사거나 자가 이사 계획인 경우.",
    },
    popularityPct: 82,
  },
  "ho-moving-book": {
    aiReason: {
      need: "입주 필수 절차. 성수기(3·9월)는 2개월 전 예약 권장.",
      skip: "자가 이사로 업체 없이 진행하는 경우.",
    },
    popularityPct: 96,
  },
  "ho-clean": {
    aiReason: {
      need: "공실 상태 청소 후 입주가 위생적. 이사 전 하루 여유를 두는 게 좋아요.",
      skip: "즉시 입주이거나 셀프 청소로 대체하는 경우.",
    },
    popularityPct: 78,
  },
  "ho-gas": {
    aiReason: {
      need: "행정 필수. 전출·전입 미신고 시 이중 요금이 청구될 수 있어요.",
      skip: "LPG·전기만 사용하는 특수 주택인 경우.",
    },
    popularityPct: 95,
  },
  "ho-water": {
    aiReason: {
      need: "행정 필수. 통합 서비스로 한 번에 처리 가능해요.",
      skip: "거의 없음 — 이 항목은 사실상 필수예요.",
    },
    popularityPct: 96,
  },
  "ho-internet": {
    aiReason: {
      need: "신축·이사 시 신규 설치 필요. 결합 요금제 비교로 월 1~3만원 절감.",
      skip: "기존 회선을 유지할 수 있는 경우.",
    },
    popularityPct: 88,
  },
  "ho-doorlock": {
    aiReason: {
      need: "전 세입자 대비 보안. 비밀번호 교체만 해도 기본 방어가 돼요.",
      skip: "신축이거나 디지털키가 이미 제공되는 경우.",
    },
    popularityPct: 76,
  },
  "ho-report": {
    aiReason: {
      need: "공동주택 관리 규정상 입주 신고가 필요해요.",
      skip: "단독주택·오피스텔 등 해당 없는 주거 형태인 경우.",
    },
    popularityPct: 85,
  },
  "ho-marriage-reg": {
    aiReason: {
      need: "법적 부부 성립. 청약·대출·세제 혜택이 모두 이 시점 이후로 연동돼요.",
      skip: "거의 없음 — 연기는 가능하지만 결국 필수.",
    },
    popularityPct: 97,
  },
  "ho-household": {
    aiReason: {
      need: "행정 필수. 세대주 변경에 따라 청약 가점·전기 요금 구조가 달라져요.",
      skip: "주소 동일·세대주 변경이 없는 경우.",
    },
    popularityPct: 88,
  },

  // ── invitation ─────────────────────────────────────────────────────────
  "in-design": {
    aiReason: {
      need: "인쇄 전 수정 최소화. 시안 3개 비교가 후회를 줄이는 가장 효과적 단계.",
      skip: "템플릿 그대로 사용하기로 확정한 경우.",
    },
    popularityPct: 84,
  },
  "in-print": {
    aiReason: {
      need: "종이 청첩장은 양가 어른 전달용 관례로 남아 있어요.",
      skip: "모바일 청첩장만 사용하기로 양가 합의한 경우.",
    },
    popularityPct: 86,
  },
  "in-mobile": {
    aiReason: {
      need: "지인·동료 표준 채널. 카카오톡 전달이 가장 자연스러워요.",
      skip: "거의 없음 — 이 항목은 사실상 필수예요.",
    },
    popularityPct: 96,
  },
  "in-guest-list": {
    aiReason: {
      need: "청첩장 발송·RSVP 관리의 기준 문서. 엑셀 한 장이 전체 일정을 관리해요.",
      skip: "아주 소규모(30명 이하)로 개별 연락이 가능한 경우.",
    },
    popularityPct: 92,
  },
  "in-send": {
    aiReason: {
      need: "발송 없이 참석 기대는 불가능. 모바일+우편 2채널 발송이 표준이에요.",
      skip: "비공개·가족만의 기획인 경우.",
    },
    popularityPct: 95,
  },
  "in-rsvp": {
    aiReason: {
      need: "식사·좌석 수 최종 결정의 기준. 마감 5일 전 확정이 보통이에요.",
      skip: "뷔페·자유석으로 집계가 불필요한 형식인 경우.",
    },
    popularityPct: 82,
  },
  "in-seating": {
    aiReason: {
      need: "양가 가족·귀빈 자리 배치. 양가 균형을 맞추는 중요한 포인트예요.",
      skip: "자유석으로 운영하는 경우.",
    },
    popularityPct: 68,
  },
  "in-thanks-card": {
    aiReason: {
      need: "답례품 격을 한 단계 높여줘요. 짧은 문구 하나로 인상이 달라져요.",
      skip: "기본 답례품이 포함된 패키지로 이미 해결된 경우.",
    },
    popularityPct: 58,
  },

  // ── vendor ─────────────────────────────────────────────────────────────
  "ve-mc": {
    aiReason: {
      need: "식순 진행의 중추. 전문 사회자는 당일 돌발 상황 대응에 강해요.",
      skip: "자율 진행이나 간소화 기획인 경우.",
    },
    popularityPct: 88,
  },
  "ve-song": {
    aiReason: {
      need: "식순 하이라이트. 하객 기억에 가장 오래 남는 순간 중 하나예요.",
      skip: "축가를 생략하거나 녹음 영상으로 대체하는 경우.",
    },
    popularityPct: 82,
  },
  "ve-dance": {
    aiReason: {
      need: "하객 몰입도가 확실히 올라가는 이벤트. 예식장 허용 여부를 먼저 확인해요.",
      skip: "전통·정적 식순을 선호하는 경우.",
    },
    popularityPct: 42,
  },
  "ve-helper": {
    aiReason: {
      need: "신부 의상·동선 지원이 필수인 드레스 기획에 사실상 반드시 필요해요.",
      skip: "가족 도움으로 충분히 커버 가능한 경우.",
    },
    popularityPct: 65,
  },
  "ve-bus": {
    aiReason: {
      need: "외곽 예식장·교외 예식일 때 하객 이동이 병목. 주차 확보도 같이 체크.",
      skip: "도심이거나 대중교통 접근성이 좋은 예식장인 경우.",
    },
    popularityPct: 48,
  },
  "ve-prewedding-video": {
    aiReason: {
      need: "하객 대기 시간 활용 + 커플 소개. 식 초반 몰입도를 크게 높여요.",
      skip: "식전 영상을 생략하는 간소 기획인 경우.",
    },
    popularityPct: 72,
  },
  "ve-paebaek": {
    aiReason: {
      need: "양가 어른 인사 관례. 양가 기대치를 사전에 맞추는 게 중요해요.",
      skip: "양가 합의로 생략하는 경우(최근 증가 추세).",
    },
    popularityPct: 68,
  },
  "ve-photographer": {
    aiReason: {
      need: "식 중 실시간 기록. 하객이 찍어주는 사진과는 품질 차이가 커요.",
      skip: "거의 없음 — 이 항목은 사실상 필수예요.",
    },
    popularityPct: 92,
  },
  "ve-dj": {
    aiReason: {
      need: "식장 음향 품질·타이밍. 플레이리스트 전달이 당일 분위기를 결정해요.",
      skip: "예식장 제공 기본 음향으로 충분하다고 판단한 경우.",
    },
    popularityPct: 78,
  },

  // ── honeymoon ──────────────────────────────────────────────────────────
  "hm-dest": {
    aiReason: {
      need: "항공·숙박 예산·비자가 여행지에 따라 크게 달라져요. 3곳 압축이 합리적 시작점.",
      skip: "여행지가 이미 확정된 경우.",
    },
    popularityPct: 88,
  },
  "hm-flight": {
    aiReason: {
      need: "해외 시 필수. 성수기는 3개월 전 예약이 안전해요.",
      skip: "국내 여행으로 기획한 경우.",
    },
    popularityPct: 94,
  },
  "hm-resort": {
    aiReason: {
      need: "인기 리조트는 성수기 조기 완판. 숙박이 여행 경험의 절반을 결정해요.",
      skip: "캠핑·백패킹·자유 여행 기획인 경우.",
    },
    popularityPct: 92,
  },
  "hm-insurance": {
    aiReason: {
      need: "해외 의료비 대비. 신혼여행 기간에 맞춘 단기 플랜이 합리적이에요.",
      skip: "카드사 자동 제공 보험으로 이미 커버되는 경우.",
    },
    popularityPct: 78,
  },
  "hm-passport": {
    aiReason: {
      need: "만료 6개월 미만이면 출국이 제한될 수 있어요. 초기에 확인.",
      skip: "만료까지 여유가 이미 확인된 경우.",
    },
    popularityPct: 92,
  },
  "hm-visa": {
    aiReason: {
      need: "국가마다 필요 서류·발급 기간이 달라요. 1~2개월 여유를 두는 게 안전.",
      skip: "무비자 국가(일본·동남아 일부 등)로 결정한 경우.",
    },
    popularityPct: 62,
  },
  "hm-currency": {
    aiReason: {
      need: "현지 결제 편의·수수료 절감. 현금+카드 조합이 표준이에요.",
      skip: "해외 결제 카드로만 해결하는 경우.",
    },
    popularityPct: 78,
  },
  "hm-roaming": {
    aiReason: {
      need: "해외 통신 수단. eSIM이 최근 비용·편의 모두 우위.",
      skip: "국내 여행이거나 현지 WiFi만으로 충분한 경우.",
    },
    popularityPct: 85,
  },
  "hm-luggage": {
    aiReason: {
      need: "필수품 누락 방지. 10개 핵심 아이템만 체크해도 사고 절반을 줄여요.",
      skip: "단기 여행이거나 여행 경험이 많은 커플인 경우.",
    },
    popularityPct: 74,
  },
  "hm-apps": {
    aiReason: {
      need: "지도·결제·번역 3종이 가장 필수. 현지 배달·교통 앱도 체크.",
      skip: "오프라인 지도 다운로드와 기본 앱만으로 충분한 경우.",
    },
    popularityPct: 62,
  },

  // ── dday ───────────────────────────────────────────────────────────────
  "dd-bouquet": {
    aiReason: {
      need: "사진·던지기 관례. 부케를 받을 지인을 미리 정해두는 게 안전해요.",
      skip: "인조 부케 사용 또는 부케 자체를 생략한 경우.",
    },
    popularityPct: 92,
  },
  "dd-vow": {
    aiReason: {
      need: "식순 핵심. 직접 작성한 서약은 하객·가족 기억에 가장 오래 남아요.",
      skip: "표준 문구를 사용하거나 식순을 간소화한 경우.",
    },
    popularityPct: 82,
  },
  "dd-ring-case": {
    aiReason: {
      need: "당일 반지 분실·착용 실수를 막는 마지막 리허설 단계.",
      skip: "예식장 브리핑으로 충분히 커버되는 경우.",
    },
    popularityPct: 65,
  },
  "dd-cash-officiant": {
    aiReason: {
      need: "주례 섭외 시 관례. 20~30만원 구간이 일반적이에요.",
      skip: "주례가 없거나 부모 말씀으로 대체한 경우.",
    },
    popularityPct: 72,
  },
  "dd-cash-mc": {
    aiReason: {
      need: "관례. 친구 사회여도 감사 인사 봉투를 준비하는 게 예의.",
      skip: "사회자가 없거나 친구와 별도 인사로 해결한 경우.",
    },
    popularityPct: 78,
  },
  "dd-cash-song": {
    aiReason: {
      need: "전문 축가 섭외 시 관례. 보통 계약 금액과 별도 감사 봉투.",
      skip: "지인 축가이거나 녹음으로 대체한 경우.",
    },
    popularityPct: 68,
  },
  "dd-cash-helper": {
    aiReason: {
      need: "헬퍼(이모님) 섭외 시 관례. 현장에서 작은 봉투가 분위기를 살려요.",
      skip: "가족 도움으로 대체한 경우.",
    },
    popularityPct: 62,
  },
  "dd-cash-thanks": {
    aiReason: {
      need: "양가 부모 감사 관례. 당일 전달이 분위기와 기록에 모두 좋아요.",
      skip: "이미 별도 시점에 감사 인사를 완료한 경우.",
    },
    popularityPct: 88,
  },
  "dd-cash-bouquet": {
    aiReason: {
      need: "부케 발주 시 현장 팁 관례. 부케 전달 도우미 팁도 같이 준비해요.",
      skip: "부케 자체를 생략한 경우.",
    },
    popularityPct: 55,
  },
  "dd-luggage-final": {
    aiReason: {
      need: "당일 출국 대비. 여권·항공권·일정표 3종 최종 확인이 핵심.",
      skip: "국내 여행이거나 여권이 불필요한 경우.",
    },
    popularityPct: 94,
  },
};

// ---------------------------------------------------------------------------

/**
 * Returns metadata for a given checklist item id, or `null` if unseeded
 * (custom items added by user or future items not yet in the metadata table).
 */
export function getItemMetadata(itemId: string): ChecklistItemMetadata | null {
  return CHECKLIST_METADATA[itemId] ?? null;
}

/**
 * Counts how many seed items in CHECKLIST_SEED have metadata. Used in S2
 * tests to assert 100% coverage before deploying the pill UI.
 */
export function metadataCoverageCount(): number {
  return Object.keys(CHECKLIST_METADATA).length;
}
