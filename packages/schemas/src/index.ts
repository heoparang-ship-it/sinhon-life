import { z } from "zod";

export const coupleLifecycleStatusSchema = z.enum(["preparing", "married", "unknown"]);

export const createCoupleInputSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  lifecycleStatus: coupleLifecycleStatusSchema.default("preparing")
});

export const authProviderSchema = z.enum(["local", "seed", "kakao", "naver", "google", "apple"]);

export const registerInputSchema = z
  .object({
    authProvider: authProviderSchema.default("local"),
    authProviderUserId: z.string().trim().min(3).max(120).optional(),
    coupleDisplayName: z.string().trim().min(1).max(80).optional(),
    displayName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(254).optional(),
    invitationToken: z.string().trim().min(24).max(160).optional(),
    lifecycleStatus: coupleLifecycleStatusSchema.default("preparing"),
    marketingAccepted: z.boolean().default(false),
    phone: z.string().trim().min(7).max(30).optional(),
    privacyAccepted: z.literal(true),
    relationshipLabel: z.string().trim().max(40).optional(),
    termsAccepted: z.literal(true)
  })
  .refine((value) => value.authProviderUserId || value.email || value.phone, {
    message: "가입 식별자가 필요합니다.",
    path: ["email"]
  })
  .refine((value) => value.invitationToken || value.coupleDisplayName, {
    message: "커플 이름 또는 초대 토큰이 필요합니다.",
    path: ["coupleDisplayName"]
  });

export const loginInputSchema = z
  .object({
    authProvider: authProviderSchema.default("local"),
    authProviderUserId: z.string().trim().min(3).max(120).optional(),
    email: z.string().trim().email().max(254).optional(),
    phone: z.string().trim().min(7).max(30).optional()
  })
  .refine((value) => value.authProviderUserId || value.email || value.phone, {
    message: "로그인 식별자가 필요합니다."
  });

export const createInvitationInputSchema = z.object({
  expiresInHours: z.number().int().min(1).max(168).default(72)
});

export const acceptInvitationInputSchema = z.object({
  accept: z.literal(true)
});

export const onboardingRangeSchema = z.enum([
  "not_set",
  "under_30m",
  "30m_50m",
  "50m_100m",
  "over_100m",
  "private"
]);

export const onboardingStatusSchema = z.enum(["not_started", "in_progress", "completed"]);

export const visibilityLevelSchema = z.enum(["private", "partner", "summary"]);

export const onboardingVisibilityPreferenceSchema = z.object({
  asset: visibilityLevelSchema.default("summary"),
  income: visibilityLevelSchema.default("summary")
});

export const budgetRangeSchema = z.enum([
  "not_set",
  "under_100m",
  "100m_200m",
  "200m_300m",
  "300m_500m",
  "over_500m",
  "private"
]);

export const housingTypeSchema = z.enum([
  "not_set",
  "rental_jeonse",
  "monthly_rent",
  "purchase",
  "family_home",
  "undecided",
  "other"
]);

export const familySupportTypeSchema = z.enum([
  "not_set",
  "none",
  "possible",
  "confirmed",
  "private"
]);

export const loanConsiderationStatusSchema = z.enum([
  "not_set",
  "not_considering",
  "considering",
  "already_using",
  "private"
]);

export const childrenPlanStatusSchema = z.enum([
  "not_set",
  "planning",
  "not_planning",
  "undecided",
  "private"
]);

export const preferredWeddingStyleSchema = z.enum([
  "not_set",
  "small",
  "standard",
  "hotel",
  "church",
  "outdoor",
  "family_only",
  "undecided",
  "other"
]);

const onboardingDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "날짜는 YYYY-MM-DD 형식이어야 합니다."
});

export const savePersonalOnboardingInputSchema = z.object({
  assetRange: onboardingRangeSchema.optional(),
  incomeRange: onboardingRangeSchema.optional(),
  nickname: z.string().trim().min(1).max(80).optional(),
  phoneVerified: z.boolean().optional(),
  visibilityPreference: onboardingVisibilityPreferenceSchema.optional(),
  workRegion: z.string().trim().min(1).max(80).optional()
});

