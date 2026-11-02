"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main>
      <p>Algo salió mal.</p>
      <button type="button" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
