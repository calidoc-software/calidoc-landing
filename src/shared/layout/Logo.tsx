import Image from "next/image";
import Link from "next/link";
import { routes } from "@/shared/config/routes";

export function Logo() {
  return (
    <Link href={routes.home} aria-label="Calidoc, ir al inicio" className="inline-flex rounded-md">
      <Image
        src="/logos/isologo-mark.png"
        alt=""
        width={160}
        height={157}
        className="h-11 w-auto md:hidden"
      />
      <Image
        src="/logos/logo.png"
        alt=""
        width={501}
        height={200}
        className="hidden h-12 w-auto md:block lg:h-14"
      />
    </Link>
  );
}