export const saveCoupleOnboardingInputSchema = z.object({
  cashOnHandRange: onboardingRangeSchema.optional(),
  childrenPlanStatus: childrenPlanStatusSchema.optional(),
  familySupportType: familySupportTypeSchema.optional(),
  housingType: housingTypeSchema.optional(),
  loanConsiderationStatus: loanConsiderationStatusSchema.optional(),
  moveInPlanAt: onboardingDateSchema.optional(),
  preferredResidenceRegion: z.string().trim().min(1).max(80).optional(),
  preferredWeddingStyle: preferredWeddingStyleSchema.optional(),
  totalBudgetRange: budgetRangeSchema.optional(),
  weddingDate: onboardingDateSchema.optional(),
  weddingRegion: z.string().trim().min(1).max(80).optional()
});

export const completeOnboardingInputSchema = z.object({
  confirm: z.literal(true)
});

export const scenarioCalculationVersionSchema = z.literal("scenario-engine-v1");

export const scenarioCategorySchema = z.enum([
  "wedding",
  "housing_initial",
  "housing_monthly",
  "furniture",
  "appliance",
  "honeymoon",
  "living_setup",
  "misc"
]);

export const scenarioAmountTypeSchema = z.enum([
  "user_input",
  "sample",
  "admin_default",
  "partner_price_snapshot"
]);

export const scenarioFrequencySchema = z.enum(["one_time", "monthly"]);

export const scenarioStatusSchema = z.enum(["draft", "completed", "archived"]);

const scenarioAmountSchema = z
  .number()
  .int()
  .min(0)
  .max(999_999_999_999, "금액은 원화 정수로 입력해 주세요.");

export const scenarioBudgetBasisInputSchema = z.object({
  availableBudgetAmount: scenarioAmountSchema.optional()
});

export const scenarioItemInputSchema = z.object({
  amount: scenarioAmountSchema,
  amountType: scenarioAmountTypeSchema.default("user_input"),
  category: scenarioCategorySchema,
  frequency: scenarioFrequencySchema.default("one_time"),
  isRequired: z.boolean().default(false),
  label: z.string().trim().min(1).max(80),
  note: z.string().trim().max(500).optional(),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
  sourceType: z.string().trim().min(1).max(80).optional(),
  sourceUrl: z.string().trim().url().max(500).optional()
});

export const createScenarioInputSchema = z.object({
  budgetBasis: scenarioBudgetBasisInputSchema.optional(),
  items: z.array(scenarioItemInputSchema).min(1).max(40),
  title: z.string().trim().min(1).max(80),
  useOnboardingDefaults: z.boolean().default(true)
});

export const updateScenarioInputSchema = z
  .object({
    budgetBasis: scenarioBudgetBasisInputSchema.optional(),
    items: z.array(scenarioItemInputSchema).min(1).max(40).optional(),
    status: scenarioStatusSchema.optional(),
    title: z.string().trim().min(1).max(80).optional()
  })
  .refine((value) => value.title || value.status || value.items || value.budgetBasis, {
    message: "수정할 값이 필요합니다."
  });

export const evaluateScenarioInputSchema = z.object({
  calculationVersion: scenarioCalculationVersionSchema.optional()
});

export const listScenariosQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: scenarioStatusSchema.optional()
});

export const policyProgramStatusSchema = z.enum([
  "draft",
  "active",
  "expired",
  "hidden",
  "retired"
]);

export const policyRuleStatusSchema = z.enum(["draft", "active", "retired"]);

export const policyResultStatusSchema = z.enum([
  "likely_eligible",
  "maybe_eligible",
  "not_eligible",
  "need_more_info",
  "expired",
  "unknown"
]);

export const policyRuleOperatorSchema = z.enum([
  "in",
  "not_in",
  "exists",
  "date_between",
  "range_in",
  "equals"
]);

const policyDateTimeInputSchema = z.string().trim().datetime();

