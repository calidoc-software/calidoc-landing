/** `ana.perez@gmail.com` → `a*******@gmail.com`: confirma el destino sin exponer el correo completo. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local.slice(0, 1)}${"*".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}
