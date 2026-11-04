"use server";

import { api, tryApi } from "@/shared/lib/api";
import { getSessionTokens } from "./server-tokens";

/**
 * Revoca el refresh token en calidoc-api. Es de mejor esfuerzo: si la API no responde (o el access
 * token ya venció) no impide cerrar la sesión local. La cookie la borra `signOut` de
 * `next-auth/react` en el cliente, que además actualiza el estado de `useSession` (un
 * `signOut` de servidor deja la UI mostrando al usuario hasta recargar).
 */
export async function revokeSession() {
  const session = await getSessionTokens();
  if (session) {
    await tryApi(
      api.post(
        "/Auth/logout",
        { userId: session.user.id, refreshToken: session.refreshToken },
        { token: session.accessToken },
      ),
    );
  }
}
