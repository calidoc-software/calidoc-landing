"use server";

import { z } from "zod";
import { ClientErrorCode, tryApi } from "@/shared/lib/api";
import { sealSession, signIn } from "@/shared/lib/auth";
import { loginWithGoogleToken } from "../api/google-login";
import { exchangeGoogleCode } from "../api/google-token";
import { AuthErrorCode } from "../error-codes";

export type GoogleLoginResult =
  | { ok: true }
  | { ok: false; message: string; accountNotFound?: boolean };

const NETWORK_CODES: string[] = [ClientErrorCode.Network, ClientErrorCode.Timeout];

const NETWORK_MESSAGE =
  "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
const VERIFY_MESSAGE = "No pudimos verificar tu cuenta de Google. Inténtalo de nuevo.";

const GOOGLE_MESSAGES: Record<string, string> = {
  [AuthErrorCode.ProviderTokenInvalid]: VERIFY_MESSAGE,
  [AuthErrorCode.AccountNotActive]:
    "Tu cuenta no está activa. Contacta a soporte para reactivarla.",
  [AuthErrorCode.EmailNotVerifiedProvider]:
    "Tu correo de Google no está verificado. Verifícalo en Google e inténtalo de nuevo.",
};

const codeSchema = z.string().min(1).max(2048);

/**
 * Canjea el código del popup de Google por un ID token, lo envía a calidoc-api y, si la cuenta
 * existe, deja la sesión iniciada igual que el login con contraseña.
 */
export async function loginWithGoogle(code: string): Promise<GoogleLoginResult> {
  const parsed = codeSchema.safeParse(code);
  if (!parsed.success) return { ok: false, message: VERIFY_MESSAGE };

  const exchanged = await exchangeGoogleCode(parsed.data);
  if (!exchanged.ok) {
    if (exchanged.reason === "network") return { ok: false, message: NETWORK_MESSAGE };
    if (exchanged.reason === "not_configured") {
      return { ok: false, message: "El acceso con Google no está disponible por ahora." };
    }
    return { ok: false, message: VERIFY_MESSAGE };
  }

  const result = await tryApi(loginWithGoogleToken(exchanged.idToken));
  if (!result.ok) {
    const { code: errorCode } = result.error;
    if (NETWORK_CODES.includes(errorCode)) return { ok: false, message: NETWORK_MESSAGE };
    if (errorCode === AuthErrorCode.ExternalAccountNotFound) {
      return {
        ok: false,
        message: "No encontramos una cuenta con ese correo de Google.",
        accountNotFound: true,
      };
    }
    return { ok: false, message: GOOGLE_MESSAGES[errorCode] ?? VERIFY_MESSAGE };
  }

  await signIn("sesion", { session: await sealSession(result.data), redirect: false });
  return { ok: true };
}
