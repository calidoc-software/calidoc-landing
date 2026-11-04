import { z } from "zod";

const PERSON_NAME = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;

const personName = (required: string, label: string) =>
  z
    .string()
    .trim()
    .min(1, required)
    .min(2, `${label} deben tener al menos 2 letras.`)
    .max(80, `${label} no pueden superar los 80 caracteres.`)
    .regex(PERSON_NAME, "Usa solo letras, espacios, guiones o apóstrofes.");

export const registerSchema = z.object({
  nombres: personName("Ingresa tus nombres.", "Tus nombres"),
  apellidos: personName("Ingresa tus apellidos.", "Tus apellidos"),
  correo: z
    .string()
    .trim()
    .min(1, "Ingresa tu correo electrónico.")
    .max(254, "El correo es demasiado largo.")
    .pipe(z.email({ error: "Revisa tu correo: debe tener el formato nombre@dominio.com." })),
  contrasena: z
    .string()
    .min(1, "Crea una contraseña.")
    .min(8, "Usa al menos 8 caracteres.")
    .max(128, "La contraseña no puede superar los 128 caracteres."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterField = keyof RegisterInput;
