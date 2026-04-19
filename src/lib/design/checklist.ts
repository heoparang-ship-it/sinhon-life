export type Assignee = "함께" | "신랑" | "신부";

export interface ChecklistItem {
  id: string;
  name: string;
  who: Assignee;
  offsetDays?: number; // negative = past, 0 = today, positive = future
  defaultDone?: boolean;
  custom?: boolean; // true when user-added via addCustomItem
}

export interface ChecklistGroup {
  id: string;
  icon: string;
  title: string;
  when: string;
  items: ChecklistItem[];
}

// V3.1 seed — 9 groups, ~95 items covering the full Korean wedding prep cycle.
// Sourced from ohprint.me/gongysd/mha.co.kr etc. practitioner checklists plus
// the Korean ceremony cash-envelope custom (주례/사회/축가/이모님). `who` defaults
// follow Korean custom but every item is reassignable by tap in the UI.
export const CHECKLIST_SEED: ChecklistGroup[] = [
  {
    id: "ceremony-prep",
    icon: "💍",
    title: "예식 준비",
    when: "D-180 ~ D-120",
    items: [
      { id: "cp-budget", name: "총 예산 수립 + 분담 비율 합의", who: "함께", offsetDays: -180 },
      { id: "cp-sanggyunre", name: "상견례 일정·장소 확정", who: "함께", offsetDays: -175 },
      { id: "cp-venue-tour", name: "예식장 6곳 투어 + 견적 비교", who: "함께", offsetDays: -170 },
      { id: "cp-venue-contract", name: "예식장 계약·계약금 납부", who: "함께", offsetDays: -160 },
      { id: "cp-guest-count", name: "하객 규모 1차 추정", who: "함께", offsetDays: -155 },
      { id: "cp-meal", name: "피로연 메뉴·주류 선택", who: "함께", offsetDays: -140 },
      { id: "cp-officiant", name: "주례 섭외 or 부모 말씀 확정", who: "함께", offsetDays: -130 },
      { id: "cp-groom-suit", name: "신랑 양복 3곳 비교·예약", who: "신랑", offsetDays: -125 },
      { id: "cp-bride-hanbok", name: "신부 한복 대여·제작 결정", who: "신부", offsetDays: -120 },
      { id: "cp-flower", name: "예식장 꽃장식 옵션 확정", who: "함께", offsetDays: -115 },
      { id: "cp-rehearsal", name: "리허설 동선 체크", who: "함께", offsetDays: -10 },
      { id: "cp-thankyou-gift", name: "하객 답례품 주문", who: "함께", offsetDays: -30 },
    ],
  },
  {
    id: "sdm",
    icon: "👰",
    title: "스드메 (스튜디오·드레스·메이크업)",
    when: "D-180 ~ D-60",
    items: [
      { id: "sdm-package", name: "스드메 패키지 vs 개별 비교", who: "함께", offsetDays: -175 },
      { id: "sdm-dress-tour", name: "드레스샵 5곳 투어", who: "신부", offsetDays: -165 },
      { id: "sdm-dress-contract", name: "본식 드레스·리허설 드레스 계약", who: "신부", offsetDays: -150 },
      { id: "sdm-studio-contract", name: "스튜디오 촬영 스튜디오 계약", who: "함께", offsetDays: -150 },
      { id: "sdm-studio-shoot", name: "스튜디오 촬영 본 촬영", who: "함께", offsetDays: -120 },
      { id: "sdm-album", name: "스튜디오 앨범 셀렉·제작", who: "함께", offsetDays: -90 },
      { id: "sdm-makeup-sample", name: "본식 메이크업·헤어 샘플링", who: "신부", offsetDays: -90 },
      { id: "sdm-makeup-contract", name: "본식 메이크업 샵 계약", who: "신부", offsetDays: -75 },
      { id: "sdm-main-shoot", name: "본식 촬영·영상 업체 계약", who: "함께", offsetDays: -60 },
      { id: "sdm-bride-fitting", name: "본식 드레스 최종 피팅", who: "신부", offsetDays: -14 },
    ],
  },
  {
    id: "gift",
    icon: "💎",
    title: "예물·예단",
    when: "D-150 ~ D-60",
    items: [
      { id: "gift-ring-pt1", name: "결혼반지(커플링) 결정", who: "함께", offsetDays: -120 },
      { id: "gift-ring-pt2", name: "예물 반지·추가 장신구 협의", who: "함께", offsetDays: -110 },
      { id: "gift-groom-gift", name: "신부 예물 (시계·반지 등) 준비", who: "신랑", offsetDays: -100 },
      { id: "gift-bride-yedan", name: "예단 리스트 확정 (현물/현금 비율)", who: "신부", offsetDays: -90 },
      { id: "gift-yedan-send", name: "예단 발송·전달", who: "신부", offsetDays: -45 },
      { id: "gift-ibaji", name: "이바지 음식 업체 선정", who: "신부", offsetDays: -60 },
      { id: "gift-hanbok-couple", name: "혼주 한복 결정", who: "함께", offsetDays: -80 },
      { id: "gift-gift-gold", name: "금반지·돌반지 등 답례 장신구", who: "함께", offsetDays: -45 },
      { id: "gift-honja", name: "혼주 예물 (양가 어른 선물)", who: "함께", offsetDays: -40 },
      { id: "gift-policy", name: "예물 분실·보험 확인", who: "함께", offsetDays: -30 },
    ],
  },
  {
    id: "appliance",
    icon: "🛋️",
    title: "혼수·가전·가구",
    when: "D-120 ~ D-30",
    items: [
      { id: "ap-fridge", name: "냉장고 (김치냉장고 포함)", who: "함께", offsetDays: -100 },
      { id: "ap-washer", name: "세탁기 + 건조기", who: "함께", offsetDays: -100 },
      { id: "ap-tv", name: "TV + 사운드바", who: "함께", offsetDays: -95 },
      { id: "ap-air", name: "에어컨 (거실·안방)", who: "함께", offsetDays: -90 },
      { id: "ap-vacuum", name: "무선청소기 + 로봇청소기", who: "함께", offsetDays: -80 },
      { id: "ap-induction", name: "인덕션·전자레인지", who: "함께", offsetDays: -80 },
      { id: "ap-dishwasher", name: "식기세척기", who: "함께", offsetDays: -75 },
      { id: "ap-bed", name: "침대 프레임 + 매트리스", who: "함께", offsetDays: -70 },
      { id: "ap-sofa", name: "소파 (2~3인용)", who: "함께", offsetDays: -65 },
      { id: "ap-dining", name: "식탁·식탁의자", who: "함께", offsetDays: -60 },
      { id: "ap-bedding", name: "침구 세트 (봄/가을용 2세트)", who: "신부", offsetDays: -50 },
      { id: "ap-curtain", name: "커튼·블라인드 (방별)", who: "신부", offsetDays: -45 },
      { id: "ap-rug", name: "거실 러그", who: "함께", offsetDays: -40 },
      { id: "ap-kitchen", name: "식기·수저·주방소품 세트", who: "신부", offsetDays: -35 },
      { id: "ap-delivery", name: "가전·가구 배송일 조율", who: "함께", offsetDays: -25 },
    ],
  },
  {
    id: "house",
    icon: "🏠",
    title: "신혼집 준비",
    when: "D-120 ~ D-15",
    items: [
      { id: "ho-contract", name: "임대 계약 or 자가 잔금 납부", who: "함께", offsetDays: -115 },
      { id: "ho-interior", name: "인테리어 시공 업체 견적 3곳", who: "함께", offsetDays: -100 },
      { id: "ho-moving-quote", name: "이사 업체 견적 3곳 비교", who: "신랑", offsetDays: -60 },
      { id: "ho-moving-book", name: "이사 업체 예약 (날짜 확정)", who: "신랑", offsetDays: -45 },
      { id: "ho-clean", name: "입주 청소 예약", who: "신랑", offsetDays: -30 },
      { id: "ho-gas", name: "도시가스 전출·전입 신고", who: "신랑", offsetDays: -20 },
      { id: "ho-water", name: "수도·전기 전출·전입 처리", who: "신랑", offsetDays: -20 },
      { id: "ho-internet", name: "인터넷·TV 신규 설치 예약", who: "신랑", offsetDays: -20 },
      { id: "ho-doorlock", name: "도어락 교체·비밀번호 설정", who: "신랑", offsetDays: -10 },
      { id: "ho-report", name: "관리사무소 입주 신고", who: "함께", offsetDays: -5 },
      { id: "ho-marriage-reg", name: "혼인신고 (혼인신고서 + 증인 2)", who: "함께", offsetDays: 14 },
      { id: "ho-household", name: "세대주·세대원 변경 신고", who: "함께", offsetDays: 21 },
    ],
  },
  {
    id: "invitation",
    icon: "📮",
    title: "청첩장·인쇄",
    when: "D-80 ~ D-30",
    items: [
      { id: "in-design", name: "청첩장 디자인 시안 3개 확정", who: "함께", offsetDays: -75 },
      { id: "in-print", name: "청첩장 인쇄 주문", who: "함께", offsetDays: -60 },
      { id: "in-mobile", name: "모바일 청첩장 제작", who: "함께", offsetDays: -55 },
      { id: "in-guest-list", name: "하객 연락처 Excel 정리 (양가)", who: "함께", offsetDays: -50 },
      { id: "in-send", name: "청첩장 발송 (우편/직접)", who: "함께", offsetDays: -40 },
      { id: "in-rsvp", name: "참석 여부 RSVP 집계", who: "함께", offsetDays: -20 },
      { id: "in-seating", name: "하객 좌석 배치안", who: "함께", offsetDays: -10 },
      { id: "in-thanks-card", name: "감사 카드·답례품 라벨 준비", who: "신부", offsetDays: -7 },
    ],
  },
  {
    id: "vendor",
    icon: "🎤",
    title: "당일 섭외·용역",
    when: "D-100 ~ D-30",
    items: [
      { id: "ve-mc", name: "사회자 섭외 (친구 or 전문)", who: "함께", offsetDays: -90 },
      { id: "ve-song", name: "축가 섭외 (지인/전문 가수)", who: "함께", offsetDays: -80 },
      { id: "ve-dance", name: "축무·이벤트 섭외 (옵션)", who: "함께", offsetDays: -60 },
      { id: "ve-helper", name: "헬퍼(이모님) 섭외", who: "신부", offsetDays: -45 },
      { id: "ve-bus", name: "하객 버스·주차 예약", who: "신랑", offsetDays: -40 },
      { id: "ve-prewedding-video", name: "식전 영상 제작 의뢰", who: "함께", offsetDays: -40 },
      { id: "ve-paebaek", name: "폐백 담당·폐백실 조율", who: "함께", offsetDays: -30 },
      { id: "ve-photographer", name: "본식 스냅 사진기사 확인", who: "함께", offsetDays: -20 },
      { id: "ve-dj", name: "음향 담당·플레이리스트 전달", who: "함께", offsetDays: -14 },
    ],
  },
  {
    id: "honeymoon",
    icon: "✈️",
    title: "신혼여행",
    when: "D-100 ~ D-20",
    items: [
      { id: "hm-dest", name: "여행지 후보 3곳 압축", who: "함께", offsetDays: -100 },
      { id: "hm-flight", name: "항공권 예약", who: "신랑", offsetDays: -80 },
      { id: "hm-resort", name: "숙박·리조트 예약", who: "신부", offsetDays: -70 },
      { id: "hm-insurance", name: "여행자보험 가입", who: "신랑", offsetDays: -30 },
      { id: "hm-passport", name: "여권 유효기간 6개월+ 확인", who: "함께", offsetDays: -90 },
      { id: "hm-visa", name: "비자 필요 여부·신청", who: "함께", offsetDays: -60 },
      { id: "hm-currency", name: "환전 (현지 통화 + 달러)", who: "신랑", offsetDays: -14 },
      { id: "hm-roaming", name: "로밍·유심·eSIM 결정", who: "신랑", offsetDays: -10 },
      { id: "hm-luggage", name: "캐리어·여행 짐 체크리스트", who: "함께", offsetDays: -7 },
      { id: "hm-apps", name: "현지 앱 설치(지도·결제·번역)", who: "함께", offsetDays: -3 },
    ],
  },
  {
    id: "dday",
    icon: "🎊",
    title: "본식 D-30 ~ 당일",
    when: "D-30 ~ D-day",
    items: [
      { id: "dd-bouquet", name: "부케 발주 (+ 던지기용 1개)", who: "신부", offsetDays: -21 },
      { id: "dd-vow", name: "혼인서약서·축사 대본 작성", who: "함께", offsetDays: -14 },
      { id: "dd-ring-case", name: "반지 보관함·반지 전달 리허설", who: "함께", offsetDays: -7 },
      { id: "dd-cash-officiant", name: "현금 봉투: 주례비", who: "신랑", offsetDays: -3 },
      { id: "dd-cash-mc", name: "현금 봉투: 사회비", who: "신랑", offsetDays: -3 },
      { id: "dd-cash-song", name: "현금 봉투: 축가비", who: "신랑", offsetDays: -3 },
      { id: "dd-cash-helper", name: "현금 봉투: 헬퍼(이모님)비", who: "신부", offsetDays: -3 },
      { id: "dd-cash-thanks", name: "현금 봉투: 감사봉투 (양가 부모)", who: "함께", offsetDays: -3 },
      { id: "dd-cash-bouquet", name: "현금 봉투: 부케비·도우미 팁", who: "신부", offsetDays: -3 },
      { id: "dd-luggage-final", name: "신혼여행 짐·여권·일정표 최종", who: "함께", offsetDays: -1 },
    ],
  },
];