function hasResidentRegistrationNumberLikeInput(value: unknown): boolean {
  if (typeof value === "string") {
    return (
      /residentRegistrationNumber|resident_registration_number|jumin|rrn|주민등록|주민번호/i.test(
        value
      ) || /\b\d{6}-?[1-4]\d{6}\b/.test(value)
    );
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasResidentRegistrationNumberLikeInput(item));
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value).some(
      ([key, item]) =>
        hasResidentRegistrationNumberLikeInput(key) || hasResidentRegistrationNumberLikeInput(item)
    );
  }

  return false;
}

const residentRegistrationNumberGuard = (value: unknown, ctx: z.RefinementCtx) => {
  if (hasResidentRegistrationNumberLikeInput(value)) {
    ctx.addIssue({
      code: "custom",
      message: "주민등록번호 또는 이를 추정할 수 있는 값은 입력할 수 없습니다."
    });
  }
};

export const policyRuleConditionSchema = z.object({
  inputKey: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120).optional(),
  operator: policyRuleOperatorSchema,
  reason: z.string().trim().min(1).max(240).optional(),
  value: z.unknown().optional()
});

export const policyEligibilityCriteriaSchema = z
  .object({
    conditions: z.array(policyRuleConditionSchema).min(1).max(40),
    mode: z.enum(["all", "any"]).default("all"),
    sample: z.boolean().default(true)
  })
  .superRefine(residentRegistrationNumberGuard);

export const policyRequiredInputSchema = z.object({
  description: z.string().trim().max(240).optional(),
  key: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120)
});

export const policyRequiredDocumentSchema = z.object({
  description: z.string().trim().max(240).optional(),
  key: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  required: z.boolean().default(true)
});

export const createPolicyProgramInputSchema = z.object({
  applicationEndAt: policyDateTimeInputSchema.optional(),
  applicationStartAt: policyDateTimeInputSchema.optional(),
  category: z.string().trim().min(1).max(80),
  cautionText: z.string().trim().min(1).max(500).optional(),
  name: z.string().trim().min(1).max(120),
  providerName: z.string().trim().min(1).max(120),
  region: z.string().trim().min(1).max(80).optional(),
  requiredDocumentsSummary: z.array(policyRequiredDocumentSchema).max(20).optional(),
  sourceUpdatedAt: policyDateTimeInputSchema.optional(),
  sourceUrl: z.string().trim().url().max(500),
  status: policyProgramStatusSchema.default("draft"),
  summary: z.string().trim().min(1).max(500),
  verifiedAt: policyDateTimeInputSchema.optional()
});

export const updatePolicyProgramInputSchema = createPolicyProgramInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "수정할 값이 필요합니다."
  });

export const createPolicyRuleVersionInputSchema = z
  .object({
    effectiveFrom: policyDateTimeInputSchema.optional(),
    effectiveTo: policyDateTimeInputSchema.optional(),
    eligibilityCriteria: policyEligibilityCriteriaSchema,
    requiredDocuments: z.array(policyRequiredDocumentSchema).max(30).default([]),
    requiredInputs: z.array(policyRequiredInputSchema).min(1).max(30),
    resultReasonTemplate: z
      .object({
        expired: z.string().trim().min(1).max(240).optional(),
        likely_eligible: z.string().trim().min(1).max(240).optional(),
        maybe_eligible: z.string().trim().min(1).max(240).optional(),
        need_more_info: z.string().trim().min(1).max(240).optional(),
        not_eligible: z.string().trim().min(1).max(240).optional(),
        unknown: z.string().trim().min(1).max(240).optional()
      })
      .default({}),
    ruleSummary: z.string().trim().min(1).max(500),
    sourceUpdatedAt: policyDateTimeInputSchema.optional(),
    sourceUrl: z.string().trim().url().max(500),
    status: policyRuleStatusSchema.default("draft"),
    verifiedAt: policyDateTimeInputSchema.optional(),
    version: z.number().int().min(1).max(10_000).optional()
  })
  .superRefine(residentRegistrationNumberGuard);

export const listPolicyProgramsQuerySchema = z.object({
  category: z.string().trim().min(1).max(80).optional(),
  includeInactive: z.coerce.boolean().default(false),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  region: z.string().trim().min(1).max(80).optional()
});

