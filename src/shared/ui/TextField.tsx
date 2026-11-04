import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/shared/lib/utils/cn";

export type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
};

export function TextField({ label, error, hint, trailing, className, ...props }: TextFieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-neutral-900">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            "h-11 w-full rounded-field border bg-white px-3.5 text-base text-neutral-900 transition-colors duration-200 placeholder:text-neutral-400 focus:outline-none focus-visible:outline-none disabled:bg-neutral-100",
            error
              ? "border-error-600 focus:border-error-600 focus:ring-3 focus:ring-error-600/15"
              : "border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-3 focus:ring-primary-500/15",
            trailing ? "pr-12" : undefined,
            className,
          )}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {message && (
        <p
          id={messageId}
          className={cn("text-sm", error ? "font-medium text-error-600" : "text-neutral-500")}
        >
          {message}
        </p>
      )}
    </div>
  );
}
