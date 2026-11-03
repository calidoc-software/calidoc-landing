import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils/cn";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-primary-500 text-white hover:bg-primary-400 active:bg-primary-600",
  secondary:
    "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200",
  soft: "border border-neutral-300 bg-neutral-100 text-neutral-900 hover:bg-white active:bg-neutral-200",
  ghost: "text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200",
} as const;

const sizes = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

type StyleProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

function buttonStyles({ variant = "primary", size = "md" }: StyleProps, className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: StyleProps & ComponentProps<"button">) {
  return <button type={type} className={buttonStyles({ variant, size }, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: StyleProps & ComponentProps<typeof Link>) {
  return <Link className={buttonStyles({ variant, size }, className)} {...props} />;
}
