# ARGOS — El observador digital · Fase 1

Plataforma **gratuita, educativa y defensiva** de ciberseguridad. Esta entrega incluye la landing, el simulador de phishing con 12 casos ficticios (modos Aprender y Desafío), las páginas Conceptos, Acerca de y Próximos módulos, y una arquitectura preparada para los laboratorios de fases siguientes.

> **Para continuar el proyecto, leé primero [ESTADO_DEL_PROYECTO.md](ESTADO_DEL_PROYECTO.md).**

> Todo es ficticio: personas, marcas y dominios inventados (`.example`), enlaces inertes y adjuntos que no existen. No hay backend, cuentas, telemetría ni servicios externos. El progreso se guarda solo en el `localStorage` del navegador. Ver [ETICA.md](ETICA.md).

## Requisitos

- **Node.js 20.19 o superior** (verificado con Node 24.22.1 y npm 11.21.1). Recomendado: Node 22 LTS o 24.
- npm 10 o superior (viene con Node).
- Solo para las pruebas E2E: un Chromium para Playwright (ver «Pruebas E2E»).
- Funciona en Windows, macOS y Linux. La verificación de esta entrega se hizo en Linux; en Windows no se ejecutó todavía.

## Instalación

```bash
npm ci               # instala exactamente las versiones de package-lock.json (recomendado)
# o: npm install
```

Todas las dependencias son gratuitas y open source. No hay variables de entorno, claves ni servicios externos.

## Uso

```bash
npm run dev          # servidor de desarrollo → http://localhost:5173
npm run build        # chequeo de tipos + build de producción en dist/
npm run preview      # sirve dist/ → http://localhost:4173 (hacé `npm run build` antes)
```

## Pruebas y verificación

```bash
npm run typecheck    # TypeScript estricto (tsc -b --noEmit)
npm run lint         # ESLint (incluye una regla que prohíbe dangerouslySetInnerHTML)
npm run test         # unitarias, de componentes y de flujo (Vitest + Testing Library + jsdom)
npm run check        # typecheck + lint + test + build, en ese orden (lo que hay que correr antes de entregar)
```

`npm run test:watch` deja Vitest en modo observación.

### Pruebas E2E (Playwright)

Las E2E levantan `vite preview` sobre `dist/`, así que **primero hay que compilar**. Se ejecutan en tres formatos (escritorio 1440×900, tablet 1024×768 y móvil 390×844); algunas pruebas se omiten a propósito en formatos donde no aplican.

```bash
npm run build
npx playwright install chromium   # una sola vez: descarga el Chromium de Playwright
npm run test:e2e
```

Si preferís usar un Chrome ya instalado, en lugar de `playwright install` definí `CHROME_PATH`:

```bash
# Linux / macOS
CHROME_PATH=/usr/bin/google-chrome npm run test:e2e
```

```powershell
# Windows (PowerShell)
$env:CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"; npm run test:e2e
```

Variables opcionales: `SCREENSHOT_DIR=./capturas` guarda capturas de página completa del flujo principal; `ITER_DIR=./capturas-revision` guarda las capturas móviles de revisión del repaso guiado.

### Despliegue (futuro)

Es un SPA estático: `dist/` se puede publicar en Vercel Hobby. `vercel.json` ya redirige todas las rutas a `index.html`. **No se hizo ningún deploy** y no debe hacerse sin autorización.

## Estructura

```
src/
  app/                 Router, layout (header/nav/footer), guía rápida, resolución de módulos
  components/
    brand/             Logo, símbolo del ojo, ilustración del hero y columna (SVG propios)
    ui/                Modal accesible, diálogo de confirmación, barra de progreso segmentada
  data/
    phishing-scenarios.json   12 escenarios enriquecidos (contrato versionado, editable por QA)
    seed/casos-phishing.seed.json  semilla original del paquete (los tests verifican que se respete)
  hooks/               useModuleProgress (almacén de progreso) y useMediaQuery (móvil ≤ 760 px)
  lib/
    storage.ts         Acceso seguro a localStorage con respaldo en memoria
    progress/          Almacén de progreso compartido, versionado, con migraciones y restauración segura
  modules/
    registry/          Registro de módulos (fuente única para rutas, landing, hub y próximos módulos)
    phishing/
      domain/          Esquema zod, parser de señales, evaluación (correcta/prudente/riesgosa), progreso,
                       categorías de señal, resumen del Desafío (report.ts) y repaso guiado (review.ts)
      data/            Carga y validación de escenarios
      components/      Bandeja, visor de correo, enlace/adjunto inertes, pistas, decisión, análisis,
                       barra y panel inferior móviles, resumen del Desafío, barra y cierre del repaso
      PhishingSimulator.tsx
    theory/            Glosario de conceptos
    labs/              SOLO contratos (tipos) para Worm/Malware, Blue Team e IA — sin implementación
  pages/               Inicio, Casos, Conceptos, Acerca de, Próximos módulos, 404
  styles/              Tokens de diseño + estilos por área
  test/                setup de Vitest y helper renderApp
e2e/                   Pruebas Playwright (escritorio, tablet y móvil)
docs/
  ESPECIFICACION_MAESTRA_ARGOS.md   especificación original
  origen/              README original del repositorio de GitHub
  referencias/         referencias visuales aprobadas
  continuidad/         documento de cierre y continuidad de Agustín (Fase 1)
  verificacion/        salidas reales de la verificación de la entrega final
  historial/           informe inicial de Fase 1 (reemplazado por ESTADO_DEL_PROYECTO.md)
ESTADO_DEL_PROYECTO.md Estado real, decisiones aprobadas, pruebas y pendientes (leer primero para continuar)
```

