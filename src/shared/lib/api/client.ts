import { env } from "../env";
import { ApiError, ClientErrorCode } from "./api-error";

const API_PREFIX = "/api/v1";
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_GET_RETRIES = 2;
const RETRYABLE_STATUS = new Set([502, 503, 504]);

type QueryValue = string | number | boolean | null | undefined;

export type ApiRequestOptions = Omit<RequestInit, "body" | "method"> & {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Objeto → JSON; `FormData` se envía tal cual. */
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Access token del paciente. Solo debe pasarse desde código de servidor. */
  token?: string;
  timeoutMs?: number;
};

type RequestExtras = Omit<ApiRequestOptions, "method" | "body">;

function buildUrl(path: string, query?: ApiRequestOptions["query"]): string {
  const url = new URL(`${API_PREFIX}${path}`, env.NEXT_PUBLIC_API_BASE_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function parseBody<T>(response: Response): Promise<T> {
  const text = response.status === 204 ? "" : await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function isRetryable(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === ClientErrorCode.Network ||
      error.code === ClientErrorCode.Timeout ||
      RETRYABLE_STATUS.has(error.status))
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const backoff = (attempt: number) => 200 * 2 ** attempt + Math.random() * 100;

async function send<T>(url: string, init: RequestInit, timeoutMs: number): Promise<T> {
  const timeout = AbortSignal.timeout(timeoutMs);
  const callerSignal = init.signal ?? undefined;
  const signal = callerSignal ? AbortSignal.any([callerSignal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(url, { ...init, signal });
  } catch (cause) {
    if (callerSignal?.aborted) throw cause;
    const isTimeout = timeout.aborted;
    throw new ApiError({
      status: 0,
      code: isTimeout ? ClientErrorCode.Timeout : ClientErrorCode.Network,
      title: isTimeout ? "La solicitud tardó demasiado" : "No se pudo conectar con el servidor",
      metadata: {},
      fieldErrors: {},
    });
  }

  if (!response.ok) throw await ApiError.fromResponse(response);
  return parseBody<T>(response);
}

/**
 * Llama a calidoc-api (`/api/v1`). Éxito (2xx) → devuelve el recurso sin envoltorio.
 * Error (4xx/5xx o red) → lanza `ApiError`, con `code` para decidir cómo manejarlo.
 * Admite las opciones de caché de Next (`next: { revalidate, tags }`, `cache`).
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    query,
    token,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers,
    ...init
  } = options;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    payload = JSON.stringify(body);
    requestHeaders.set("Content-Type", "application/json");
  }

  const url = buildUrl(path, query);
  const request: RequestInit = { ...init, method, headers: requestHeaders, body: payload };

  const retries = method === "GET" ? MAX_GET_RETRIES : 0;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await send<T>(url, request, timeoutMs);
    } catch (error) {
      if (!isRetryable(error)) throw error;
      await sleep(backoff(attempt));
    }
  }
  return send<T>(url, request, timeoutMs);
}

export const api = {
  get: <T>(path: string, options?: RequestExtras) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestExtras) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestExtras) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestExtras) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestExtras) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
