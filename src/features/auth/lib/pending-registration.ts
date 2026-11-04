import "server-only";
import { createHash } from "node:crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import { serverEnv } from "@/shared/lib/env.server";
import { type RegisterInput, registerSchema } from "../schemas/register.schema";

const COOKIE_NAME = "calidoc_registro";
const COOKIE_PATH = "/registro";
const TTL_SECONDS = 15 * 60;

// A256GCM exige una llave de 32 bytes: se deriva del secreto con SHA-256.
const key = createHash("sha256").update(serverEnv.AUTH_SECRET).digest();

/** Guarda los datos del formulario cifrados (JWE) en una cookie httpOnly de corta vida. */
export async function savePendingRegistration(data: RegisterInput) {
  const token = await new EncryptJWT({ ...data })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .encrypt(key);

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: TTL_SECONDS,
  });
}

/** Devuelve los datos pendientes, o `null` si no hay cookie, está vencida o fue alterada. */
export async function readPendingRegistration(): Promise<RegisterInput | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtDecrypt(token, key);
    const parsed = registerSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function clearPendingRegistration() {
  (await cookies()).delete({ name: COOKIE_NAME, path: COOKIE_PATH });
}