export const runPolicyCheckInputSchema = z
  .object({
    additionalInputs: z.record(z.string(), z.unknown()).default({}),
    policyProgramIds: z.array(z.string().uuid()).max(20).optional()
  })
  .superRefine(residentRegistrationNumberGuard);

export const listEligibilityResultsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  policyProgramId: z.string().uuid().optional(),
  resultStatus: policyResultStatusSchema.optional()
});

export const createEligibilityDocumentTasksInputSchema = z.object({
  dueInDays: z.number().int().min(1).max(90).default(14)
});

const workspaceDateTimeInputSchema = z.string().trim().datetime();

const workspaceSourceTypeSchema = z.string().trim().min(1).max(80);

export const documentStatusSchema = z.enum([
  "needed",
  "preparing",
  "ready",
  "attached",
  "submitted",
  "expired"
]);

export const taskStatusSchema = z.enum(["open", "in_progress", "done", "canceled"]);

export const notificationStatusSchema = z.enum(["scheduled", "sent", "read", "dismissed"]);

export const createDocumentInputSchema = z.object({
  documentType: z.string().trim().min(1).max(80),
  dueAt: workspaceDateTimeInputSchema.optional(),
  ownerCoupleMemberId: z.string().uuid().optional(),
  sourceId: z.string().uuid().optional(),
  sourceType: workspaceSourceTypeSchema.optional(),
  title: z.string().trim().min(1).max(120)
});

export const updateDocumentInputSchema = z
  .object({
    dueAt: workspaceDateTimeInputSchema.nullable().optional(),
    ownerCoupleMemberId: z.string().uuid().nullable().optional(),
    status: documentStatusSchema.optional(),
    title: z.string().trim().min(1).max(120).optional()
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.status !== undefined ||
      value.ownerCoupleMemberId !== undefined ||
      value.dueAt !== undefined,
    {
      message: "수정할 값이 필요합니다."
    }
  );

export const prepareDocumentAttachmentInputSchema = z.object({
  contentType: z.string().trim().min(1).max(120),
  fileName: z.string().trim().min(1).max(180),
  size: z
    .number()
    .int()
    .min(1)
    .max(15 * 1024 * 1024)
});

export const listDocumentsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sourceType: workspaceSourceTypeSchema.optional(),
  status: documentStatusSchema.optional()
});

export const createTaskInputSchema = z.object({
  assignedCoupleMemberId: z.string().uuid().optional(),
  description: z.string().trim().max(500).optional(),
  dueAt: workspaceDateTimeInputSchema.optional(),
  sourceId: z.string().uuid().optional(),
  sourceType: workspaceSourceTypeSchema.optional(),
  title: z.string().trim().min(1).max(120)
});

export const updateTaskInputSchema = z
  .object({
    assignedCoupleMemberId: z.string().uuid().nullable().optional(),
    description: z.string().trim().max(500).nullable().optional(),
    dueAt: workspaceDateTimeInputSchema.nullable().optional(),
    status: taskStatusSchema.optional(),
    title: z.string().trim().min(1).max(120).optional()
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.status !== undefined ||
      value.assignedCoupleMemberId !== undefined ||
      value.dueAt !== undefined,
    {
      message: "수정할 값이 필요합니다."
    }
  );

export const completeTaskInputSchema = z.object({
  completed: z.boolean()
});

export const listTasksQuerySchema = z.object({
  assignee: z.string().trim().min(1).max(80).optional(),
  dueBefore: workspaceDateTimeInputSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
  status: taskStatusSchema.optional()
});

export const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: notificationStatusSchema.optional()
});

export const readNotificationInputSchema = z.object({
  read: z.boolean()
});

const contentDateTimeInputSchema = z.string().trim().datetime();

export const articleStatusSchema = z.enum(["draft", "published", "archived"]);

export const createArticleInputSchema = z.object({
  body: z.string().trim().min(1).max(20_000),
  category: z.string().trim().min(1).max(80),
  ogImageUrl: z.string().trim().url().max(500).optional(),
  publishedAt: contentDateTimeInputSchema.optional(),
  seoDescription: z.string().trim().min(1).max(180).optional(),
  seoTitle: z.string().trim().min(1).max(80).optional(),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다."),
  status: articleStatusSchema.default("draft"),
  summary: z.string().trim().min(1).max(500).optional(),
  title: z.string().trim().min(1).max(120)
});

