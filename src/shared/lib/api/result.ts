import { type ApiErrorData, isApiError } from "./api-error";

/** Resultado serializable para Server Actions: el componente ramifica por `error.code`. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiErrorData };

/**
 * Convierte una llamada a la API en un `ApiResult` sin lanzar excepción para errores de la API.
 * Los errores que no son de la API (bugs, abortos) se relanzan.
 */
export async function tryApi<T>(request: Promise<T>): Promise<ApiResult<T>> {
  try {
    return { ok: true, data: await request };
  } catch (error) {
    if (isApiError(error)) return { ok: false, error: error.toJSON() };
    throw error;
  }
}
