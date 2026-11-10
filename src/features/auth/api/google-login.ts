import "server-only";
import { api } from "@/shared/lib/api";
import type { SessionPayload } from "@/shared/lib/auth/session";
import { loginResponseSchema, toSessionPayload } from "../mappers/login-response.mapper";

export async function loginWithGoogleToken(idToken: string): Promise<SessionPayload> {
  const response = await api.post<unknown>("/Auth/google-login", { googleIdToken: idToken });
  return toSessionPayload(loginResponseSchema.parse(response));
}
