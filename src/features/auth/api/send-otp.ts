import "server-only";
import { api } from "@/shared/lib/api";

export function sendOtp(email: string) {
  return api.post<unknown>("/Auth/send-otp", { email });
}