export const updateArticleInputSchema = createArticleInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "수정할 값이 필요합니다."
  });

export const publishArticleInputSchema = z.object({
  publish: z.boolean()
});

export const listArticlesQuerySchema = z.object({
  category: z.string().trim().min(1).max(80).optional(),
  includeDrafts: z.coerce.boolean().default(false),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: articleStatusSchema.optional()
});

export const analyticsEventNameSchema = z.enum([
  "account_created",
  "couple_created",
  "partner_invited",
  "partner_joined",
  "onboarding_started",
  "onboarding_completed",
  "scenario_created",
  "scenario_evaluated",
  "policy_check_started",
  "policy_check_completed",
  "offer_viewed",
  "offer_compared",
  "compare_room_created",
  "approval_submitted",
  "both_approved",
  "lead_submitted",
  "content_viewed",
  "calculator_started",
  "task_completed"
]);

export const analyticsSourceSchema = z.enum(["admin", "api", "system", "web"]);

export const createAnalyticsEventInputSchema = z.object({
  anonymousId: z.string().trim().min(3).max(120).optional(),
  coupleId: z.string().uuid().optional(),
  eventName: analyticsEventNameSchema,
  occurredAt: contentDateTimeInputSchema.optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
  source: analyticsSourceSchema.default("web")
});

export const listAnalyticsFunnelQuerySchema = z
  .object({
    from: contentDateTimeInputSchema.optional(),
    source: analyticsSourceSchema.optional(),
    to: contentDateTimeInputSchema.optional()
  })
  .refine(
    (value) =>
      !value.from || !value.to || new Date(value.from).getTime() <= new Date(value.to).getTime(),
    {
      message: "from은 to보다 늦을 수 없습니다.",
      path: ["from"]
    }
  );

const offerDateTimeInputSchema = z.string().trim().datetime();

const offerPriceAmountSchema = z
  .number()
  .int()
  .min(0)
  .max(999_999_999_999, "금액은 원화 정수로 입력해 주세요.");

export const vendorStatusSchema = z.enum(["draft", "active", "paused", "archived"]);

export const vendorVerificationStatusSchema = z.enum([
  "verified",
  "unverified",
  "needs_review",
  "rejected"
]);

export const offerStatusSchema = z.enum(["draft", "active", "paused", "sold_out", "archived"]);

export const offerVerificationStatusSchema = z.enum([
  "verified",
  "unverified",
  "needs_review",
  "expired",
  "rejected"
]);

export const offerBudgetRangeSchema = z.enum(["under_1m", "1m_3m", "3m_5m", "5m_10m", "over_10m"]);

export const offerOptionPricingTypeSchema = z.enum(["fixed", "range", "quote_required"]);

export const offerIncludedItemSchema = z.object({
  description: z.string().trim().max(240).optional(),
  key: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  quantity: z.number().min(0).max(10_000).optional(),
  unit: z.string().trim().min(1).max(40).optional()
});

export const offerPriceOptionSchema = z
  .object({
    amount: offerPriceAmountSchema.optional(),
    appliesWhen: z.string().trim().max(240).optional(),
    includedInEstimatedTotal: z.boolean().optional(),
    key: z.string().trim().min(1).max(80),
    label: z.string().trim().min(1).max(120),
    maxAmount: offerPriceAmountSchema.optional(),
    minAmount: offerPriceAmountSchema.optional(),
    note: z.string().trim().max(240).optional(),
    pricingType: offerOptionPricingTypeSchema
  })
  .refine(
    (value) =>
      value.includedInEstimatedTotal !== true ||
      value.pricingType !== "fixed" ||
      typeof value.amount === "number",
    {
      message: "예상 총액에 반영하는 고정 옵션은 amount가 필요합니다.",
      path: ["amount"]
    }
  )
  .refine(
    (value) =>
      value.pricingType !== "range" ||
      (typeof value.minAmount === "number" &&
        typeof value.maxAmount === "number" &&
        value.minAmount <= value.maxAmount),
    {
      message: "범위 옵션은 minAmount와 maxAmount가 필요합니다.",
      path: ["minAmount"]
    }
  );

