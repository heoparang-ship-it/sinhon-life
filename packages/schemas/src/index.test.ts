import { describe, expect, it } from "vitest";
import {
  addCompareCardInputSchema,
  createLeadRequestInputSchema,
  createArticleInputSchema,
  createAnalyticsEventInputSchema,
  createScenarioInputSchema,
  createDocumentInputSchema,
  createOfferPriceVersionInputSchema,
  createPolicyRuleVersionInputSchema,
  createCompareCommentInputSchema,
  createCompareRoomInputSchema,
  createTaskInputSchema,
  prepareDocumentAttachmentInputSchema,
  readNotificationInputSchema,
  saveCoupleOnboardingInputSchema,
  createCoupleInputSchema,
  createInvitationInputSchema,
  listNotificationsQuerySchema,
  listAnalyticsFunnelQuerySchema,
  policyEligibilityCriteriaSchema,
  runPolicyCheckInputSchema,
  registerInputSchema,
  savePersonalOnboardingInputSchema,
  scenarioItemInputSchema,
  submitApprovalInputSchema,
  updateDocumentInputSchema,
  updateLeadStatusInputSchema,
  publishArticleInputSchema,
  updateOfferPriceVersionInputSchema
} from "./index.js";

describe("createCoupleInputSchema", () => {
  it("trims and validates a couple display name", () => {
    expect(
      createCoupleInputSchema.parse({
        displayName: " 우리 결혼 준비 ",
        lifecycleStatus: "preparing"
      })
    ).toEqual({
      displayName: "우리 결혼 준비",
      lifecycleStatus: "preparing"
    });
  });
});

describe("registerInputSchema", () => {
  it("requires explicit terms and privacy consent", () => {
    expect(() =>
      registerInputSchema.parse({
        coupleDisplayName: "우리 결혼 준비",
        displayName: "민지",
        email: "minji@example.com",
        privacyAccepted: false,
        termsAccepted: true
      })
    ).toThrow();
  });

  it("requires a login identifier", () => {
    expect(() =>
      registerInputSchema.parse({
        coupleDisplayName: "우리 결혼 준비",
        displayName: "민지",
        privacyAccepted: true,
        termsAccepted: true
      })
    ).toThrow();
  });
});

describe("createInvitationInputSchema", () => {
  it("defaults invitations to 72 hours and caps them at 168 hours", () => {
    expect(createInvitationInputSchema.parse({})).toEqual({ expiresInHours: 72 });
    expect(() => createInvitationInputSchema.parse({ expiresInHours: 169 })).toThrow();
  });
});

describe("onboarding schemas", () => {
  it("accepts personal onboarding ranges and visibility settings", () => {
    expect(
      savePersonalOnboardingInputSchema.parse({
        assetRange: "30m_50m",
        incomeRange: "50m_100m",
        nickname: "민지",
        phoneVerified: false,
        visibilityPreference: {
          asset: "private",
          income: "summary"
        },
        workRegion: "서울"
      })
    ).toMatchObject({
      assetRange: "30m_50m",
      incomeRange: "50m_100m",
      nickname: "민지"
    });
  });

  it("rejects exact amount-like budget ranges and invalid dates", () => {
    expect(() =>
      saveCoupleOnboardingInputSchema.parse({
        moveInPlanAt: "2026/10/01",
        totalBudgetRange: "250000000"
      })
    ).toThrow();
  });
});

describe("scenario schemas", () => {
  it("accepts one-time and monthly scenario items", () => {
    expect(
      scenarioItemInputSchema.parse({
        amount: 12_000_000,
        amountType: "user_input",
        category: "wedding",
        frequency: "one_time",
        isRequired: true,
        label: "예식장 예상 비용"
      })
    ).toMatchObject({
      amount: 12_000_000,
      category: "wedding",
      frequency: "one_time"
    });
  });

  it("rejects negative amounts and unknown categories", () => {
    expect(() =>
      createScenarioInputSchema.parse({
        items: [
          {
            amount: -1,
            category: "loan_limit",
            label: "대출 가능 금액"
          }
        ],
        title: "무리한 시나리오"
      })
    ).toThrow();
  });
});

