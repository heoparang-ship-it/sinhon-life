import type { MegaCategoryId, Vendor, HubCategory } from "./types";

export const BRAND = {
  name: "신혼생활",
  tagline: "결혼하면 꼭 챙겨야 할 돈, AI가 찾아줄게요",
  domain: "sinhon.life",
  kakaoLink: "https://open.kakao.com/o/p10syHoi",
  instagram: "https://instagram.com/sinhon.life",
} as const;

export const MEGA_CATEGORIES: {
  id: MegaCategoryId;
  title: string;
  description: string;
  iconName: string;
  color: "coral" | "mint" | "warm";
  policyCategories: string[];
}[] = [
  {
    id: "wedding-prep",
    title: "결혼준비",
    description: "새집·청약·전세대출",
    iconName: "Home",
    color: "coral",
    policyCategories: ["housing"],
  },
  {
    id: "newlywed-life",
    title: "신혼생활",
    description: "세금·대출·재테크",
    iconName: "Wallet",
    color: "mint",
    policyCategories: ["finance", "tax"],
  },
  {
    id: "gov-support",
    title: "정책지원",
    description: "출산·육아·지원금",
    iconName: "Heart",
    color: "coral",
    policyCategories: ["baby"],
  },
];

export const CATEGORIES = [
  { id: "housing", title: "새집 마련", color: "coral" as const },
  { id: "finance", title: "싸게 빌리기", color: "mint" as const },
  { id: "baby", title: "출산 머니", color: "coral" as const },
  { id: "tax", title: "세금 아끼기", color: "mint" as const },
] as const;

// 2026.04 개편: 홈 & 탐색 탭의 진짜 목적지. /category/[id] 허브 페이지로 연결.
export const HUB_CATEGORIES: HubCategory[] = [
  {
    id: "wedding",
    title: "예식준비",
    subtitle: "웨딩홀·스드메·혼수",
    emoji: "💒",
    color: "coral",
    policyCategories: ["housing"], // 임시: 직접 콘텐츠가 적음 → 관련 꿀정보로 채움
    description: "웨딩홀 고르는 법, 스드메 견적, 하객 관리까지 결혼식 전에 꼭 챙겨야 할 정보.",
  },
  {
    id: "home",
    title: "신혼집",
    subtitle: "청약·전세·월세",
    emoji: "🏠",
    color: "coral",
    policyCategories: ["housing"],
    description: "새 아파트 특공, 전세대출, 행복주택 — 신혼집 마련에 관한 모든 것.",
  },
  {
    id: "money",
    title: "재테크",
    subtitle: "세금·대출·투자",
    emoji: "💰",
    color: "mint",
    policyCategories: ["finance", "tax"],
    description: "연말정산·취득세·부부 증여까지, 아는 만큼 절약하는 신혼 머니 가이드.",
  },
  {
    id: "parenting",
    title: "출산육아",
    subtitle: "출산지원금·부모급여",
    emoji: "👶",
    color: "coral",
    policyCategories: ["baby"],
    description: "첫만남이용권 200만원부터 매달 부모급여까지, 아이가 생기면 챙길 혜택.",
  },
  {
    id: "honeymoon",
    title: "신혼여행",
    subtitle: "가성비·럭셔리·이색",
    emoji: "✈️",
    color: "mint",
    policyCategories: ["finance"], // 준비중
    description: "예산별 신혼여행지, 현지 팁, 여행자보험까지 — 콘텐츠 확장 준비 중.",
  },
  {
    id: "policy",
    title: "혜택정책",
    subtitle: "지원금·바우처·세액공제",
    emoji: "🎁",
    color: "mint",
    policyCategories: ["baby", "tax", "finance", "housing"],
    description: "2026년 기준 신혼부부가 받을 수 있는 전 부처·지자체 지원금 총정리.",
  },
];

export const QUICK_QUESTIONS = [
  "우리 부부 새 아파트 당첨 가능해요?",
  "전세대출 이자 제일 싼 거 뭐예요?",
  "아이 낳으면 돈 얼마나 받아요?",
  "맞벌이인데 뭐 신청할 수 있어요?",
] as const;

export interface Policy {
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  tags: string[];
  updatedAt: string;
  highlight?: string;
}

