"use client";

import { SessionProvider as AuthSessionProvider } from "next-auth/react";

/**
 * Lee la sesión desde el cliente (`/api/auth/session`) para que las páginas públicas sigan siendo
 * estáticas (SSG/ISR): llamar a `auth()` en un layout las volvería dinámicas. Además, esa ruta es
 * donde la cookie se puede reescribir cuando el access token se renueva.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
