"use client";

import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from "input-otp";
import { useId } from "react";
import { cn } from "@/shared/lib/utils/cn";

type OtpFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

function Slot({ char, isActive, hasFakeCaret, error }: SlotProps & { error: boolean }) {
  return (
    <div
      className={cn(
        "relative flex h-14 w-11 items-center justify-center rounded-field border bg-white text-xl font-bold text-neutral-900 transition-colors duration-200 sm:w-12",
        error
          ? "border-error-600"
          : isActive
            ? "border-primary-500 ring-3 ring-primary-500/15"
            : "border-neutral-300",
      )}
    >
      {char}
      {hasFakeCaret && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-6 w-px animate-pulse bg-primary-500" />
        </span>
      )}
    </div>
  );
}

export function OtpField({
  label,
  value,
  onChange,
  onComplete,
  length = 6,
  error,
  disabled,
  autoFocus,
}: OtpFieldProps) {
  const messageId = `${useId()}-message`;

  return (
    <div className="flex flex-col items-center gap-3">
      <OTPInput
        maxLength={length}
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        pattern={REGEXP_ONLY_DIGITS}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
        disabled={disabled}
        autoFocus={autoFocus}
        containerClassName="group flex items-center has-[:disabled]:opacity-50"
        render={({ slots }) => (
          <div className="flex gap-2">
            {slots.map((slot, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: las casillas son posiciones fijas
              <Slot key={index} {...slot} error={Boolean(error)} />
            ))}
          </div>
        )}
      />
      {error && (
        <p id={messageId} className="text-sm font-medium text-error-600">
          {error}
        </p>
      )}
    </div>
  );
}
