# ARGOS — Estado del proyecto (cierre de Fase 1)

**Fecha:** 23/11/2026 (verificación final ≈ 18:40, hora de Buenos Aires, UTC-3) · **Versión:** `0.1.0` en `package.json` (sin etiqueta ni release)
**Estado:** Fase 1 (simulador de phishing) **aprobada visualmente por Agustín** y congelada. **Falta el QA técnico local independiente.** No se hicieron commits, push, PR, issues, ramas ni deploys: el repositorio de GitHub (`AgusDelgado98/argos`) **no** contiene este frontend.

Documentos relacionados: [`README.md`](README.md) (instalación y comandos), [`docs/continuidad/instrucciones-entrega-final.md`](docs/continuidad/instrucciones-entrega-final.md) (cierre y orden de trabajo de Agustín), [`ETICA.md`](ETICA.md), [`docs/ESPECIFICACION_MAESTRA_ARGOS.md`](docs/ESPECIFICACION_MAESTRA_ARGOS.md). El informe inicial quedó **reemplazado** por este documento (copia histórica en `docs/historial/`).

---

## 1. Qué hay terminado

**Stack:** React 19 + TypeScript 5.9 estricto + Vite 8 · React Router 7 · zod 4 · lucide-react · Fontsource (fuentes empaquetadas) · CSS propio con tokens (sin Tailwind) · Vitest 5 + Testing Library + jsdom · Playwright 1.65 · ESLint 9. SPA estática, sin backend.

**Páginas:** Inicio (hero con ilustración vectorial propia y encabezado unificado), Casos interactivos (hub), Simulador de phishing, Conceptos (8 fichas de glosario con anclas), Acerca de y ética, Próximos módulos (generada desde el registro), 404, y Guía rápida (diálogo).

**Simulador de phishing** (`/casos/phishing`):
- 12 correos ficticios: **5 phishing** (001, 004, 006, 009, 011), **4 legítimos** (002, 005, 008, 012) y **3 que requieren verificación** (003, 007, 010). Coincide con el documento de Agustín.
- Bandeja, visor de correo, enlaces y adjuntos **inertes**, hasta 3 pistas graduales con resaltado en el correo.
- **Aprender:** pistas y reintentos. **Desafío:** sin pistas antes de responder, una respuesta por caso y puntaje separado.
- Tres decisiones: «Parece legítimo», «Es un posible phishing» y «No tengo suficiente información».
- Calificación en tres niveles: **correcta**; **prudente** (no acertó pero no confió en algo dudoso, o desconfió de algo legítimo); **riesgosa** (marcó «Parece legítimo» un mensaje que no lo era).
- Devolución constructiva y específica, análisis completo desplegable y enlaces a conceptos.
- **Móvil (≤ 760 px):** el correo primero, una barra fija inferior y un panel inferior para pistas, respuesta y devolución.
- **Resumen del Desafío en dos niveles:** resumen compacto, y análisis completo a pedido.
- **Repaso guiado** de las respuestas riesgosas, en Aprender.
- **Progreso** en `localStorage`; se puede reiniciar todo o solo el Desafío.

**Arquitectura extensible:** registro de módulos (`src/modules/registry`) que genera rutas, hub, landing y «Próximos módulos»; almacén de progreso compartido y versionado; contratos (solo tipos) para los laboratorios futuros en `src/modules/labs/`, **sin implementación**.

## 2. Pruebas ejecutadas (entrega final, desde cero)

Entorno: Linux, **Node v24.22.1**, **npm 11.21.1**, TypeScript 5.9.3, ESLint 9.39.5, Vitest 5.1.1, Vite 8.3.8, Playwright 1.65.1 con Google Chrome 156 del sistema (`CHROME_PATH`). Se borraron `node_modules`, `dist`, `test-results` y `playwright-report` y se corrió `npm ci`, que reportó 0 vulnerabilidades.

| Paso | Resultado |
|---|---|
| `npm run typecheck` | sin errores |
| `npm run lint` | sin errores ni advertencias |
| `npm run test` | **14 archivos, 100/100 pruebas aprobadas** |
| `npm run build` | correcto (JS principal 429,7 kB / 133,7 kB gzip; simulador 48,3 kB, cargado bajo demanda) |
| `npm run test:e2e` | **13 aprobadas, 11 omitidas a propósito, 0 fallidas** (24 = 8 pruebas × 3 formatos) |

**Por qué se omiten 11 pruebas E2E:**
- Las de móvil no corren en escritorio ni en tablet, y las de escritorio no corren en móvil.
- El resumen y el repaso se prueban en móvil y escritorio, pero no en tablet.
- Los casos de un solo caso y de cero casos se prueban solo en escritorio.

Las salidas reales están en `docs/verificacion/`. La misma verificación se repitió sobre el ZIP descomprimido en una carpeta limpia (ver §7).

