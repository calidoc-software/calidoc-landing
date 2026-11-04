"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { Button } from "@/shared/ui/Button";
import { PasswordField } from "@/shared/ui/PasswordField";
import { TextField } from "@/shared/ui/TextField";
import { login } from "../actions/login";
import { type LoginField, loginSchema } from "../schemas/login.schema";
import { GoogleButton } from "./GoogleButton";

type FieldErrors = Partial<Record<LoginField, string>>;

const fieldOrder: LoginField[] = ["correo", "contrasena"];

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { update } = useSession();

  function validateField(field: LoginField, value: string) {
    const result = loginSchema.shape[field].safeParse(value);
    setErrors((current) => ({
      ...current,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  }

  function bind(field: LoginField) {
    return {
      name: field,
      error: errors[field],
      onBlur: (event: React.FocusEvent<HTMLInputElement>) =>
        validateField(field, event.currentTarget.value),
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        if (errors[field]) validateField(field, event.currentTarget.value);
      },
    };
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = loginSchema.safeParse(Object.fromEntries(new FormData(form)));

    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as LoginField;
        next[field] ??= issue.message;
      }
      setErrors(next);
      const firstInvalid = fieldOrder.find((field) => next[field]);
      if (firstInvalid) form.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setErrors({});
    setFormError(undefined);
    startTransition(async () => {
      const outcome = await login(result.data);
      if (!outcome.ok) {
        setFormError(outcome.message);
        return;
      }
      // La sesión se creó en el servidor: se relee para que el header cambie sin recargar.
      await update();
      router.replace(redirectTo);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tucorreo@ejemplo.com"
          required
          {...bind("correo")}
        />
        <PasswordField
          label="Contraseña"
          autoComplete="current-password"
          placeholder="Tu contraseña"
          required
          {...bind("contrasena")}
        />
        {formError && (
          <p
            role="alert"
            className="rounded-xl bg-error/10 px-3.5 py-2.5 text-sm font-medium text-error-600"
          >
            {formError}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="mt-1 w-full"
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? "Iniciando sesión…" : "Iniciar sesión"}
        </Button>
      </form>

      <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
        <span aria-hidden className="h-px flex-1 bg-neutral-200" />o
        <span aria-hidden className="h-px flex-1 bg-neutral-200" />
      </div>

      <GoogleButton />
    </div>
  );
}
