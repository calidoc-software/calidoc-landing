import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[88rem] px-4 sm:px-8 lg:px-12", className)}
      {...props}
    />
  );
}