**Qué cubren las pruebas:**
- Esquema y contenido de los 12 casos: dominios reservados, marcas con pista, el texto no revela la clasificación y cada pista tiene categoría.
- Evaluación, progreso, almacén versionado (incluido un progreso corrupto) y registro de módulos.
- Pistas, decisión, flujo completo, persistencia y reinicio.
- Flujo móvil con panel inferior.
- Resumen: nivel 1, nivel 2 con foco, ocultamiento de la navegación entre casos y que el nivel 1 entre en 390×844 sin desplazarse.
- Repaso de 0, 1 y N casos: salir y retomar después de recargar, y que el Desafío no cambie.
- Ausencia de errores de consola y de pedidos externos.

## 3. Decisiones aprobadas (no reabrir salvo bugs de QA)

1. **Identidad:** marfil, azul oscuro, dorado, ojo de ARGOS y estilo sobrio. Se conservan la **ilustración vectorial del hero** y el **encabezado unificado**. CSS propio con tokens (`src/styles/tokens.css`).
2. **Contenido ficticio:** dominios reservados `.example` (el esquema rechaza otros), enlaces y adjuntos inertes, nada de `dangerouslySetInnerHTML` (lo prohíbe el lint) y ningún pedido de red.
3. **Móvil en tres pasos:** 1) observar el correo; 2) abrir el panel inferior para responder (o ver pistas en Aprender); 3) devolución en el mismo panel. La barra inferior es fija. *(iter-01)*
4. **Opciones neutrales:** las tres decisiones se ven iguales hasta elegir una. *(iter-02)*
5. **Devolución constructiva y específica:** nombra la señal que se escapó y la respuesta más adecuada, sin rojo ni «incorrecto». Panel compacto con 2 señales clave (`keyHints`) y análisis completo desplegable. *(iter-02)*
6. **Resumen del Desafío en dos niveles** *(iter-03 a iter-05)*:
   - **Nivel 1 (compacto, sin desplazarse en 390×844):** «Desafío completado», «N de 12 casos bien resueltos», desglose bien resueltos / con buena intuición / para revisar, una recomendación sobre el tipo de señal menos resuelto, «Repasar estos casos» y «Ver mi análisis completo».
   - **Nivel 2 (a pedido, con «Volver al resumen» y foco gestionado):**
     - «Cómo te fue por tipo de señal»: 8 categorías **estimadas por cantidad de casos** donde aparece cada señal (por ejemplo «3 de 4 casos bien resueltos · 1 prudente»), con la aclaración de que es una estimación. No afirma que la persona haya identificado señales sueltas.
     - «Respuestas para revisar» (solo las riesgosas reales; su cantidad coincide con el contador) separado de «Para practicar más» (casos relacionados, con estilo neutro: «No son errores»).
     - Enlaces al glosario y «Seguí practicando».
   - En el resumen se ocultan la navegación entre casos, el puntaje duplicado y la bandeja; en móvil el pie de página se reduce.
7. **Repaso guiado** *(iter-06)*. «Repasar estos casos» recorre en **Aprender** las respuestas riesgosas del Desafío:
   - Muestra «Repaso n de N» y «Salir del repaso».
   - Después de responder ofrece «Siguiente caso para repasar»; en el último caso, «Terminar el repaso».
   - Al terminar aparece «Repaso completado», con «Volver al resumen del Desafío» y «Seguir practicando en Aprender».
   - **0 casos:** no aparece el botón. Si hubo respuestas prudentes, se ofrece «Practicar casos relacionados» (abre un caso suelto). Si todo estuvo bien, la acción pasa a «Volver a intentar el Desafío».
   - **1 caso:** «Repaso 1 de 1» y luego «Terminar el repaso».
   - **Varios casos:** la secuencia completa.
8. **Persistencia y reinicio:**
   - Una sola clave versionada `argos.progress` (`{version: 1, updatedAt, modules}`), validada con zod. Si los datos son inválidos o están corruptos, se vuelve a un estado seguro.
   - El repaso se guarda en `modules.phishing.review` (`caseIds`, `done`, `active`). No hizo falta subir la versión: el campo es opcional y un repaso inválido se descarta.
   - **Salir:** con «Salir del repaso», al abrir un caso que no es del repaso o al pasar al Desafío, el repaso queda en pausa sin perder lo hecho. En el resumen aparece «Continuar el repaso» («Llevás n de N casos repasados.»).
   - **Al iniciar un repaso nuevo** se borran **solo las respuestas de Aprender de esos casos**; las pistas vistas se conservan. **El Desafío nunca se modifica.**
   - «Volver a intentar el Desafío» borra solo las respuestas del Desafío (pide confirmación) y descarta el repaso.
   - «Reiniciar progreso» borra todo (pide confirmación).

## 4. Restricciones vigentes

