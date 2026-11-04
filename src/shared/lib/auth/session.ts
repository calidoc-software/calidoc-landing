import { z } from "zod";

/** Datos del paciente que sí pueden llegar al cliente (nunca incluye tokens). */
export const sessionUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  profilePhotoUrl: z.string().nullable(),
});

/** Sesión emitida por calidoc-api: usuario + tokens. Las fechas de expiración van en ms (epoch). */
export const sessionPayloadSchema = z.object({
  user: sessionUserSchema,
  accessToken: z.string(),
  accessTokenExpiresAt: z.number(),
  refreshToken: z.string(),
  refreshTokenExpiresAt: z.number(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
export type SessionPayload = z.infer<typeof sessionPayloadSchema>;
