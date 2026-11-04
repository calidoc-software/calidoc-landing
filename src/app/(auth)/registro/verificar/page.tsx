import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard, maskEmail, VerifyEmailForm } from "@/features/auth";
import { readPendingRegistration } from "@/features/auth/server";
import { routes } from "@/shared/config/routes";

export const metadata: Metadata = {
  title: "Verifica tu correo — Calidoc",
  robots: { index: false },
};

export default async function VerifyEmailPage() {
  const pending = await readPendingRegistration();
  if (!pending) redirect(routes.register);

  return (
    <AuthCard
      title="Revisa tu correo"
      description={
        <>
          Enviamos un código de 6 dígitos a{" "}
          <strong className="font-semibold text-neutral-900">{maskEmail(pending.correo)}</strong>.
        </>
      }
      footer={
        <>
          ¿Te equivocaste de correo?{" "}
          <Link href={routes.register} className="font-semibold text-primary-600 hover:underline">
            Cambiar correo
          </Link>
        </>
      }
    >
      <VerifyEmailForm />
    </AuthCard>
  );
}