export const POLICIES: Policy[] = [
  // ── 주거 (housing) ──
  {
    slug: "newlywed-special-supply",
    title: "새 아파트, 신혼부부가 먼저 받는 법",
    category: "housing",
    summary: "결혼 7년 안에 신청하면 새 아파트 우선 배정! 자격 확인하고 바로 준비하세요",
    highlight: "우선배정",
    content: `새 아파트, 신혼부부가 먼저 받을 수 있어요

결혼한 지 7년 안 되셨으면 새 아파트를 먼저 받을 수 있는 기회가 있어요. 85㎡ 이하 아파트가 대상이에요.

누가 신청할 수 있나요?

결혼한 지 7년 이내 (혼인신고일 기준)
우리 가족 중 아무도 집이 없어야 해요
소득기준: 맞벌이는 연 1.6억 이하면 OK
생각보다 기준이 널널해요!

당첨되려면 어떻게 해야 유리해요?

소득이 낮을수록, 가족이 많을수록, 그 동네 오래 살수록 유리해요.
아이가 3명 이상이면 추첨 없이 바로 배정돼요.

어디서 신청해요?

청약홈(applyhome.co.kr)에서 청약통장 확인하고, 공고가 나오면 바로 신청하세요!

놓치면 안 되는 꿀팁

올해부터 출산하면 2번까지 특공 기회가 생겨요! 첫째, 둘째 각각 한 번씩이요.
아이가 있으면 소득 상관없이 100% 추첨인 '신생아 특공'도 있어요.`,
    tags: ["새아파트", "신혼특공", "당첨전략"],
    updatedAt: "2026-04-01",
  },
  {
    slug: "newborn-special-supply",
    title: "소득 상관없이 새 아파트? 신생아 특공의 비밀",
    category: "housing",
    summary: "아이가 있으면 소득 무관 100% 추첨! 고소득 맞벌이도 OK인 특공",
    highlight: "100% 추첨",
    content: `신생아 특공 — 소득 상관없이 새 아파트 기회!

2024년부터 시작된 제도인데, 아이만 낳으면 소득 무관하게 새 아파트 추첨에 참여할 수 있어요.

누가 신청할 수 있어요?

2년 안에 아이를 낳은 가구 (공고일 기준)
결혼 안 했어도 돼요 (미혼 출산 가능)
집 없는 가구
연봉 상관없어요 — 맞벌이 고소득도 OK!

얼마나 나와요?

공공분양: 전체의 20%
민간분양: 전체의 5%
공공임대: 전체의 15%

이거 꼭 기억하세요

아이 낳을 때마다 1회씩, 최대 2번 특공 기회!
쌍둥이는 1회로 카운트돼요
임신 중이면 출산 후 신청 가능해요
입양도 포함!

타이밍이 중요해요

공고일 기준 2년 이내 출산이 핵심이에요.
출산 예정이라면 청약 공고 일정 미리미리 체크하세요!`,
    tags: ["신생아특공", "100%추첨", "고소득OK"],
    updatedAt: "2026-04-02",
  },
  {
    slug: "happy-housing",
    title: "월세 반값? 행복주택으로 똑똑하게 사는 법",
    category: "housing",
    summary: "시세의 60~80%에 최대 10년 거주! 신혼부부를 위한 공공임대 총정리",
    highlight: "시세 60%~",
    content: `행복주택 — 월세 반값으로 살 수 있어요

신혼부부를 위한 공공임대예요. 주변 시세의 60~80%로 살 수 있고, 아이 있으면 최대 10년까지!

누가 들어갈 수 있어요?

결혼한 지 7년 이내
부부합산 소득 월평균 100% 이하
지금 집이 없어야 해요

얼마나 저렴해요?

주변 월세 80만원짜리면 → 48~64만원 정도
보증금도 일반 전세보다 훨씬 낮아요
체감 절약이 엄청 커요!

얼마나 오래 살 수 있어요?

기본 6년
아이가 있으면 10년까지 연장 가능
출산하면 자동 연장!

어디서 신청해요?

LH 청약센터(apply.lh.or.kr)에서 온라인 신청
공고 나올 때마다 신청해야 해요
서울, 경기 물량이 제일 많아요`,
    tags: ["행복주택", "월세절약", "반값임대"],
    updatedAt: "2026-04-03",
  },
  // ── 금융 (finance) ──
  {
    slug: "jeonse-loan-guide",
    title: "이자 1%대? 신혼부부 전세대출 꿀비교",
    category: "finance",
    summary: "같은 전세대출인데 금리가 이렇게 다르다고? 내 상황에 딱 맞는 대출 찾기",
    highlight: "연 1.1%~",
    content: `전세대출, 어디서 빌려야 이자가 제일 적을까?

신혼부부가 받을 수 있는 전세대출은 크게 3가지예요. 상황에 따라 금리 차이가 꽤 나요!

1. 버팀목 전세대출

이자: 연 1.5% ~ 2.1%
최대: 3억까지
부부합산 연봉 7,500만원 이하면 신청 가능해요.

2. 신생아 특례 전세대출 (제일 싸요!)

이자: 연 1.1% ~ 3.0%
최대: 3억까지
아이가 태어난 지 2년 안이면 이게 최고예요!

3. 디딤돌 대출 (내 집 살 때)

이자: 연 2.15% ~ 3.0%
최대: 5억까지 (신생아 특례 적용 시)
전세 말고 매매할 때 쓰는 거예요.

그래서 뭘 골라야 돼요?

전세로 살 거라면 → 버팀목 or 신생아 특례
아이 있으면 → 신생아 특례가 압도적으로 싸요
내 집 사려면 → 디딤돌 + 신생아 특례 조합이 최선`,
    tags: ["전세대출", "금리비교", "이자절약"],
    updatedAt: "2026-04-01",
  },
  // ── 출산 (baby) ──
  {
    slug: "birth-benefits-2026",
    title: "아이 낳으면 총 얼마 받을 수 있을까?",
    category: "baby",
    summary: "첫만남이용권 200만원 + 부모급여 월 100만원 + 지자체 지원금까지 총정리",
    highlight: "200만원+",
    content: `출산하면 받을 수 있는 돈, 다 모아봤어요

2026년 기준, 아이 한 명 낳으면 생각보다 많이 받을 수 있어요!

첫만남이용권 — 200만원

아이 태어나면 바로 200만원 바우처가 나와요.
국민행복카드로 받아서 아기용품, 병원비 등에 쓸 수 있어요.
출생신고하면서 주민센터에서 같이 신청하면 돼요.

부모급여 — 매달 꼬박꼬박

만 0세: 매달 100만원
만 1세: 매달 50만원
어린이집 다니면 보육료 제외한 차액이 현금으로 나와요.

우리 동네 출산축하금 (인천 기준)

첫째: 30만원 / 둘째: 50만원 / 셋째+: 100만원 이상
서울은 첫째에 100만원 주는 구도 있어요!
지역마다 달라서 우리 동네 기준 꼭 확인하세요.

이것도 챙기세요

아이돌봄서비스: 정부가 돌봄 도우미를 보내줘요
영아수당: 만 0~1세 월 30만원 별도 지급
산후조리원 바우처: 일부 지자체에서 지원`,
    tags: ["출산지원금", "부모급여", "얼마받나"],
    updatedAt: "2026-04-02",
  },
  // ── 세금 (tax) ──
  {
    slug: "tax-reduction-newlywed",
    title: "결혼하고 세금 200만원 돌려받는 법",
    category: "tax",
    summary: "집 살 때 취득세 200만원 깎고, 연말정산에서 월세 17% 돌려받는 꿀팁",
    highlight: "최대 200만원",
    content: `신혼부부가 몰라서 못 받는 세금 혜택

집 살 때, 월급 받을 때 세금을 꽤 줄일 수 있어요. 모르면 그냥 내는 돈이에요!

첫 집 살 때 취득세 깎아줘요

생애 처음 집 사면 취득세 최대 200만원 감면!
12억원 이하 집이 대상이에요.
부부 중 한 명도 집을 가진 적 없어야 해요.

연말정산 이렇게 하면 더 돌려받아요

맞벌이라면 소득 높은 쪽에 공제 몰아주세요
청약 넣는 돈 → 연 300만원까지 소득공제
월세 살고 있다면 → 월세의 17%를 돌려받아요 (총급여 7천만원 이하)

부모님한테 돈 받을 때

배우자끼리: 10년간 6억까지 세금 없음
부모님에게: 10년간 5천만원까지 세금 없음
축의금은 당연히 비과세예요!

전세·매매 대출 이자도 공제돼요

전세대출 이자: 연 400만원까지
주택담보대출 이자: 연 300~1,800만원까지 (상환기간에 따라)`,
    tags: ["세금환급", "연말정산", "취득세감면"],
    updatedAt: "2026-04-01",
  },
];

