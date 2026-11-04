import { CalendarCheck, Lock, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

const tones = {
  success: "bg-secondary-500/10 text-secondary-600",
  primary: "bg-tertiary-50 text-primary-600",
  accent: "bg-accent-500/15 text-accent-600",
} as const;

const surfaces = {
  glass:
    "bg-gradient-to-br from-white/55 to-white/15 shadow-[0_8px_32px_rgb(2_25_44/0.10)] backdrop-blur-xl backdrop-saturate-150",
  solid: "bg-white shadow-card",
} as const;

function FloatingCard({
  icon,
  tone,
  surface = "glass",
  title,
  detail,
  className,
}: {
  icon: ReactNode;
  tone: keyof typeof tones;
  surface?: keyof typeof surfaces;
  title: string;
  detail: string;
  className: string;
}) {
  return (
    <div
      className={`absolute flex w-[14.5rem] items-center gap-3 rounded-2xl py-3 pr-5 pl-3 will-change-transform ${surfaces[surface]} ${className}`}
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}
      >
        {icon}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-bold text-neutral-900">{title}</span>
        <span className="text-xs font-medium text-neutral-700">{detail}</span>
      </span>
    </div>
  );
}

export function HeroFloatingCards() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-[62%] xl:block"
    >
      <FloatingCard
        icon={<ShieldCheck size={20} />}
        tone="accent"
        title="Médico verificado"
        detail="Especialista de confianza"
        className="top-[80%] left-[35%] animate-float"
      />
      <FloatingCard
        icon={<CalendarCheck size={20} />}
        tone="success"
        title="Cita confirmada"
        detail="Virtual · 4:30 p. m."
        className="top-[50%] left-[26%] animate-float-slow"
      />
      <FloatingCard
        icon={<Lock size={20} />}
        tone="primary"
        title="Pago seguro"
        detail="Con tarjeta o Yape"
        className="top-[70%] right-4 animate-float-alt"
      />
    </div>
  );
}
