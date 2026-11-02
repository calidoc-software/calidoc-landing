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
- **Estilos:** Tailwind CSS con `tailwind.config.js` custom (ver sección 5) — nunca usar la paleta default de Tailwind (`slate`, `blue-500`, etc.)
- **Validación de formularios:** Zod
- **Auth del paciente (solo para agendar/mis-citas):** ligera, tipo magic link/OTP — no es el sistema de permisos de la plataforma completa

Principio general del proyecto (aplica también a este repo): **YAGNI** — no construir infraestructura o abstracciones que no estén justificadas por un requerimiento real. Las convenciones deben ser explícitas para que un segundo desarrollador no pueda aplicarlas mal por error.

---

## 4. Estructura de carpetas

```
src/
├── app/
│   ├── (marketing)/                      # rutas públicas — sin sesión
│   │   ├── page.tsx                      # Home
│   │   ├── especialidades/
│   │   │   ├── page.tsx                  # listado de especialidades (pilar SEO)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx              # ficha de especialidad (SSG/ISR)
│   │   │       └── opengraph-image.tsx
│   │   ├── doctores/
│   │   │   ├── page.tsx                  # listado/buscador de doctores (transaccional)
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # perfil del doctor (SSG/ISR)
│   │   ├── nosotros/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── layout.tsx                    # header/footer públicos
│   │
│   ├── (booking)/                        # flujo de agendar cita — requiere login simple del paciente
│   │   ├── agendar/
│   │   │   ├── [doctorSlug]/page.tsx     # selección de fecha/hora
│   │   │   └── confirmacion/page.tsx
│   │   ├── mis-citas/page.tsx            # único contenido "privado" de este repo
│   │   └── layout.tsx                    # valida sesión simple del paciente
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── verificar/page.tsx            # magic link / OTP
│   │
│   ├── api/                              # Route Handlers (webhooks, revalidate, etc.)
│   ├── sitemap.ts                        # generado dinámicamente
│   ├── robots.ts
│   └── layout.tsx                        # metadata base, fonts, providers
│
├── modules/                              # lógica y componentes por dominio de contenido
│   ├── specialties/
│   │   ├── components/                   # SpecialtyCard, SpecialtyFilter
│   │   ├── api/                          # getSpecialties(), getSpecialtyBySlug()
│   │   └── types.ts
│   ├── doctors/
│   │   ├── components/                   # DoctorCard, DoctorProfileHeader, ReviewsList
│   │   ├── api/
│   │   └── types.ts
│   └── booking/
│       ├── components/                   # Calendar, TimeSlotPicker, BookingSummary
│       ├── api/                          # createAppointment(), useAvailability()
│       ├── schemas/                      # zod
│       └── hooks/
│
├── shared/
│   ├── ui/                               # Design system: Button, Card, Badge...
│   ├── seo/                              # helpers: generateMetadata(), JSON-LD builders
│   ├── auth/                             # session.ts (simple, solo para booking/mis-citas)
│   ├── api/                              # cliente HTTP centralizado hacia calidoc-api
│   └── lib/                              # utils, formatters (fechas, etc.)
│
└── content/                               # MDX para blog/landing content, si aplica
```

### Por qué así

- **Route Groups separan mundos**: `(marketing)`, `(booking)` y `(auth)` no afectan la URL pero permiten `layout.tsx` distintos (header público vs. flujo de reserva) y aplicar el guard de sesión solo donde hace falta — nada de proteger todo el sitio por defecto.
- **`app/` organizado por tipo de página, `modules/` por dominio**: el árbol de `app/` refleja el sitemap real (información arquitectónica valiosa en un sitio de contenido); la lógica reutilizable (fetch de datos, componentes de UI del dominio) vive en `modules/`, importada por cada página.
- **`shared/ui` es el design system** — todo componente de la sección 5 (Button, Card, Badge, inputs) vive ahí, nunca duplicado dentro de un módulo.

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

