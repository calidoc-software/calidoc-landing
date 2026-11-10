import "server-only";
import { z } from "zod";

// Variables privadas: solo existen en el servidor. Las públicas (NEXT_PUBLIC_*) viven en env.ts.
const schema = z.object({
  AUTH_SECRET: z.string().min(32, "debe tener al menos 32 caracteres"),
  // Secreto de cliente de Google: solo para canjear el código de autorización en el servidor.
  GOOGLE_CLIENT_SECRET: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
});

const parsed = schema.safeParse({
  AUTH_SECRET: process.env.AUTH_SECRET,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Variables de entorno del servidor inválidas o faltantes:\n${details}`);
}

export const serverEnv = parsed.data;