/** 레거시 시스템 프롬프트 — UI에서 빠른 질문 등에 참고용으로 유지 */
export const CHATBOT_SYSTEM_PROMPT = `당신은 "신혼생활" AI 정책 상담사예요. 신혼부부 정책, 지원금, 청약, 대출, 출산 혜택만 안내해요.`;

/** RAG 기반 동적 시스템 프롬프트 템플릿 — {CONTEXT}에 Pinecone 검색 결과가 주입됩니다 */
export const RAG_SYSTEM_PROMPT_TEMPLATE = `당신은 "신혼생활" AI 정책 상담사예요. 신혼부부 정책, 지원금, 청약, 대출, 출산 혜택만 안내해요.

절대 규칙:
1. 마크다운 서식 절대 금지. **, ##, -, *, 번호목록 등 서식기호 쓰지 마세요.
2. 카톡 대화하듯 짧게 나눠서 답하세요. 한 덩어리는 2~3줄 이내.
3. 여러 정보가 있으면 빈 줄 두 번(줄바꿈)으로 나눠주세요.
4. 당신은 오직 "신혼생활 AI 상담사"입니다. 절대로 Claude, Anthropic, GPT, AI 모델명, 기술 정보를 언급하지 마세요.
5. "어떤 모델이야?", "누가 만들었어?", "AI야?" 같은 질문에는 "저는 신혼생활 정책 상담사예요! 신혼부부 정책이나 혜택 관련해서 궁금한 거 물어봐주세요"라고만 답하세요.
6. 신혼부부 정책/혜택/생활과 관련 없는 질문에는 "저는 신혼부부 정책 전문 상담사라서 그 부분은 도움드리기 어려워요. 대신 청약, 대출, 출산 지원금 등은 편하게 물어봐주세요!"라고 답하세요.
7. 정치, 종교, 논란 주제에는 절대 답하지 마세요.
8. "~해요" 체로 친근하게. 친구한테 설명하듯이.
9. 이모지는 덩어리 시작에 1개 정도만.
10. 금액, 기간 등 수치는 정확하게 (2026년 기준).
11. 반드시 아래 참고 자료를 기반으로 답변하세요. 참고 자료에 없는 내용은 "정확한 정보 확인이 어려워서, 관련 기관에 직접 문의해보시는 게 좋겠어요"라고 솔직히 답하세요.

=== 참고 자료 ===
{CONTEXT}
=== 참고 자료 끝 ===`;