- **NO** aplicar `backdrop-filter: blur()` en más de 1–2 elementos visibles simultáneamente en toda la página (el header sticky cuenta como uno).
- **NO** usar imágenes de fondo (PNG/JPG) para gradientes — todo mesh/gradient del hero es `radial-gradient()`/`conic-gradient()` en CSS puro.
- **NO** aplicar glass o gradiente a secciones completas de contenido largo (listados de doctores, resultados de búsqueda, formularios). Esas secciones son fondo sólido, plano, de máxima legibilidad.
- **NO** usar librerías de animación pesadas (GSAP, Framer Motion completo) solo para scroll-reveal — usar CSS scroll-driven animations (`animation-timeline`) o `IntersectionObserver` nativo dentro de un Client Component ligero.
- **NO** marcar un componente como `'use client'` por defecto — Server Component es la base; solo pasa a cliente lo que necesita estado, efectos o eventos (buscador, filtros, calendario, header sticky).
- **NO** bloquear contenido detrás de JS — todo debe ser visible sin animar como fallback (progressive enhancement).
- Todo motion debe respetar `prefers-reduced-motion: reduce`.
- Máximo un elemento animado o con foco de atención por sección visible a la vez — cero autoplay de carrousels ni loops que compitan con la lectura.

### Reveal progresivo al hacer scroll

Cada bloque de contenido (feature, testimonio, card de especialidad) se revela al entrar en el viewport: fade + desplazamiento vertical corto (12–16px), sin rebote, `ease-out`, ~400–600ms. El usuario no debe notar conscientemente la animación.

### Header sticky con glass

- Estado inicial (scroll = 0): transparente o fondo sólido simple, sin blur — integrado al hero.
- Al despegarse del top: `backdrop-filter: blur(10-16px)`, fondo semi-transparente (`bg-white/70` light, `bg-dark-surface/70` dark), borde inferior 1px sutil (`neutral-200` / `dark-border`). Transición 200–250ms, sin salto.
- Este es uno de los 1–2 usos de glass presupuestados en toda la página. El estado de scroll se maneja en un Client Component mínimo (o `IntersectionObserver` sobre un sentinel), nunca con una librería completa de scroll.

---

## 7. Sistema de diseño (tokens)

### Paleta — usar SIEMPRE estos tokens, nunca colores de Tailwind por defecto

**Primario (celeste — acciones, links, interactivo):**
`primary-50 #E6F9FD` · `100 #C0F0FA` · `200 #85E3F5` · `300 #4DD5EF` · `400 #1CC5E8` · **`500 #00B7E2` (base)** · `600 #0092B8` · `700 #006F8C` · `800 #004D61` · `900 #002E3A`

**Secundario (verde — confirmaciones, estados "disponible"):**
`secondary-50 #EAF8F1` · `100 #C9EEDD` · `200 #94DDBB` · `300 #5FCB99` · `400 #3EB682` · **`500 #2C9B6B` (base)** · `600 #237C56` · `700 #1B5F42` · `800 #13432E` · `900 #0B2A1D`

**Dark mode (navy — no negro puro):**
`dark-bg #02192C` (fondo) · `dark-surface #0A2740` (cards) · `dark-surface-2 #123349` (elevado/hover) · `dark-border #1D4258` · `dark-text #EAF4F7`

**Neutrales (tinte azulado, ancla con `dark-bg`):**
`neutral-50 #F7FAFB` · `100 #EDF2F4` · `200 #DCE4E8` · `300 #C2CDD3` · `400 #94A3AC` · `500 #65767F` · `700 #37424A` · `900 #02192C`

**Acento cálido (terracota — CTA secundario, badges, rating):**
`accent-400 #F0A85C` (hover) · **`accent-500 #E1873D` (base)** · `accent-600 #C06B26` (texto sobre fondo claro)

**Semánticos (nunca reusar colores de marca para estados de UI, excepto donde se indica):**
`success #16A34A` · `warning #E1873D` (reusa accent) · `error #E5484D` · `info primary-500`

### Uso de la escala de un color (aplica a primary/secondary/accent)

