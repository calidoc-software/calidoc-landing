/** Solo rutas internas: evita que `?callbackUrl=` sirva de redirección abierta a otro sitio. */
export function safeRedirectPath(value: string | string[] | undefined, fallback: string): string {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path?.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return fallback;
  }
  return path;
}
