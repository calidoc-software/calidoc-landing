import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, RegisterForm } from "@/features/auth";
import { routes } from "@/shared/config/routes";

export const metadata: Metadata = {
  title: "Crea tu cuenta — Calidoc",
  description: "Crea tu cuenta en Calidoc para agendar consultas con especialistas.",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Crea tu cuenta"
      description="Estás a un paso de estar más cerca de tu salud."
      footer={
        <>
          ¿Ya tienes una cuenta?{" "}
          <Link href={routes.login} className="font-semibold text-primary-600 hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
