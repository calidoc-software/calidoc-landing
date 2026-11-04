import "server-only";
import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";
import { serverEnv } from "@/shared/lib/env.server";
import type { SessionPayload } from "./session";

/**
 * Tokens de calidoc-api de la sesión actual, leídos de la cookie de Auth.js en el servidor.
 * `auth()` no los expone a propósito (la sesión llega al cliente); esto es solo para llamar a la
 * API desde Server Actions y Server Components. Devuelve `null` si no hay sesión.
 */
export async function getSessionTokens(): Promise<SessionPayload | null> {
  const req = { headers: await headers() };
  // El nombre de la cookie lleva el prefijo `__Secure-` solo bajo HTTPS.
  for (const secureCookie of [true, false]) {
    const token = await getToken({ req, secret: serverEnv.AUTH_SECRET, secureCookie });
    if (token?.user && token.accessToken && token.refreshToken) {
      return {
        user: token.user,
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt ?? 0,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt ?? 0,
      };
    }
  }
  return null;
}
