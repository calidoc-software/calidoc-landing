"use server";

import { redirect } from "next/navigation";
import { routes } from "@/shared/config/routes";
import { ClientErrorCode, tryApi } from "@/shared/lib/api";
import { sealSession, signIn } from "@/shared/lib/auth";
import { registerPatient } from "../api/register-patient";
import { verifyOtp } from "../api/verify-otp";
import { AuthErrorCode } from "../error-codes";
import { clearPendingRegistration, readPendingRegistration } from "../lib/pending-registration";
import { type OtpInput, otpSchema } from "../schemas/otp.schema";

export type CompleteRegistrationResult = { ok: true } | ({ ok: false } & CompleteRegistrationError);

type CompleteRegistrationError = {
  message: string;
  /** El error pertenece al campo del código (se pinta bajo el OTP) y no al formulario. */
  field?: boolean;
};

const NETWORK_CODES: string[] = [ClientErrorCode.Network, ClientErrorCode.Timeout];

const OTP_MESSAGES: Record<string, string> = {
  [AuthErrorCode.OtpCodeIncorrect]: "El código es incorrecto. Revísalo e inténtalo de nuevo.",
  [AuthErrorCode.OtpExpiredOrNotRequested]: "El código expiró. Vuelve atrás y solicita uno nuevo.",
  [AuthErrorCode.OtpAttemptsExceeded]:
    "Demasiados intentos. Vuelve atrás y solicita un nuevo código.",
};

const NETWORK_MESSAGE =
  "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

/**
 * Verifica el código, crea la cuenta del paciente y deja la sesión iniciada con los tokens que
 * devuelve el propio registro. Si todo sale bien retorna `ok` y el cliente refresca la sesión y navega.
 */
export async function completeRegistration(input: OtpInput): Promise<CompleteRegistrationResult> {
  const parsed = otpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revisa el código.",
      field: true,
    };
  }

  const pending = await readPendingRegistration();
  if (!pending) redirect(routes.register);

  const verified = await tryApi(verifyOtp(pending.correo, parsed.data.codigo));
  if (!verified.ok) {
    const { code } = verified.error;
    if (NETWORK_CODES.includes(code)) return { ok: false, message: NETWORK_MESSAGE };
    const message = OTP_MESSAGES[code];
    return message
      ? { ok: false, message, field: true }
      : { ok: false, message: "No pudimos verificar el código. Inténtalo de nuevo." };
  }

  const registered = await tryApi(registerPatient(pending, verified.data));
  if (!registered.ok) {
    if (NETWORK_CODES.includes(registered.error.code)) {
      return { ok: false, message: NETWORK_MESSAGE };
    }
    // El código de un solo uso ya se consumió: reintentar aquí no sirve, hay que empezar de nuevo.
    return {
      ok: false,
      message: "No pudimos crear tu cuenta. Vuelve al registro e inténtalo de nuevo.",
    };
  }

  await signIn("sesion", { session: await sealSession(registered.data), redirect: false });
  await clearPendingRegistration();
  return { ok: true };
}
