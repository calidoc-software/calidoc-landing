import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/shared/layout/Container";
import { HeroFloatingCards } from "./HeroFloatingCards";

export function Hero({ search }: { search: ReactNode }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative -mt-[5.0625rem] flex flex-col overflow-hidden lg:min-h-[90svh] bg-neutral-50 lg:-mt-[6.0625rem]"
    >
      <svg
        aria-hidden
        viewBox="0 0 540 160"
        className="pointer-events-none absolute bottom-0 left-0 w-[min(40vw,38rem)] text-tertiary-200"
      >
        <defs>
          <linearGradient id="hero-blob" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <path
          fill="url(#hero-blob)"
          d="M0 10C70 50 150 78 230 76C320 74 390 0 470 6C520 10 535 90 540 160H0Z"
        />
      </svg>

      <Container className="relative z-10 flex flex-1 flex-col pt-28 lg:min-h-160 lg:pt-32">
        <div className="relative z-20 mx-auto w-full max-w-3xl">{search}</div>

        <div className="relative z-10 pt-12 sm:pt-16 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:pt-8 lg:pb-20">
          <h1
            id="hero-title"
            className="max-w-3xl text-4xl font-bold sm:text-6xl lg:max-w-2xl lg:text-6xl"
          >
            Encuentra al{" "}
            <span className="box-decoration-clone bg-linear-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent">
              especialista ideal
            </span>
            , estés donde estés.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-7 text-neutral-700 sm:text-xl sm:leading-8 lg:max-w-md">
            Agenda consultas virtuales o presenciales con profesionales de salud de confianza, de
            forma sencilla y rápida.
          </p>
        </div>
      </Container>

      <div className="relative mt-6 aspect-[1672/941] [mask-image:linear-gradient(to_bottom,transparent,black_18%)] lg:absolute lg:right-0 lg:bottom-0 lg:mt-0 lg:w-[min(72%,1280px)] lg:[mask-composite:intersect] lg:[mask-image:linear-gradient(to_right,transparent_10%,black_40%),linear-gradient(to_bottom,transparent,black_12%)]">
        <Image
          src="/images/hero-teleconsulta.webp"
          alt="Médico de bata blanca conversando por videollamada con una paciente que sonríe en la pantalla de su laptop"
          fill
          priority
          sizes="(min-width: 1024px) min(72vw, 1280px), 100vw"
          className="animate-discover object-cover"
        />
      </div>

      <HeroFloatingCards />
    </section>
  );
}
