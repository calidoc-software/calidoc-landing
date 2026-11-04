import type { ReactNode } from "react";
import { Logo } from "@/shared/layout/Logo";

type AuthCardProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <section aria-labelledby="auth-title" className="relative z-10 w-full max-w-sm">
      <div className="flex flex-col items-center gap-5 text-center">
        <Logo />
        <h1 id="auth-title" className="text-2xl sm:text-3xl">
          {title}
        </h1>
        {description && <p className="-mt-2 text-sm leading-6 text-neutral-600">{description}</p>}
      </div>
      <div className="mt-8">{children}</div>
      {footer && <p className="mt-6 text-center text-sm text-neutral-500">{footer}</p>}
    </section>
  );
}
