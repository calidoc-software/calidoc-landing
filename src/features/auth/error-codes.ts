/** Códigos de negocio de calidoc-api que maneja el flujo de autenticación. */
export const AuthErrorCode = {
  OtpEmailRegistered: "AUTH_OTP_EMAIL_REGISTERED",
  OtpExpiredOrNotRequested: "AUTH_OTP_EXPIRED_OR_NOT_REQUESTED",
  OtpAttemptsExceeded: "AUTH_OTP_ATTEMPTS_EXCEEDED",
  OtpCodeIncorrect: "AUTH_OTP_CODE_INCORRECT",
  InvalidCredentials: "AUTH_INVALID_CREDENTIALS",
  AccountNotActive: "AUTH_ACCOUNT_NOT_ACTIVE",
  AccountLocked: "AUTH_ACCOUNT_LOCKED",
} as const;
