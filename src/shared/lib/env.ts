import { z } from "zod";

// Variables públicas (NEXT_PUBLIC_*): seguras para importar desde Client Components.
// Las variables privadas (AUTH_SECRET, etc.) irán en un archivo aparte con `server-only`.
const schema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url(),
  NEXT_PUBLIC_CULQI_PUBLIC_KEY: z.string().min(1).optional(),
});

// Next solo reemplaza accesos literales a `process.env.NEXT_PUBLIC_*`, por eso cada
// variable se lista explícitamente en vez de pasar `process.env` completo.
const parsed = schema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_CULQI_PUBLIC_KEY: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Variables de entorno inválidas o faltantes:\n${details}`);
}

export const env = parsed.data;
