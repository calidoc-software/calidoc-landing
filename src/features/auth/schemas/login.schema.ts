import { z } from "zod";

export const loginSchema = z.object({
  correo: z
    .string()
    .trim()
    .min(1, "Ingresa tu correo electrónico.")
    .max(254, "El correo es demasiado largo.")
    .pipe(z.email({ error: "Revisa tu correo: debe tener el formato nombre@dominio.com." })),
  // Sin reglas de longitud mínima: al iniciar sesión solo se exige que no esté vacía.
  contrasena: z.string().min(1, "Ingresa tu contraseña.").max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type LoginField = keyof LoginInput;
