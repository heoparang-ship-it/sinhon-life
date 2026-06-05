import {
  acceptInvitationInputSchema,
  addCompareCardInputSchema,
  completeTaskInputSchema,
  completeOnboardingInputSchema,
  createAnalyticsEventInputSchema,
  createCompareCommentInputSchema,
  createCompareRoomInputSchema,
  createDocumentInputSchema,
  createEligibilityDocumentTasksInputSchema,
  createInvitationInputSchema,
  createArticleInputSchema,
  createLeadRequestInputSchema,
  createOfferInputSchema,
  createOfferPriceVersionInputSchema,
  createPolicyProgramInputSchema,
  createPolicyRuleVersionInputSchema,
  createScenarioInputSchema,
  createTaskInputSchema,
  createVendorInputSchema,
  evaluateScenarioInputSchema,
  listAnalyticsFunnelQuerySchema,
  listArticlesQuerySchema,
  listCompareRoomsQuerySchema,
  listDocumentsQuerySchema,
  listEligibilityResultsQuerySchema,
  listLeadRequestsQuerySchema,
  listNotificationsQuerySchema,
  listOffersQuerySchema,
  listPolicyProgramsQuerySchema,
  listScenariosQuerySchema,
  listTasksQuerySchema,
  listVendorsQuerySchema,
  loginInputSchema,
  prepareDocumentAttachmentInputSchema,
  publishArticleInputSchema,
  readNotificationInputSchema,
  registerInputSchema,
  runPolicyCheckInputSchema,
  saveCoupleOnboardingInputSchema,
  savePersonalOnboardingInputSchema,
  submitApprovalInputSchema,
  updateCompareRoomInputSchema,
  updateArticleInputSchema,
  updateDocumentInputSchema,
  updateLeadStatusInputSchema,
  updateOfferInputSchema,
  updateOfferPriceVersionInputSchema,
  updatePolicyProgramInputSchema,
  updateTaskInputSchema,
  updateScenarioInputSchema,
  updateVendorInputSchema
} from "@sinhon-os/schemas";
import { getPrismaClient } from "@sinhon-os/database";
import { randomUUID } from "node:crypto";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { ApiError, toErrorResponse } from "./api-errors.js";
import { type AnalyticsService, createAnalyticsService } from "./analytics-service.js";
import { type AuthService, createAuthService } from "./auth-service.js";
import { type CompareRoomService, createCompareRoomService } from "./compare-room-service.js";
import { type ContentService, createContentService } from "./content-service.js";
import { type LeadRequestService, createLeadRequestService } from "./lead-service.js";
import { type OfferService, createOfferService } from "./offer-service.js";
import { type OnboardingService, createOnboardingService } from "./onboarding-service.js";
import { type PolicyService, createPolicyService } from "./policy-service.js";
import { type ScenarioService, createScenarioService } from "./scenario-service.js";
import { assertPiiEncryptionConfigured } from "./sensitive-data.js";
import { type WorkspaceService, createWorkspaceService } from "./workspace-service.js";

export function buildHealthResponse() {
  return {
    app: "sinhon-os-api",
    status: "ok",
    database: "postgresql-ready",
    features:
      "auth-couple-invitation-onboarding-scenarios-policies-offers-compare-rooms-leads-workspace-content-analytics"
  } as const;
}

type CreateAppOptions = {
  analyticsService?: AnalyticsService;
  authService?: AuthService;
  compareRoomService?: CompareRoomService;
  contentService?: ContentService;
  leadRequestService?: LeadRequestService;
  offerService?: OfferService;
  onboardingService?: OnboardingService;
  policyService?: PolicyService;
  scenarioService?: ScenarioService;
  workspaceService?: WorkspaceService;
};

type Schema<T> = {
  parse: (value: unknown) => T;
};

type FlattenableError = {
  flatten: () => {
    fieldErrors?: Record<string, string[] | undefined>;
  };
};

