import { expect, test, type APIRequestContext } from "@playwright/test";

const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";

type ApiEnvelope<T> = {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

type RegisterResponse = {
  accessToken: string;
  couple: {
    id: string;
  };
  user: {
    id: string;
  };
};

type InvitationResponse = {
  token: string;
};

type ScenarioResponse = {
  scenario: {
    id: string;
  };
};

type OfferListResponse = {
  offers: Array<{
    id: string;
    title: string;
  }>;
};

type CompareRoomResponse = {
  cardId?: string;
  compareRoom: {
    id: string;
    status: string;
  };
};

type LeadRequestResponse = {
  leadRequest: {
    id: string;
  };
};

type AdminLeadListResponse = {
  leadRequests: Array<{
    id: string;
  }>;
};

type LoginResponse = {
  accessToken: string;
};

async function apiRequest<T>(
  request: APIRequestContext,
  path: string,
  options: { body?: unknown; method?: "GET" | "PATCH" | "POST"; token?: string } = {}
) {
  const response = await request.fetch(`${API_BASE_URL}${path}`, {
    data: options.body,
    headers: options.token
      ? {
          Authorization: `Bearer ${options.token}`
        }
      : undefined,
    method: options.method ?? "GET"
  });
  const payload = (await response.json()) as ApiEnvelope<T>;

  return {
    payload,
    response
  };
}

function requireData<T>(payload: ApiEnvelope<T>): T {
  if (!payload.data) {
    throw new Error(`Expected data payload, received ${JSON.stringify(payload.error)}`);
  }

  return payload.data;
}

function uniqueEmail(label: string) {
  return `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function registerUser(
  request: APIRequestContext,
  input: {
    coupleDisplayName?: string;
    displayName: string;
    invitationToken?: string;
  }
) {
  const { payload, response } = await apiRequest<RegisterResponse>(request, "/auth/register", {
    body: {
      coupleDisplayName: input.coupleDisplayName,
      displayName: input.displayName,
      email: uniqueEmail(input.displayName),
      invitationToken: input.invitationToken,
      privacyAccepted: true,
      termsAccepted: true
    },
    method: "POST"
  });

  expect(response.status()).toBe(201);

  return requireData(payload);
}

async function saveOnboarding(request: APIRequestContext, user: RegisterResponse) {
  await apiRequest(request, `/couples/${user.couple.id}/onboarding/me`, {
    body: {
      assetRange: "50m_100m",
      incomeRange: "50m_100m",
      nickname: "테스트",
      phoneVerified: true,
      visibilityPreference: {
        asset: "summary",
        income: "summary"
      },
      workRegion: "서울"
    },
    method: "PATCH",
    token: user.accessToken
  });
}

async function saveCoupleOnboarding(request: APIRequestContext, user: RegisterResponse) {
  await apiRequest(request, `/couples/${user.couple.id}/onboarding/couple`, {
    body: {
      cashOnHandRange: "50m_100m",
      childrenPlanStatus: "undecided",
      familySupportType: "possible",
      housingType: "rental_jeonse",
      loanConsiderationStatus: "considering",
      moveInPlanAt: "2027-03-01",
      preferredResidenceRegion: "서울",
      preferredWeddingStyle: "small",
      totalBudgetRange: "100m_200m",
      weddingDate: "2027-05-15",
      weddingRegion: "서울"
    },
    method: "PATCH",
    token: user.accessToken
  });
}

async function completeOnboarding(request: APIRequestContext, user: RegisterResponse) {
  const { response } = await apiRequest(request, `/couples/${user.couple.id}/onboarding/complete`, {
    body: {
      confirm: true
    },
    method: "POST",
    token: user.accessToken
  });

  expect(response.ok()).toBe(true);
}

test("core newlywed journey reaches admin lead review and survives mobile refresh", async ({
  page,
  request
}) => {
  expect(page.viewportSize()?.width).toBeLessThanOrEqual(414);

  await page.goto("/offers");
  await expect(page.getByRole("heading", { name: "파트너 상품" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "가입이 필요합니다" })).toBeVisible();

  const { payload: validationPayload, response: validationResponse } = await apiRequest(
    request,
    "/auth/register",
    {
      body: {
        coupleDisplayName: "검증 실패 커플",
        displayName: "",
        email: "not-an-email",
        privacyAccepted: false,
        termsAccepted: true
      },
      method: "POST"
    }
  );
  expect(validationResponse.status()).toBe(400);
  expect(validationPayload.error?.code).toBe("VALIDATION_ERROR");

  const owner = await registerUser(request, {
    coupleDisplayName: "E2E 신혼 커플",
    displayName: "e2e-owner"
  });
  const { payload: invitationPayload } = await apiRequest<InvitationResponse>(
    request,
    `/couples/${owner.couple.id}/invitations`,
    {
      body: {
        expiresInHours: 24
      },
      method: "POST",
      token: owner.accessToken
    }
  );
  const partner = await registerUser(request, {
    displayName: "e2e-partner",
    invitationToken: requireData(invitationPayload).token
  });

  await saveOnboarding(request, owner);
  await saveCoupleOnboarding(request, owner);
  await saveOnboarding(request, partner);
  await completeOnboarding(request, owner);
  await completeOnboarding(request, partner);

  const { payload: scenarioPayload, response: scenarioResponse } =
    await apiRequest<ScenarioResponse>(request, `/couples/${owner.couple.id}/scenarios`, {
      body: {
        budgetBasis: {
          availableBudgetAmount: 90_000_000
        },
        items: [
          {
            amount: 80_000_000,
            amountType: "user_input",
            category: "housing_initial",
            label: "전세 보증금",
            frequency: "one_time",
            isRequired: true
          },
          {
            amount: 12_000_000,
            amountType: "user_input",
            category: "wedding",
            label: "예식 준비",
            frequency: "one_time",
            isRequired: true
          }
        ],
        title: "E2E 예산 시나리오"
      },
      method: "POST",
      token: owner.accessToken
    });
  expect(scenarioResponse.status()).toBe(201);
  const scenario = requireData(scenarioPayload).scenario;

  await apiRequest(request, `/scenarios/${scenario.id}/evaluate`, {
    body: {
      calculationVersion: "scenario-engine-v1"
    },
    method: "POST",
    token: owner.accessToken
  });

  const { response: policyResponse } = await apiRequest(
    request,
    `/couples/${owner.couple.id}/policy-checks`,
    {
      body: {
        additionalInputs: {}
      },
      method: "POST",
      token: owner.accessToken
    }
  );
  expect(policyResponse.status()).toBe(201);

  const { payload: offerPayload } = await apiRequest<OfferListResponse>(
    request,
    "/offers?limit=10",
    {
      token: owner.accessToken
    }
  );
  const offers = requireData(offerPayload).offers;
  expect(offers.length).toBeGreaterThanOrEqual(2);

  const { payload: roomPayload, response: roomResponse } = await apiRequest<CompareRoomResponse>(
    request,
    `/couples/${owner.couple.id}/compare-rooms`,
    {
      body: {
        initialOfferId: offers[0]!.id,
        title: "E2E 비교방"
      },
      method: "POST",
      token: owner.accessToken
    }
  );
  expect(roomResponse.status()).toBe(201);
  const room = requireData(roomPayload).compareRoom;

  const { payload: cardPayload } = await apiRequest<CompareRoomResponse>(
    request,
    `/compare-rooms/${room.id}/cards`,
    {
      body: {
        offerId: offers[1]!.id
      },
      method: "POST",
      token: owner.accessToken
    }
  );
  const leadCompareCardId = requireData(cardPayload).cardId;

  expect(leadCompareCardId).toBeTruthy();

  await apiRequest(request, `/compare-rooms/${room.id}/approvals/me`, {
    body: {
      status: "approved"
    },
    method: "POST",
    token: owner.accessToken
  });
  const { payload: approvalPayload } = await apiRequest<CompareRoomResponse>(
    request,
    `/compare-rooms/${room.id}/approvals/me`,
    {
      body: {
        status: "approved"
      },
      method: "POST",
      token: partner.accessToken
    }
  );
  expect(requireData(approvalPayload).compareRoom.status).toBe("both_approved");

  const { payload: leadPayload, response: leadResponse } = await apiRequest<LeadRequestResponse>(
    request,
    `/compare-rooms/${room.id}/lead-requests`,
    {
      body: {
        compareCardId: leadCompareCardId,
        contactName: "홍길동",
        contactPhone: "010-1234-5678",
        preferredContactDates: [
          {
            date: "2027-06-01",
            window: "afternoon"
          }
        ],
        preferredContactMethod: "phone",
        privacyConsent: true
      },
      method: "POST",
      token: owner.accessToken
    }
  );
  expect(leadResponse.status()).toBe(201);
  const lead = requireData(leadPayload).leadRequest;

  const { response: unauthorizedResponse } = await apiRequest(request, "/admin/lead-requests", {
    token: owner.accessToken
  });
  expect(unauthorizedResponse.status()).toBe(403);

  const { payload: adminPayload } = await apiRequest<LoginResponse>(request, "/auth/login", {
    body: {
      authProvider: "seed",
      authProviderUserId: "seed-user-1"
    },
    method: "POST"
  });
  const admin = requireData(adminPayload);
  const { payload: adminLeadPayload } = await apiRequest<AdminLeadListResponse>(
    request,
    "/admin/lead-requests?limit=50",
    {
      token: admin.accessToken
    }
  );
  expect(requireData(adminLeadPayload).leadRequests.some((item) => item.id === lead.id)).toBe(true);

  await page.evaluate((token) => {
    localStorage.setItem("sinhon_os_access_token", token);
  }, owner.accessToken);
  await page.goto("/scenarios");
  await expect(page.getByRole("heading", { name: "예상 비용 만들기" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "예상 비용 만들기" })).toBeVisible();
});
