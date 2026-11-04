import "server-only";
import { api } from "@/shared/lib/api";

type VerifyOtpResponse = { emailToken: string };

export async function verifyOtp(email: string, code: string): Promise<string> {
  const { emailToken } = await api.post<VerifyOtpResponse>("/Auth/verify-otp", { email, code });
  return emailToken;
}