## Cómo agregar o editar un escenario de phishing

1. Abrí `src/data/phishing-scenarios.json` y agregá un objeto en `scenarios` (copiá uno existente).
2. Campos clave:
   - `id`: formato `ARG-NNN`, único.
   - `senderEmail`, `to`, `replyTo` y las `url` de enlaces: **solo dominios reservados** (`.example`, `.test`, `.invalid`, `example.com`…). El esquema rechaza cualquier otro.
   - `classification`: `legitimate`, `phishing` o `needs_more_info`.
   - `hints`: hasta 3, de menos a más explícita, con `title` neutro (que no revele la respuesta), `text` y `category` (tipo de señal: `dominio`, `remitente`, `urgencia`, `credenciales`, `dinero`, `enlaces`, `adjuntos` o `verificacion`; alimenta «Cómo te fue por tipo de señal»).
   - `keySignal` y `keyHints` (2 números de pista): la señal principal y las dos pistas que muestra la devolución compacta.
   - `content`: lista de bloques. Un párrafo es un texto; para señalar un fragmento usá `[[n|fragmento]]`, donde `n` es el número de pista (1–3). También hay bloques `{"type":"link"}`, `{"type":"attachment"}` y `{"type":"signature"}`, con `marker` opcional.
   - `markers`: señala `sender`, `replyTo` o `subject` con un número de pista.
   - `feedback`: `summary`, `explanation`, `recommendedAction` y `verify` (qué convenía verificar).
   - `concepts`: ids del glosario (`src/modules/theory/glossary.ts`) para enlazar desde el análisis.
3. Ejecutá `npm run check`: los tests validan el esquema, los dominios, que las marcas tengan pista y que el texto del correo no revele la clasificación. Si cambiás la cantidad de casos, ajustá el test «hay exactamente 12 casos».

El texto se renderiza siempre como texto plano (sin HTML), así que no hace falta escapar nada.

## Cómo agregar un módulo nuevo

1. Creá la carpeta `src/modules/<modulo>/` con su vista como **export default** (por ejemplo `MiModulo.tsx`).
2. Registralo en `src/modules/registry/registry.ts`:
   ```ts
   {
     id: 'amenazas', slug: 'amenazas', area: 'entender', phase: 2,
     status: 'available',                       // 'planned' mientras no exista
     component: lazy(() => import('../amenazas/WormLab')),
     title: '…', cardTitle: '…', cardDescription: '…', description: '…',
     icon: Bug, topics: ['…'], safety: LAB_SAFETY_NOTICE,
   }
   ```
   Con eso aparece automáticamente en `/casos/<slug>`, en el hub de casos y en la landing (si su área es una de las cuatro). Mientras sea `planned`, la ruta redirige a su ficha en «Próximos módulos» (no hay vistas falsas).
3. Para guardar progreso, definí un esquema zod y usá `useModuleProgress('<id>', esquema, valorInicial)`; el almacén compartido se ocupa de versionado, validación y reset.
4. Los laboratorios deben respetar los contratos de `src/modules/labs/` y mostrar siempre: «Simulación ficticia. No afecta tus archivos, redes ni cuentas.» Nada de acceso al sistema de archivos, red, ejecución de muestras ni replicación real.

## Accesibilidad

Navegación por teclado, foco visible, enlace «Saltar al contenido», botones semánticos con `aria-pressed`/`aria-expanded`, diálogos con foco atrapado y Escape, regiones etiquetadas, el análisis recibe el foco tras responder, y `prefers-reduced-motion` respetado.

## Licencia

Código bajo licencia [MIT](LICENSE). El uso de ARGOS está sujeto a [ETICA.md](ETICA.md). Autor: Agustín Delgado.
