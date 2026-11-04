"use client";

import { CalendarDays, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { routes } from "@/shared/config/routes";
import type { SessionUser } from "@/shared/lib/auth/session";
import { cn } from "@/shared/lib/utils/cn";

type UserMenuProps = {
  user: SessionUser;
  onLogout: () => void;
  loggingOut: boolean;
};

const itemStyles =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-neutral-700 transition-colors duration-200 hover:bg-neutral-50 hover:text-primary-600 disabled:opacity-60";

/** Foto del paciente (o ícono de usuario si no tiene o no carga), con un punto verde de conectado. */
export function Avatar({ user, className }: { user: SessionUser; className?: string }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const photo = user.profilePhotoUrl;
  const showPhoto = photo && failedUrl !== photo;

  return (
    <span className={cn("relative size-11 shrink-0", className)}>
      <span className="flex size-full items-center justify-center overflow-hidden rounded-full bg-primary-50 text-primary-600">
        {showPhoto ? (
          <Image
            src={photo}
            alt=""
            width={44}
            height={44}
            onError={() => setFailedUrl(photo)}
            className="size-full object-cover"
          />
        ) : (
          <User size={28} aria-hidden />
        )}
      </span>
      {/* Indicador de sesión iniciada: decorativo, el estado ya se comunica con el aria-label. */}
      <span
        aria-hidden
        className="absolute right-0 bottom-0 size-2.5 rounded-full bg-secondary-500 ring-2 ring-white"
      />
    </span>
  );
}

export function AccountLinks({
  onNavigate,
  onLogout,
  loggingOut,
}: {
  onNavigate?: () => void;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  return (
    <>
      <Link href={routes.myAppointments} onClick={onNavigate} className={itemStyles}>
        <CalendarDays size={18} aria-hidden />
        Mis citas
      </Link>
      <button type="button" onClick={onLogout} disabled={loggingOut} className={itemStyles}>
        <LogOut size={18} aria-hidden />
        {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
    </>
  );
}

export function UserMenu({ user, onLogout, loggingOut }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Menú de tu cuenta, sesión iniciada"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full ring-offset-2 transition-shadow duration-200 hover:ring-2 hover:ring-primary-200"
      >
        <Avatar user={user} />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full z-50 mt-3 w-64 rounded-xl border border-neutral-200 bg-white p-2 shadow-raised"
        >
          <div className="border-b border-neutral-200 px-3 pt-2 pb-3">
            <p className="truncate text-sm font-bold text-neutral-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-neutral-500">{user.email}</p>
          </div>
          <div className="mt-2 flex flex-col">
            <AccountLinks
              onNavigate={() => setOpen(false)}
              onLogout={onLogout}
              loggingOut={loggingOut}
            />
          </div>
        </div>
      )}
    </div>
  );
}
