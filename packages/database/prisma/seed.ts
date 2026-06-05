import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl)
});

const ids = {
  article: "00000000-0000-4000-8000-000000000025",
  approval: "00000000-0000-4000-8000-000000000017",
  approval2: "00000000-0000-4000-8000-000000000043",
  compareCard: "00000000-0000-4000-8000-000000000016",
  compareCard2: "00000000-0000-4000-8000-000000000042",
  compareComment: "00000000-0000-4000-8000-000000000018",
  compareRoom: "00000000-0000-4000-8000-000000000015",
  couple: "00000000-0000-4000-8000-000000000002",
  coupleInvitation: "00000000-0000-4000-8000-000000000004",
  coupleMember: "00000000-0000-4000-8000-000000000003",
  coupleMember2: "00000000-0000-4000-8000-000000000041",
  decisionLog: "00000000-0000-4000-8000-000000000021",
  document: "00000000-0000-4000-8000-000000000022",
  eligibilityResult: "00000000-0000-4000-8000-000000000009",
  eventLog: "00000000-0000-4000-8000-000000000026",
  leadRequest: "00000000-0000-4000-8000-000000000019",
  leadStatusHistory: "00000000-0000-4000-8000-000000000020",
  notification: "00000000-0000-4000-8000-000000000024",
  offer: "00000000-0000-4000-8000-000000000012",
  offer2: "00000000-0000-4000-8000-000000000037",
  offerPriceVersion: "00000000-0000-4000-8000-000000000013",
  offerPriceVersion2: "00000000-0000-4000-8000-000000000038",
  offerPriceVersion3: "00000000-0000-4000-8000-000000000039",
  offerPriceVersion4: "00000000-0000-4000-8000-000000000040",
  policyProgram: "00000000-0000-4000-8000-000000000007",
  policyProgram2: "00000000-0000-4000-8000-000000000027",
  policyProgram3: "00000000-0000-4000-8000-000000000028",
  policyProgram4: "00000000-0000-4000-8000-000000000029",
  policyProgram5: "00000000-0000-4000-8000-000000000030",
  policyRuleVersion: "00000000-0000-4000-8000-000000000008",
  policyRuleVersion2: "00000000-0000-4000-8000-000000000031",
  policyRuleVersion3: "00000000-0000-4000-8000-000000000032",
  policyRuleVersion4: "00000000-0000-4000-8000-000000000033",
  policyRuleVersion5: "00000000-0000-4000-8000-000000000034",
  scenario: "00000000-0000-4000-8000-000000000005",
  scenarioItem: "00000000-0000-4000-8000-000000000006",
  task: "00000000-0000-4000-8000-000000000023",
  user: "00000000-0000-4000-8000-000000000001",
  user2: "00000000-0000-4000-8000-000000000044",
  vendor: "00000000-0000-4000-8000-000000000010",
  vendor2: "00000000-0000-4000-8000-000000000035",
  vendorBranch: "00000000-0000-4000-8000-000000000011",
  vendorBranch2: "00000000-0000-4000-8000-000000000036"
} as const;

const seedNow = new Date("2026-06-05T00:00:00.000Z");
const addDays = (days: number) => new Date(seedNow.getTime() + days * 24 * 60 * 60 * 1000);

