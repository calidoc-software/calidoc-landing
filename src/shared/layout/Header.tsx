"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { routes } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils/cn";
import { ButtonLink } from "@/shared/ui/Button";
import { Container } from "./Container";
import { Logo } from "./Logo";

const navLinks = [
  { href: routes.specialties, label: "Especialidades" },
  { href: routes.howItWorks, label: "Cómo funciona" },
  { href: routes.forDoctors, label: "Para profesionales" },
];

const navLinkStyles =
  "rounded-md px-1 py-2 text-base font-bold text-neutral-900 transition-colors duration-200 hover:text-primary-600";

export function Header() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const solid = scrolled || open;

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="absolute inset-x-0 top-0 h-2" />
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-colors duration-200",
          solid
            ? "border-neutral-200 bg-white/70 backdrop-blur-md"
            : "border-transparent bg-transparent",
        )}
      >
        <Container className="flex h-20 items-center justify-between gap-8 py-3 lg:h-24">
          <Logo />

          <nav aria-label="Principal" className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkStyles}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href={routes.register} className={navLinkStyles}>
              Crear cuenta
            </Link>
            <ButtonLink href={routes.login} variant="soft" size="lg">
              Iniciar sesión
            </ButtonLink>
          </div>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex size-11 items-center justify-center rounded-full text-neutral-900 transition-colors duration-200 hover:bg-neutral-100 md:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </Container>

        {open && (
          <div id="menu-movil" className="border-t border-neutral-200 md:hidden">
            <Container className="flex flex-col gap-1 py-4">
              <nav aria-label="Principal móvil" className="flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md py-3 text-lg font-bold text-neutral-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-3 flex flex-col gap-2">
                <ButtonLink
                  href={routes.login}
                  variant="secondary"
                  size="lg"
                  onClick={() => setOpen(false)}
                >
                  Iniciar sesión
                </ButtonLink>
                <Link
                  href={routes.register}
                  onClick={() => setOpen(false)}
                  className="rounded-md py-3 text-center text-base font-bold text-neutral-900"
                >
                  Crear cuenta
                </Link>
              </div>
            </Container>
          </div>
        )}
      </header>
    </>
  );
}
