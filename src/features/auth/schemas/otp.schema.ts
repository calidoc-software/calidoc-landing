import { z } from "zod";

export const OTP_LENGTH = 6;

export const otpSchema = z.object({
  codigo: z.string().regex(/^\d{6}$/, "Ingresa los 6 dígitos del código."),
});

export type OtpInput = z.infer<typeof otpSchema>;
