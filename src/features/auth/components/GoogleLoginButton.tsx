"use client";

import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { env } from "@/shared/lib/env";
import { GoogleButton } from "./GoogleButton";

type GoogleLoginButtonProps = {
  onCode: (code: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
};

function Trigger({ onCode, onError, disabled }: GoogleLoginButtonProps) {
  const start = useGoogleLogin({
    flow: "auth-code",
    scope: "openid email profile",
    onSuccess: ({ code }) => onCode(code),
    onError: () => onError("No pudimos conectar con Google. Inténtalo de nuevo."),
    onNonOAuthError: ({ type }) => {
      // Cerrar el popup es cancelar: no es un error que mostrar.
      if (type === "popup_failed_to_open") {
        onError("Tu navegador bloqueó la ventana de Google. Permite las ventanas emergentes.");
      }
    },
  });

  return <GoogleButton onClick={() => start()} disabled={disabled} />;
}

/** Botón propio de Google: abre el popup de autorización y entrega el código al formulario. */
export function GoogleLoginButton(props: GoogleLoginButtonProps) {
  const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return null;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Trigger {...props} />
    </GoogleOAuthProvider>
  );
}