export const createVendorInputSchema = z.object({
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  name: z.string().trim().min(1).max(120),
  region: z.string().trim().min(1).max(80).optional(),
  status: vendorStatusSchema.default("draft"),
  verificationStatus: vendorVerificationStatusSchema.default("unverified"),
  verifiedAt: offerDateTimeInputSchema.optional()
});

export const updateVendorInputSchema = createVendorInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "수정할 값이 필요합니다."
  });

export const createOfferInputSchema = z.object({
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().max(1000).optional(),
  displayOrder: z.number().int().min(0).max(10_000).default(0),
  region: z.string().trim().min(1).max(80).optional(),
  status: offerStatusSchema.default("draft"),
  summary: z.string().trim().min(1).max(500),
  title: z.string().trim().min(1).max(120),
  vendorBranchId: z.string().uuid().optional()
});

export const updateOfferInputSchema = createOfferInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "수정할 값이 필요합니다."
  });

export const createOfferPriceVersionInputSchema = z.object({
  additionalCostNote: z.string().trim().max(500).optional(),
  basePrice: offerPriceAmountSchema,
  cancellationPolicySummary: z.string().trim().max(500).optional(),
  estimatedTotalPrice: offerPriceAmountSchema.optional(),
  includedItems: z.array(offerIncludedItemSchema).min(1).max(40),
  optionalOptions: z.array(offerPriceOptionSchema).max(40).default([]),
  requiredOptions: z
    .array(
      offerPriceOptionSchema.transform((option) => ({
        ...option,
        includedInEstimatedTotal: option.includedInEstimatedTotal !== false
      }))
    )
    .max(40)
    .default([]),
  sourceType: z.string().trim().min(1).max(80).optional(),
  sourceUrl: z.string().trim().url().max(500).optional(),
  validFrom: offerDateTimeInputSchema.optional(),
  validUntil: offerDateTimeInputSchema.optional(),
  verificationStatus: offerVerificationStatusSchema.default("unverified"),
  verifiedAt: offerDateTimeInputSchema.optional(),
  version: z.number().int().min(1).max(10_000).optional()
});

export const updateOfferPriceVersionInputSchema = z.object({
  verificationStatus: offerVerificationStatusSchema,
  verifiedAt: offerDateTimeInputSchema.optional()
});

export const listVendorsQuerySchema = z.object({
  category: z.string().trim().min(1).max(80).optional(),
  includeInactive: z.coerce.boolean().default(false),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  region: z.string().trim().min(1).max(80).optional(),
  verificationStatus: vendorVerificationStatusSchema.optional()
});

export const listOffersQuerySchema = z.object({
  budgetRange: offerBudgetRangeSchema.optional(),
  category: z.string().trim().min(1).max(80).optional(),
  includeUnverified: z.coerce.boolean().default(false),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  region: z.string().trim().min(1).max(80).optional(),
  validOnly: z.coerce.boolean().default(true),
  vendorId: z.string().uuid().optional()
});

export const compareRoomStatusSchema = z.enum([
  "draft",
  "shared",
  "waiting_partner",
  "both_approved",
  "rejected",
  "archived"
]);

export const approvalStatusSchema = z.enum(["pending", "approved", "hold", "rejected"]);

export const leadRequestStatusSchema = z.enum([
  "submitted",
  "viewed",
  "accepted",
  "contacted",
  "booked",
  "rejected",
  "expired"
]);

export const leadContactMethodSchema = z.enum(["phone", "sms", "email", "kakao", "other"]);

export const leadContactWindowSchema = z.enum(["morning", "afternoon", "evening", "any"]);

export const leadPreferredContactDateSchema = z.object({
  date: onboardingDateSchema,
  window: leadContactWindowSchema.default("any")
});

