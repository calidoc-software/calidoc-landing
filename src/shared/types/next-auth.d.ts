import type { DefaultSession } from "next-auth";
import type { SessionPayload, SessionUser } from "@/shared/lib/auth/session";

declare module "next-auth" {
  interface Session {
    user: SessionUser & DefaultSession["user"];
    /** Presente cuando el refresh token murió: el cliente debe forzar `signOut()`. */
    error?: "RefreshTokenError";
  }

  interface User {
    /** Sesión emitida por calidoc-api, entregada por el provider `registro`. */
    payload?: SessionPayload;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends Partial<SessionPayload> {
    error?: "RefreshTokenError";
  }
}
