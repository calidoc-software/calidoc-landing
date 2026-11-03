---
name: calidoc-telemedicina
description: Reglas de producto, confianza y contenido para la landing de Calidoc (marketplace de salud/telemedicina en Perú). Usar al diseñar, escribir copy o construir cualquier página o componente de la landing, el buscador de doctores, el perfil del doctor o el flujo de agendar cita. Complementa CLAUDE.md; ante conflicto con otras skills de diseño, mandan CLAUDE.md y esta skill.
---

# Calidoc — criterios de telemedicina

Esta skill añade lo que CLAUDE.md no detalla: confianza del paciente, tono, contenido sensible y estados de UI propios de salud. Los tokens, la tipografía, la arquitectura y las reglas de motion viven en CLAUDE.md (secciones 4, 6 y 7) y no se repiten aquí.

## Prioridad de decisiones

1. Confianza del paciente (factor #1 de conversión).
2. Claridad y accesibilidad (WCAG AA como mínimo).
3. Rendimiento en móvil y conexiones lentas (tráfico mayoritariamente móvil en Perú).
4. Estética. Una decisión "bonita" que baje la confianza o la legibilidad se descarta.

Otras skills de diseño (impeccable, frontend-design, Emil Kowalski, etc.) proponen estilo; aquí **no se cambia** paleta, fuentes ni límite de efectos. Si una sugerencia los contradice, se ignora la sugerencia.

## Confianza: qué mostrar y qué no

- Perfil del doctor: **foto real**, nombre completo, especialidad, sedes y modalidad (presencial/virtual) siempre visibles sin scroll en móvil.
- Mostrar datos de colegiatura/credenciales **solo si existen y vienen verificados de la API**. Nunca inventarlos ni dejar un placeholder que parezca real.
- Precio, duración y modalidad antes del botón de agendar, no después. Sin costos ocultos.
- **Cero señales falsas**: sin contadores, testimonios, "X pacientes atendidos", sellos ni calificaciones que no respalde data real (decisión de marca ya fijada en CLAUDE.md sección 8).
- Estados de disponibilidad con color **y** texto/icono (verde `secondary` + "Disponible hoy"), nunca solo color.

## Tono y copy (español neutro peruano)

- Cálido, claro y directo; tuteo sobrio ("Agenda tu cita"). Sin jerga médica innecesaria ni tecnicismos de producto.
- **No prometer resultados clínicos** ("te curamos", "diagnóstico garantizado") ni sustituir criterio médico. Calidoc conecta con profesionales; no diagnostica.
- No usar miedo ni urgencia artificial para convertir ("¡últimos cupos!") salvo que sea un dato real y verificable.
- Botones con verbo + objeto: "Agendar cita", "Ver horarios", "Confirmar cita". Evitar "Enviar", "Aceptar", "Continuar" a secas.
- Mensajes de error que digan qué pasó y qué hacer, sin culpar al paciente ni exponer detalles técnicos.
- Formatos: fechas `dd/mm/aaaa` o "lunes 3 de noviembre", hora en 24 h o con "a. m./p. m." de forma consistente, moneda `S/ 120`, zona horaria America/Lima mostrada en citas virtuales.

## Contenido sensible

- Aviso visible de **urgencias**: la plataforma no es para emergencias; indicar acudir a un centro de salud o llamar al servicio de emergencia local. Debe estar en el flujo de agendar y en el footer.
- Datos de salud y personales: pedir solo lo necesario para agendar. Sin campos de síntomas o historial en este repo (eso pertenece al dashboard autenticado, fuera de alcance, CLAUDE.md sección 2).
- Cumplimiento de protección de datos personales (Perú: Ley 29733): consentimiento explícito y enlace a la política de privacidad junto a todo formulario que recoja datos. **El texto legal lo define y valida el equipo legal**, no se inventa aquí.
- No cargar scripts de terceros de analytics/publicidad en páginas con datos del paciente sin decisión explícita del equipo.
- No colocar datos del paciente en URLs, query strings ni logs del cliente.

## Accesibilidad (checklist mínimo por componente)

- Contraste AA: texto normal ≥ 4.5:1, texto grande y componentes de UI ≥ 3:1. Texto de color sobre fondos tintados usa la escala 600 (CLAUDE.md sección 7).
- Todo interactivo operable con teclado, con `:focus-visible` claramente visible (borde `primary-300`/anillo), orden de tabulación lógico.
- Área táctil mínima de 44×44 px en móvil; separación suficiente entre acciones del calendario y los horarios.
- Formularios: `label` visible y asociado (no solo placeholder), errores en texto cercano al campo con `aria-describedby`, `autocomplete` correcto (email, tel, name), tipo de input adecuado (`inputmode="tel"`, etc.), tamaño de fuente ≥ 16 px para evitar zoom en iOS.
- Calendario y selector de horarios: navegable con teclado, estado seleccionado/deshabilitado anunciado a lectores de pantalla, no depender solo del color.
- Imágenes con `alt` útil (foto del doctor: nombre y especialidad); decorativas con `alt=""`.
- Respetar `prefers-reduced-motion: reduce` en todo motion y `prefers-color-scheme` si hay dark mode.
- Un único `h1` por página; jerarquía de encabezados sin saltos.

## Movimiento

Mínimo y con propósito (CLAUDE.md sección 6): reveal sutil al hacer scroll (fade + 12–16 px, `ease-out`, 400–600 ms), transición del header sticky, feedback de botones. Nada de autoplay ni animaciones en listados, resultados ni formularios. Los loops solo se admiten como motion ambiental suave sobre elementos decorativos, con los límites de CLAUDE.md sección 6 (≤ 8 px, ciclo ≥ 6 s, 2–3 elementos como máximo, apagado con reduced-motion). Si se duda entre animar o no, no se anima.

## Estados que no pueden faltar

Cada vista con datos define: **carga** (skeleton con `neutral-300`/`100`, sin spinners a pantalla completa), **vacío** (ilustración duotono de marca + siguiente acción, p. ej. "No hay horarios hoy · Ver otros días"), **error** (qué pasó + reintentar) y **sin conexión/lenta**. Probar con datos extremos: nombres largos, tildes y "ñ", doctor sin foto, sin horarios, múltiples sedes.

## Antes de dar algo por terminado

- Revisar contra el checklist de accesibilidad de arriba en móvil (~375 px) y en escritorio.
- `npm run lint`, `npm run typecheck` y `next build` sin errores nuevos.
- Verificar que no se introdujo ninguna señal de tracción falsa ni promesa clínica en el copy.
