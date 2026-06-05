export const ADMIN_AUTH_TOKEN_STORAGE_KEY = "sinhon_os_admin_access_token";

function getApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return "/api/v1";
  }

  const webBaseUrl =
    process.env.NEXT_PUBLIC_WEB_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3001";

  return `${webBaseUrl}/api/v1`;
}

export type ApiErrorPayload = {
  code: string;
  fields: Record<string, string[]>;
  message: string;
};

type ApiEnvelope<T> = {
  data?: T;
  error?: ApiErrorPayload;
};

export class ApiClientError extends Error {
  readonly error: ApiErrorPayload;

  constructor(error: ApiErrorPayload) {
    super(error.message);
    this.error = error;
  }
}

export async function apiRequest<T>(
  path: string,
  options: { body?: unknown; method?: "GET" | "PATCH" | "POST"; token?: string } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers,
    method: options.method ?? "GET"
  });
  const envelope = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !envelope.data) {
    throw new ApiClientError(
      envelope.error ?? {
        code: "UNKNOWN",
        fields: {},
        message: "요청을 처리하지 못했습니다."
      }
    );
  }

  return envelope.data;
}
