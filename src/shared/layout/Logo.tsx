import Image from "next/image";
import Link from "next/link";
import { routes } from "@/shared/config/routes";

export function Logo() {
  return (
    <Link
      href={routes.home}
      aria-label="Calidoc, ir al inicio"
      className="inline-flex items-center gap-2 rounded-md"
    >
      <Image
        src="/logos/isologo.png"
        alt=""
        width={501}
        height={200}
        className="h-11 w-auto lg:h-12"
      />
      {/* En móvil solo el isologo; el nombre aparece desde md. */}
      <span
        aria-hidden
        className="hidden text-2xl font-bold tracking-tight text-neutral-900 md:inline"
      >
        Calidoc
      </span>
    </Link>
  );
}