describe("policy schemas", () => {
  it("accepts MVP policy rules with versioned criteria", () => {
    expect(
      createPolicyRuleVersionInputSchema.parse({
        eligibilityCriteria: {
          conditions: [
            {
              inputKey: "preferredResidenceRegion",
              operator: "in",
              value: ["서울"]
            },
            {
              inputKey: "housingType",
              operator: "equals",
              value: "rental_jeonse"
            }
          ],
          mode: "all",
          sample: true
        },
        requiredInputs: [
          {
            key: "preferredResidenceRegion",
            label: "희망 거주 지역"
          }
        ],
        resultReasonTemplate: {
          maybe_eligible: "입력한 조건과 일부 맞습니다."
        },
        ruleSummary: "서울 전세 준비 가구를 확인합니다.",
        sourceUrl: "https://example.com/policies/sample/rules",
        status: "active"
      })
    ).toMatchObject({
      eligibilityCriteria: {
        mode: "all"
      },
      requiredDocuments: []
    });
  });

  it("rejects resident-registration-number-like policy input", () => {
    expect(() =>
      runPolicyCheckInputSchema.parse({
        additionalInputs: {
          residentRegistrationNumber: "900101-1234567"
        }
      })
    ).toThrow();
  });

  it("rejects nested sensitive values in rule criteria", () => {
    expect(() =>
      policyEligibilityCriteriaSchema.parse({
        conditions: [
          {
            inputKey: "identity",
            operator: "equals",
            value: {
              label: "주민등록번호"
            }
          }
        ]
      })
    ).toThrow();
  });
});

describe("workspace schemas", () => {
  it("accepts document and task inputs with an assignee and due date", () => {
    expect(
      createDocumentInputSchema.parse({
        documentType: "policy_document",
        dueAt: "2026-06-20T00:00:00.000Z",
        ownerCoupleMemberId: "00000000-0000-4000-8000-000000000002",
        title: "혼인관계증명서"
      })
    ).toMatchObject({
      documentType: "policy_document",
      title: "혼인관계증명서"
    });

    expect(
      createTaskInputSchema.parse({
        assignedCoupleMemberId: "00000000-0000-4000-8000-000000000002",
        dueAt: "2026-06-20T00:00:00.000Z",
        title: "주민센터 방문 예약"
      })
    ).toMatchObject({
      title: "주민센터 방문 예약"
    });
  });

  it("rejects invalid document status and oversized attachment selections", () => {
    expect(() =>
      updateDocumentInputSchema.parse({
        status: "done"
      })
    ).toThrow();

    expect(() =>
      prepareDocumentAttachmentInputSchema.parse({
        contentType: "application/pdf",
        fileName: "가족관계증명서.pdf",
        size: 16 * 1024 * 1024
      })
    ).toThrow();
  });

  it("defaults notification query limits and read toggles", () => {
    expect(listNotificationsQuerySchema.parse({})).toEqual({ limit: 20 });
    expect(readNotificationInputSchema.parse({ read: true })).toEqual({ read: true });
  });
});

describe("content schemas", () => {
  it("accepts a publish-ready article with SEO and OG fields", () => {
    expect(
      createArticleInputSchema.parse({
        body: "예산표를 만들 때는 고정비와 선택비를 나눠 봅니다.",
        category: "budget",
        ogImageUrl: "https://example.com/og/budget.png",
        seoDescription: "신혼 예산표를 만드는 기본 순서입니다.",
        seoTitle: "신혼 예산표 작성법",
        slug: "newlywed-budget-guide",
        status: "published",
        summary: "예식, 주거, 가전 비용을 한 번에 정리합니다.",
        title: "신혼 예산표 작성법"
      })
    ).toMatchObject({
      slug: "newlywed-budget-guide",
      status: "published"
    });

    expect(publishArticleInputSchema.parse({ publish: true })).toEqual({ publish: true });
  });

  it("rejects unsafe article slugs", () => {
    expect(() =>
      createArticleInputSchema.parse({
        body: "본문",
        category: "budget",
        slug: "Bad Slug",
        title: "제목"
      })
    ).toThrow();
  });
});

describe("analytics schemas", () => {
  it("accepts known analytics events with anonymous IDs", () => {
    expect(
      createAnalyticsEventInputSchema.parse({
        anonymousId: "anon-1",
        eventName: "calculator_started",
        payload: {
          entry: "content"
        }
      })
    ).toMatchObject({
      eventName: "calculator_started",
      source: "web"
    });
  });

  it("rejects unknown events and invalid funnel ranges", () => {
    expect(() =>
      createAnalyticsEventInputSchema.parse({
        eventName: "unknown_event"
      })
    ).toThrow();

    expect(() =>
      listAnalyticsFunnelQuerySchema.parse({
        from: "2026-06-06T00:00:00.000Z",
        to: "2026-06-05T00:00:00.000Z"
      })
    ).toThrow();
  });
});

