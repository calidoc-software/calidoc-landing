/** Códigos de negocio de calidoc-api que maneja el flujo de registro. */
export const AuthErrorCode = {
  OtpEmailRegistered: "AUTH_OTP_EMAIL_REGISTERED",
  OtpExpiredOrNotRequested: "AUTH_OTP_EXPIRED_OR_NOT_REQUESTED",
  OtpAttemptsExceeded: "AUTH_OTP_ATTEMPTS_EXCEEDED",
  OtpCodeIncorrect: "AUTH_OTP_CODE_INCORRECT",
} as const;