function isFlattenableError(error: unknown): error is FlattenableError {
  return (
    typeof error === "object" &&
    error !== null &&
    "flatten" in error &&
    typeof error.flatten === "function"
  );
}

function getFieldErrors(error: unknown): Record<string, string[]> {
  if (!isFlattenableError(error)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors ?? {}).map(([field, messages]) => [
      field,
      (messages ?? []).filter((message): message is string => Boolean(message))
    ])
  );
}

function parseBody<T>(schema: Schema<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    throw new ApiError("VALIDATION_ERROR", "입력값을 확인해 주세요.", getFieldErrors(error));
  }
}

function getRequiredParam(request: Request, name: string): string {
  const rawValue = request.params[name];
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

  if (!value) {
    throw new ApiError("VALIDATION_ERROR", "요청 경로를 확인해 주세요.");
  }

  return value;
}

function getAuthTokenSecret(
  env: Partial<Record<"AUTH_TOKEN_SECRET" | "NODE_ENV", string | undefined>>
) {
  if (env.AUTH_TOKEN_SECRET) {
    if (env.NODE_ENV === "production" && env.AUTH_TOKEN_SECRET.includes("dev-only")) {
      throw new Error("AUTH_TOKEN_SECRET must not use a development value in production.");
    }

    return env.AUTH_TOKEN_SECRET;
  }

  if (env.NODE_ENV === "production") {
    throw new Error("AUTH_TOKEN_SECRET is required in production.");
  }

  return "dev-only-sinhon-os-secret";
}

function getAuthTokenTtlSeconds(
  env: Partial<Record<"AUTH_TOKEN_TTL_SECONDS", string | undefined>>
) {
  const rawValue = Number(env.AUTH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 7);

  return Number.isFinite(rawValue) && rawValue >= 300 ? rawValue : 60 * 60 * 24 * 7;
}

function getWebBaseUrl(env: Partial<Record<"NEXT_PUBLIC_WEB_BASE_URL", string | undefined>>) {
  return env.NEXT_PUBLIC_WEB_BASE_URL ?? "http://localhost:3000";
}

function createDefaultAuthService() {
  return createAuthService({
    authTokenSecret: getAuthTokenSecret(process.env),
    authTokenTtlSeconds: getAuthTokenTtlSeconds(process.env),
    prisma: getPrismaClient(),
    webBaseUrl: getWebBaseUrl(process.env)
  });
}

function createDefaultAnalyticsService() {
  return createAnalyticsService({
    prisma: getPrismaClient()
  });
}

function createDefaultOnboardingService() {
  return createOnboardingService({
    prisma: getPrismaClient()
  });
}

function createDefaultScenarioService() {
  return createScenarioService({
    prisma: getPrismaClient()
  });
}

function createDefaultPolicyService() {
  return createPolicyService({
    prisma: getPrismaClient()
  });
}

function createDefaultOfferService() {
  return createOfferService({
    prisma: getPrismaClient()
  });
}

function createDefaultCompareRoomService() {
  return createCompareRoomService({
    prisma: getPrismaClient()
  });
}

function createDefaultContentService() {
  return createContentService({
    prisma: getPrismaClient()
  });
}

function createDefaultLeadRequestService() {
  return createLeadRequestService({
    prisma: getPrismaClient()
  });
}

function createDefaultWorkspaceService() {
  return createWorkspaceService({
    prisma: getPrismaClient()
  });
}

function asyncRoute(handler: (request: Request, response: Response) => Promise<void> | void) {
  return (request: Request, response: Response, next: NextFunction) => {
    void Promise.resolve(handler(request, response)).catch(next);
  };
}

function parseOriginList(value: string | undefined) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  );
}

function getDefaultAllowedOrigins() {
  return new Set([
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002"
  ]);
}