export const VENDOR_CATEGORIES = [
  { id: "wedding-hall" as const, label: "웨딩홀", emoji: "🏛️" },
  { id: "dress" as const, label: "드레스", emoji: "👗" },
];

export const VENDORS: Vendor[] = [
  {
    slug: "grace-wedding-hall",
    name: "그레이스 웨딩홀",
    category: "wedding-hall",
    categoryLabel: "웨딩홀",
    location: "서울 강남구",
    priceRange: "300~500만원",
    rating: 4.8,
    reviewCount: 124,
    tags: ["소규모웨딩", "가든식", "뷔페포함"],
    description: "강남 한복판, 자연광이 쏟아지는 프라이빗 웨딩 공간. 50~150명 규모의 소규모 웨딩에 최적화되어 있어요. 전문 웨딩 플래너가 상주하며, 맞춤 패키지도 가능합니다.",
    highlights: [
      "자연광 채플 + 가든 테라스 동시 사용",
      "50~150명 맞춤 소규모 웨딩",
      "뷔페·플라워·사회자 올인원 패키지",
      "주차 100대 무료",
    ],
    contactUrl: "https://open.kakao.com/o/p10syHoi",
  },
  {
    slug: "bella-dress",
    name: "벨라 드레스",
    category: "dress",
    categoryLabel: "드레스",
    location: "서울 청담동",
    priceRange: "80~200만원",
    rating: 4.7,
    reviewCount: 67,
    tags: ["수입드레스", "맞춤수선", "피팅무제한"],
    description: "유럽 수입 드레스부터 국내 디자이너 드레스까지, 200벌 이상 보유. 전문 피팅사가 체형에 맞게 수선해드리며, 계약 후 피팅 횟수 제한이 없어요.",
    highlights: [
      "수입·국내 드레스 200벌+ 보유",
      "계약 후 피팅 무제한",
      "속드레스·베일·글러브 무료 대여",
      "신랑 턱시도 패키지 할인",
    ],
    contactUrl: "https://open.kakao.com/o/p10syHoi",
  },
];