const samplePolicies = [
  {
    category: "housing",
    criteria: {
      conditions: [
        {
          inputKey: "preferredResidenceRegion",
          label: "희망 거주 지역",
          operator: "in",
          reason: "희망 거주 지역이 서울인 경우를 예시로 봅니다.",
          value: ["서울"]
        },
        {
          inputKey: "housingType",
          label: "주거 형태",
          operator: "in",
          reason: "전세 또는 월세 준비 가구를 예시 대상으로 봅니다.",
          value: ["rental_jeonse", "monthly_rent"]
        },
        {
          inputKey: "totalBudgetRange",
          label: "총 예산 구간",
          operator: "range_in",
          reason: "총 예산 구간이 샘플 정책 범위에 들어갑니다.",
          value: ["100m_200m", "200m_300m"]
        }
      ],
      mode: "all",
      sample: true
    },
    documents: [
      {
        key: "lease_contract",
        label: "임대차계약서",
        required: true
      },
      {
        key: "family_relation_certificate",
        label: "가족관계증명서",
        required: true
      }
    ],
    name: "서울 신혼 주거 준비 지원 샘플",
    programId: ids.policyProgram,
    providerName: "샘플시 주거정책과",
    region: "서울",
    requiredInputs: [
      {
        key: "preferredResidenceRegion",
        label: "희망 거주 지역"
      },
      {
        key: "housingType",
        label: "주거 형태"
      },
      {
        key: "totalBudgetRange",
        label: "총 예산 구간"
      }
    ],
    ruleId: ids.policyRuleVersion,
    ruleSummary: "서울 거주 희망, 전월세 준비, 예산 구간을 확인합니다.",
    sourceUrl: "https://example.com/sample-policies/newlywed-housing",
    summary: "신혼 커플의 서울 주거 준비 조건을 확인하는 샘플 정책입니다."
  },
  {
    category: "wedding",
    criteria: {
      conditions: [
        {
          inputKey: "weddingRegion",
          label: "예식 지역",
          operator: "in",
          reason: "예식 지역이 서울 또는 경기인 경우를 예시로 봅니다.",
          value: ["서울", "경기"]
        },
        {
          inputKey: "preferredWeddingStyle",
          label: "선호 예식 형태",
          operator: "in",
          reason: "소규모, 일반, 가족 예식 중심의 샘플 조건입니다.",
          value: ["small", "standard", "family_only"]
        }
      ],
      mode: "all",
      sample: true
    },
    documents: [
      {
        key: "wedding_contract",
        label: "예식 계약서",
        required: true
      },
      {
        key: "estimate_sheet",
        label: "견적서",
        required: false
      }
    ],
    name: "수도권 예식 준비 바우처 샘플",
    programId: ids.policyProgram2,
    providerName: "샘플 광역지원센터",
    region: "수도권",
    requiredInputs: [
      {
        key: "weddingRegion",
        label: "예식 지역"
      },
      {
        key: "preferredWeddingStyle",
        label: "선호 예식 형태"
      }
    ],
    ruleId: ids.policyRuleVersion2,
    ruleSummary: "예식 지역과 선호 예식 형태를 확인합니다.",
    sourceUrl: "https://example.com/sample-policies/wedding-voucher",
    summary: "예식 준비 비용 일부를 확인하는 샘플 정책입니다."
  },
  {
    category: "moving",
    criteria: {
      conditions: [
        {
          inputKey: "moveInPlanAt",
          label: "입주 예정일",
          operator: "date_between",
          reason: "입주 예정일이 샘플 사업 기간 안에 있습니다.",
          value: {
            end: "2027-12-31",
            start: "2026-01-01"
          }
        },
        {
          inputKey: "cashOnHandRange",
          label: "보유 현금 구간",
          operator: "exists",
          reason: "보유 현금 구간 입력이 필요합니다."
        }
      ],
      mode: "all",
      sample: true
    },
    documents: [
      {
        key: "move_in_plan",
        label: "입주 예정 확인 자료",
        required: true
      },
      {
        key: "address_document",
        label: "주소 확인 서류",
        required: false
      }
    ],
    name: "입주 준비 이사비 지원 샘플",
    programId: ids.policyProgram3,
    providerName: "샘플 생활지원과",
    region: "전국",
    requiredInputs: [
      {
        key: "moveInPlanAt",
        label: "입주 예정일"
      },
      {
        key: "cashOnHandRange",
        label: "보유 현금 구간"
      }
    ],
    ruleId: ids.policyRuleVersion3,
    ruleSummary: "입주 예정일과 보유 현금 입력 여부를 확인합니다.",
    sourceUrl: "https://example.com/sample-policies/moving-support",
    summary: "입주 준비 과정의 이사비 조건을 확인하는 샘플 정책입니다."
  },
  {
    category: "appliance",
    criteria: {
      conditions: [
        {
          inputKey: "housingType",
          label: "주거 형태",
          operator: "not_in",
          reason: "가족 거주 주택이 아닌 경우를 예시로 봅니다.",
          value: ["family_home"]
        },
        {
          inputKey: "cashOnHandRange",
          label: "보유 현금 구간",
          operator: "in",
          reason: "보유 현금 구간이 샘플 정책 범위에 들어갑니다.",
          value: ["30m_50m", "50m_100m"]
        }
      ],
      mode: "all",
      sample: true
    },
    documents: [
      {
        key: "purchase_quote",
        label: "구매 견적서",
        required: true
      },
      {
        key: "housing_confirmation",
        label: "주거 확인 자료",
        required: true
      }
    ],
    name: "신혼 가전 구매 지원 샘플",
    programId: ids.policyProgram4,
    providerName: "샘플 소비생활센터",
    region: "전국",
    requiredInputs: [
      {
        key: "housingType",
        label: "주거 형태"
      },
      {
        key: "cashOnHandRange",
        label: "보유 현금 구간"
      }
    ],
    ruleId: ids.policyRuleVersion4,
    ruleSummary: "주거 형태와 보유 현금 구간을 확인합니다.",
    sourceUrl: "https://example.com/sample-policies/appliance-support",
    summary: "입주 전 가전 구매 준비 조건을 확인하는 샘플 정책입니다."
  },
  {
    category: "family",
    criteria: {
      conditions: [
        {
          inputKey: "childrenPlanStatus",
          label: "자녀 계획",
          operator: "in",
          reason: "자녀 계획이 있거나 아직 결정 전인 경우를 예시로 봅니다.",
          value: ["planning", "undecided"]
        },
        {
          inputKey: "weddingDate",
          label: "예식일",
          operator: "date_between",
          reason: "예식일이 샘플 사업 기간 안에 있습니다.",
          value: {
            end: "2027-12-31",
            start: "2026-01-01"
          }
        }
      ],
      mode: "all",
      sample: true
    },
    documents: [
      {
        key: "marriage_plan_statement",
        label: "혼인 또는 예식 계획 확인서",
        required: true
      },
      {
        key: "family_plan_checklist",
        label: "가족 계획 체크리스트",
        required: false
      }
    ],
    name: "신혼 가족 준비 상담 지원 샘플",
    programId: ids.policyProgram5,
    providerName: "샘플 가족센터",
    region: "전국",
    requiredInputs: [
      {
        key: "childrenPlanStatus",
        label: "자녀 계획"
      },
      {
        key: "weddingDate",
        label: "예식일"
      }
    ],
    ruleId: ids.policyRuleVersion5,
    ruleSummary: "자녀 계획과 예식일을 확인합니다.",
    sourceUrl: "https://example.com/sample-policies/family-planning",
    summary: "신혼 초기 가족 계획 상담 조건을 확인하는 샘플 정책입니다."
  }
] as const;