export const createCompareRoomInputSchema = z
  .object({
    initialOfferId: z.string().uuid().optional(),
    offerPriceVersionId: z.string().uuid().optional(),
    title: z.string().trim().min(1).max(120)
  })
  .refine((value) => value.initialOfferId || !value.offerPriceVersionId, {
    message: "가격 버전을 지정하려면 상품도 함께 지정해야 합니다.",
    path: ["initialOfferId"]
  });

export const updateCompareRoomInputSchema = z
  .object({
    status: compareRoomStatusSchema.optional(),
    title: z.string().trim().min(1).max(120).optional()
  })
  .refine((value) => value.title || value.status, {
    message: "수정할 값이 필요합니다."
  });

export const addCompareCardInputSchema = z.object({
  offerId: z.string().uuid(),
  offerPriceVersionId: z.string().uuid().optional()
});

export const submitApprovalInputSchema = z.object({
  comment: z.string().trim().max(500).optional(),
  status: z.enum(["approved", "hold", "rejected"])
});

export const createCompareCommentInputSchema = z.object({
  body: z.string().trim().min(1).max(1000),
  compareCardId: z.string().uuid().optional()
});

export const listCompareRoomsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: compareRoomStatusSchema.optional()
});

export const createLeadRequestInputSchema = z.object({
  compareCardId: z.string().uuid().optional(),
  contactName: z.string().trim().min(1).max(80),
  contactPhone: z.string().trim().min(7).max(30),
  message: z.string().trim().max(1000).optional(),
  preferredContactDates: z.array(leadPreferredContactDateSchema).min(1).max(3),
  preferredContactMethod: leadContactMethodSchema,
  privacyConsent: z.boolean()
});

export const listLeadRequestsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: leadRequestStatusSchema.optional(),
  submittedFrom: z.string().datetime().optional(),
  submittedTo: z.string().datetime().optional(),
  vendorId: z.string().uuid().optional()
});

export const updateLeadStatusInputSchema = z.object({
  reason: z.string().trim().max(500).optional(),
  status: leadRequestStatusSchema
});

export type CreateCoupleInput = z.infer<typeof createCoupleInputSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationInputSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationInputSchema>;
export type OnboardingRange = z.infer<typeof onboardingRangeSchema>;
export type OnboardingStatus = z.infer<typeof onboardingStatusSchema>;
export type OnboardingVisibilityPreference = z.infer<typeof onboardingVisibilityPreferenceSchema>;
export type SavePersonalOnboardingInput = z.infer<typeof savePersonalOnboardingInputSchema>;
export type SaveCoupleOnboardingInput = z.infer<typeof saveCoupleOnboardingInputSchema>;
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingInputSchema>;
export type ScenarioCategory = z.infer<typeof scenarioCategorySchema>;
export type ScenarioAmountType = z.infer<typeof scenarioAmountTypeSchema>;
export type ScenarioFrequency = z.infer<typeof scenarioFrequencySchema>;
export type ScenarioStatus = z.infer<typeof scenarioStatusSchema>;
export type ScenarioBudgetBasisInput = z.infer<typeof scenarioBudgetBasisInputSchema>;
export type ScenarioItemInput = z.infer<typeof scenarioItemInputSchema>;
export type CreateScenarioInput = z.infer<typeof createScenarioInputSchema>;
export type UpdateScenarioInput = z.infer<typeof updateScenarioInputSchema>;
export type EvaluateScenarioInput = z.infer<typeof evaluateScenarioInputSchema>;
export type ListScenariosQuery = z.infer<typeof listScenariosQuerySchema>;
export type PolicyProgramStatus = z.infer<typeof policyProgramStatusSchema>;
export type PolicyRuleStatus = z.infer<typeof policyRuleStatusSchema>;
export type PolicyResultStatus = z.infer<typeof policyResultStatusSchema>;
export type PolicyRuleOperator = z.infer<typeof policyRuleOperatorSchema>;
export type PolicyRuleCondition = z.infer<typeof policyRuleConditionSchema>;
export type PolicyEligibilityCriteria = z.infer<typeof policyEligibilityCriteriaSchema>;
export type PolicyRequiredInput = z.infer<typeof policyRequiredInputSchema>;
export type PolicyRequiredDocument = z.infer<typeof policyRequiredDocumentSchema>;
export type CreatePolicyProgramInput = z.infer<typeof createPolicyProgramInputSchema>;
export type UpdatePolicyProgramInput = z.infer<typeof updatePolicyProgramInputSchema>;
export type CreatePolicyRuleVersionInput = z.infer<typeof createPolicyRuleVersionInputSchema>;
export type ListPolicyProgramsQuery = z.infer<typeof listPolicyProgramsQuerySchema>;
export type RunPolicyCheckInput = z.infer<typeof runPolicyCheckInputSchema>;
export type ListEligibilityResultsQuery = z.infer<typeof listEligibilityResultsQuerySchema>;
export type CreateEligibilityDocumentTasksInput = z.infer<
  typeof createEligibilityDocumentTasksInputSchema
