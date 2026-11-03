const isDev = process.env.NODE_ENV === "development";

/**
 * Opciones de caché para endpoints públicos. En desarrollo no se cachea, para ver de inmediato los
 * cambios de la API; en producción se revalida cada hora y se puede invalidar por `tags`.
 */
export function publicCache(tags: string[], revalidate = 3600) {
  return isDev ? ({ cache: "no-store" } as const) : { next: { revalidate, tags } };
}
