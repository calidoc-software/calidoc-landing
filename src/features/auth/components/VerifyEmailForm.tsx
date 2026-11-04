"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui/Button";
import { OtpField } from "@/shared/ui/OtpField";
import { completeRegistration } from "../actions/complete-registration";
import { OTP_LENGTH, otpSchema } from "../schemas/otp.schema";

export function VerifyEmailForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { update } = useSession();

  function handleChange(value: string) {
    setCode(value);
    if (error) setError(undefined);
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = otpSchema.safeParse({ codigo: code });
    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    setFormError(undefined);
    startTransition(async () => {
      const outcome = await completeRegistration(result.data);
      if (!outcome.ok) {
        if (outcome.field) setError(outcome.message);
        else setFormError(outcome.message);
        return;
      }
      // La sesión se creó en el servidor: el SessionProvider ya había leído "sin sesión", así que
      // hay que releerla para que el header cambie sin recargar.
      await update();
      router.replace(routes.home);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <OtpField
        label="Código de verificación"
        length={OTP_LENGTH}
        value={code}
        onChange={handleChange}
        error={error}
        disabled={pending}
        autoFocus
      />
      {formError && (
        <p
          role="alert"
          className="rounded-xl bg-error/10 px-3.5 py-2.5 text-sm font-medium text-error-600"
        >
          {formError}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending} aria-busy={pending}>
        {pending ? "Creando tu cuenta…" : "Verificar y crear cuenta"}
      </Button>
    </form>
  );
}