| Rango | Uso |
|---|---|
| 50–100 | Fondos tintados sutiles (banner, badge, card seleccionada) |
| 200–300 | Bordes con estado (focus de input, card activa) |
| 400 | Hover (se aclara) |
| **500** | Estado base / acción principal |
| 600 | Active/pressed (se oscurece) — también texto sobre fondo 50/100 para contraste AA |
| 700 | Hover en dark mode |
| 800–900 | Gradientes, sombras coloreadas, variantes dark-mode-only |

Convención de hover/active: **hover aclara (400), active oscurece (600)** — nunca al revés.

### Neutrales — qué va dónde

`50/100` fondos de página y disabled · `200` bordes de cards/separadores · `300` bordes de inputs/placeholders de skeleton · `400` texto placeholder · `500` texto secundario/metadata · `700` texto de párrafo estándar · `900` títulos/alto énfasis.

### Tipografía

- **Headings:** `Baloo 2` — geométrica redondeada, coherente con el isotipo
- **Body/UI:** `Plus Jakarta Sans` — alta legibilidad en textos largos
- Cargar ambas vía `next/font/google` (no CDN externo) para evitar layout shift y mejorar performance
- Nunca usar Inter ni una sans genérica de sistema como default

### Estilo de imágenes

- Ilustraciones custom en duotono con gradiente celeste→verde (hero, estados vacíos, onboarding) — nunca stock genérico tipo "doctor sonriendo con bata blanca"
- Fotografía real obligatoria en perfiles de especialistas (no negociable para conversión en salud)
- Fotografía de apoyo (equipo/oficina): grading de color hacia navy/verde para coherencia de marca
- Todas las imágenes vía `next/image` — formatos WebP/AVIF, `priority` solo en el hero, `loading="lazy"` en el resto

### `tailwind.config.js` de referencia

```js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50:'#E6F9FD',100:'#C0F0FA',200:'#85E3F5',300:'#4DD5EF',400:'#1CC5E8',500:'#00B7E2',600:'#0092B8',700:'#006F8C',800:'#004D61',900:'#002E3A' },
        secondary: { 50:'#EAF8F1',100:'#C9EEDD',200:'#94DDBB',300:'#5FCB99',400:'#3EB682',500:'#2C9B6B',600:'#237C56',700:'#1B5F42',800:'#13432E',900:'#0B2A1D' },
        accent: { 400:'#F0A85C', 500:'#E1873D', 600:'#C06B26' },
        dark: { bg:'#02192C', surface:'#0A2740', surface2:'#123349', border:'#1D4258', text:'#EAF4F7' },
        neutral: { 50:'#F7FAFB',100:'#EDF2F4',200:'#DCE4E8',300:'#C2CDD3',400:'#94A3AC',500:'#65767F',700:'#37424A',900:'#02192C' },
      },
      fontFamily: {
        heading: ['"Baloo 2"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
}
```

---

## 8. Arquitectura de información del home (estado actual)

- **Orden de secciones:** Header → Hero (buscador) → Cómo funciona → Carousel de especialidades → Cards de propuesta de valor → CTA para doctores → Footer
- Header CTA principal: "Agendar cita" (botón celeste `primary-500`). "¿Eres médico? Únete" es solo un link de bajo peso, no un botón
- **Cero señales de tracción falsas**: sin contadores ni testimonios hasta que exista volumen real que los respalde — esto es una decisión de honestidad de marca, no un placeholder temporal a "arreglar después"

---

## 9. Autenticación (paciente, solo para agendar/mis-citas)

Recordatorio de alcance (sección 2): esta auth es **solo del paciente**, exclusivamente para poder agendar cita y ver "mis citas" dentro de este repo. No es el sistema de permisos completo de la plataforma (eso vive en la app del dashboard/panel administrativo, fuera de este repo).

### Librería: Auth.js (NextAuth v5)

