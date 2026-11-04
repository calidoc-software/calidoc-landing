"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui/Button";
import { PasswordField } from "@/shared/ui/PasswordField";
import { TextField } from "@/shared/ui/TextField";
import { startRegistration } from "../actions/start-registration";
import { type RegisterField, registerSchema } from "../schemas/register.schema";
import { GoogleButton } from "./GoogleButton";

type FieldErrors = Partial<Record<RegisterField, string>>;

const fieldOrder: RegisterField[] = ["nombres", "apellidos", "correo", "contrasena"];

export function RegisterForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [emailRegistered, setEmailRegistered] = useState(false);
  const [pending, startTransition] = useTransition();

  function validateField(field: RegisterField, value: string) {
    const result = registerSchema.shape[field].safeParse(value);
    setErrors((current) => ({
      ...current,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  }

  function bind(field: RegisterField) {
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
    const result = registerSchema.safeParse(Object.fromEntries(new FormData(form)));

    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as RegisterField;
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
      const failure = await startRegistration(result.data);
      setFormError(failure.message);
      setEmailRegistered(failure.emailRegistered ?? false);
      if (failure.fieldErrors) setErrors(failure.fieldErrors);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Nombres"
            autoComplete="given-name"
            placeholder="Tus nombres"
            required
            {...bind("nombres")}
          />
          <TextField
            label="Apellidos"
            autoComplete="family-name"
            placeholder="Tus apellidos"
            required
            {...bind("apellidos")}
          />
        </div>
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
          autoComplete="new-password"
          placeholder="Crea una contraseña"
          hint="Mínimo 8 caracteres."
          required
          {...bind("contrasena")}
        />
        {formError && (
          <p
            role="alert"
            className="rounded-xl bg-error/10 px-3.5 py-2.5 text-sm font-medium text-error-600"
          >
            {formError}
            {emailRegistered && (
              <>
                {" "}
                <Link href={routes.login} className="font-semibold underline">
                  Inicia sesión
                </Link>
                .
              </>
            )}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="mt-1 w-full"
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? "Enviando código…" : "Continuar"}
        </Button>
      </form>

      <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
        <span aria-hidden className="h-px flex-1 bg-neutral-200" />o
        <span aria-hidden className="h-px flex-1 bg-neutral-200" />
      </div>

      <GoogleButton />

      <p className="text-center text-xs leading-5 text-neutral-500">
        Al crear tu cuenta aceptas los{" "}
        <Link href={routes.terms} className="font-semibold text-neutral-700 underline">
          Términos de uso
        </Link>{" "}
        y la{" "}
        <Link href={routes.privacy} className="font-semibold text-neutral-700 underline">
          Política de privacidad
        </Link>
        .
      </p>
    </div>
  );
}
