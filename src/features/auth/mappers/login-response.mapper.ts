import { z } from "zod";
import type { SessionPayload } from "@/shared/lib/auth/session";

// Se valida en runtime porque de esto depende toda la sesión del paciente.
export const loginResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    profilePhotoUrl: z.string().nullable(),
  }),
  accessToken: z.string(),
  accessTokenExpiresAtUtc: z.string(),
  refreshToken: z.string(),
  refreshTokenExpiresAtUtc: z.string(),
});

type LoginResponse = z.infer<typeof loginResponseSchema>;

export function toSessionPayload(response: LoginResponse): SessionPayload {
  return {
    user: {
      id: response.user.id,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
      email: response.user.email,
      profilePhotoUrl: response.user.profilePhotoUrl,
    },
    accessToken: response.accessToken,
    accessTokenExpiresAt: Date.parse(response.accessTokenExpiresAtUtc),
    refreshToken: response.refreshToken,
    refreshTokenExpiresAt: Date.parse(response.refreshTokenExpiresAtUtc),
  };
}
