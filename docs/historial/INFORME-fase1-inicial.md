> **DOCUMENTO REEMPLAZADO.** Este es el informe de la primera entrega de Fase 1 (ZIP `argos-fase1.zip`). Quedó desactualizado por las iteraciones visuales y funcionales posteriores (iter-01 a iter-06). El estado vigente está en [`ESTADO_DEL_PROYECTO.md`](../../ESTADO_DEL_PROYECTO.md). Se conserva solo como historial.

# ARGOS · Informe de la Fase 1

**Fecha:** 23/11/2026 · **Alcance:** Fase 1 de la especificación maestra (frontend + módulo de phishing) · **Estado:** implementada y verificada localmente. **No se hicieron commits, pushes, PR, issues, ramas ni deploys en GitHub.**

Insumos usados: `ESPECIFICACION_MAESTRA_ARGOS.md`, `PROMPT_PARA_GROK.txt`, `LEEME_PRIMERO.md`, `datos/casos-phishing.json`, las dos referencias visuales y `origen-github/` (README, ETICA, LICENSE). No se recibió el ZIP del prototipo anterior (`argos.zip`), así que la app se construyó desde cero, como indica la especificación.

---

## TRABAJADO

### Stack
React 19 + TypeScript 5.9 (estricto) + Vite 8 · React Router 7 · zod 4 (validación de datos y progreso) · Lucide React (íconos) · Fontsource (tipografías empaquetadas, sin pedidos a Google Fonts) · Vitest 5 + Testing Library + jsdom · Playwright 1.65 (E2E opcional) · ESLint 9 + typescript-eslint. Todo gratuito y open source. CSS propio con design tokens (no se usó Tailwind: con tokens y CSS por área alcanzaba y es más fácil de mantener la identidad).

### Requisitos de la especificación vs. lo implementado

