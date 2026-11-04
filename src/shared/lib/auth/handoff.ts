import "server-only";
import { createHash } from "node:crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import { serverEnv } from "@/shared/lib/env.server";
import { type SessionPayload, sessionPayloadSchema } from "./session";

const TTL_SECONDS = 60;

// Llave distinta a la de la cookie de registro: cada uso del secreto tiene su propio contexto.
const key = createHash("sha256").update(`session-handoff:${serverEnv.AUTH_SECRET}`).digest();

/**
 * Sella (JWE) la sesión que calidoc-api acaba de emitir para pasársela al provider de Auth.js.
 * `/api/auth/callback/*` es público: sin este sello, cualquiera podría inventar una sesión.
 */
export async function sealSession(payload: SessionPayload): Promise<string> {
  return new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .encrypt(key);
}

/** Devuelve la sesión sellada, o `null` si el sello es inválido, está vencido o fue alterado. */
export async function openSession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtDecrypt(token, key);
    const parsed = sessionPayloadSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