- Nada de malware real, exploits, payloads ni ataques a terceros. Solo simulaciones ficticias (ver `ETICA.md`).
- Sin APIs pagas, sin backend, cuentas ni telemetría.
- **Sin cambios en GitHub** (commits, push, PR, issues, ramas) **ni deploys sin autorización explícita de Agustín.**
- Un solo ZIP consolidado por fase. Las iteraciones intermedias se revisan con capturas.

## 5. Pendientes técnicos y limitaciones conocidas (para el QA)

- **Coincidencias y diferencias con el documento de Agustín:**
  - El documento (§3) pide confirmar que el borrado de las respuestas de Aprender al iniciar un repaso **se comunique claramente**. **Hoy la interfaz no lo avisa.** Solo dice «Repasás los casos 6 y 10 en modo Aprender, uno por vez.». Queda para resolver en QA como bug o texto, sin rediseño.
  - Lo demás coincide con el código: la cantidad de casos (5/4/3), las reglas de 0/1/N casos, que reiniciar el Desafío descarte el repaso, los resultados del Desafío intactos y las cifras de prueba (100 unitarias y 13 E2E aprobadas).
- **Windows:** no se ejecutó todavía. El README incluye el comando de PowerShell para `CHROME_PATH`.
- **Navegadores:** las E2E se corrieron solo en Chromium (Chrome 156). Faltan Safari (iOS/macOS) y Firefox reales, y dispositivos físicos.
- **Accesibilidad:** hay buenas prácticas aplicadas (roles, foco, Escape, `aria-*`, `prefers-reduced-motion`), pero **no se hizo una auditoría formal** (axe/Lighthouse ni lector de pantalla real). Hay que revisar el panel inferior con teclado y lector, y el foco al cerrar los diálogos.
- **Contraste:** no se midió con herramienta, en especial el ámbar sobre marfil y los textos `--ink-soft` chicos.
- **Detección de móvil:** usa `matchMedia('(max-width: 760px)')`. Al cambiar el tamaño en vivo cambia el diseño, pero no se probó a fondo la rotación de pantalla.
- **Botones por caso del análisis completo:** abren un caso suelto en Aprender, sin la secuencia del repaso (decisión deliberada).
- **Revisión pedagógica pendiente:** el contenido, la clasificación y las explicaciones de los 12 casos, y la asignación de categorías de señal por pista (`src/data/phishing-scenarios.json`).
- **Build:** el JS principal pesa unos 430 kB sin comprimir. Optimizar no es prioridad.
- **Ejecución de las E2E:** necesitan `npm run build` antes, porque usan `vite preview`.
- El progreso vive solo en el navegador: no hay sincronización ni exportación.

## 6. Próxima etapa (acordada; **no iniciada**)

1. **QA local y cierre técnico de Fase 1, sin rediseño:**
   - Instalar en Windows y correr `npm ci`, `npm run check` y las E2E.
   - QA manual de los casos 1 a 12 con respuestas correctas, prudentes y riesgosas.
   - Revisar pistas, modos, resumen, repaso de 0/1/N casos, reinicios y persistencia, sobre todo el borrado de respuestas de Aprender al iniciar un repaso.
   - Revisar la accesibilidad del panel inferior.
   - Corregir solo bugs. Después, decidir la `v0.1.0` y un eventual PR o deploy **solo con permiso**.
2. **Fase 2: laboratorio de worm simulado.** Una PC o red **totalmente ficticia**, con nodos y archivos virtuales:
   - Visualizar la propagación, los indicadores que deja, la detección y la contención.
   - Teoría breve, luego simulación, luego decisión defensiva y luego devolución.
   - Perspectiva Blue Team con eventos y alertas simulados. La IA queda para una fase posterior.
   - **Primero se aprueban el alcance y los bocetos; recién después se escribe código.** No hay nada desarrollado de ese laboratorio, salvo los tipos de `src/modules/labs/`.

## 7. Entrega

- `argos-fase1-final.zip`: código fuente completo, sin `node_modules`, `dist`, `test-results` ni `playwright-report`. Incluye `README.md`, este documento, `ETICA.md`, `LICENSE` y `docs/` (especificación, referencias, continuidad, verificación e historial). Las capturas de las iteraciones quedan fuera del ZIP.
- Verificación sobre el ZIP descomprimido en una carpeta limpia: `npm ci` + `npm run check` + E2E, con los mismos resultados que la copia de trabajo (100/100 unitarias; 13 E2E aprobadas y 11 omitidas).

**Para retomar en una conversación nueva:** «Retomemos ARGOS desde el cierre visual de Fase 1. Abrí `ESTADO_DEL_PROYECTO.md`, `docs/continuidad/instrucciones-entrega-final.md` y el ZIP consolidado; empecemos por QA local y validación técnica del simulador de phishing. No iniciemos aún el laboratorio de worms.»