// --- Storage helpers --------------------------------------------------------

const DONE_KEY = "sinhon.checklist.done";
const CUSTOM_KEY = "sinhon.checklist.custom"; // Record<groupId, ChecklistItem[]>
const REMOVED_KEY = "sinhon.checklist.removed"; // string[] of itemIds
const WHO_OVERRIDE_KEY = "sinhon.checklist.whoOverride"; // Record<itemId, Assignee>

export function readDoneMap(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(DONE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeDoneMap(map: Record<string, boolean>) {
  try {
    window.localStorage.setItem(DONE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function readCustom(): Record<string, ChecklistItem[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CUSTOM_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCustom(map: Record<string, ChecklistItem[]>) {
  try {
    window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function readRemoved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(REMOVED_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeRemoved(ids: string[]) {
  try {
    window.localStorage.setItem(REMOVED_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function readWhoOverride(): Record<string, Assignee> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(WHO_OVERRIDE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeWhoOverride(map: Record<string, Assignee>) {
  try {
    window.localStorage.setItem(WHO_OVERRIDE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

// --- Public API -------------------------------------------------------------

export function formatOffset(offset?: number): string {
  if (offset === undefined) return "";
  if (offset === 0) return "오늘";
  return `${offset > 0 ? "+" : ""}${offset}`;
}

export function getMergedGroups(): ChecklistGroup[] {
  const custom = readCustom();
  const removed = new Set(readRemoved());
  const whoOverride = readWhoOverride();

  return CHECKLIST_SEED.map((group) => {
    const seedItems = group.items
      .filter((it) => !removed.has(it.id))
      .map((it) =>
        whoOverride[it.id] ? { ...it, who: whoOverride[it.id] } : it,
      );
    const customItems = (custom[group.id] || []).filter((it) => !removed.has(it.id));
    return { ...group, items: [...seedItems, ...customItems] };
  });
}

export function addCustomItem(
  groupId: string,
  item: { name: string; who: Assignee; offsetDays?: number },
): ChecklistItem {
  const custom = readCustom();
  const newItem: ChecklistItem = {
    id: `custom-${groupId}-${Date.now()}`,
    name: item.name,
    who: item.who,
    offsetDays: item.offsetDays,
    custom: true,
  };
  const list = custom[groupId] ? [...custom[groupId], newItem] : [newItem];
  writeCustom({ ...custom, [groupId]: list });
  return newItem;
}

export function removeItem(itemId: string) {
  const removed = readRemoved();
  if (!removed.includes(itemId)) {
    writeRemoved([...removed, itemId]);
  }
  // Also drop done state to avoid stale counters.
  const done = readDoneMap();
  if (done[itemId]) {
    const { [itemId]: _, ...rest } = done;
    writeDoneMap(rest);
  }
}

export function setItemWho(itemId: string, who: Assignee) {
  const map = readWhoOverride();
  writeWhoOverride({ ...map, [itemId]: who });

  // If it's a custom item, update its persisted value too.
  const custom = readCustom();
  for (const groupId of Object.keys(custom)) {
    const updated = custom[groupId].map((it) =>
      it.id === itemId ? { ...it, who } : it,
    );
    if (updated.some((it) => it.id === itemId)) {
      writeCustom({ ...custom, [groupId]: updated });
    }
  }
}

export function cycleWho(current: Assignee): Assignee {
  if (current === "함께") return "신랑";
  if (current === "신랑") return "신부";
  return "함께";
}

export function getInitialDoneMap(): Record<string, boolean> {
  const seed: Record<string, boolean> = {};
  for (const group of CHECKLIST_SEED) {
    for (const item of group.items) {
      if (item.defaultDone) seed[item.id] = true;
    }
  }
  return seed;
}

export function totalItemCount(): number {
  const merged = getMergedGroups();
  return merged.reduce((acc, g) => acc + g.items.length, 0);
}