function getAllowedOrigins(
  env: Partial<
    Record<"ADMIN_ALLOWED_ORIGINS" | "CORS_ALLOWED_ORIGINS" | "NODE_ENV", string | undefined>
  >
) {
  const corsAllowedOrigins = parseOriginList(env.CORS_ALLOWED_ORIGINS);
  const adminAllowedOrigins = parseOriginList(env.ADMIN_ALLOWED_ORIGINS);

  if (env.NODE_ENV === "production") {
    if (!corsAllowedOrigins.size) {
      throw new Error("CORS_ALLOWED_ORIGINS is required in production.");
    }

    if (!adminAllowedOrigins.size) {
      throw new Error("ADMIN_ALLOWED_ORIGINS is required in production.");
    }

    return {
      adminAllowedOrigins,
      corsAllowedOrigins
    };
  }

  const fallbackOrigins = getDefaultAllowedOrigins();

  return {
    adminAllowedOrigins: adminAllowedOrigins.size ? adminAllowedOrigins : fallbackOrigins,
    corsAllowedOrigins: corsAllowedOrigins.size ? corsAllowedOrigins : fallbackOrigins
  };
}

function isAdminSurfacePath(path: string) {
  return path.startsWith("/api/v1/admin") || path.startsWith("/api/v1/partner");
}

function createCorsMiddleware(
  env: Partial<
    Record<"ADMIN_ALLOWED_ORIGINS" | "CORS_ALLOWED_ORIGINS" | "NODE_ENV", string | undefined>
  >
) {
  const allowedOrigins = getAllowedOrigins(env);

  return (request: Request, response: Response, next: NextFunction) => {
    const origin = request.get("origin");

    if (origin) {
      const originSet = isAdminSurfacePath(request.path)
        ? allowedOrigins.adminAllowedOrigins
        : allowedOrigins.corsAllowedOrigins;

      if (!originSet.has(origin)) {
        response.status(403).json({
          error: {
            code: "FORBIDDEN",
            fields: {},
            message: "허용되지 않은 출처입니다."
          }
        });
        return;
      }

      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Vary", "Origin");
    }

    response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Request-Id");
    response.setHeader("Access-Control-Allow-Methods", "DELETE, GET, PATCH, POST, OPTIONS");

    if (request.method === "OPTIONS") {
      response.status(204).send();
      return;
    }

    next();
  };
}

function createRequestIdMiddleware() {
  return (request: Request, response: Response, next: NextFunction) => {
    const requestId = request.get("x-request-id") || randomUUID();
    response.locals.requestId = requestId;
    response.setHeader("X-Request-Id", requestId);
    next();
  };
}

function createRateLimiter(options: { max: number; windowMinutes: number }) {
  return rateLimit({
    handler: (_request, response) => {
      response.status(429).json({
        error: {
          code: "RATE_LIMITED",
          fields: {},
          message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
        }
      });
    },
    legacyHeaders: false,
    max: options.max,
    skip: () => process.env.NODE_ENV === "test",
    standardHeaders: true,
    windowMs: options.windowMinutes * 60 * 1000
  });
}

function assertProductionConfiguration() {
  getAuthTokenSecret(process.env);
  getAllowedOrigins(process.env);
  assertPiiEncryptionConfigured(process.env);
}

function sendData(response: Response, data: unknown, status = 200) {
  response.status(status).json({ data });
}