| Requisito (spec §3) | Estado | Dónde |
|---|---|---|
| **Inicio**: landing fiel a la referencia, CTA funcional, acceso a módulos | ✅ Header con logo + bajada, nav, «Guía rápida» (diálogo real); hero «Aprendé a ver las señales antes de que sea tarde.», «EL OBSERVADOR DIGITAL», CTA «Explorar casos interactivos» y «Conocer la plataforma»; franja de 4 beneficios; «Explorá las áreas de práctica» con 4 tarjetas; «Cómo funciona»; aviso de contenido ficticio | `pages/HomePage.tsx` |
| **Casos interactivos / Phishing** con 12 correos, navegación y progreso | ✅ Bandeja con 12 mensajes seleccionables (no leídos, estado), «Caso N de 12» con barra segmentada y flechas | `modules/phishing/` |
| **Conceptos** (phishing, remitente, dominio, urgencia, adjunto, enlace, verificación) | ✅ 8 fichas (las 7 pedidas + suplantación de identidad), con índice y anclas; el análisis de cada caso enlaza a sus conceptos | `pages/ConceptsPage.tsx`, `modules/theory/glossary.ts` |
| **Acerca de**: propósito, alcance, limitaciones y ética | ✅ Incluye privacidad, reglas de ETICA.md y Ley 26.388 | `pages/AboutPage.tsx` |
| **Módulos próximos** como teasers honestos | ✅ Accesos, Worm/Malware, Blue Team, IA: «Planificado · Fase N», qué se practicará y compromiso de seguridad. Sin botones engañosos; `/casos/<planificado>` redirige a la ficha | `pages/UpcomingModulesPage.tsx` |
| Mix de legítimos, phishing y «requiere más información» | ✅ 5 phishing · 4 legítimos · 3 requieren verificación | `data/phishing-scenarios.json` |
| Cliente de correo verosímil (remitente, fecha, asunto, cuerpo, enlace inerte, indicadores, panel de observación) | ✅ Ventana tipo cliente: De / Responder a / Para / Asunto / Fecha, marca del remitente, cuerpo, firma, botón-enlace inerte que muestra su destino al tocarlo o pasar el cursor, adjunto simulado | `components/EmailViewer.tsx`, `InertLink.tsx`, `AttachmentChip.tsx` |
| Modos **Aprender** (pistas graduales) y **Desafío** (pistas ocultas, explicación al terminar) | ✅ Registros separados por modo; Desafío no permite pistas ni reintento y suma puntaje; resumen al completar los 12 | `domain/progress.ts`, `ModeSwitch`, `ChallengeSummary` |
| No revelar el tipo de caso de antemano | ✅ Títulos de pista neutros («Mirá el remitente», «Lo que te pide»…); las señales no existen en el DOM hasta revelarse; colores de botones fijos por decisión, no por caso; test que verifica que el texto del correo no contenga «phishing/fraude/legítimo» | `Signal.tsx`, tests |
| Tres decisiones | ✅ «Parece legítimo», «Es un posible phishing», «No tengo suficiente información» | `DecisionBar.tsx` |
| Tras responder: resultado, por qué, señales, acción recomendada, qué verificar; revisar sin alteraciones; no penalizar aprender | ✅ «Análisis del caso» con badge (correcta / prudente / a revisar), explicación, señales numeradas que se marcan en el correo, acción recomendada, qué convenía verificar, conceptos. La respuesta queda fija (revisión sin alteraciones); en Aprender existe «Intentar de nuevo» | `CaseAnalysis.tsx`, `domain/evaluate.ts` |
| Hasta 3 pistas, de menos a más explícita, contador y estado | ✅ «Pistas reveladas: n de 3», pistas bloqueadas visibles, botón deshabilitado al llegar a 3; tocar una pista resalta su señal | `HintsPanel.tsx` |
| Cambiar de caso conserva el resultado sin filtrar pistas | ✅ Estado de pistas por caso y por modo; el resaltado se descarta al cambiar | tests de flujo |
| Progreso persistido y restaurado (visitados, resueltos, decisiones, modo, pistas) + reinicio con confirmación | ✅ Una clave versionada `argos.progress` (`{version, updatedAt, modules}`), validación zod, migraciones previstas, respaldo `argos.progress.backup` si los datos están corruptos o son de una versión futura, fallback en memoria si localStorage no está disponible. «Reiniciar progreso» con diálogo de confirmación | `lib/progress/store.ts` |
| No entrenar «urgente = fraude» | ✅ Casos legítimos y dudosos con plazos/urgencia moderada (turno, vencimiento de clave, cupos limitados); notas específicas cuando se marca phishing algo legítimo o dudoso | `evaluate.ts` (`outcomeExtraNote`) |
| Accesibilidad | ✅ Skip link, foco visible, semántica (nav/regiones/dl), `aria-pressed`/`aria-expanded`/`aria-current`, diálogos con foco atrapado y Escape, foco al análisis tras responder, textos para lectores en marcas e íconos de estado, `prefers-reduced-motion`, objetivos táctiles ≥ 44 px | todo el código |
| Responsive desktop / móvil | ✅ 3 columnas (bandeja · correo · pistas) ≥ 1240 px; 2 columnas con bandeja desplegable en tablet; 1 columna en móvil con decisiones apiladas; menú hamburguesa | `styles/*.css`, capturas |
| Seguridad (§5) | ✅ Sin `dangerouslySetInnerHTML` (regla de ESLint que lo prohíbe), sin `<a href>` en los correos, solo dominios reservados (el esquema rechaza otros), adjuntos no descargables, sin telemetría/cookies/servicios externos (el E2E verifica 0 pedidos a otros orígenes) | `domain/schema.ts`, `eslint.config.js`, tests |

### Arquitectura extensible (sin construir fases futuras)

- **Registro de módulos** (`src/modules/registry/`): fuente única para rutas (`/casos/:slug`), landing, hub de casos y «Próximos módulos». Cada módulo declara área, fase, estado (`available`/`planned`), temas, compromiso de seguridad y vista con carga diferida (code splitting: el simulador es un chunk aparte).
- **Servicio de progreso compartido** (`src/lib/progress/`): cada módulo guarda su porción validada con su propio esquema mediante `useModuleProgress`. Reset por módulo o total.
- **Escenarios tipados** (`modules/phishing/domain/schema.ts`): contrato zod + validación de coherencia (ids únicos, marcas ↔ pistas, dominios reservados).
- **Contratos de laboratorios** (`src/modules/labs/`), solo tipos: `contracts.ts` (Worm/Malware: hosts y red virtual, eventos `archivo_aparece`/`equipo_alerta`/`aislamiento`/`cuarentena`, acciones `aislar`/`examinar`/`bloquear`/`restaurar`, modos Observación/Defensa, motor determinista y `LAB_SAFETY_NOTICE`), `blueteam.ts` (logs sintéticos, reporte de incidente) y `ai.ts` (matriz de confusión, métricas, escenario de prompt injection). No hay código de propagación ni de acceso a archivos o red.

### Los 12 casos

