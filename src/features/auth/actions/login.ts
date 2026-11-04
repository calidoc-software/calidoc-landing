"use server";

import { ClientErrorCode, tryApi } from "@/shared/lib/api";
import { sealSession, signIn } from "@/shared/lib/auth";
import { loginWithPassword } from "../api/login";
import { AuthErrorCode } from "../error-codes";
import { type LoginInput, loginSchema } from "../schemas/login.schema";

export type LoginResult = { ok: true } | { ok: false; message: string };

const NETWORK_CODES: string[] = [ClientErrorCode.Network, ClientErrorCode.Timeout];

const LOGIN_MESSAGES: Record<string, string> = {
  // Mismo mensaje para correo o contraseña incorrectos: no revela si el correo existe.
  [AuthErrorCode.InvalidCredentials]: "El correo o la contraseña son incorrectos.",
  [AuthErrorCode.AccountNotActive]:
    "Tu cuenta no está activa. Contacta a soporte para reactivarla.",
  [AuthErrorCode.AccountLocked]:
    "Tu cuenta se bloqueó temporalmente por demasiados intentos. Inténtalo de nuevo en unos minutos.",
};

/**
 * Valida las credenciales contra calidoc-api y deja la sesión iniciada con los tokens que esta
 * devuelve (la misma sesión que crea el registro). El cliente refresca `useSession` y navega.
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Revisa los datos del formulario e inténtalo de nuevo." };
  }

  const result = await tryApi(loginWithPassword(parsed.data));
  if (!result.ok) {
    const { code } = result.error;
    if (NETWORK_CODES.includes(code)) {
      return {
        ok: false,
        message: "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
      };
    }
    return {
      ok: false,
      message: LOGIN_MESSAGES[code] ?? "No pudimos iniciar sesión. Inténtalo de nuevo.",
    };
  }

  await signIn("sesion", { session: await sealSession(result.data), redirect: false });
  return { ok: true };
}
