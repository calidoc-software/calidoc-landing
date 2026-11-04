import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, LoginForm, safeRedirectPath } from "@/features/auth";
import { routes } from "@/shared/config/routes";

export const metadata: Metadata = {
  title: "Inicia sesión — Calidoc",
  description: "Inicia sesión en Calidoc para agendar y ver tus citas.",
  robots: { index: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;

  return (
    <AuthCard
      title="Inicia sesión"
      footer={
        <>
          ¿No tienes una cuenta?{" "}
          <Link href={routes.register} className="font-semibold text-primary-600 hover:underline">
            Crea tu cuenta
          </Link>
        </>
      }
    >
      <LoginForm redirectTo={safeRedirectPath(callbackUrl, routes.home)} />
    </AuthCard>
  );
}
