import Image from "next/image";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      {/* Fondos decorativos */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "#00b7e2" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "#2c9b6b" }}
      />

      <main className="relative z-10 flex w-full max-w-xl flex-col items-center gap-8">
        <img
          src="/logos/logo.png"
          alt="Calidoc"
          width={501}
          height={200}
      
          className="h-auto w-56 sm:w-64"
        />

        <span
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
          style={{ borderColor: "#00b7e2", color: "#0f2b33" }}
        >
          <span
            className="h-2 w-2 animate-pulse rounded-full"
            style={{ background: "#2c9b6b" }}
          />
          Sitio en construcción
        </span>

        <h1 className="text-4xl font-bold tracking-tight text-[#0f2b33] sm:text-5xl">
          Muy pronto disponible
        </h1>

        <p className="max-w-md text-base leading-7 text-[#3f5b63] sm:text-lg">
          Estamos construyendo <strong>Calidoc</strong>, la plataforma de
          telemedicina donde encontrarás todo tipo de especialidades para
          atenderte de forma <strong>presencial</strong> o{" "}
          <strong>virtual</strong>.
        </p>

        <div
          className="h-1 w-40 rounded-full"
          style={{
            background: "linear-gradient(90deg, #00b7e2 0%, #2c9b6b 100%)",
          }}
        />

        <p className="text-sm text-[#6b8188]">
          Trabajando para atenderte mejor · Vuelve pronto
        </p>
      </main>

      <footer className="relative z-10 mt-16 text-xs text-[#6b8188]">
        © {new Date().getFullYear()} Calidoc · Telemedicina
      </footer>
    </div>
  );
}