>;
export type DocumentStatus = z.infer<typeof documentStatusSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type NotificationStatus = z.infer<typeof notificationStatusSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentInputSchema>;
export type PrepareDocumentAttachmentInput = z.infer<typeof prepareDocumentAttachmentInputSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskInputSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
export type ReadNotificationInput = z.infer<typeof readNotificationInputSchema>;
export type ArticleStatus = z.infer<typeof articleStatusSchema>;
export type CreateArticleInput = z.infer<typeof createArticleInputSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleInputSchema>;
export type PublishArticleInput = z.infer<typeof publishArticleInputSchema>;
export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>;
export type AnalyticsEventNameInput = z.infer<typeof analyticsEventNameSchema>;
export type AnalyticsSource = z.infer<typeof analyticsSourceSchema>;
export type CreateAnalyticsEventInput = z.infer<typeof createAnalyticsEventInputSchema>;
export type ListAnalyticsFunnelQuery = z.infer<typeof listAnalyticsFunnelQuerySchema>;
export type VendorStatus = z.infer<typeof vendorStatusSchema>;
export type VendorVerificationStatus = z.infer<typeof vendorVerificationStatusSchema>;
export type OfferStatus = z.infer<typeof offerStatusSchema>;
export type OfferVerificationStatus = z.infer<typeof offerVerificationStatusSchema>;
export type OfferBudgetRange = z.infer<typeof offerBudgetRangeSchema>;
export type OfferOptionPricingType = z.infer<typeof offerOptionPricingTypeSchema>;
export type OfferIncludedItem = z.infer<typeof offerIncludedItemSchema>;
export type OfferPriceOption = z.infer<typeof offerPriceOptionSchema>;
export type CreateVendorInput = z.infer<typeof createVendorInputSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorInputSchema>;
export type CreateOfferInput = z.infer<typeof createOfferInputSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferInputSchema>;
export type CreateOfferPriceVersionInput = z.infer<typeof createOfferPriceVersionInputSchema>;
export type UpdateOfferPriceVersionInput = z.infer<typeof updateOfferPriceVersionInputSchema>;
export type ListVendorsQuery = z.infer<typeof listVendorsQuerySchema>;
export type ListOffersQuery = z.infer<typeof listOffersQuerySchema>;
export type CompareRoomStatus = z.infer<typeof compareRoomStatusSchema>;
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
export type CreateCompareRoomInput = z.infer<typeof createCompareRoomInputSchema>;
export type UpdateCompareRoomInput = z.infer<typeof updateCompareRoomInputSchema>;
export type AddCompareCardInput = z.infer<typeof addCompareCardInputSchema>;
export type SubmitApprovalInput = z.infer<typeof submitApprovalInputSchema>;
export type CreateCompareCommentInput = z.infer<typeof createCompareCommentInputSchema>;
export type ListCompareRoomsQuery = z.infer<typeof listCompareRoomsQuerySchema>;
export type LeadRequestStatus = z.infer<typeof leadRequestStatusSchema>;
export type CreateLeadRequestInput = z.infer<typeof createLeadRequestInputSchema>;
export type ListLeadRequestsQuery = z.infer<typeof listLeadRequestsQuerySchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusInputSchema>;