export function createApp(options: CreateAppOptions = {}): Express {
  assertProductionConfiguration();

  const app = express();
  const analyticsService = options.analyticsService ?? createDefaultAnalyticsService();
  const authService = options.authService ?? createDefaultAuthService();
  const compareRoomService = options.compareRoomService ?? createDefaultCompareRoomService();
  const contentService = options.contentService ?? createDefaultContentService();
  const leadRequestService = options.leadRequestService ?? createDefaultLeadRequestService();
  const offerService = options.offerService ?? createDefaultOfferService();
  const onboardingService = options.onboardingService ?? createDefaultOnboardingService();
  const policyService = options.policyService ?? createDefaultPolicyService();
  const scenarioService = options.scenarioService ?? createDefaultScenarioService();
  const workspaceService = options.workspaceService ?? createDefaultWorkspaceService();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(createRequestIdMiddleware());
  app.use(helmet());
  app.use(createCorsMiddleware(process.env));
  app.use(express.json({ limit: "100kb" }));
  app.use("/api/v1/analytics/events", createRateLimiter({ max: 300, windowMinutes: 15 }));
  app.use("/api/v1/auth", createRateLimiter({ max: 60, windowMinutes: 15 }));
  app.use("/api/v1/couple-invitations", createRateLimiter({ max: 80, windowMinutes: 15 }));
  app.use(
    /^\/api\/v1\/couples\/[^/]+\/invitations$/,
    createRateLimiter({ max: 80, windowMinutes: 15 })
  );
  app.use(
    /^\/api\/v1\/compare-rooms\/[^/]+\/lead-requests$/,
    createRateLimiter({ max: 40, windowMinutes: 15 })
  );

  const healthHandler = (_request: Request, response: Response) => {
    response.json(buildHealthResponse());
  };

  async function verifyAdminAuthorization(authorizationHeader: string | undefined) {
    const userId = authService.verifyAuthorizationHeader(authorizationHeader);

    await authService.assertAdminUser(userId);

    return userId;
  }

  function getOptionalUserId(authorizationHeader: string | undefined) {
    return authorizationHeader
      ? authService.verifyAuthorizationHeader(authorizationHeader)
      : undefined;
  }

  app.get("/health", healthHandler);
  app.get("/api/v1/health", healthHandler);
  app.get(
    "/ready",
    asyncRoute(async (_request, response) => {
      await getPrismaClient().$queryRaw`SELECT 1`;
      response.json({
        app: "sinhon-os-api",
        database: "ok",
        status: "ready"
      });
    })
  );
  app.get(
    "/api/v1/ready",
    asyncRoute(async (_request, response) => {
      await getPrismaClient().$queryRaw`SELECT 1`;
      response.json({
        app: "sinhon-os-api",
        database: "ok",
        status: "ready"
      });
    })
  );

  app.post(
    "/api/v1/analytics/events",
    asyncRoute(async (request, response) => {
      const userId = getOptionalUserId(request.get("authorization"));
      const input = parseBody(createAnalyticsEventInputSchema, request.body);
      const result = await analyticsService.recordEvent(userId, input);

      sendData(response, result, 201);
    })
  );

  app.get(
    "/api/v1/admin/analytics/funnel",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const query = parseBody(listAnalyticsFunnelQuerySchema, request.query);
      const result = await analyticsService.getFunnel(userId, query);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/auth/register",
    asyncRoute(async (request, response) => {
      const input = parseBody(registerInputSchema, request.body);
      const result = await authService.register(input);

      sendData(response, result, 201);
    })
  );

  app.post(
    "/api/v1/auth/login",
    asyncRoute(async (request, response) => {
      const input = parseBody(loginInputSchema, request.body);
      const result = await authService.login(input);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/auth/me",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const result = await authService.getCurrentUser(userId);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/couples/current",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const result = await authService.getCurrentCouple(userId);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/couples/:coupleId/members",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const result = await workspaceService.listCoupleMembers(userId, coupleId);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/couples/:coupleId/invitations",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const input = parseBody(createInvitationInputSchema, request.body);
      const result = await authService.createInvitation(userId, coupleId, input.expiresInHours);

      sendData(response, result, 201);
    })
  );

  app.get(
    "/api/v1/couple-invitations/:token",
    asyncRoute(async (request, response) => {
      const token = getRequiredParam(request, "token");
      const result = await authService.previewInvitation(token);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/couple-invitations/:token/accept",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const token = getRequiredParam(request, "token");

      parseBody(acceptInvitationInputSchema, request.body);
      const result = await authService.acceptInvitation(userId, token);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/couples/:coupleId/onboarding",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const result = await onboardingService.getOnboarding(userId, coupleId);

      sendData(response, result);
    })
  );

  app.patch(
    "/api/v1/couples/:coupleId/onboarding/me",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const input = parseBody(savePersonalOnboardingInputSchema, request.body);
      const result = await onboardingService.savePersonalOnboarding(userId, coupleId, input);

      sendData(response, result);
    })
  );

  app.patch(
    "/api/v1/couples/:coupleId/onboarding/couple",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const input = parseBody(saveCoupleOnboardingInputSchema, request.body);
      const result = await onboardingService.saveCoupleOnboarding(userId, coupleId, input);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/couples/:coupleId/onboarding/complete",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");

      parseBody(completeOnboardingInputSchema, request.body);
      const result = await onboardingService.completeOnboarding(userId, coupleId);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/couples/:coupleId/scenarios",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const input = parseBody(createScenarioInputSchema, request.body);
      const result = await scenarioService.createScenario(userId, coupleId, input);

      sendData(response, result, 201);
    })
  );

  app.get(
    "/api/v1/couples/:coupleId/scenarios",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const query = parseBody(listScenariosQuerySchema, request.query);
      const result = await scenarioService.listScenarios(userId, coupleId, query);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/scenarios/:scenarioId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const scenarioId = getRequiredParam(request, "scenarioId");
      const result = await scenarioService.getScenario(userId, scenarioId);

      sendData(response, result);
    })
  );

  app.patch(
    "/api/v1/scenarios/:scenarioId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const scenarioId = getRequiredParam(request, "scenarioId");
      const input = parseBody(updateScenarioInputSchema, request.body);
      const result = await scenarioService.updateScenario(userId, scenarioId, input);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/scenarios/:scenarioId/evaluate",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const scenarioId = getRequiredParam(request, "scenarioId");
      const input = parseBody(evaluateScenarioInputSchema, request.body);
      const result = await scenarioService.evaluateScenario(userId, scenarioId, input);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/scenarios/:scenarioId/archive",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const scenarioId = getRequiredParam(request, "scenarioId");
      const result = await scenarioService.archiveScenario(userId, scenarioId);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/policy-programs",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const query = parseBody(listPolicyProgramsQuerySchema, request.query);
      const result = await policyService.listPolicyPrograms(userId, query);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/policy-programs/:policyProgramId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const policyProgramId = getRequiredParam(request, "policyProgramId");
      const result = await policyService.getPolicyProgram(userId, policyProgramId);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/couples/:coupleId/policy-checks",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const input = parseBody(runPolicyCheckInputSchema, request.body);
      const result = await policyService.runPolicyCheck(userId, coupleId, input);

      sendData(response, result, 201);
    })
  );

  app.get(
    "/api/v1/couples/:coupleId/eligibility-results",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const query = parseBody(listEligibilityResultsQuerySchema, request.query);
      const result = await policyService.listEligibilityResults(userId, coupleId, query);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/eligibility-results/:eligibilityResultId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const eligibilityResultId = getRequiredParam(request, "eligibilityResultId");
      const result = await policyService.getEligibilityResult(userId, eligibilityResultId);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/eligibility-results/:eligibilityResultId/tasks",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const eligibilityResultId = getRequiredParam(request, "eligibilityResultId");
      const input = parseBody(createEligibilityDocumentTasksInputSchema, request.body);
      const result = await policyService.createDocumentTasks(userId, eligibilityResultId, input);

      sendData(response, result, 201);
    })
  );

  app.get(
    "/api/v1/couples/:coupleId/documents",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const query = parseBody(listDocumentsQuerySchema, request.query);
      const result = await workspaceService.listDocuments(userId, coupleId, query);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/couples/:coupleId/documents",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const input = parseBody(createDocumentInputSchema, request.body);
      const result = await workspaceService.createDocument(userId, coupleId, input);

      sendData(response, result, 201);
    })
  );

  app.patch(
    "/api/v1/documents/:documentId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const documentId = getRequiredParam(request, "documentId");
      const input = parseBody(updateDocumentInputSchema, request.body);
      const result = await workspaceService.updateDocument(userId, documentId, input);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/documents/:documentId/attachments/presign",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const documentId = getRequiredParam(request, "documentId");
      const input = parseBody(prepareDocumentAttachmentInputSchema, request.body);
      const result = await workspaceService.prepareDocumentAttachment(userId, documentId, input);

      sendData(response, result);
    })
  );

  app.delete(
    "/api/v1/documents/:documentId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const documentId = getRequiredParam(request, "documentId");
      const result = await workspaceService.deleteDocument(userId, documentId);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/couples/:coupleId/tasks",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const query = parseBody(listTasksQuerySchema, request.query);
      const result = await workspaceService.listTasks(userId, coupleId, query);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/couples/:coupleId/tasks",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const input = parseBody(createTaskInputSchema, request.body);
      const result = await workspaceService.createTask(userId, coupleId, input);

      sendData(response, result, 201);
    })
  );

  app.patch(
    "/api/v1/tasks/:taskId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const taskId = getRequiredParam(request, "taskId");
      const input = parseBody(updateTaskInputSchema, request.body);
      const result = await workspaceService.updateTask(userId, taskId, input);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/tasks/:taskId/complete",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const taskId = getRequiredParam(request, "taskId");
      const input = parseBody(completeTaskInputSchema, request.body);
      const result = await workspaceService.completeTask(userId, taskId, input);

      sendData(response, result);
    })
  );

  app.delete(
    "/api/v1/tasks/:taskId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const taskId = getRequiredParam(request, "taskId");
      const result = await workspaceService.deleteTask(userId, taskId);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/notifications",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const query = parseBody(listNotificationsQuerySchema, request.query);
      const result = await workspaceService.listNotifications(userId, query);

      sendData(response, result);
    })
  );

  app.patch(
    "/api/v1/notifications/:notificationId/read",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const notificationId = getRequiredParam(request, "notificationId");
      const input = parseBody(readNotificationInputSchema, request.body);
      const result = await workspaceService.readNotification(userId, notificationId, input);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/articles",
    asyncRoute(async (request, response) => {
      const query = parseBody(listArticlesQuerySchema, request.query);
      const result = await contentService.listPublishedArticles(query);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/articles/:slug",
    asyncRoute(async (request, response) => {
      const slug = getRequiredParam(request, "slug");
      const result = await contentService.getPublishedArticle(slug);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/admin/articles",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const query = parseBody(listArticlesQuerySchema, request.query);
      const result = await contentService.listAdminArticles(userId, query);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/admin/articles",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const input = parseBody(createArticleInputSchema, request.body);
      const result = await contentService.createArticle(userId, input);

      sendData(response, result, 201);
    })
  );

  app.patch(
    "/api/v1/admin/articles/:articleId",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const articleId = getRequiredParam(request, "articleId");
      const input = parseBody(updateArticleInputSchema, request.body);
      const result = await contentService.updateArticle(userId, articleId, input);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/admin/articles/:articleId/publish",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const articleId = getRequiredParam(request, "articleId");
      const input = parseBody(publishArticleInputSchema, request.body);
      const result = await contentService.publishArticle(userId, articleId, input.publish);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/admin/policy-programs",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const input = parseBody(createPolicyProgramInputSchema, request.body);
      const result = await policyService.createPolicyProgram(userId, input);

      sendData(response, result, 201);
    })
  );

  app.patch(
    "/api/v1/admin/policy-programs/:policyProgramId",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const policyProgramId = getRequiredParam(request, "policyProgramId");
      const input = parseBody(updatePolicyProgramInputSchema, request.body);
      const result = await policyService.updatePolicyProgram(userId, policyProgramId, input);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/admin/policy-programs/:policyProgramId/rule-versions",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const policyProgramId = getRequiredParam(request, "policyProgramId");
      const input = parseBody(createPolicyRuleVersionInputSchema, request.body);
      const result = await policyService.createPolicyRuleVersion(userId, policyProgramId, input);

      sendData(response, result, 201);
    })
  );

  app.get(
    "/api/v1/vendors",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const query = parseBody(listVendorsQuerySchema, request.query);
      const result = await offerService.listVendors(userId, query);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/vendors/:vendorId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const vendorId = getRequiredParam(request, "vendorId");
      const result = await offerService.getVendor(userId, vendorId);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/offers",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const query = parseBody(listOffersQuerySchema, request.query);
      const result = await offerService.listOffers(userId, query);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/offers/:offerId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const offerId = getRequiredParam(request, "offerId");
      const result = await offerService.getOffer(userId, offerId);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/offers/:offerId/price-versions/current",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const offerId = getRequiredParam(request, "offerId");
      const result = await offerService.getCurrentPriceVersion(userId, offerId);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/admin/vendors",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const input = parseBody(createVendorInputSchema, request.body);
      const result = await offerService.createVendor(userId, input);

      sendData(response, result, 201);
    })
  );

  app.get(
    "/api/v1/admin/offers",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const query = parseBody(listOffersQuerySchema, request.query);
      const result = await offerService.listAdminOffers(userId, query);

      sendData(response, result);
    })
  );

  app.patch(
    "/api/v1/admin/vendors/:vendorId",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const vendorId = getRequiredParam(request, "vendorId");
      const input = parseBody(updateVendorInputSchema, request.body);
      const result = await offerService.updateVendor(userId, vendorId, input);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/admin/vendors/:vendorId/offers",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const vendorId = getRequiredParam(request, "vendorId");
      const input = parseBody(createOfferInputSchema, request.body);
      const result = await offerService.createOffer(userId, vendorId, input);

      sendData(response, result, 201);
    })
  );

  app.patch(
    "/api/v1/admin/offers/:offerId",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const offerId = getRequiredParam(request, "offerId");
      const input = parseBody(updateOfferInputSchema, request.body);
      const result = await offerService.updateOffer(userId, offerId, input);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/admin/offers/:offerId/price-versions",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const offerId = getRequiredParam(request, "offerId");
      const input = parseBody(createOfferPriceVersionInputSchema, request.body);
      const result = await offerService.createOfferPriceVersion(userId, offerId, input);

      sendData(response, result, 201);
    })
  );

  app.patch(
    "/api/v1/admin/offer-price-versions/:offerPriceVersionId",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const offerPriceVersionId = getRequiredParam(request, "offerPriceVersionId");
      const input = parseBody(updateOfferPriceVersionInputSchema, request.body);
      const result = await offerService.updateOfferPriceVersion(userId, offerPriceVersionId, input);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/couples/:coupleId/compare-rooms",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const input = parseBody(createCompareRoomInputSchema, request.body);
      const result = await compareRoomService.createRoom(userId, coupleId, input);

      sendData(response, result, 201);
    })
  );

  app.get(
    "/api/v1/couples/:coupleId/compare-rooms",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const query = parseBody(listCompareRoomsQuerySchema, request.query);
      const result = await compareRoomService.listRooms(userId, coupleId, query);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/compare-rooms/:compareRoomId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const compareRoomId = getRequiredParam(request, "compareRoomId");
      const result = await compareRoomService.getRoom(userId, compareRoomId);

      sendData(response, result);
    })
  );

  app.patch(
    "/api/v1/compare-rooms/:compareRoomId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const compareRoomId = getRequiredParam(request, "compareRoomId");
      const input = parseBody(updateCompareRoomInputSchema, request.body);
      const result = await compareRoomService.updateRoom(userId, compareRoomId, input);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/compare-rooms/:compareRoomId/cards",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const compareRoomId = getRequiredParam(request, "compareRoomId");
      const input = parseBody(addCompareCardInputSchema, request.body);
      const result = await compareRoomService.addCard(userId, compareRoomId, input);

      sendData(response, result, 201);
    })
  );

  app.post(
    "/api/v1/compare-rooms/:compareRoomId/approvals/me",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const compareRoomId = getRequiredParam(request, "compareRoomId");
      const input = parseBody(submitApprovalInputSchema, request.body);
      const result = await compareRoomService.submitApproval(userId, compareRoomId, input);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/compare-rooms/:compareRoomId/approvals",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const compareRoomId = getRequiredParam(request, "compareRoomId");
      const result = await compareRoomService.getRoom(userId, compareRoomId);

      sendData(response, {
        approvals: result.approvals,
        roomStatus: result.compareRoom.status
      });
    })
  );

  app.post(
    "/api/v1/compare-rooms/:compareRoomId/comments",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const compareRoomId = getRequiredParam(request, "compareRoomId");
      const input = parseBody(createCompareCommentInputSchema, request.body);
      const result = await compareRoomService.createComment(userId, compareRoomId, input);

      sendData(response, result, 201);
    })
  );

  app.get(
    "/api/v1/compare-rooms/:compareRoomId/decision-logs",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const compareRoomId = getRequiredParam(request, "compareRoomId");
      const result = await compareRoomService.getDecisionLogs(userId, compareRoomId);

      sendData(response, result);
    })
  );

  app.delete(
    "/api/v1/compare-cards/:compareCardId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const compareCardId = getRequiredParam(request, "compareCardId");
      const result = await compareRoomService.removeCard(userId, compareCardId);

      sendData(response, result);
    })
  );

  app.post(
    "/api/v1/compare-rooms/:compareRoomId/lead-requests",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const compareRoomId = getRequiredParam(request, "compareRoomId");
      const input = parseBody(createLeadRequestInputSchema, request.body);
      const result = await leadRequestService.createLeadRequest(userId, compareRoomId, input);

      sendData(response, result, 201);
    })
  );

  app.get(
    "/api/v1/couples/:coupleId/lead-requests",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const coupleId = getRequiredParam(request, "coupleId");
      const query = parseBody(listLeadRequestsQuerySchema, request.query);
      const result = await leadRequestService.listCoupleLeadRequests(userId, coupleId, query);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/lead-requests/:leadRequestId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const leadRequestId = getRequiredParam(request, "leadRequestId");
      const result = await leadRequestService.getLeadRequest(userId, leadRequestId);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/admin/lead-requests",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const query = parseBody(listLeadRequestsQuerySchema, request.query);
      const result = await leadRequestService.listAdminLeadRequests(userId, query);

      sendData(response, result);
    })
  );

  app.patch(
    "/api/v1/admin/lead-requests/:leadRequestId/status",
    asyncRoute(async (request, response) => {
      const userId = await verifyAdminAuthorization(request.get("authorization"));
      const leadRequestId = getRequiredParam(request, "leadRequestId");
      const input = parseBody(updateLeadStatusInputSchema, request.body);
      const result = await leadRequestService.updateLeadStatus(userId, leadRequestId, input);

      sendData(response, result);
    })
  );

  app.get(
    "/api/v1/partner/lead-requests/:leadRequestId",
    asyncRoute(async (request, response) => {
      const userId = authService.verifyAuthorizationHeader(request.get("authorization"));
      const leadRequestId = getRequiredParam(request, "leadRequestId");
      const result = await leadRequestService.getPartnerLeadRequest(userId, leadRequestId);

      sendData(response, result);
    })
  );

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    const { body, status } = toErrorResponse(error);

    if (!(error instanceof ApiError)) {
      console.error("Unhandled API error", {
        error,
        requestId: response.locals.requestId
      });
    }

    response.status(status).json(body);
  });

  return app;
}

if (process.env.NODE_ENV !== "test" && process.env.SINHON_OS_SKIP_API_LISTEN !== "true") {
  const port = Number(process.env.PORT ?? 4000);
  createApp().listen(port, () => {
    console.log(`신혼OS API listening on http://localhost:${port}`);
  });
}