Es la opción correcta aquí porque:
- Soporte nativo de App Router (Route Handler en `app/api/auth/[...nextauth]/route.ts`)
- Permite combinar un provider `Credentials` (para tu API .NET) y `Google` en la misma configuración de sesión, sin lógica duplicada
- Middleware de protección de rutas listo para usar en el grupo `(booking)`

### Principio de diseño: la API .NET es la única fuente de verdad de la sesión

Da igual si el paciente entra por email/password o por Google — al final de cualquiera de los dos flujos, quien emite `accessToken`, `refreshToken` y los datos de usuario es **siempre tu API .NET**, nunca Next.js ni Google directamente. Esto evita tener dos modelos de identidad distintos según el proveedor.

- **Credentials provider**: en `authorize()`, llama al endpoint de login de la API .NET con email/password y devuelve `{ accessToken, refreshToken, user }` tal cual lo responde la API.
- **Google provider**: Auth.js maneja el intercambio OAuth con Google, pero el `id_token` de Google resultante se envía server-side a un endpoint dedicado de tu API (ej. `POST /auth/google-login`) que lo valida, crea o vincula al paciente, y devuelve el mismo shape `{ accessToken, refreshToken, user }`. Esto se hace en el callback `signIn` o `jwt`, nunca confiando en el perfil de Google como identidad final por sí solo.

### Estrategia de sesión: JWT (no database sessions)

Como el estado real vive en tu API .NET (no en una base de datos de Next.js), la sesión de Auth.js usa `strategy: "jwt"`:

- El `jwt` callback guarda `accessToken`, `refreshToken`, su expiración, y los datos de usuario dentro del token de Auth.js (que Auth.js ya cifra y guarda en cookie `httpOnly`)
- En cada request, el `jwt` callback verifica si `accessToken` está por expirar; si es así, llama al endpoint de refresh de la API .NET con el `refreshToken` y actualiza el token — esto es lo que en la comunidad de Auth.js se conoce como el patrón de "rotating refresh token"
- Si el refresh falla (refresh token inválido/expirado), el callback marca la sesión con un flag de error (ej. `RefreshTokenError`) y el cliente fuerza `signOut()` — nunca dejar una sesión "zombie" reintentando con un token muerto
- El `session` callback expone al cliente solo lo necesario (datos de usuario + un flag de error si aplica) — **nunca expongas el `accessToken`/`refreshToken` crudos al cliente**; las llamadas a la API desde Server Components/Route Handlers los toman del JWT en el servidor

### Cliente HTTP hacia la API de Calidoc

En `shared/api/`, el cliente centralizado adjunta el `accessToken` vigente (obtenido de la sesión del servidor) en el header `Authorization`. Ante un 401, el cliente no reintenta indefinidamente — delega en el flujo de refresh ya descrito en el `jwt` callback.

### Protección de rutas

El `layout.tsx` de `(booking)` valida la sesión del lado del servidor (o vía `middleware.ts` con `auth()` de Auth.js) y redirige a `(auth)/login` si no hay sesión válida — el resto del sitio (`(marketing)`) es público por defecto.

### Variables de entorno esperadas

```
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
NEXT_PUBLIC_API_BASE_URL=        # calidoc-api
```

---

## 10. Secciones a definir en próximas sesiones

Este archivo se irá ampliando. Aún pendientes de documentar aquí:

- [ ] Convenciones de nombrado de componentes (PascalCase, sufijos, co-ubicación de estilos)
- [ ] Seguridad adicional (headers, CSP, manejo de datos de formularios, rate limiting del buscador y del login/OTP)
- [ ] Convenciones de commits/PR y checks de CI para este repo (Vercel preview deployments)
- [ ] Accesibilidad: checklist WCAG AA específico (contraste ya pendiente de validar en Notion)
- [ ] Contrato exacto de los endpoints de auth de calidoc-api (`/auth/login`, `/auth/refresh`, `/auth/google-login`) — shape de request/response, códigos de error
- [ ] Manejo de expiración de sesión en UI (aviso al paciente antes de que expire, no solo al fallar una request)