| # | Id | Caso | Clasificación | Señales principales |
|---|---|---|---|---|
| 1 | ARG-001 | Aviso de bloqueo inmediato (Banco Atlas) | Phishing | Dominio que no es del banco, bloqueo en 2 horas, pide credenciales por enlace |
| 2 | ARG-002 | Confirmación de turno médico | Legítimo | No pide datos, deriva al teléfono de la credencial, cotejar con la reserva |
| 3 | ARG-003 | Factura inesperada de un proveedor | Requiere verificación | Remitente no prueba nada, sin número de pedido, adjunto inesperado |
| 4 | ARG-004 | Premio de una encuesta | Phishing | Premio no solicitado, pide datos de tarjeta, vence hoy + «cargo de envío» |
| 5 | ARG-005 | Aviso de biblioteca | Legítimo | Trámite esperable, sin enlaces, contrastable con la reserva |
| 6 | ARG-006 | Pedido del director (fraude del CEO) | Phishing | «Responder a» externo, transferencia fuera de procedimiento, «no consultes a nadie» |
| 7 | ARG-007 | Actualización de contraseña corporativa | Requiere verificación | Sin enlaces, pero la política no está confirmada: verificar por canal interno |
| 8 | ARG-008 | Recibo de compra habitual | Legítimo | Sin pedidos de datos, detalle concreto, número para cotejar |
| 9 | ARG-009 | Alerta de paquetería | Phishing | Microcargo, dominio sin envío comprobable, 30 minutos de plazo |
| 10 | ARG-010 | Invitación a capacitación | Requiere verificación | Dominio externo, sin sistema oficial de inscripción, plausible |
| 11 | ARG-011 | Notificación de impuestos falsa | Phishing | Pide foto de documento y clave, amenaza de multas, dominio genérico «segura» |
| 12 | ARG-012 | Mensaje de una plataforma de cursos | Legítimo | Sin datos ni pagos, sugiere entrar desde el marcador |

Se conservaron de la semilla: id, título, remitente, dirección, asunto, clasificación, los textos de las 3 pistas y la acción recomendada (un test lo verifica contra `src/data/seed/casos-phishing.seed.json`). Se enriqueció: cuerpo realista con marcas de señales, fecha, destinatario ficticio («Sofía Ramos», `@correo-personal.example` / `@empresa-demo.example`), marca, enlace/adjunto inerte, títulos neutros de pista, explicación ampliada, «qué verificar» y conceptos. Corrección menor: en ARG-009 «las próximas 30 minutos» → «los próximos 30 minutos».

---

## RESULTADOS (comandos ejecutados realmente en esta entrega)

Entorno: Linux, Node 24.22.1, npm 11.21.1.

| Comando | Resultado |
|---|---|
| `npm install` | ✅ OK · `npm audit`: **0 vulnerabilidades** |
| `npm run typecheck` (`tsc -b --noEmit`) | ✅ exit 0, sin errores |
| `npm run lint` (ESLint) | ✅ exit 0, 0 errores, 0 advertencias |
| `npm run test` (Vitest) | ✅ **11 archivos, 63 pruebas, 63 aprobadas** |
| `npm run build` (`tsc -b && vite build`) | ✅ exit 0 · JS principal 424 kB (132 kB gzip), chunk del simulador 25 kB (7,9 kB gzip), CSS 52 kB (14 kB gzip) |
| `npm run test:e2e` (Playwright con Chrome del sistema, sobre `vite preview`) | ✅ **6 pruebas aprobadas** (2 escenarios × escritorio 1440, tablet 1024 y móvil 390): flujo inicio → simulador → pistas → enlace inerte → decisión → análisis → recarga con progreso restaurado, **sin errores de consola y sin pedidos a otros orígenes**; Desafío sin marcas visibles |
| Verificación desde el ZIP final (extraído en una carpeta limpia: `npm ci` + `npm run check`) | ✅ 0 vulnerabilidades, typecheck/lint OK, 63/63 pruebas, build OK |
| `npm run dev` | ✅ Configurado (es Vite estándar); el servidor de producción `vite preview` se levantó y usó en el E2E |

Cobertura de los tests pedidos en la spec §6:
- Clasificación/feedback: `evaluate.test.ts`, análisis en `PhishingSimulator.test.tsx`.
- Persistencia local y restauración: `store.test.ts`, test de flujo «persiste… y lo restaura», E2E con recarga.
- Reset: `store.test.ts` y test de flujo con confirmación/cancelación.
- Límite de pistas: `progress.test.ts`, `HintsPanel.test.tsx`.
- Transición Aprender/Desafío: `progress.test.ts`, test de flujo de Desafío y resumen de 12 casos.
- Ausencia de enlaces reales: `EmailViewer.test.tsx` (ningún `<a>`/`href` en los 12 correos), `App.test.tsx` (ninguna página enlaza afuera), `scenarios.test.ts` (dominios reservados; rechaza `google.com` o `.com` reales).
- Flujo de inicio a decisión: test de flujo y E2E.
- Datos corruptos no rompen la app: `store.test.ts` y test de flujo.

