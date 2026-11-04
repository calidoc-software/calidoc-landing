"use server";

import { redirect } from "next/navigation";
import { routes } from "@/shared/config/routes";
import { ClientErrorCode, tryApi } from "@/shared/lib/api";
import { sendOtp } from "../api/send-otp";
import { AuthErrorCode } from "../error-codes";
import { savePendingRegistration } from "../lib/pending-registration";
import { type RegisterField, type RegisterInput, registerSchema } from "../schemas/register.schema";

export type StartRegistrationError = {
  message: string;
  fieldErrors?: Partial<Record<RegisterField, string>>;
  /** El correo ya tiene cuenta: el formulario ofrece ir a iniciar sesión. */
  emailRegistered?: boolean;
};

const NETWORK_CODES: string[] = [ClientErrorCode.Network, ClientErrorCode.Timeout];

/**
 * Valida los datos, pide a calidoc-api que envíe el código al correo y, si responde bien, guarda
 * los datos cifrados y lleva al usuario a la pantalla del código. Solo retorna si algo falló.
 */
export async function startRegistration(input: RegisterInput): Promise<StartRegistrationError> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { message: "Revisa los datos del formulario e inténtalo de nuevo." };
  }

  const result = await tryApi(sendOtp(parsed.data.correo));
  if (!result.ok) {
    const { code, fieldErrors } = result.error;
    if (NETWORK_CODES.includes(code)) {
      return {
        message: "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
      };
    }
    if (code === AuthErrorCode.OtpEmailRegistered) {
      return { message: "Ya existe una cuenta con este correo.", emailRegistered: true };
    }
    if (Object.keys(fieldErrors).some((key) => key.toLowerCase() === "email")) {
      return {
        message: "No pudimos enviar el código a ese correo.",
        fieldErrors: { correo: "Revisa tu correo: debe tener el formato nombre@dominio.com." },
      };
    }
    return {
      message: "No pudimos enviar el código a tu correo. Inténtalo de nuevo en unos minutos.",
    };
  }

  await savePendingRegistration(parsed.data);
  redirect(routes.registerVerify);
}
