/** Cuerpo ProblemDetails con el que calidoc-api responde los errores (4xx/5xx). */
export type ApiErrorBody = {
  title?: string;
  code?: string;
  status?: number;
  detail?: string;
  instance?: string;
  type?: string;
  metadata?: Record<string, unknown>;
  errors?: Record<string, string[]>;
  traceId?: string;
};

/** Versión serializable de `ApiError`: puede cruzar de un Server Action a un Client Component. */
export type ApiErrorData = {
  status: number;
  code: string;
  title: string;
  detail?: string;
  instance?: string;
  type?: string;
  metadata: Record<string, unknown>;
  /** Errores por campo (validación): `{ Email: ["The Email field is required."] }`. */
  fieldErrors: Record<string, string[]>;
  traceId?: string;
};

/**
 * Códigos de respaldo que el cliente usa solo cuando la respuesta no trae `code`.
 * No es la lista de códigos posibles: `ApiError.code` es un string abierto y los códigos de
 * negocio del backend siempre tienen prioridad.
 */
export const ClientErrorCode = {
  Network: "NETWORK_ERROR",
  Timeout: "TIMEOUT",
  Unauthorized: "UNAUTHORIZED",
  Forbidden: "FORBIDDEN",
  Validation: "VALIDATION_ERROR",
} as const;

function fallbackCode(status: number, body: ApiErrorBody): string {
  if (status === 401) return ClientErrorCode.Unauthorized;
  if (status === 403) return ClientErrorCode.Forbidden;
  if (status === 400 && body.errors) return ClientErrorCode.Validation;
  return `HTTP_${status}`;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly title: string;
  readonly detail?: string;
  readonly instance?: string;
  readonly type?: string;
  readonly metadata: Record<string, unknown>;
  readonly fieldErrors: Record<string, string[]>;
  readonly traceId?: string;

  constructor(data: ApiErrorData) {
    super(data.detail ?? data.title);
    this.name = "ApiError";
    this.status = data.status;
    this.code = data.code;
    this.title = data.title;
    this.detail = data.detail;
    this.instance = data.instance;
    this.type = data.type;
    this.metadata = data.metadata;
    this.fieldErrors = data.fieldErrors;
    this.traceId = data.traceId;
  }

  /** Compara el `code` del error: `if (error.is("NOT_FOUND")) …`. */
  is(code: string): boolean {
    return this.code === code;
  }

  toJSON(): ApiErrorData {
    return {
      status: this.status,
      code: this.code,
      title: this.title,
      detail: this.detail,
      instance: this.instance,
      type: this.type,
      metadata: this.metadata,
      fieldErrors: this.fieldErrors,
      traceId: this.traceId,
    };
  }

  /** Construye el error desde una respuesta no exitosa; tolera cuerpos vacíos o que no sean JSON. */
  static async fromResponse(response: Response): Promise<ApiError> {
    let body: ApiErrorBody = {};
    try {
      const text = await response.text();
      const parsed: unknown = text ? JSON.parse(text) : null;
      if (parsed && typeof parsed === "object") body = parsed as ApiErrorBody;
    } catch {
      // cuerpo vacío o no JSON: se usan los valores por defecto
    }
    return new ApiError({
      status: response.status,
      code: body.code ?? fallbackCode(response.status, body),
      title: body.title ?? (response.statusText || "Error inesperado"),
      detail: body.detail,
      instance: body.instance,
      type: body.type,
      metadata: body.metadata ?? {},
      fieldErrors: body.errors ?? {},
      traceId: body.traceId,
    });
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
