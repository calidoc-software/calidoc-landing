import Image from "next/image";
import Link from "next/link";
import { routes } from "@/shared/config/routes";

export function Logo() {
  return (
    <Link href={routes.home} aria-label="Calidoc, ir al inicio" className="inline-flex rounded-md">
      <Image
        src="/logos/isologo.png"
        alt="Calidoc"
        width={501}
        height={200}
        className="h-11 w-auto lg:h-12"
      />
    </Link>
  );
}
