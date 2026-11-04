import "server-only";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { api, tryApi } from "@/shared/lib/api";
import { openSession } from "./handoff";

type RefreshTokenResponse = {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
};

/** Margen para renovar antes de que el access token venza de verdad. */
const REFRESH_MARGIN_MS = 30_000;

async function refreshTokens(token: JWT): Promise<JWT> {
  if (!token.refreshToken || Date.now() >= (token.refreshTokenExpiresAt ?? 0)) {
    return { ...token, error: "RefreshTokenError" };
  }

  const result = await tryApi(
    api.post<RefreshTokenResponse>("/Auth/refresh-token", { refreshToken: token.refreshToken }),
  );

  if (!result.ok) {
    // 401 = refresh token muerto → sesión terminada. Red o 5xx: se conserva el token y se reintenta.
    return result.error.status === 401 ? { ...token, error: "RefreshTokenError" } : token;
  }

  const data = result.data;
  return {
    ...token,
    accessToken: data.accessToken,
    accessTokenExpiresAt: Date.parse(data.accessTokenExpiresAtUtc),
    refreshToken: data.refreshToken,
    refreshTokenExpiresAt: Date.parse(data.refreshTokenExpiresAtUtc),
    error: undefined,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    // La sesión nace en calidoc-api (registro o login). Este provider solo recibe esa sesión sellada
    // por el servidor (`sealSession`); no valida credenciales ni llama a la API.
    Credentials({
      id: "sesion",
      credentials: { session: {} },
      async authorize(credentials) {
        const sealed = credentials?.session;
        const payload = typeof sealed === "string" ? await openSession(sealed) : null;
        return payload ? { id: payload.user.id, payload } : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.payload) {
        const { user: sessionUser, ...tokens } = user.payload;
        return { ...tokens, user: sessionUser };
      }
      if (Date.now() < (token.accessTokenExpiresAt ?? 0) - REFRESH_MARGIN_MS) return token;
      return refreshTokens(token);
    },
    session({ session, token }) {
      if (token.user) session.user = { ...session.user, ...token.user };
      session.error = token.error;
      return session;
    },
  },
});
