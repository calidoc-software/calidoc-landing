import "server-only";
import { api } from "@/shared/lib/api";
import type { SessionPayload } from "@/shared/lib/auth/session";
import { loginResponseSchema, toSessionPayload } from "../mappers/login-response.mapper";
import type { LoginInput } from "../schemas/login.schema";

export async function loginWithPassword(data: LoginInput): Promise<SessionPayload> {
  const response = await api.post<unknown>("/Auth/login", {
    email: data.correo,
    password: data.contrasena,
  });
  return toSessionPayload(loginResponseSchema.parse(response));
}
