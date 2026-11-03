import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/shared/layout/Container";
import { HeroFloatingCards } from "./HeroFloatingCards";

export function Hero({ search }: { search: ReactNode }) {
  return (
    <section aria-labelledby="hero-title" className="overflow-x-clip">
      <Container>
        <div className="bg-hero-soft relative flex flex-col rounded-3xl lg:min-h-[max(40rem,calc(100svh-8rem))]">
          <div className="relative z-20 mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 lg:pt-8">
            {search}
          </div>

          <div className="relative z-10 px-6 pt-12 sm:px-12 sm:pt-16 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-20 lg:pt-8 lg:pb-16">
            <h1 id="hero-title" className="max-w-3xl text-4xl sm:text-6xl lg:max-w-2xl lg:text-6xl">
              Encuentra a tu médico ideal, estés donde estés.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-700 sm:text-xl sm:leading-9 lg:max-w-md">
              Agenda consultas virtuales o presenciales con especialistas de confianza, de forma
              sencilla y rápida.
            </p>
          </div>

          <div className="relative mt-6 aspect-[4/3] [mask-image:linear-gradient(to_bottom,transparent,black_30%)] overflow-hidden rounded-b-3xl lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:aspect-auto lg:w-[62%] lg:rounded-b-none lg:rounded-r-3xl lg:[mask-image:linear-gradient(to_right,transparent,black_38%)]">
            <Image
              src="/images/hero-teleconsulta.webp"
              alt="Médica con uniforme azul saludando durante una videollamada desde su celular"
              fill
              priority
              sizes="(min-width: 1024px) 62vw, 100vw"
              className="object-cover object-[65%_center] brightness-[0.97] saturate-[0.8]"
            />
          </div>

          <HeroFloatingCards />
        </div>
      </Container>
    </section>
  );
}
