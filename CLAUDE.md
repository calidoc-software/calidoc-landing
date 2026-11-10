# CLAUDE.md — Calidoc Landing Page

Este archivo le da contexto permanente al agente para cualquier tarea de diseño, maquetación o construcción de módulos dentro de la landing page de Calidoc. Léelo por completo antes de generar o modificar cualquier componente visual o de estructura.

> Documentación de referencia completa (fuente de verdad para diseño, no reemplazada por este archivo): [Diseño Visual — Sistema de Marca](https://app.notion.com/p/Dise-o-Visual-Sistema-de-Marca-3cec9b54d241815b93fde9e2bc56a8a9)
> Ante cualquier ambigüedad entre este archivo y Notion, Notion es la fuente de verdad para diseño — este archivo es un resumen operativo para que el agente no tenga que consultarlo en cada tarea.

> **Nota de stack (actualizado):** este módulo migró de Astro a **Next.js**. Si en algún momento aparece una referencia a Astro, islands, o Cloudflare Pages para este repo en documentación antigua, está desactualizada — Next.js + Vercel es la decisión vigente.

---

## 1. Qué es Calidoc

Calidoc es un marketplace de salud peruano que conecta pacientes con médicos y especialistas. Cubre todo el journey: descubrimiento → agendamiento → consulta (virtual o presencial) → receta. Mercado inicial: Perú. Aspiración: expansión LATAM.

Competidor de referencia directo: **Doctoralia**. El objetivo explícito del producto es superar su experiencia, que se percibe sobrecargada y con estética corporativa genérica, con algo más limpio, cálido y sofisticado sin sacrificar la densidad funcional que Doctoralia sí resuelve bien (filtros, multi-sede, SEO long-tail).

La confianza del paciente es el factor #1 de conversión en este producto — cada decisión de diseño se evalúa contra ese criterio antes que contra "se ve bien".

---

## 2. Alcance de este repo (importante)

Este repo/contexto cubre **únicamente la landing page pública + el flujo ligero de agendamiento para pacientes**. Explícitamente NO cubre:

- El panel administrativo/dashboard de médicos (agenda del doctor, gestión de pacientes, etc.)
- El dashboard autenticado post-booking con historial clínico, videollamadas y recetas

Esos dos son **una aplicación completamente distinta** (fuera de este repo). Si una tarea suena a "panel de doctor" o "historial médico completo", no es de este contexto — hay que confirmarlo antes de construir algo aquí.

Lo que SÍ vive en este repo:
- Páginas informativas/marketing (home, especialidades, nosotros, blog)
- Buscador y listado de doctores
- Perfil público del doctor
- Flujo de agendar cita (selección de fecha/hora, confirmación)
- Autenticación simple del paciente (login/verificación) solo para poder agendar y ver "mis citas" — no es el sistema de auth completo de la plataforma

---

## 3. Stack

- **Framework:** Next.js (App Router), desplegado en **Vercel**
- **Renderizado por tipo de página:**
  - Home, especialidades, perfiles de doctores → Server Components + SSG/ISR (rápido, indexable, mínimo JS)
  - Buscador/listado de doctores → Server Component para el listado inicial + Client Component solo para filtros interactivos
  - Flujo de agendar cita → Client Components (formulario, calendario) dentro del grupo de rutas de booking
- **Estilos:** Tailwind CSS v4 con los tokens en `src/styles/theme.css` (`@theme`, ver sección 7) — nunca usar la paleta default de Tailwind (`slate`, `blue-500`, etc.)
- **Validación de formularios:** Zod
- **Auth del paciente (solo para agendar/mis-citas):** ligera, tipo magic link/OTP — no es el sistema de permisos de la plataforma completa

Principio general del proyecto (aplica también a este repo): **YAGNI** — no construir infraestructura o abstracciones que no estén justificadas por un requerimiento real. Las convenciones deben ser explícitas para que un segundo desarrollador no pueda aplicarlas mal por error.

---

## 4. Estructura de carpetas y arquitectura

```
src/
├── app/                                  # SOLO ruteo: pages delgadas, layouts, metadata
│   ├── (marketing)/                      # rutas públicas — sin sesión
│   │   ├── page.tsx                      # Home
│   │   ├── especialidades/
│   │   │   ├── page.tsx                  # listado de especialidades (pilar SEO)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx              # ficha de especialidad (SSG/ISR)
│   │   │       └── opengraph-image.tsx
│   │   ├── doctores/
│   │   │   ├── page.tsx                  # listado/buscador (transaccional)
│   │   │   └── [slug]/page.tsx           # perfil del doctor (SSG/ISR)
│   │   ├── nosotros/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── layout.tsx                    # Header/Footer públicos (de shared/layout)
│   │
│   ├── (booking)/                        # flujo de agendar — requiere sesión del paciente
│   │   ├── agendar/
│   │   │   ├── [doctorSlug]/page.tsx     # selección de fecha/hora
│   │   │   └── confirmacion/page.tsx
│   │   ├── mis-citas/page.tsx            # único contenido "privado" de este repo
│   │   └── layout.tsx                    # valida sesión del paciente
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── verificar/page.tsx            # (legacy) magic link / OTP de login
│   │   registro/page.tsx · registro/verificar/page.tsx   # alta de paciente: formulario → código OTP de 6 dígitos
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # Auth.js
│   │   └── revalidate/route.ts           # ISR on-demand (webhook desde calidoc-api)
│   ├── layout.tsx                        # metadata base, fonts, providers
│   ├── sitemap.ts · robots.ts
│   └── error.tsx · not-found.tsx
│
├── features/                             # un dominio de UI = una carpeta autocontenida
│   ├── specialties/
│   │   ├── api/                          # fetchers server-only hacia calidoc-api
│   │   ├── actions/                      # Server Actions (mutaciones)
│   │   ├── components/                   # SpecialtyCard, SpecialtyFilter
│   │   ├── hooks/                        # solo client
│   │   ├── mappers/                      # DTO de la API → modelo de vista
│   │   ├── schemas/                      # zod (forms y validación)
│   │   ├── types.ts
│   │   ├── index.ts                      # API pública client-safe (componentes, tipos, schemas)
│   │   └── server.ts                     # API pública server-only (fetchers, actions)
│   ├── doctors/                          # DoctorCard, DoctorProfileHeader, ReviewsList
│   ├── booking/                          # Calendar, TimeSlotPicker, BookingSummary, useAvailability
│   ├── auth/                             # formularios login/OTP, actions de sesión
│   └── blog/                             # solo si el blog consume MDX/CMS (ver content/)
│
├── shared/                               # nada de negocio, reutilizable por todos
│   ├── ui/                               # design system (Button, Card, Badge, inputs…)
│   ├── layout/                           # Header, Footer, Container
│   ├── lib/
│   │   ├── api/                          # cliente HTTP, manejo de errores, auth header
│   │   ├── seo/                          # helpers generateMetadata(), JSON-LD builders
│   │   ├── auth/                         # config de Auth.js, helpers de sesión
│   │   ├── utils/                        # formatters (fechas, moneda), cn()
│   │   └── env.ts                        # variables de entorno validadas con zod
│   ├── hooks/
│   ├── config/                           # constantes, rutas (routes.ts), site config
│   └── types/
│
├── content/                              # MDX para blog/landing, si aplica
├── styles/                               # globals.css, tokens
└── proxy.ts                              # (ex middleware, Next 16) chequeo optimista de sesión para (booking)
```

### Por qué así

- **Route Groups separan mundos**: `(marketing)`, `(booking)` y `(auth)` no afectan la URL pero permiten `layout.tsx` distintos y aplicar el guard de sesión solo donde hace falta — nada de proteger todo el sitio por defecto.
- **`app/` solo rutea**: refleja el sitemap real. Una `page.tsx` hace como máximo: leer params → llamar un fetcher del feature → componer componentes → exportar `generateMetadata`/`generateStaticParams`. Sin lógica de negocio ni JSX extenso.
- **`features/` por dominio, `shared/` sin negocio**: todo lo que conoce el concepto "doctor", "especialidad" o "cita" vive en su feature. Si no conoce el dominio, va a `shared/`.
- **`shared/ui` es el design system** — todo componente de la sección 7 vive ahí, nunca duplicado dentro de un feature.

### Reglas de dependencia (no negociables)

Flujo permitido: `app → features → shared`. Nunca al revés.

1. `shared/` **no importa** de `features/` ni de `app/`.
2. Un feature **no importa** de otro feature, salvo vía su API pública (`@/features/x` o `@/features/x/server`), nunca por rutas internas (`@/features/x/components/...`). Si dos features se acoplan mucho, evaluar si lo común sube a `shared/` o si son un solo feature.
3. `app/` importa de features solo por su API pública.
4. **Dos puntos de entrada por feature** para no mezclar fronteras server/client en un barrel:
   - `index.ts` → client-safe: componentes, tipos, schemas.
   - `server.ts` → empieza con `import 'server-only'`: fetchers y Server Actions.
5. Los fetchers (`api/`) devuelven **modelos de vista** (ya pasados por `mappers/`); los DTO crudos de calidoc-api no salen del feature.
6. Todo acceso HTTP a calidoc-api pasa por `shared/lib/api`; ningún componente hace `fetch` directo a la API.
7. Variables de entorno solo vía `shared/lib/env.ts` (validadas con zod; falla el build si falta o es inválida una variable requerida), nunca `process.env` suelto. `env.ts` contiene solo variables públicas (`NEXT_PUBLIC_*`, seguras en Client Components); las privadas (`AUTH_SECRET`, etc.) van en `src/shared/lib/env.server.ts` (`import "server-only"`, validadas con zod). Cada variable nueva se declara en el schema y en `.env.example`.
8. Alias de import `@/*` → `src/*`; sin rutas relativas que suban más de un nivel (`../../`).
9. Estas reglas se hacen cumplir con ESLint (`no-restricted-imports` o `eslint-plugin-boundaries`), no solo por convención.

### Convenciones

- **YAGNI en carpetas**: un feature solo crea las subcarpetas que usa hoy (`hooks/`, `actions/`, `mappers/`…). No se crean vacías "por si acaso".
- **Server Component por defecto**; `'use client'` solo en el componente hoja que lo necesita.
- **Co-ubicación**: un componente usado por un solo feature vive en ese feature; solo sube a `shared/ui` cuando lo usa un segundo dominio.
- **Mutaciones** = Server Actions en `actions/` (validan con el schema zod del feature antes de llamar a la API).
- **Tests** junto al archivo (`Foo.test.tsx`).

---

## 5. SEO como ciudadano de primera clase

- `generateMetadata()` por página dinámica (`especialidades/[slug]`, `doctores/[slug]`) con título, descripción y OG dinámicos
- `generateStaticParams()` para pre-renderizar especialidades y doctores en build time (SSG), con `revalidate` (ISR) para actualizarse sin rebuild completo
- `sitemap.ts` y `robots.ts` nativos de Next.js, generados desde la API de Calidoc
- **JSON-LD (schema.org `Physician`, `MedicalOrganization`, `MedicalSpecialty`)** en cada perfil de doctor y página de especialidad — alto impacto en rich snippets para salud/teleconsulta
- Imágenes con `next/image` + `opengraph-image.tsx` por ruta para compartidos en redes

### Modelo de rutas SEO (decisión previa, sigue vigente)

- `/{especialidad}` → página pilar informacional
- `/{especialidad}/{ciudad}` → página de listado transaccional (con filtros avanzados: precio, género, idioma, disponibilidad)
- El buscador del hero envía siempre a la página de listado transaccional, no a la pilar

---

## 6. Dirección de diseño: "Minimalismo cálido con acento atmosférico"

Principio rector: **90% del sitio es una interfaz limpia, blanca/neutral, funcional y de carga instantánea. El 10% restante (hero, header al hacer scroll, algún modal o badge puntual) concentra el "momento wow"** — mesh gradient sutil en CSS puro + glassmorphism quirúrgico. El efecto visual se gasta donde está la acción del usuario (buscador, CTA), nunca donde está el contenido que debe leerse rápido (listados, resultados, formularios).

### Reglas duras (no negociables sin discutirlo explícitamente)

- **NO** aplicar `backdrop-filter: blur()` fuera de estos 4 elementos, que son los únicos con blur de toda la landing: el header sticky y las 3 tarjetas flotantes del hero. Dentro de una misma sección nunca hay más de 3 con blur (el hero tiene 3; el header no cuenta como parte de esa sección porque al hacer scroll tapa el hero). Los 4 son una excepción deliberada por ser una landing; todo lo demás es sólido. Cualquier otro uso requiere discutirlo explícitamente.
- **NO** usar imágenes de fondo (PNG/JPG) para gradientes — todo mesh/gradient del hero es `radial-gradient()`/`conic-gradient()` en CSS puro.
- **NO** aplicar glass o gradiente a secciones completas de contenido largo (listados de doctores, resultados de búsqueda, formularios). Esas secciones son fondo sólido, plano, de máxima legibilidad.
- **NO** usar librerías de animación pesadas (GSAP, Framer Motion completo) solo para scroll-reveal — usar CSS scroll-driven animations (`animation-timeline`) o `IntersectionObserver` nativo dentro de un Client Component ligero.
- **NO** marcar un componente como `'use client'` por defecto — Server Component es la base; solo pasa a cliente lo que necesita estado, efectos o eventos (buscador, filtros, calendario, header sticky).
- **NO** bloquear contenido detrás de JS — todo debe ser visible sin animar como fallback (progressive enhancement).
- Todo motion debe respetar `prefers-reduced-motion: reduce`.
- Máximo un elemento con foco de atención por sección visible a la vez — cero autoplay de carrousels ni loops que compitan con la lectura.
- Excepción permitida, **motion ambiental**: se admiten loops suaves que den vida a la página, solo si cumplen todo esto: (1) afectan únicamente a elementos **decorativos** (`aria-hidden`), nunca a texto que se debe leer, formularios, listados ni al CTA/buscador; (2) amplitud mínima (≤ 8 px de desplazamiento o ≤ 3 % de escala/opacidad) con `ease-in-out`; (3) duración ≥ 6 s por ciclo; (4) solo `transform`/`opacity`; (5) máximo 2–3 elementos animándose a la vez en el viewport, desfasados entre sí para que no se muevan al unísono; (6) se detienen con `prefers-reduced-motion: reduce`. Si el usuario nota el movimiento conscientemente, es demasiado.

### Reveal progresivo al hacer scroll

Cada bloque de contenido (feature, testimonio, card de especialidad) se revela al entrar en el viewport: fade + desplazamiento vertical corto (12–16px), sin rebote, `ease-out`, ~400–600ms. El usuario no debe notar conscientemente la animación.

### Header sticky con glass

- Estado inicial (scroll = 0): transparente o fondo sólido simple, sin blur — integrado al hero.
- Al despegarse del top: `backdrop-filter: blur(10-16px)`, fondo semi-transparente (`bg-white/70`), borde inferior 1px sutil (`neutral-200`). Transición 200–250ms, sin salto.
- Este es uno de los 4 usos de glass presupuestados en toda la página (junto con las 3 tarjetas flotantes del hero). El estado de scroll se maneja en un Client Component mínimo (o `IntersectionObserver` sobre un sentinel), nunca con una librería completa de scroll.

---

## 7. Sistema de diseño (tokens)

### Paleta — usar SIEMPRE estos tokens, nunca colores de Tailwind por defecto

**Primario (azul — acciones, links, interactivo):**
`primary-50 #EFF6FF` · `100 #DBEAFE` · `200 #BFDBFE` · `300 #93C5FD` · `400 #3B82F6` · **`500 #2563EB` (base)** · `600 #1D4ED8` · `700 #1E40AF` · `800 #1E3A8A` · `900 #172554`. Texto sobre `primary-500`: blanco (contraste AA).

**Terciario (celeste de marca — solo fondos y acentos sutiles, nunca acciones):**
`tertiary-50 #E6F9FD` · `100 #C0F0FA` · `200 #85E3F5` · `300 #4DD5EF` · `400 #1CC5E8` · **`500 #00B7E2` (base)** · `600 #0092B8` · `700 #006F8C` · `800 #004D61` · `900 #002E3A`. Era el primario original; para revertir, intercambiar los nombres `primary`/`tertiary` en `theme.css` y volver a poner texto navy sobre `primary-500`.

**Secundario (verde — confirmaciones, estados "disponible"):**
`secondary-50 #EAF8F1` · `100 #C9EEDD` · `200 #94DDBB` · `300 #5FCB99` · `400 #3EB682` · **`500 #2C9B6B` (base)** · `600 #237C56` · `700 #1B5F42` · `800 #13432E` · `900 #0B2A1D`

**Neutrales (tinte azulado; `neutral-900` es el navy de marca):**
`neutral-50 #F7FAFB` · `100 #EDF2F4` · `200 #DCE4E8` · `300 #C2CDD3` · `400 #94A3AC` · `500 #65767F` · `700 #37424A` · `900 #02192C`

**Acento cálido (terracota — CTA secundario, badges, rating):**
`accent-400 #F0A85C` (hover) · **`accent-500 #E1873D` (base)** · `accent-600 #C06B26` (texto sobre fondo claro)

**Semánticos (nunca reusar colores de marca para estados de UI, excepto donde se indica):**
`success #16A34A` · `warning #E1873D` (reusa accent) · `error #E5484D` (`error-600 #C42B30` para texto, por contraste AA) · `info primary-500`

### Uso de la escala de un color (aplica a primary/secondary/tertiary/accent)

| Rango   | Uso                                                                               |
| ------- | --------------------------------------------------------------------------------- |
| 50–100  | Fondos tintados sutiles (banner, badge, card seleccionada)                        |
| 200–300 | Bordes con estado (focus de input, card activa)                                   |
| 400     | Hover (se aclara)                                                                 |
| **500** | Estado base / acción principal                                                    |
| 600     | Active/pressed (se oscurece) — también texto sobre fondo 50/100 para contraste AA |
| 800–900 | Gradientes y sombras coloreadas                                                   |

Convención de hover/active: **hover aclara (400), active oscurece (600)** — nunca al revés.

### Campos de formulario

Todos los campos (`TextField`, `PasswordField`, `OtpField`) usan el radio `rounded-field` (6 px): serio y sobrio, nunca pill ni `rounded-xl`. Borde fino `neutral-300`, foco `primary-500` con halo tenue y error `error-600`. Cualquier campo nuevo reutiliza ese token.

### Neutrales — qué va dónde

`50/100` fondos de página y disabled · `200` bordes de cards/separadores · `300` bordes de inputs/placeholders de skeleton · `400` texto placeholder · `500` texto secundario/metadata · `700` texto de párrafo estándar · `900` títulos/alto énfasis.

### Tipografía

- **Una sola familia: `Plus Jakarta Sans`** para headings y body/UI. Headings en peso 800 con `letter-spacing: -0.035em` e interlineado 1.1; body en peso 500 con interlineado 1.6. Se descartó `Baloo 2` (redondeada, resta seriedad en salud) e Inter (default genérico)
- Cargarla vía `next/font/google` (no CDN externo) para evitar layout shift y mejorar performance
- Nunca usar Inter ni una sans genérica de sistema como default

### Estilo de imágenes

- Ilustraciones custom en duotono con gradiente celeste→verde (hero, estados vacíos, onboarding) — nunca stock genérico tipo "doctor sonriendo con bata blanca"
- Fotografía real obligatoria en perfiles de especialistas (no negociable para conversión en salud)
- **Excepción temporal:** el hero usa una foto de stock de referencia (`public/images/hero-teleconsulta.webp`) mientras no exista fotografía propia. Debe reemplazarse por una foto real del equipo/pacientes antes del lanzamiento, y verificar la licencia de la imagen actual si llegara a publicarse.
- Fotografía de apoyo (equipo/oficina): grading de color hacia navy/verde para coherencia de marca
- Todas las imágenes vía `next/image` (lazy loading y dimensiones sin saltos de layout), con `priority` solo en el hero. El optimizador de Vercel está **desactivado** (`images.unoptimized` en `next.config.ts`) para no pagar por transformaciones: **la optimización es manual antes de subir el archivo**.
- Checklist manual: exportar en WebP o AVIF (JPG solo si no hay alternativa), ancho máximo real de uso (≈ 2× el tamaño en pantalla; hero ≤ 1600 px), calidad 75–80, peso objetivo < 150 KB por imagen (hero < 250 KB), `width`/`height` siempre declarados y `sizes` donde la imagen sea fluida. Los SVG se sirven tal cual.

### Dónde viven los tokens

- `src/styles/theme.css` es la **única fuente** de tokens (`@theme`): paleta, semánticos, radios, sombras (`shadow-card`, `shadow-raised`, `shadow-glow`), easing (`ease-out-soft`) y fuentes. Borra la paleta por defecto de Tailwind (`--color-*: initial`), así que solo existen los colores de marca.
- `src/styles/globals.css` importa Tailwind y el tema, y define la base: fondo `neutral-50`, texto `neutral-700`, headings en `font-heading` (Plus Jakarta Sans 800, tracking ajustado), foco visible, `::selection`, `prefers-reduced-motion` y la utilidad `reveal` (scroll-driven, con `@supports`).
- Las fuentes se cargan con `next/font/google` en `app/layout.tsx` y exponen `--font-jakarta`.
- **Sin dark mode**: el sitio es solo claro. No hay `dark:` ni tokens `dark-*`. Si se reintroduce, se agrega con `@custom-variant dark`.
- No existe `tailwind.config.js`; no volver a crearlo.

---

## 8. Arquitectura de información del home (estado actual)

- **Orden de secciones:** Header → Hero (buscador) → Cómo funciona → Carousel de especialidades → Cards de propuesta de valor → CTA para doctores → Footer
- Header CTA principal: "Agendar cita" (botón azul `primary-500`). "¿Eres médico? Únete" es solo un link de bajo peso, no un botón
- **Cero señales de tracción falsas**: sin contadores ni testimonios hasta que exista volumen real que los respalde — esto es una decisión de honestidad de marca, no un placeholder temporal a "arreglar después"

---

## 9. Autenticación (paciente, solo para agendar/mis-citas)

Recordatorio de alcance (sección 2): esta auth es **solo del paciente**, exclusivamente para poder agendar cita y ver "mis citas" dentro de este repo. No es el sistema de permisos completo de la plataforma (eso vive en la app del dashboard/panel administrativo, fuera de este repo).

### Librería: Auth.js (NextAuth v5)

Es la opción correcta aquí porque:
- Soporte nativo de App Router (Route Handler en `app/api/auth/[...nextauth]/route.ts`)
- Permite combinar un provider `Credentials` (para tu API .NET) y `Google` en la misma configuración de sesión, sin lógica duplicada
- Protección de rutas del grupo `(booking)` con `proxy.ts` (antes `middleware.ts`) o validación en el layout

### Principio de diseño: la API .NET es la única fuente de verdad de la sesión

Da igual si el paciente entra por email/password o por Google — al final de cualquiera de los dos flujos, quien emite `accessToken`, `refreshToken` y los datos de usuario es **siempre tu API .NET**, nunca Next.js ni Google directamente. Esto evita tener dos modelos de identidad distintos según el proveedor.

- **Credentials provider**: en `authorize()`, llama al endpoint de login de la API .NET con email/password y devuelve `{ accessToken, refreshToken, user }` tal cual lo responde la API.
- **Google (implementado)**: NO se usa el provider Google de Auth.js. El botón propio (`@react-oauth/google`, `useGoogleLogin` con `flow: "auth-code"`) abre el popup de Google y entrega un **código** de un solo uso. Un Server Action lo canjea en el servidor (`oauth2.googleapis.com/token`, con `GOOGLE_CLIENT_SECRET`) por el `id_token`, que viaja directo a `POST /Auth/google-login` y **nunca llega al navegador**. La respuesta de la API (mismo shape que el login con contraseña) se sella con `sealSession` y se inicia sesión con `signIn("sesion")`. `404 AUTH_EXTERNAL_ACCOUNT_NOT_FOUND` → invitar a crear cuenta; el registro con Google (`/Auth/google-register`) va en un paso aparte.

### Estrategia de sesión: JWT (no database sessions)

Como el estado real vive en tu API .NET (no en una base de datos de Next.js), la sesión de Auth.js usa `strategy: "jwt"`:

- El `jwt` callback guarda `accessToken`, `refreshToken`, su expiración, y los datos de usuario dentro del token de Auth.js (que Auth.js ya cifra y guarda en cookie `httpOnly`)
- En cada request, el `jwt` callback verifica si `accessToken` está por expirar; si es así, llama al endpoint de refresh de la API .NET con el `refreshToken` y actualiza el token — esto es lo que en la comunidad de Auth.js se conoce como el patrón de "rotating refresh token"
- Si el refresh falla (refresh token inválido/expirado), el callback marca la sesión con un flag de error (ej. `RefreshTokenError`) y el cliente fuerza `signOut()` — nunca dejar una sesión "zombie" reintentando con un token muerto
- El `session` callback expone al cliente solo lo necesario (datos de usuario + un flag de error si aplica) — **nunca expongas el `accessToken`/`refreshToken` crudos al cliente**; las llamadas a la API desde Server Components/Route Handlers los toman del JWT en el servidor

### Cliente HTTP hacia la API de Calidoc

En `shared/lib/api/`, el cliente centralizado adjunta el `accessToken` vigente (obtenido de la sesión del servidor) en el header `Authorization`. Ante un 401, el cliente no reintenta indefinidamente — delega en el flujo de refresh ya descrito en el `jwt` callback.

**Contrato de respuestas de calidoc-api** (implementado en `shared/lib/api/`, import desde `@/shared/lib/api`):
- **2xx** → el recurso tal cual, sin envoltorio (`api.get<Doctor[]>("/Doctors/public")`). Las rutas son relativas a `/api/v1`.
- **Error (4xx/5xx o red)** → `apiFetch`/`api.*` lanzan `ApiError` con `status`, `code`, `title`, `detail`, `instance`, `type`, `metadata`, `fieldErrors` y `traceId`. El `code` es lo que el componente usa para decidir qué mostrar (`error.is("NOT_FOUND")`); solo se maneja por código donde el producto lo requiere, el resto cae al error genérico (`error.tsx`).
- **`code` es un string abierto**: el backend puede mandar cualquier código, incluidos los de validaciones custom, y 401/403 también llegan como ProblemDetails con `code`. El `code` del backend siempre manda. `ClientErrorCode` solo lista los códigos genéricos de respaldo que el cliente inventa cuando la respuesta no trae uno: `NETWORK_ERROR` y `TIMEOUT` (sin respuesta), `UNAUTHORIZED`/`FORBIDDEN` (401/403 sin cuerpo útil, p. ej. un proxy), `VALIDATION_ERROR` (400 de model binding de ASP.NET con `errors: { Campo: [mensajes] }`, que va a `fieldErrors`) y `HTTP_<status>` en cualquier otro caso.
- **Server Actions**: una instancia de `ApiError` no cruza al cliente. Se envuelve la llamada con `tryApi(...)`, que devuelve `{ ok: true, data } | { ok: false, error }` (objeto plano serializable) para que el Client Component ramifique por `error.code` o pinte `error.fieldErrors` en el formulario.
- **Los códigos de negocio los declara cada feature** (p. ej. `features/booking/` define las constantes de los `code` que maneja); `shared/` solo conoce los códigos genéricos.
- Reintentos con espera solo en `GET` ante red, timeout, 502, 503 y 504; timeout por defecto de 10 s. Nunca se reintenta un `POST/PUT/PATCH/DELETE`.
- El `token` se pasa solo desde código de servidor; los endpoints públicos se llaman sin token y con caché (`next: { revalidate, tags }`), los privados sin caché.
- El cliente tipa la respuesta con un genérico pero **no la valida en runtime**: la validación (zod) ocurre en los `mappers` del feature cuando el dato es crítico.

### Protección de rutas

El `layout.tsx` de `(booking)` valida la sesión del lado del servidor (o vía `proxy.ts` con `auth()` de Auth.js — en Next 16 `middleware.ts` se renombró a `proxy.ts`; solo para chequeos optimistas leyendo la cookie, nunca consultas a base de datos ni la API) y redirige a `(auth)/login` si no hay sesión válida — el resto del sitio (`(marketing)`) es público por defecto.

### Variables de entorno esperadas

```
AUTH_SECRET=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=    # público; si falta, se oculta el acceso con Google
GOOGLE_CLIENT_SECRET=            # solo servidor: canjea el código por el ID token
NEXT_PUBLIC_API_BASE_URL=        # calidoc-api
```

---

## 10. Linting y formato (Biome + ESLint)

Dos herramientas, cada una con su responsabilidad. **No se pisan**: lo que una cubre, la otra lo tiene apagado.

| Herramienta | Responsable de                                                                                                                                                | Config              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **Biome**   | Formato (JS/TS/JSX, CSS con directivas Tailwind, HTML, JSON), indentación (2 espacios, 100 cols, comillas dobles, `;`), orden de imports, código limpio, a11y | `biome.json`        |
| **ESLint**  | Reglas de Next/React (`core-web-vitals`, hooks), TypeScript (unused vars, `any`) y límites de arquitectura (`no-restricted-imports`, sección 4)               | `eslint.config.mjs` |

Reglas para no romper la separación:
- ESLint **nunca** define reglas de formato/estilo (nada de prettier ni stylistic).
- Si una regla existe en ambos, se apaga en Biome (ya apagadas: `useExhaustiveDependencies`, `useHookAtTopLevel`, `noUnusedVariables`, `noUnusedImports`, `noImgElement`).
- Los comentarios de encabezado de `eslint.config.mjs` documentan este reparto.

Scripts: `npm run lint` (ambos) · `lint:biome` · `lint:eslint` · `format` · `fix` (autofix de ambos) · `typecheck`.

**CI:** `.github/workflows/lint.yml` corre `lint:biome` y `lint:eslint` en todo Pull Request hacia `develop`. Biome solo verifica (no reescribe archivos): si falla por formato, ejecutar `npm run fix` en local y volver a commitear.

---

## 11. Commits

**Los mensajes de commit se escriben siempre en inglés** (asunto y cuerpo), aunque el resto de la documentación del repo esté en español. Siguen la convención **Conventional Commits**:

```
<type>(<scope>): <subject>

<body, opcional>
```

- **type** (obligatorio): `feat` (funcionalidad nueva) · `fix` (corrección de bug) · `refactor` (cambio interno sin alterar comportamiento) · `style` (formato, sin cambio de lógica) · `docs` · `test` · `perf` · `build` (dependencias, empaquetado) · `ci` · `chore` (tareas de mantenimiento, configuración) · `revert`.
- **scope** (opcional, minúsculas): el feature o área afectada, p. ej. `booking`, `doctors`, `specialties`, `auth`, `ui`, `seo`, `lint`, `deps`.
- **subject**: en imperativo y minúscula inicial (`add`, `fix`, `move`; no `added` ni `adds`), sin punto final, idealmente ≤ 72 caracteres. Describe el qué, no el cómo.
- **body** (cuando el cambio no es obvio): explica el porqué y el contexto, no repite el diff. Líneas de ≤ 100 caracteres.
- **Cambio incompatible**: `!` después del tipo/scope (`feat(api)!: ...`) y un pie `BREAKING CHANGE: ...`.
- Un commit = un cambio lógico. No mezclar refactor, formato y funcionalidad en el mismo commit.
- Antes de commitear debe pasar `npm run lint` y `npm run typecheck`.

Ejemplos:

```
feat(booking): add time slot picker to appointment flow
fix(doctors): prevent crash when profile has no photo
refactor: move payments module into features
chore(lint): configure Biome and ESLint with separate responsibilities
docs: document dependency rules in CLAUDE.md
```

Los commits previos a esta regla en español no se reescriben.

---

## 12. Seguridad base y entorno

- **Cabeceras de seguridad** definidas en `next.config.ts` para todas las rutas: CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y HSTS. `poweredByHeader` desactivado.
- **CSP sin nonces**, a propósito: un nonce obliga a renderizar todo de forma dinámica y rompería el SSG/ISR de la sección 5. A cambio `script-src` permite `'unsafe-inline'`; el resto es estricto (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`).
- **Todo origen de terceros nuevo se agrega explícitamente a la CSP** en `next.config.ts` (analytics, mapas, CDN de imágenes de doctores, etc.). Si algo "no carga" tras sumar un servicio, revisar primero la consola por violaciones de CSP. Hoy permite `*.culqi.com`, `accounts.google.com/gsi/` (acceso con Google) y el origen de `NEXT_PUBLIC_API_BASE_URL`.
- Con `images.unoptimized` el navegador descarga las imágenes directo de su origen, así que no hace falta `remotePatterns`; solo declarar el origen en `img-src` (hoy: el de la API). Las fotos de doctores redirigen (302) a otro host: añadirlo a `img-src` cuando se conozca.
- **Entorno:** copiar `.env.example` a `.env.local`. Toda variable nueva se declara en `src/shared/lib/env.ts` y en `.env.example` (única plantilla versionada; `.env*` está ignorado).
- **Node:** versión de referencia en `.nvmrc` (24); `engines` exige ≥ 22.
- **Formato de archivos:** `.editorconfig` y `.gitattributes` fijan LF, UTF-8 y 2 espacios para que el editor, Git y Biome coincidan.

---

## 13. Secciones a definir en próximas sesiones

Este archivo se irá ampliando. Aún pendientes de documentar aquí:

- [ ] Convenciones de nombrado de componentes (PascalCase, sufijos, co-ubicación de estilos)
- [ ] Seguridad adicional (manejo de datos de formularios, rate limiting del buscador y del login/OTP)
- [ ] Convenciones de PR y checks de CI adicionales (typecheck, build, tests; hoy solo corre lint)
- [ ] Accesibilidad: checklist WCAG AA específico (contraste ya pendiente de validar en Notion)
- [ ] Contrato exacto de los endpoints de auth de calidoc-api (`/auth/login`, `/auth/refresh`, `/auth/google-login`) — shape de request/response, códigos de error
- [ ] Manejo de expiración de sesión en UI (aviso al paciente antes de que expire, no solo al fallar una request)
