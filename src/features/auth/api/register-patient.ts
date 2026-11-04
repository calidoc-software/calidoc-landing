import "server-only";
import { api } from "@/shared/lib/api";
import type { SessionPayload } from "@/shared/lib/auth/session";
import { loginResponseSchema, toSessionPayload } from "../mappers/login-response.mapper";
import type { RegisterInput } from "../schemas/register.schema";

export async function registerPatient(
  data: RegisterInput,
  emailToken: string,
): Promise<SessionPayload> {
  const response = await api.post<unknown>("/Patients/register", {
    firstName: data.nombres,
    lastName: data.apellidos,
    email: data.correo,
    password: data.contrasena,
    emailToken,
  });
  return toSessionPayload(loginResponseSchema.parse(response));
}
