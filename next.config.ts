import type { NextConfig } from "next";
// Import relativo: next.config.ts se carga fuera del bundler y no resuelve el alias "@/".
import { env } from "./src/shared/lib/env";

const isDev = process.env.NODE_ENV === "development";

const apiOrigin = new URL(env.NEXT_PUBLIC_API_BASE_URL).origin;
// Culqi (pasarela de pago): script del checkout, iframe y llamadas de tokenización.
const culqi = "https://*.culqi.com";
// Google Identity Services (acceso con Google): script, popup/iframes y estilos del cliente.
const google = "https://accounts.google.com/gsi/";
const googleScript = "https://accounts.google.com/gsi/client";
const googleStyle = "https://accounts.google.com/gsi/style";

// CSP sin nonces para conservar SSG/ISR (un nonce obliga a renderizar todo de forma dinámica).
// Cada origen de terceros nuevo (analytics, mapas, CDN de imágenes…) se agrega aquí de forma explícita.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${culqi} ${googleScript}${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline' ${googleStyle}`,
  `img-src 'self' blob: data: ${apiOrigin} ${culqi}`,
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin} ${culqi} ${google}`,
  `frame-src ${culqi} ${google}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // En desarrollo rompería las llamadas http://localhost hacia la API local.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Sin optimizador de Vercel (/_next/image) para no pagar por transformaciones: las imágenes se
  // optimizan a mano antes de subirlas.
  images: { unoptimized: true },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