describe("offer schemas", () => {
  it("normalizes required options for estimated total calculation", () => {
    expect(
      createOfferPriceVersionInputSchema.parse({
        basePrice: 1_500_000,
        includedItems: [
          {
            key: "studio_session",
            label: "스튜디오 촬영"
          }
        ],
        requiredOptions: [
          {
            amount: 300_000,
            key: "weekend_fee",
            label: "주말 추가 비용",
            pricingType: "fixed"
          }
        ],
        sourceType: "admin_seed",
        verificationStatus: "verified",
        verifiedAt: "2026-06-05T00:00:00.000Z"
      }).requiredOptions
    ).toEqual([
      {
        amount: 300_000,
        includedInEstimatedTotal: true,
        key: "weekend_fee",
        label: "주말 추가 비용",
        pricingType: "fixed"
      }
    ]);
  });

  it("rejects invalid range options", () => {
    expect(() =>
      createOfferPriceVersionInputSchema.parse({
        basePrice: 1_500_000,
        includedItems: [
          {
            key: "studio_session",
            label: "스튜디오 촬영"
          }
        ],
        requiredOptions: [
          {
            key: "assistant_fee",
            label: "헬퍼비",
            maxAmount: 50_000,
            minAmount: 100_000,
            pricingType: "range"
          }
        ]
      })
    ).toThrow();
  });

  it("accepts a price verification status update", () => {
    expect(
      updateOfferPriceVersionInputSchema.parse({
        verificationStatus: "verified",
        verifiedAt: "2026-06-05T00:00:00.000Z"
      })
    ).toMatchObject({
      verificationStatus: "verified"
    });
  });
});

describe("compare room schemas", () => {
  it("accepts a compare room with an initial offer", () => {
    expect(
      createCompareRoomInputSchema.parse({
        initialOfferId: "00000000-0000-4000-8000-000000000012",
        offerPriceVersionId: "00000000-0000-4000-8000-000000000013",
        title: "스튜디오 비교"
      })
    ).toMatchObject({
      title: "스튜디오 비교"
    });
  });

  it("requires an offer when a price version is supplied", () => {
    expect(() =>
      createCompareRoomInputSchema.parse({
        offerPriceVersionId: "00000000-0000-4000-8000-000000000013",
        title: "가격만 있는 비교"
      })
    ).toThrow();
  });

  it("validates compare card, approval, and comment inputs", () => {
    expect(
      addCompareCardInputSchema.parse({
        offerId: "00000000-0000-4000-8000-000000000012"
      })
    ).toMatchObject({
      offerId: "00000000-0000-4000-8000-000000000012"
    });
    expect(
      submitApprovalInputSchema.parse({
        comment: "둘 다 예산 안에 들어옵니다.",
        status: "approved"
      })
    ).toMatchObject({
      status: "approved"
    });
    expect(
      createCompareCommentInputSchema.parse({
        body: "주말 비용을 한 번 더 확인하자."
      })
    ).toMatchObject({
      body: "주말 비용을 한 번 더 확인하자."
    });
  });
});

describe("lead request schemas", () => {
  it("accepts a lead request with contact preference and consent flag", () => {
    expect(
      createLeadRequestInputSchema.parse({
        compareCardId: "00000000-0000-4000-8000-000000000016",
        contactName: "민지",
        contactPhone: "010-1234-5678",
        message: "주말 상담 가능 여부를 확인하고 싶습니다.",
        preferredContactDates: [
          {
            date: "2026-06-10",
            window: "afternoon"
          }
        ],
        preferredContactMethod: "phone",
        privacyConsent: true
      })
    ).toMatchObject({
      preferredContactMethod: "phone",
      privacyConsent: true
    });
  });

  it("keeps false consent parseable so the API can return CONSENT_REQUIRED", () => {
    expect(
      createLeadRequestInputSchema.parse({
        contactName: "민지",
        contactPhone: "010-1234-5678",
        preferredContactDates: [
          {
            date: "2026-06-10"
          }
        ],
        preferredContactMethod: "phone",
        privacyConsent: false
      })
    ).toMatchObject({
      preferredContactDates: [
        {
          date: "2026-06-10",
          window: "any"
        }
      ],
      privacyConsent: false
    });
  });

  it("validates lead status updates", () => {
    expect(
      updateLeadStatusInputSchema.parse({
        reason: "운영자가 접수 내용을 확인했습니다.",
        status: "viewed"
      })
    ).toMatchObject({
      status: "viewed"
    });
  });
});
