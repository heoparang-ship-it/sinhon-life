export type ApiErrorCode =
  | "ALREADY_IN_COUPLE"
  | "APPROVAL_REQUIRED"
  | "COMPARE_ROOM_NOT_READY"
  | "CONFLICT"
  | "CONSENT_REQUIRED"
  | "FORBIDDEN"
  | "INTERNAL_ERROR"
  | "INVITATION_EXPIRED"
  | "NOT_FOUND"
  | "ONBOARDING_INCOMPLETE"
  | "PARTNER_REQUIRED"
  | "PRICE_VERSION_EXPIRED"
  | "RATE_LIMITED"
  | "UNAUTHENTICATED"
  | "VALIDATION_ERROR";

const statusByCode: Record<ApiErrorCode, number> = {
  ALREADY_IN_COUPLE: 409,
  APPROVAL_REQUIRED: 409,
  COMPARE_ROOM_NOT_READY: 409,
  CONFLICT: 409,
  CONSENT_REQUIRED: 409,
  FORBIDDEN: 403,
  INTERNAL_ERROR: 500,
  INVITATION_EXPIRED: 410,
  NOT_FOUND: 404,
  ONBOARDING_INCOMPLETE: 409,
  PARTNER_REQUIRED: 409,
  PRICE_VERSION_EXPIRED: 409,
  RATE_LIMITED: 429,
  UNAUTHENTICATED: 401,
  VALIDATION_ERROR: 400
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly fields?: Record<string, string[]>;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, fields?: Record<string, string[]>) {
    super(message);
    this.code = code;
    this.fields = fields;
    this.status = statusByCode[code];
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return {
      body: {
        error: {
          code: error.code,
          fields: error.fields ?? {},
          message: error.message
        }
      },
      status: error.status
    };
  }

  return {
    body: {
      error: {
        code: "INTERNAL_ERROR" as const,
        fields: {},
        message: "잠시 후 다시 시도해 주세요."
      }
    },
    status: 500
  };
}