Capturas reales de la app (generadas por el E2E): `landing-*`, `simulador-inicial-*`, `simulador-analisis-*`, `simulador-desafio-*` en escritorio, tablet y móvil.

---

## EVALUACIÓN

- **Fidelidad visual:** paleta marfil/navy/ámbar con tokens, logo con ojo y «EL OBSERVADOR DIGITAL», titular slab en navy, CTA ámbar + secundario con borde, franja de beneficios y 4 tarjetas (la primera destacada) siguen la referencia de portada. El simulador sigue la segunda referencia: título con ícono de carpeta, «Caso N de 12» con segmentos y flechas, ventana de correo con barra navy, señales numeradas en ámbar, columna «Pistas del caso» + «¿Necesitás una pista? / Mostrar pista», barra «¿Qué harías con este mensaje?» con los tres botones verde/rojo/gris y «Análisis del caso» en tres columnas con «Acción recomendada».
- **Diferencia principal con la referencia:** la portada aprobada usa una ilustración pintada de un busto de Argos con muchos ojos, columnas y paisaje griego. No se copió esa imagen (la spec pide no usarla como fondo estático, y el paquete la aporta solo como guía). En su lugar hay una **ilustración vectorial propia** (ojo central, anillo de «cien ojos», templo, colinas y una columna lateral). Es más sobria que la referencia; si querés el busto, conviene sumar una ilustración con licencia libre o encargada (ver preguntas).
- **Encabezado del simulador:** se unificó el header de todo el sitio (Inicio · Casos interactivos · Conceptos · Acerca de + Guía rápida) en lugar del header alternativo «La sala de observación / Explorar · Ejercicios» de la segunda maqueta, para no tener dos navegaciones distintas.
- **Bandeja:** la maqueta del simulador no muestra bandeja; la spec sí la pide. Se agregó como columna izquierda en escritorio y como panel desplegable («Ver bandeja») en tablet y móvil.
- **Calidad:** TypeScript estricto, sin errores de lint, lógica de dominio pura y testeada por separado de la UI, sin HTML inyectado.

## PENDIENTES / limitaciones conocidas

- No hubo revisión con lector de pantalla real (NVDA/VoiceOver) ni auditoría Lighthouse/axe automatizada; la accesibilidad se cubrió por diseño y con consultas por rol en los tests.
- Contraste de algunos textos secundarios (gris tinta sobre marfil) no se midió con herramienta; a ojo es legible, pero conviene validarlo con axe.
- El bundle principal (424 kB, 132 kB gzip) incluye zod y los datos de escenarios porque el hub de casos muestra estadísticas; se puede dividir más si hiciera falta.
- Fechas de los correos son textos fijos («Hoy, 09:12»), no relativos a la fecha real.
- Las capturas son de la app real con Chrome headless; no se probó en Safari/iOS ni Firefox.
- El E2E necesita Chromium; si no está, `npm run test:e2e` falla con un mensaje de Playwright (las pruebas de Vitest no dependen de eso).
- Contenido: los casos son simplificados (un correo por caso, sin hilos ni imágenes) y conviene que QA revise redacción y dificultad.

## Próximos pasos sugeridos (Fase 2)

1. Revisión de Agustín de esta entrega (visual + contenido de los 12 casos) y ajustes.
2. Si das el visto bueno: crear una rama y PR en GitHub (solo con tu autorización), y deploy de prueba en Vercel Hobby.
3. Auditoría de accesibilidad con axe + prueba en iPhone real.
4. **Laboratorio Worm / Malware**: implementar `SimulationEngine` determinista y puro sobre los contratos de `modules/labs/contracts.ts` (tres equipos ficticios, eventos sintéticos, modos Observación/Defensa, fichas de teoría por evento), con el aviso «Simulación ficticia. No afecta tus archivos, redes ni cuentas.» y tests que verifiquen que no hay acceso a APIs de archivos/red.
5. Módulo **Proteger tus accesos** (contraseñas + login de juguete con límite de intentos), que es chico y reutiliza el servicio de progreso.
6. Más tarde: Centro Blue Team (logs sintéticos) y laboratorio de IA (métricas reales, asistente determinista).
