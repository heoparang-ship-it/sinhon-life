/**
 * 초기 데이터 시딩 스크립트
 * constants.ts의 POLICIES 데이터를 Pinecone integrated index에 upsert합니다.
 *
 * 사용법: npx tsx scripts/seed-initial.ts
 * 필요 환경변수: PINECONE_API_KEY (.env.local에 설정)
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { Pinecone } from "@pinecone-database/pinecone";

const INDEX_NAME = "sinhon-policies";
const CHUNK_SIZE = 500; // 글자 단위

// constants.ts의 POLICIES 데이터를 인라인으로 가져옴 (tsx에서 path alias 미지원)
const POLICIES = [
  {
    slug: "newlywed-special-supply",
    title: "새 아파트, 신혼부부가 먼저 받는 법",
    category: "housing",
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
  },
  {
    slug: "newborn-special-supply",
    title: "소득 상관없이 새 아파트? 신생아 특공의 비밀",
    category: "housing",
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
  },
  {
    slug: "happy-housing",
    title: "월세 반값? 행복주택으로 똑똑하게 사는 법",
    category: "housing",
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
  },
  {
    slug: "jeonse-loan-guide",
    title: "이자 1%대? 신혼부부 전세대출 꿀비교",
    category: "finance",
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
  },
  {
    slug: "birth-benefits-2026",
    title: "아이 낳으면 총 얼마 받을 수 있을까?",
    category: "baby",
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
  },
  {
    slug: "tax-reduction-newlywed",
    title: "결혼하고 세금 200만원 돌려받는 법",
    category: "tax",
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
  },
];

// 시스템 프롬프트에 있던 추가 정책 지식 (constants.ts에서 추출)
const EXTRA_KNOWLEDGE = [
  {
    slug: "system-prompt-newlywed-special",
    title: "신혼부부 특별공급 자격 요약",
    category: "housing",
    content:
      "신혼부부 특별공급: 혼인 7년 이내, 무주택, 85㎡ 이하. 맞벌이 소득기준: 도시근로자 월평균 160% (약 연 1.6억). 출산가구 특공 2회 허용.",
    tags: ["신혼특공", "자격요건"],
  },
  {
    slug: "system-prompt-newborn-special",
    title: "신생아 특공 요약",
    category: "housing",
    content:
      "신생아 특공: 출생 2년 이내 자녀, 100% 추첨. 소득 무관.",
    tags: ["신생아특공", "추첨"],
  },
  {
    slug: "system-prompt-loans",
    title: "신혼부부 대출 금리 요약",
    category: "finance",
    content:
      "버팀목 전세대출: 연 1.5~2.1%, 최대 3억. 신생아 특례 대출: 금리 1.1%~, 최대 3억 (전세) / 5억 (매매). 디딤돌 대출: 연 2.15~3.0%, 매매용.",
    tags: ["전세대출", "금리"],
  },
  {
    slug: "system-prompt-birth-benefits",
    title: "출산 혜택 요약",
    category: "baby",
    content:
      "첫만남이용권: 200만원 바우처. 부모급여: 만0세 월100만, 만1세 월50만. 인천 출산장려금: 첫째 30만, 둘째 50만, 셋째 100만+.",
    tags: ["출산지원금", "부모급여"],
  },
  {
    slug: "system-prompt-tax-housing",
    title: "세금 및 주거 혜택 요약",
    category: "tax",
    content:
      "취득세 감면: 생애최초 주택 최대 200만원. 행복주택: 시세 60~80%, 최대 6~10년 거주.",
    tags: ["취득세", "행복주택"],
  },
];

function chunkText(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let current = "";

  for (const para of paragraphs) {
    if (current.length + para.length + 2 > maxLen && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

interface Record {
  _id: string;
  chunk_text: string;
  title: string;
  category: string;
  tags: string;
  source: string;
}

async function main() {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    console.error("PINECONE_API_KEY가 .env.local에 설정되어 있지 않습니다.");
    process.exit(1);
  }

  const pc = new Pinecone({ apiKey });
  const index = pc.index(INDEX_NAME);

  const allPolicies = [...POLICIES, ...EXTRA_KNOWLEDGE];
  const records: Record[] = [];

  for (const policy of allPolicies) {
    const chunks = chunkText(policy.content, CHUNK_SIZE);
    for (let i = 0; i < chunks.length; i++) {
      records.push({
        _id: `${policy.slug}_chunk_${i}`,
        chunk_text: chunks[i],
        title: policy.title,
        category: policy.category,
        tags: policy.tags.join(", "),
        source: "initial-seed",
      });
    }
  }

  console.log(`총 ${records.length}개 레코드를 Pinecone에 업서트합니다...`);

  // 10개씩 배치 업서트
  const BATCH_SIZE = 10;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await index.upsertRecords({ records: batch });
    console.log(`  업서트 완료: ${Math.min(i + BATCH_SIZE, records.length)}/${records.length}`);
  }

  console.log("초기 데이터 시딩 완료!");
}

main().catch((err) => {
  console.error("시딩 실패:", err);
  process.exit(1);
});