async function main() {
  await prisma.user.upsert({
    where: { id: ids.user },
    update: {
      displayName: "Seed User",
      status: "admin"
    },
    create: {
      id: ids.user,
      displayName: "Seed User",
      emailEncrypted: "encrypted:seed@example.com",
      emailHash: "hash:seed-email",
      authProvider: "seed",
      authProviderUserId: "seed-user-1",
      status: "admin",
      lastLoginAt: seedNow
    }
  });

  await prisma.user.upsert({
    where: { id: ids.user2 },
    update: {
      displayName: "Seed Partner",
      status: "active"
    },
    create: {
      id: ids.user2,
      displayName: "Seed Partner",
      emailEncrypted: "encrypted:seed-partner@example.com",
      emailHash: "hash:seed-partner-email",
      authProvider: "seed",
      authProviderUserId: "seed-user-2",
      status: "active",
      lastLoginAt: seedNow
    }
  });

  await prisma.couple.upsert({
    where: { id: ids.couple },
    update: {
      cashOnHandAmount: 40_000_000n,
      cashOnHandRange: "50m_100m",
      childrenPlanStatus: "undecided",
      displayName: "Seed Couple",
      familySupportType: "possible",
      housingType: "rental_jeonse",
      lifecycleStatus: "preparing",
      loanConsiderationStatus: "considering",
      moveInPlanAt: new Date("2027-03-01T00:00:00.000Z"),
      onboardingStatus: "completed",
      preferredResidenceRegion: "서울",
      preferredWeddingStyle: "small",
      totalBudgetAmount: 120_000_000n,
      totalBudgetRange: "100m_200m",
      weddingDate: new Date("2027-05-15T00:00:00.000Z"),
      weddingRegion: "서울"
    },
    create: {
      id: ids.couple,
      displayName: "Seed Couple",
      lifecycleStatus: "preparing",
      weddingDate: new Date("2027-05-15T00:00:00.000Z"),
      weddingRegion: "서울",
      preferredResidenceRegion: "서울",
      housingType: "rental_jeonse",
      totalBudgetRange: "100m_200m",
      totalBudgetAmount: 120_000_000n,
      cashOnHandRange: "50m_100m",
      cashOnHandAmount: 40_000_000n,
      familySupportType: "possible",
      loanConsiderationStatus: "considering",
      childrenPlanStatus: "undecided",
      preferredWeddingStyle: "small",
      moveInPlanAt: new Date("2027-03-01T00:00:00.000Z"),
      onboardingStatus: "completed",
      createdByUserId: ids.user
    }
  });

  await prisma.coupleMember.upsert({
    where: { id: ids.coupleMember },
    update: {
      assetRange: "50m_100m",
      displayLabel: "owner",
      incomeRange: "50m_100m",
      onboardingCompletedAt: seedNow,
      onboardingStatus: "completed",
      phoneVerified: true,
      role: "owner",
      status: "active",
      visibilityPreference: {
        asset: "summary",
        income: "summary"
      },
      workRegion: "서울"
    },
    create: {
      id: ids.coupleMember,
      coupleId: ids.couple,
      userId: ids.user,
      role: "owner",
      status: "active",
      displayLabel: "owner",
      phoneVerified: true,
      workRegion: "서울",
      incomeRange: "50m_100m",
      assetRange: "50m_100m",
      onboardingStatus: "completed",
      onboardingCompletedAt: seedNow,
      invitedByUserId: ids.user,
      invitedAt: seedNow,
      joinedAt: seedNow,
      visibilityPreference: {
        asset: "summary",
        income: "summary"
      }
    }
  });

  await prisma.coupleMember.upsert({
    where: { id: ids.coupleMember2 },
    update: {
      assetRange: "30m_50m",
      displayLabel: "partner",
      incomeRange: "50m_100m",
      onboardingCompletedAt: seedNow,
      onboardingStatus: "completed",
      phoneVerified: true,
      role: "partner",
      status: "active",
      visibilityPreference: {
        asset: "summary",
        income: "summary"
      },
      workRegion: "서울"
    },
    create: {
      id: ids.coupleMember2,
      coupleId: ids.couple,
      userId: ids.user2,
      role: "partner",
      status: "active",
      displayLabel: "partner",
      phoneVerified: true,
      workRegion: "서울",
      incomeRange: "50m_100m",
      assetRange: "30m_50m",
      onboardingStatus: "completed",
      onboardingCompletedAt: seedNow,
      invitedByUserId: ids.user,
      invitedAt: seedNow,
      joinedAt: seedNow,
      visibilityPreference: {
        asset: "summary",
        income: "summary"
      }
    }
  });

  await prisma.coupleInvitation.upsert({
    where: { id: ids.coupleInvitation },
    update: {
      acceptedAt: seedNow,
      acceptedByUserId: ids.user2,
      invitedUserId: ids.user2,
      status: "accepted"
    },
    create: {
      id: ids.coupleInvitation,
      coupleId: ids.couple,
      invitedByUserId: ids.user,
      invitedUserId: ids.user2,
      tokenHash: "hash:seed-invitation-token",
      status: "accepted",
      expiresAt: addDays(14),
      acceptedAt: seedNow,
      acceptedByUserId: ids.user2
    }
  });

  await prisma.scenario.upsert({
    where: { id: ids.scenario },
    update: {
      calculationVersion: "seed-v1",
      inputSnapshot: {
        housingType: "rental_jeonse",
        preferredResidenceRegion: "서울"
      },
      monthlyAmount: 1_200_000n,
      riskFlags: [{ code: "sample_value_used" }],
      shortfallAmount: 10_000_000n,
      status: "completed",
      totalAmount: 120_000_000n
    },
    create: {
      id: ids.scenario,
      coupleId: ids.couple,
      title: "Seed wedding budget",
      status: "completed",
      calculationVersion: "seed-v1",
      inputSnapshot: {
        housingType: "rental_jeonse",
        preferredResidenceRegion: "서울"
      },
      totalAmount: 120_000_000n,
      monthlyAmount: 1_200_000n,
      shortfallAmount: 10_000_000n,
      riskFlags: [{ code: "cash_buffer_low" }],
      containsSampleValue: true,
      createdByUserId: ids.user
    }
  });

  await prisma.scenarioItem.upsert({
    where: { id: ids.scenarioItem },
    update: {
      amount: 80_000_000n,
      category: "housing_initial",
      label: "전세 보증금 샘플"
    },
    create: {
      id: ids.scenarioItem,
      scenarioId: ids.scenario,
      category: "housing_initial",
      label: "전세 보증금 샘플",
      amount: 80_000_000n,
      amountType: "sample",
      isRequired: true,
      sourceType: "seed",
      sourceUrl: "https://example.com/seed",
      sortOrder: 1
    }
  });

  for (const samplePolicy of samplePolicies) {
    await prisma.policyProgram.upsert({
      where: { id: samplePolicy.programId },
      update: {
        applicationEndAt: addDays(365),
        applicationStartAt: seedNow,
        category: samplePolicy.category,
        cautionText: "샘플 정책입니다. 실제 신청 가능 여부는 공식 공고를 확인해 주세요.",
        name: samplePolicy.name,
        providerName: samplePolicy.providerName,
        region: samplePolicy.region,
        requiredDocumentsSummary: samplePolicy.documents,
        sourceUpdatedAt: seedNow,
        sourceUrl: samplePolicy.sourceUrl,
        status: "active",
        summary: samplePolicy.summary,
        verifiedAt: seedNow
      },
      create: {
        id: samplePolicy.programId,
        name: samplePolicy.name,
        providerName: samplePolicy.providerName,
        category: samplePolicy.category,
        region: samplePolicy.region,
        summary: samplePolicy.summary,
        sourceUrl: samplePolicy.sourceUrl,
        sourceUpdatedAt: seedNow,
        verifiedAt: seedNow,
        applicationStartAt: seedNow,
        applicationEndAt: addDays(365),
        status: "active",
        cautionText: "샘플 정책입니다. 실제 신청 가능 여부는 공식 공고를 확인해 주세요.",
        requiredDocumentsSummary: samplePolicy.documents,
        createdByUserId: ids.user
      }
    });

    await prisma.policyRuleVersion.upsert({
      where: { id: samplePolicy.ruleId },
      update: {
        effectiveFrom: seedNow,
        effectiveTo: addDays(365),
        eligibilityCriteria: samplePolicy.criteria,
        requiredDocuments: samplePolicy.documents,
        requiredInputs: samplePolicy.requiredInputs,
        resultReasonTemplate: {
          maybe_eligible:
            "입력한 조건과 맞는 부분이 있습니다. 샘플 정책이므로 공식 공고를 다시 확인해 주세요.",
          not_eligible: "현재 입력값 기준으로 샘플 정책의 주요 조건과 맞지 않습니다."
        },
        ruleSummary: samplePolicy.ruleSummary,
        sourceUpdatedAt: seedNow,
        sourceUrl: `${samplePolicy.sourceUrl}/rules`,
        status: "active",
        verifiedAt: seedNow
      },
      create: {
        id: samplePolicy.ruleId,
        policyProgramId: samplePolicy.programId,
        version: 1,
        status: "active",
        ruleSummary: samplePolicy.ruleSummary,
        eligibilityCriteria: samplePolicy.criteria,
        requiredInputs: samplePolicy.requiredInputs,
        resultReasonTemplate: {
          maybe_eligible:
            "입력한 조건과 맞는 부분이 있습니다. 샘플 정책이므로 공식 공고를 다시 확인해 주세요.",
          not_eligible: "현재 입력값 기준으로 샘플 정책의 주요 조건과 맞지 않습니다."
        },
        requiredDocuments: samplePolicy.documents,
        effectiveFrom: seedNow,
        effectiveTo: addDays(365),
        sourceUrl: `${samplePolicy.sourceUrl}/rules`,
        sourceUpdatedAt: seedNow,
        verifiedAt: seedNow,
        createdByUserId: ids.user
      }
    });
  }

  await prisma.eligibilityResult.upsert({
    where: { id: ids.eligibilityResult },
    update: {
      checkedAt: seedNow,
      missingInputs: [],
      requiredDocuments: samplePolicies[0].documents,
      resultReason:
        "입력한 조건과 맞는 부분이 있습니다. 샘플 정책이므로 공식 공고를 다시 확인해 주세요.",
      resultStatus: "maybe_eligible"
    },
    create: {
      id: ids.eligibilityResult,
      coupleId: ids.couple,
      policyProgramId: ids.policyProgram,
      policyRuleVersionId: ids.policyRuleVersion,
      resultStatus: "maybe_eligible",
      resultReason:
        "입력한 조건과 맞는 부분이 있습니다. 샘플 정책이므로 공식 공고를 다시 확인해 주세요.",
      missingInputs: [],
      requiredDocuments: samplePolicies[0].documents,
      inputSnapshot: {
        housingType: "rental_jeonse",
        preferredResidenceRegion: "서울",
        totalBudgetRange: "100m_200m"
      },
      checkedAt: seedNow,
      expiresAt: addDays(30)
    }
  });

  await prisma.vendor.upsert({
    where: { id: ids.vendor },
    update: {
      category: "studio",
      description: "서울 스튜디오 촬영과 보정 패키지를 제공하는 샘플 파트너입니다.",
      name: "그린웨딩 스튜디오",
      region: "서울",
      status: "active",
      verificationStatus: "verified",
      verifiedAt: seedNow
    },
    create: {
      id: ids.vendor,
      name: "그린웨딩 스튜디오",
      category: "studio",
      region: "서울",
      description: "서울 스튜디오 촬영과 보정 패키지를 제공하는 샘플 파트너입니다.",
      businessIdentifierEncrypted: "encrypted:seed-business-id",
      businessIdentifierHash: "hash:seed-business-id",
      representativeContactNameEncrypted: "encrypted:seed-manager",
      representativeContactPhoneEncrypted: "encrypted:01000000000",
      representativeContactPhoneHash: "hash:seed-manager-phone",
      status: "active",
      verificationStatus: "verified",
      verifiedAt: seedNow
    }
  });

  await prisma.vendorBranch.upsert({
    where: { id: ids.vendorBranch },
    update: {
      address: "서울 강남구 샘플로 1",
      name: "강남 상담 지점",
      region: "서울",
      status: "active"
    },
    create: {
      id: ids.vendorBranch,
      vendorId: ids.vendor,
      name: "강남 상담 지점",
      region: "서울",
      address: "서울 강남구 샘플로 1",
      contactPhoneEncrypted: "encrypted:0212345678",
      contactPhoneHash: "hash:seed-branch-phone",
      status: "active"
    }
  });

  await prisma.offer.upsert({
    where: { id: ids.offer },
    update: {
      category: "studio",
      description: "촬영, 기본 보정, 주말 추가 비용까지 가격 카드에서 분리해 보여주는 샘플입니다.",
      region: "서울",
      status: "active",
      summary: "스튜디오 촬영과 기본 보정이 포함된 대표 패키지입니다.",
      title: "본식 전 스튜디오 패키지",
      displayOrder: 1
    },
    create: {
      id: ids.offer,
      vendorId: ids.vendor,
      vendorBranchId: ids.vendorBranch,
      title: "본식 전 스튜디오 패키지",
      category: "studio",
      region: "서울",
      summary: "스튜디오 촬영과 기본 보정이 포함된 대표 패키지입니다.",
      description: "촬영, 기본 보정, 주말 추가 비용까지 가격 카드에서 분리해 보여주는 샘플입니다.",
      status: "active",
      displayOrder: 1
    }
  });

  await prisma.offerPriceVersion.upsert({
    where: { id: ids.offerPriceVersion },
    update: {
      additionalCostNote: "주말 촬영과 헬퍼비는 필수 옵션으로 예상 총액에 포함했습니다.",
      basePrice: 1_500_000n,
      cancellationPolicySummary: "상담 신청 단계에서는 계약 확정 전이므로 취소 수수료가 없습니다.",
      estimatedTotalPrice: 1_950_000n,
      includedItems: [
        {
          key: "studio_session",
          label: "스튜디오 촬영",
          quantity: 1,
          unit: "회"
        },
        {
          key: "retouched_photo",
          label: "기본 보정 20장",
          quantity: 20,
          unit: "장"
        }
      ],
      optionalOptions: [
        {
          amount: 250_000,
          includedInEstimatedTotal: false,
          key: "album_upgrade",
          label: "앨범 업그레이드",
          pricingType: "fixed"
        }
      ],
      requiredOptions: [
        {
          amount: 300_000,
          includedInEstimatedTotal: true,
          key: "weekend_fee",
          label: "주말 추가 비용",
          note: "토요일 촬영 기준",
          pricingType: "fixed"
        },
        {
          includedInEstimatedTotal: true,
          key: "assistant_fee",
          label: "헬퍼비",
          maxAmount: 150_000,
          minAmount: 100_000,
          pricingType: "range"
        }
      ],
      verificationStatus: "verified",
      verifiedAt: seedNow,
      validFrom: seedNow,
      validUntil: addDays(90)
    },
    create: {
      id: ids.offerPriceVersion,
      offerId: ids.offer,
      version: 1,
      basePrice: 1_500_000n,
      estimatedTotalPrice: 1_950_000n,
      includedItems: [
        {
          key: "studio_session",
          label: "스튜디오 촬영",
          quantity: 1,
          unit: "회"
        },
        {
          key: "retouched_photo",
          label: "기본 보정 20장",
          quantity: 20,
          unit: "장"
        }
      ],
      requiredOptions: [
        {
          amount: 300_000,
          includedInEstimatedTotal: true,
          key: "weekend_fee",
          label: "주말 추가 비용",
          note: "토요일 촬영 기준",
          pricingType: "fixed"
        },
        {
          includedInEstimatedTotal: true,
          key: "assistant_fee",
          label: "헬퍼비",
          maxAmount: 150_000,
          minAmount: 100_000,
          pricingType: "range"
        }
      ],
      optionalOptions: [
        {
          amount: 250_000,
          includedInEstimatedTotal: false,
          key: "album_upgrade",
          label: "앨범 업그레이드",
          pricingType: "fixed"
        }
      ],
      additionalCostNote: "주말 촬영과 헬퍼비는 필수 옵션으로 예상 총액에 포함했습니다.",
      cancellationPolicySummary: "상담 신청 단계에서는 계약 확정 전이므로 취소 수수료가 없습니다.",
      verificationStatus: "verified",
      verifiedAt: seedNow,
      validFrom: seedNow,
      validUntil: addDays(90),
      sourceType: "admin_seed",
      sourceUrl: "https://example.com/offers/seed-studio",
      createdByUserId: ids.user
    }
  });

  await prisma.offerPriceVersion.upsert({
    where: { id: ids.offerPriceVersion2 },
    update: {
      basePrice: 1_200_000n,
      estimatedTotalPrice: 1_200_000n,
      includedItems: [
        {
          key: "studio_session",
          label: "스튜디오 촬영",
          quantity: 1,
          unit: "회"
        }
      ],
      optionalOptions: [],
      requiredOptions: [],
      verificationStatus: "unverified",
      verifiedAt: null,
      validFrom: seedNow,
      validUntil: addDays(120)
    },
    create: {
      id: ids.offerPriceVersion2,
      offerId: ids.offer,
      version: 2,
      basePrice: 1_200_000n,
      estimatedTotalPrice: 1_200_000n,
      includedItems: [
        {
          key: "studio_session",
          label: "스튜디오 촬영",
          quantity: 1,
          unit: "회"
        }
      ],
      requiredOptions: [],
      optionalOptions: [],
      verificationStatus: "unverified",
      verifiedAt: null,
      validFrom: seedNow,
      validUntil: addDays(120),
      sourceType: "partner_seed",
      sourceUrl: "https://example.com/offers/seed-studio-partner-input",
      createdByUserId: ids.user
    }
  });

  await prisma.offerPriceVersion.upsert({
    where: { id: ids.offerPriceVersion3 },
    update: {
      basePrice: 2_000_000n,
      estimatedTotalPrice: 2_000_000n,
      includedItems: [
        {
          key: "studio_session",
          label: "스튜디오 촬영",
          quantity: 1,
          unit: "회"
        }
      ],
      optionalOptions: [],
      requiredOptions: [],
      verificationStatus: "verified",
      verifiedAt: addDays(-30),
      validFrom: addDays(-60),
      validUntil: addDays(-1)
    },
    create: {
      id: ids.offerPriceVersion3,
      offerId: ids.offer,
      version: 3,
      basePrice: 2_000_000n,
      estimatedTotalPrice: 2_000_000n,
      includedItems: [
        {
          key: "studio_session",
          label: "스튜디오 촬영",
          quantity: 1,
          unit: "회"
        }
      ],
      requiredOptions: [],
      optionalOptions: [],
      verificationStatus: "verified",
      verifiedAt: addDays(-30),
      validFrom: addDays(-60),
      validUntil: addDays(-1),
      sourceType: "admin_seed",
      sourceUrl: "https://example.com/offers/seed-studio-expired",
      createdByUserId: ids.user
    }
  });

  await prisma.vendor.upsert({
    where: { id: ids.vendor2 },
    update: {
      category: "appliance",
      description: "입주 전 필수 가전 묶음을 상담 신청으로 연결하는 샘플 파트너입니다.",
      name: "홈스타트 가전",
      region: "전국",
      status: "active",
      verificationStatus: "verified",
      verifiedAt: seedNow
    },
    create: {
      id: ids.vendor2,
      name: "홈스타트 가전",
      category: "appliance",
      region: "전국",
      description: "입주 전 필수 가전 묶음을 상담 신청으로 연결하는 샘플 파트너입니다.",
      businessIdentifierEncrypted: "encrypted:seed-business-id-2",
      businessIdentifierHash: "hash:seed-business-id-2",
      representativeContactNameEncrypted: "encrypted:seed-manager-2",
      representativeContactPhoneEncrypted: "encrypted:01000000001",
      representativeContactPhoneHash: "hash:seed-manager-phone-2",
      status: "active",
      verificationStatus: "verified",
      verifiedAt: seedNow
    }
  });

  await prisma.vendorBranch.upsert({
    where: { id: ids.vendorBranch2 },
    update: {
      address: "온라인",
      name: "온라인 상담",
      region: "전국",
      status: "active"
    },
    create: {
      id: ids.vendorBranch2,
      vendorId: ids.vendor2,
      name: "온라인 상담",
      region: "전국",
      address: "온라인",
      contactPhoneEncrypted: "encrypted:0212345679",
      contactPhoneHash: "hash:seed-branch-phone-2",
      status: "active"
    }
  });

  await prisma.offer.upsert({
    where: { id: ids.offer2 },
    update: {
      category: "appliance",
      description: "냉장고, 세탁기, 건조기를 묶은 입주 준비 샘플 상품입니다.",
      displayOrder: 2,
      region: "전국",
      status: "active",
      summary: "입주 전 많이 비교하는 가전 3종을 한 번에 확인합니다.",
      title: "신혼 입주 가전 3종 패키지"
    },
    create: {
      id: ids.offer2,
      vendorId: ids.vendor2,
      vendorBranchId: ids.vendorBranch2,
      title: "신혼 입주 가전 3종 패키지",
      category: "appliance",
      region: "전국",
      summary: "입주 전 많이 비교하는 가전 3종을 한 번에 확인합니다.",
      description: "냉장고, 세탁기, 건조기를 묶은 입주 준비 샘플 상품입니다.",
      status: "active",
      displayOrder: 2
    }
  });

  await prisma.offerPriceVersion.upsert({
    where: { id: ids.offerPriceVersion4 },
    update: {
      additionalCostNote: "기본 설치 지역 밖은 배송비가 달라질 수 있습니다.",
      basePrice: 3_200_000n,
      cancellationPolicySummary: "상담 신청 후 별도 계약 전에는 구매가 확정되지 않습니다.",
      estimatedTotalPrice: 3_300_000n,
      includedItems: [
        {
          key: "fridge",
          label: "냉장고",
          quantity: 1,
          unit: "대"
        },
        {
          key: "washer",
          label: "세탁기",
          quantity: 1,
          unit: "대"
        },
        {
          key: "dryer",
          label: "건조기",
          quantity: 1,
          unit: "대"
        }
      ],
      optionalOptions: [
        {
          amount: 180_000,
          includedInEstimatedTotal: false,
          key: "extended_warranty",
          label: "연장 보증",
          pricingType: "fixed"
        }
      ],
      requiredOptions: [
        {
          amount: 100_000,
          includedInEstimatedTotal: true,
          key: "delivery_install",
          label: "배송 및 설치",
          pricingType: "fixed"
        }
      ],
      verificationStatus: "verified",
      verifiedAt: seedNow,
      validFrom: seedNow,
      validUntil: addDays(75)
    },
    create: {
      id: ids.offerPriceVersion4,
      offerId: ids.offer2,
      version: 1,
      basePrice: 3_200_000n,
      estimatedTotalPrice: 3_300_000n,
      includedItems: [
        {
          key: "fridge",
          label: "냉장고",
          quantity: 1,
          unit: "대"
        },
        {
          key: "washer",
          label: "세탁기",
          quantity: 1,
          unit: "대"
        },
        {
          key: "dryer",
          label: "건조기",
          quantity: 1,
          unit: "대"
        }
      ],
      requiredOptions: [
        {
          amount: 100_000,
          includedInEstimatedTotal: true,
          key: "delivery_install",
          label: "배송 및 설치",
          pricingType: "fixed"
        }
      ],
      optionalOptions: [
        {
          amount: 180_000,
          includedInEstimatedTotal: false,
          key: "extended_warranty",
          label: "연장 보증",
          pricingType: "fixed"
        }
      ],
      additionalCostNote: "기본 설치 지역 밖은 배송비가 달라질 수 있습니다.",
      cancellationPolicySummary: "상담 신청 후 별도 계약 전에는 구매가 확정되지 않습니다.",
      verificationStatus: "verified",
      verifiedAt: seedNow,
      validFrom: seedNow,
      validUntil: addDays(75),
      sourceType: "admin_seed",
      sourceUrl: "https://example.com/offers/home-appliance",
      createdByUserId: ids.user
    }
  });

  await prisma.compareRoom.upsert({
    where: { id: ids.compareRoom },
    update: {
      bothApprovedAt: seedNow,
      sharedAt: seedNow,
      status: "both_approved"
    },
    create: {
      id: ids.compareRoom,
      coupleId: ids.couple,
      title: "Seed studio comparison",
      status: "both_approved",
      createdByUserId: ids.user,
      sharedAt: seedNow,
      bothApprovedAt: seedNow
    }
  });

  await prisma.compareCard.upsert({
    where: { id: ids.compareCard },
    update: {
      offerPriceVersionId: ids.offerPriceVersion,
      position: 1,
      snapshotIncludedItems: [
        {
          key: "studio_session",
          label: "스튜디오 촬영",
          quantity: 1,
          unit: "회"
        },
        {
          key: "retouched_photo",
          label: "기본 보정 20장",
          quantity: 20,
          unit: "장"
        }
      ],
      snapshotOptionalOptions: [
        {
          amount: 250_000,
          includedInEstimatedTotal: false,
          key: "album_upgrade",
          label: "앨범 업그레이드",
          pricingType: "fixed"
        }
      ],
      snapshotPriceSummary: {
        basePrice: 1_500_000,
        currency: "KRW",
        estimatedTotalPrice: 1_950_000,
        validUntil: addDays(90),
        verificationStatus: "verified",
        verifiedAt: seedNow,
        version: 1
      },
      snapshotRequiredOptions: [
        {
          amount: 300_000,
          includedInEstimatedTotal: true,
          key: "weekend_fee",
          label: "주말 추가 비용",
          note: "토요일 촬영 기준",
          pricingType: "fixed"
        },
        {
          includedInEstimatedTotal: true,
          key: "assistant_fee",
          label: "헬퍼비",
          maxAmount: 150_000,
          minAmount: 100_000,
          pricingType: "range"
        }
      ],
      snapshotTitle: "Seed Studio Package"
    },
    create: {
      id: ids.compareCard,
      compareRoomId: ids.compareRoom,
      offerId: ids.offer,
      offerPriceVersionId: ids.offerPriceVersion,
      snapshotTitle: "Seed Studio Package",
      snapshotPriceSummary: {
        basePrice: 1_500_000,
        currency: "KRW",
        estimatedTotalPrice: 1_950_000,
        validUntil: addDays(90),
        verificationStatus: "verified",
        verifiedAt: seedNow,
        version: 1
      },
      snapshotIncludedItems: [
        {
          key: "studio_session",
          label: "스튜디오 촬영",
          quantity: 1,
          unit: "회"
        },
        {
          key: "retouched_photo",
          label: "기본 보정 20장",
          quantity: 20,
          unit: "장"
        }
      ],
      snapshotRequiredOptions: [
        {
          amount: 300_000,
          includedInEstimatedTotal: true,
          key: "weekend_fee",
          label: "주말 추가 비용",
          note: "토요일 촬영 기준",
          pricingType: "fixed"
        },
        {
          includedInEstimatedTotal: true,
          key: "assistant_fee",
          label: "헬퍼비",
          maxAmount: 150_000,
          minAmount: 100_000,
          pricingType: "range"
        }
      ],
      snapshotOptionalOptions: [
        {
          amount: 250_000,
          includedInEstimatedTotal: false,
          key: "album_upgrade",
          label: "앨범 업그레이드",
          pricingType: "fixed"
        }
      ],
      position: 1,
      addedByUserId: ids.user
    }
  });

  await prisma.compareCard.upsert({
    where: { id: ids.compareCard2 },
    update: {
      offerId: ids.offer2,
      offerPriceVersionId: ids.offerPriceVersion4,
      position: 2,
      snapshotIncludedItems: [
        {
          key: "fridge",
          label: "냉장고",
          quantity: 1,
          unit: "대"
        },
        {
          key: "washer",
          label: "세탁기",
          quantity: 1,
          unit: "대"
        },
        {
          key: "dryer",
          label: "건조기",
          quantity: 1,
          unit: "대"
        }
      ],
      snapshotOptionalOptions: [
        {
          amount: 180_000,
          includedInEstimatedTotal: false,
          key: "extended_warranty",
          label: "연장 보증",
          pricingType: "fixed"
        }
      ],
      snapshotPriceSummary: {
        basePrice: 3_200_000,
        currency: "KRW",
        estimatedTotalPrice: 3_300_000,
        validUntil: addDays(75),
        verificationStatus: "verified",
        verifiedAt: seedNow,
        version: 1
      },
      snapshotRequiredOptions: [
        {
          amount: 100_000,
          includedInEstimatedTotal: true,
          key: "delivery_install",
          label: "배송 및 설치",
          pricingType: "fixed"
        }
      ],
      snapshotTitle: "신혼 입주 가전 3종 패키지"
    },
    create: {
      id: ids.compareCard2,
      compareRoomId: ids.compareRoom,
      offerId: ids.offer2,
      offerPriceVersionId: ids.offerPriceVersion4,
      snapshotTitle: "신혼 입주 가전 3종 패키지",
      snapshotPriceSummary: {
        basePrice: 3_200_000,
        currency: "KRW",
        estimatedTotalPrice: 3_300_000,
        validUntil: addDays(75),
        verificationStatus: "verified",
        verifiedAt: seedNow,
        version: 1
      },
      snapshotIncludedItems: [
        {
          key: "fridge",
          label: "냉장고",
          quantity: 1,
          unit: "대"
        },
        {
          key: "washer",
          label: "세탁기",
          quantity: 1,
          unit: "대"
        },
        {
          key: "dryer",
          label: "건조기",
          quantity: 1,
          unit: "대"
        }
      ],
      snapshotRequiredOptions: [
        {
          amount: 100_000,
          includedInEstimatedTotal: true,
          key: "delivery_install",
          label: "배송 및 설치",
          pricingType: "fixed"
        }
      ],
      snapshotOptionalOptions: [
        {
          amount: 180_000,
          includedInEstimatedTotal: false,
          key: "extended_warranty",
          label: "연장 보증",
          pricingType: "fixed"
        }
      ],
      position: 2,
      addedByUserId: ids.user2
    }
  });

  await prisma.approval.upsert({
    where: { id: ids.approval },
    update: {
      compareCardId: null,
      status: "approved",
      decidedAt: seedNow
    },
    create: {
      id: ids.approval,
      compareRoomId: ids.compareRoom,
      compareCardId: null,
      coupleMemberId: ids.coupleMember,
      userId: ids.user,
      status: "approved",
      comment: "Seed approval.",
      decidedAt: seedNow
    }
  });

  await prisma.approval.upsert({
    where: { id: ids.approval2 },
    update: {
      compareCardId: null,
      status: "approved",
      decidedAt: seedNow
    },
    create: {
      id: ids.approval2,
      compareRoomId: ids.compareRoom,
      compareCardId: null,
      coupleMemberId: ids.coupleMember2,
      userId: ids.user2,
      status: "approved",
      comment: "Seed partner approval.",
      decidedAt: seedNow
    }
  });

  await prisma.compareComment.upsert({
    where: { id: ids.compareComment },
    update: {
      body: "Seed comment."
    },
    create: {
      id: ids.compareComment,
      compareRoomId: ids.compareRoom,
      compareCardId: ids.compareCard,
      coupleMemberId: ids.coupleMember,
      userId: ids.user,
      body: "Seed comment."
    }
  });

  await prisma.leadRequest.upsert({
    where: { id: ids.leadRequest },
    update: {
      contactNameEncrypted: "local:v1:U2VlZCBVc2Vy",
      contactPhoneEncrypted: "local:v1:MDEwMTExMTIyMjI=",
      contactPhoneHash: "790837a426851d4be889b2c991693ae15a70e9003ea07c781b7eb4f5234d93b8",
      messageEncrypted: "local:v1:U2VlZCBtZXNzYWdlLg==",
      preferredContactDates: [{ date: "2026-06-10", window: "afternoon" }],
      preferredContactMethod: "phone",
      status: "submitted"
    },
    create: {
      id: ids.leadRequest,
      coupleId: ids.couple,
      compareRoomId: ids.compareRoom,
      compareCardId: ids.compareCard,
      offerId: ids.offer,
      vendorId: ids.vendor,
      offerPriceVersionId: ids.offerPriceVersion,
      status: "submitted",
      preferredContactMethod: "phone",
      preferredContactDates: [{ date: "2026-06-10", window: "afternoon" }],
      contactNameEncrypted: "local:v1:U2VlZCBVc2Vy",
      contactPhoneEncrypted: "local:v1:MDEwMTExMTIyMjI=",
      contactPhoneHash: "790837a426851d4be889b2c991693ae15a70e9003ea07c781b7eb4f5234d93b8",
      messageEncrypted: "local:v1:U2VlZCBtZXNzYWdlLg==",
      consentGivenAt: seedNow,
      submittedByUserId: ids.user,
      submittedAt: seedNow,
      expiresAt: addDays(30)
    }
  });

  await prisma.leadStatusHistory.upsert({
    where: { id: ids.leadStatusHistory },
    update: {
      toStatus: "submitted"
    },
    create: {
      id: ids.leadStatusHistory,
      leadRequestId: ids.leadRequest,
      fromStatus: null,
      toStatus: "submitted",
      changedByUserId: ids.user,
      changedByRole: "user",
      reason: "Seed lead submission."
    }
  });

  await prisma.decisionLog.upsert({
    where: { id: ids.decisionLog },
    update: {
      action: "refresh_compare_room_after_approval",
      afterStatus: "both_approved"
    },
    create: {
      id: ids.decisionLog,
      coupleId: ids.couple,
      actorUserId: ids.user,
      actorCoupleMemberId: ids.coupleMember,
      targetType: "compare_room",
      targetId: ids.compareRoom,
      action: "refresh_compare_room_after_approval",
      beforeStatus: "shared",
      afterStatus: "both_approved",
      reason: "Seed decision log.",
      metadata: {
        compareCardIds: [ids.compareCard, ids.compareCard2]
      }
    }
  });

  await prisma.document.upsert({
    where: { id: ids.document },
    update: {
      documentType: "lease_contract",
      dueAt: addDays(14),
      ownerCoupleMemberId: ids.coupleMember,
      sourceId: ids.eligibilityResult,
      sourceType: "eligibility_result",
      status: "needed",
      title: "임대차계약서"
    },
    create: {
      id: ids.document,
      coupleId: ids.couple,
      title: "임대차계약서",
      documentType: "lease_contract",
      status: "needed",
      sourceType: "eligibility_result",
      sourceId: ids.eligibilityResult,
      ownerCoupleMemberId: ids.coupleMember,
      dueAt: addDays(14),
      attachmentProvider: "none"
    }
  });

  await prisma.task.upsert({
    where: { id: ids.task },
    update: {
      assignedCoupleMemberId: ids.coupleMember,
      dueAt: addDays(14),
      sourceId: ids.eligibilityResult,
      sourceType: "eligibility_result",
      status: "open",
      title: "서류 준비: 임대차계약서"
    },
    create: {
      id: ids.task,
      coupleId: ids.couple,
      title: "서류 준비: 임대차계약서",
      description: "정책 결과에 필요한 서류입니다.",
      status: "open",
      sourceType: "eligibility_result",
      sourceId: ids.eligibilityResult,
      assignedCoupleMemberId: ids.coupleMember,
      dueAt: addDays(14),
      createdByUserId: ids.user
    }
  });

  await prisma.notification.upsert({
    where: { id: ids.notification },
    update: {
      body: "마감일이 다가오면 정책 필요 서류를 확인해 주세요.",
      scheduledAt: addDays(12),
      status: "scheduled",
      title: "정책 서류 마감 알림"
    },
    create: {
      id: ids.notification,
      coupleId: ids.couple,
      userId: ids.user,
      coupleMemberId: ids.coupleMember,
      type: "task_due",
      title: "정책 서류 마감 알림",
      body: "마감일이 다가오면 정책 필요 서류를 확인해 주세요.",
      channel: "in_app",
      status: "scheduled",
      scheduledAt: addDays(12),
      metadata: {
        taskId: ids.task
      }
    }
  });

  await prisma.article.upsert({
    where: { id: ids.article },
    update: {
      body: "신혼 예산은 예식, 주거 초기비, 월 고정비, 입주 준비비를 분리해서 봐야 합니다.\n\n먼저 확정된 비용과 아직 비교가 필요한 비용을 나누고, 부족 금액은 시나리오 계산기로 확인합니다.\n\n정책 가능성은 지역과 주거 형태에 따라 크게 달라지므로 예산표를 만든 뒤 정책 확인으로 이어가는 흐름이 좋습니다.",
      category: "budget",
      ogImageUrl: "https://example.com/og/newlywed-budget.png",
      publishedAt: seedNow,
      seoDescription:
        "신혼 예산표를 예식, 주거, 입주 비용으로 나눠 계산하고 정책 확인으로 이어가는 방법입니다.",
      seoTitle: "신혼 예산표 시작 가이드",
      slug: "newlywed-budget-start-guide",
      status: "published",
      summary: "예산표를 먼저 만들고 정책과 파트너 비교로 이어가는 기본 순서입니다.",
      title: "신혼 예산표 시작 가이드"
    },
    create: {
      id: ids.article,
      title: "신혼 예산표 시작 가이드",
      slug: "newlywed-budget-start-guide",
      summary: "예산표를 먼저 만들고 정책과 파트너 비교로 이어가는 기본 순서입니다.",
      body: "신혼 예산은 예식, 주거 초기비, 월 고정비, 입주 준비비를 분리해서 봐야 합니다.\n\n먼저 확정된 비용과 아직 비교가 필요한 비용을 나누고, 부족 금액은 시나리오 계산기로 확인합니다.\n\n정책 가능성은 지역과 주거 형태에 따라 크게 달라지므로 예산표를 만든 뒤 정책 확인으로 이어가는 흐름이 좋습니다.",
      category: "budget",
      status: "published",
      seoTitle: "신혼 예산표 시작 가이드",
      seoDescription:
        "신혼 예산표를 예식, 주거, 입주 비용으로 나눠 계산하고 정책 확인으로 이어가는 방법입니다.",
      ogImageUrl: "https://example.com/og/newlywed-budget.png",
      publishedAt: seedNow,
      authorUserId: ids.user
    }
  });

  await prisma.eventLog.upsert({
    where: { id: ids.eventLog },
    update: {
      occurredAt: seedNow
    },
    create: {
      id: ids.eventLog,
      eventName: "account_created",
      userId: ids.user,
      coupleId: ids.couple,
      anonymousId: "seed-anonymous",
      source: "seed",
      schemaVersion: 1,
      payload: {
        containsDirectPersonalData: false,
        modelsSeeded: Object.keys(ids).length
      },
      occurredAt: seedNow
    }
  });

  console.log("Seeded 신혼OS database fixtures.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
