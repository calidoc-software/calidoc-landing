import "server-only";
import { env } from "@/shared/lib/env";
import { serverEnv } from "@/shared/lib/env.server";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const TIMEOUT_MS = 10_000;

export type GoogleExchangeResult =
  | { ok: true; idToken: string }
  | { ok: false; reason: "not_configured" | "invalid_code" | "network" };

/**
 * Canjea el código de autorización que entrega el popup de Google por el ID token. El ID token se
 * queda en el servidor: viaja directo a calidoc-api, nunca llega al navegador.
 * (Google no es calidoc-api, por eso no pasa por `shared/lib/api`.)
 */
export async function exchangeGoogleCode(code: string): Promise<GoogleExchangeResult> {
  const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = serverEnv.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return { ok: false, reason: "not_configured" };

  let response: Response;
  try {
    response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: "postmessage",
        grant_type: "authorization_code",
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    return { ok: false, reason: "network" };
  }

  if (!response.ok) return { ok: false, reason: "invalid_code" };

  const data: unknown = await response.json().catch(() => null);
  const idToken =
    data && typeof data === "object" && "id_token" in data
      ? (data as { id_token: unknown }).id_token
      : null;
  return typeof idToken === "string" && idToken
    ? { ok: true, idToken }
    : { ok: false, reason: "invalid_code" };
}
