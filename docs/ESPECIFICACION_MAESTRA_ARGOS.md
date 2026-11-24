# ARGOS — Especificación maestra para desarrollo con Grok

**Versión de traspaso:** 2026-11-23  
**Proyecto:** ARGOS / El observador digital  
**Repositorio público:** https://github.com/AgusDelgado98/argos  
**Estado verificado de GitHub:** solo documentación inicial (README.md, ETICA.md y LICENSE); la app no está publicada allí. Existe referencia a un ZIP local de un prototipo anterior que **no está incluido** en este paquete. Si el propietario facilita ese ZIP, auditarlo antes de reutilizarlo.  
**Alcance:** app web gratuita, open source, educativa y defensiva. Español rioplatense claro.

## 1. Visión de producto

ARGOS enseña a **observar señales, comprender amenazas y practicar decisiones defensivas**. Es una plataforma de aprendizaje experiencial para público general que evoluciona hacia escenarios Blue Team e IA aplicada a seguridad. No es una plataforma de hacking real, ni un emulador de malware operativo, ni una app que ataca servicios.

Propuesta narrativa: «Aprendé a ver las señales antes de que sea tarde». Los usuarios aprenden por ejercicios cortos, pueden cometer errores y reciben explicaciones relevantes a la acción. Teoría en pequeñas dosis, asociada al momento en que el usuario ve una señal o un evento.

Principios: costo cero para usuarios y propietario; sin registro obligatorio; diseño excepcional antes que dashboard genérico; interactividad auténtica; transparencia sobre lo simulado; privacidad y accesibilidad; arquitectura modular; entregables graduales con pruebas.

## 2. Identidad visual: referencias adjuntas y obligatorias

- `referencias/Argos: Observá las señales.png`: portada y lenguaje visual aprobados. Fondo marfil/pergamino, azul navy oscuro, acentos ámbar/dorado, figuras clásicas y símbolo del ojo. Hero fuerte con mensaje «Aprendé a ver las señales antes de que sea tarde», llamada a explorar casos y cuatro áreas de práctica. No replicar la imagen completa como un fondo estático: construir componentes reales.
- `referencias/Interfaz ARGOS: Detectá el phishing.png`: simulator de correo aprobado. Escena de correo en primer plano, encabezados, cuerpo, marcas de señales, columna de pistas, indicador `Caso 3 de 12`, tres decisiones, y análisis posterior del caso.

La alusión a Argos Panoptes debe ser sutil y distinguible, sin convertir toda la app en una decoración mitológica. Sin neones, calaveras, terminales verdes «hacker», mapas de ataque, carditis, gráficos inventados ni pantallas vacías. La bandeja de correo debe ser protagonista. Tipografía legible, jerarquía elegante, espacios generosos, responsive desktop/mobile. Las imágenes ilustran la dirección artística; no deben incorporarse como pantallas no interactivas.

Palette orientativa, **no una afirmación de los hex originales**: marfil `#FAF4EB`, navy `#14243A`, ámbar `#B77919`, dorado pálido `#F6E3C7`, gris tinta `#414754`. Ajustar visualmente según referencias. Usar design tokens CSS.

## 3. Fase 1 (entrega solicitada ahora): frontend y phishing funcional

### Stack y límites técnicos

React + TypeScript + Vite; Tailwind CSS y Lucide React si conviene; Vitest + React Testing Library; Vercel Hobby estático como destino futuro. Sin backend, login, base de datos, autenticación, cuentas reales, pagos, tracking, ni API de IA en esta fase. Persistencia exclusivamente de progreso local en `localStorage`, con control de versión y restauración segura. No deploy, no modificar el repositorio remoto por cuenta propia.

### Navegación y páginas mínimas

1. `Inicio`: landing fiel a boceto, CTA funcional, acceso a módulos, enfoque educación defensiva.
2. `Casos interactivos / Phishing`: simulador con 12 emails inventados, navegación de caso y progreso.
3. `Conceptos`: glosario contextual sobre phishing, remitente, dominio, urgencia, adjunto, enlace y verificación.
4. `Acerca de`: propósito, alcance educativo, limitaciones y ética.
5. `Módulos próximos`: seguridad de contraseñas, malware/worms, incidentes y laboratorio IA como teasers honestos (sin botones engañosos ni funcionalidad inventada).

### Mecánica del módulo de phishing

- 12 escenarios con variedad suficiente: **legítimos, phishing y casos que requieren más información**. Usar `datos/casos-phishing.json` como semilla/contrato editable. Todos los nombres/dominios son ficticios y no tienen enlaces activos.
- Mostrar cliente de correo verosímil: bandeja con mensajes seleccionables, remitente, fecha, asunto, cuerpo, posible enlace representado como **texto inerte**, indicadores visuales y panel de observación.
- Dos modos: **Aprender** (pistas graduales habilitadas) y **Desafío** (pistas ocultas durante la decisión, explicación al terminar). Evitar revelar de antemano el tipo del caso por colores o textos.
- Tres decisiones: `Parece legítimo`, `Es un posible phishing`, `No tengo suficiente información`.
- Tras responder: resultado, por qué, señales concretas, acción recomendada, qué se habría debido verificar; dar opción de revisar el caso sin alteraciones; no penalizar aprender.
- Hasta tres pistas específicas por caso, en progresión de menos a más explícita. Mostrar contador y estado revelado. Si el usuario cambia de caso, conservar su resultado sin filtrar pistas de otro.
- Progreso persistido y restaurado en el navegador: visitados, resueltos, decisiones, modo y pistas si corresponde. Opción de **reiniciar progreso** con confirmación.
- Una zona de *análisis del caso* aparece solo después de responder en Desafío; en Aprender puede mostrarse al finalizar. La captura de la maqueta ilustra un caso ya respondido; no dar la respuesta prematuramente.
- No entrenar a que todo correo «urgente» sea automáticamente fraudulento: los legítimos y ambiguos también deben enseñar verificación por otro canal.

### Accesibilidad y experiencia

- Español (Argentina), ortografía correcta y contenido claro para principiantes.
- Diseño responsive sin sacrificar legibilidad del correo en iPhone y desktop.
- Navegable con teclado, foco visible, botones semánticos, buen contraste, labels, ARIA cuando corresponda; evitar animaciones excesivas y respetar `prefers-reduced-motion`.
- Estados reales de carga si hubiera, vacíos, errores y navegación. No incluir controles decorativos inertes.

### Arquitectura sugerida (adaptar si hay una mejor justificación)

```
src/
  app/                   # router + shell + navegación
  components/ui/         # design system pequeño y reutilizable
  modules/phishing/      # domain, view, exercises, feedback
  modules/theory/        # glosario y fichas
  modules/labs/          # contratos para laboratorios futuros, sin peligro
  data/                  # escenarios educativos versionados
  hooks/                 # estado del progreso
  lib/                   # storage, utilidades puras, validación
  styles/                # tokens y layout
  test/                  # fixtures y testing helpers
```

## 4. Fases posteriores: diseñar arquitectura ahora, NO construirlas a costa de Fase 1

**Fase 2 — Laboratorio Worm / Malware (simulación de estados):** el alumno observa tres equipos ficticios (por ejemplo Recepción, Administración y Servidor de archivos). Un motor TypeScript puro produce eventos sintéticos (`archivo_aparece`, `equipo_alerta`, `aislamiento`, `cuarentena`) en un grafo virtual. Mostrar diferencias entre virus, worm y troyano, por qué se propaga un worm, indicadores, límites de antivirus/EDR, y decisiones defensivas (`aislar`, `examinar`, `bloquear`, `restaurar`). Dos modos: Observación y Defensa. **Nunca duplicar archivos reales, acceder al sistema de archivos del equipo, escanear redes, propagar código, ejecutar muestras ni construir replicación ejecutable.** Simular copias con objetos de JavaScript en memoria y eventos de UI únicamente. Teoría vinculada a cada evento importante.

**Fase 3 — Centro Blue Team:** consola educativa con líneas de tiempo y logs totalmente sintéticos; identificar IOC, separar falsos positivos, priorizar, documentar incidentes. Nada de capturar tráfico real ni monitorear equipos del usuario.

**Fase 4 — IA y seguridad:** detección de anomalías en datos públicos o sintéticos (notebooks de Python/scikit-learn), métricas reales con matriz de confusión, precision, recall, F1 y falsos positivos; explicar limitaciones y data leakage. Primer asistente educativo **determinista** basado en reglas/escenarios; integración de LLM solo si después se decide y respetando costo cero/privacidad. Laboratorio de prompt injection con documentos y asistente ficticios en recinto simulado, enfocado en detección y mitigación sin acceder a credenciales ni herramientas reales. Distinguir **IA para defender** y **amenazas amplificadas por IA** sin sensacionalismo.

**Fase 5 — Otras prácticas seguras:** SQLi parametrizada vs insegura en consulta de juguete, XSS en sandbox cerrado, fuerza bruta con límites de intentos sobre login simulado, ransomware conceptual con archivos representados de forma virtual o cifrado reversible aislado. No publicar servicios deliberadamente vulnerables ni pruebas contra terceros.

Importante: la hoja de ruta de GitHub es una referencia de origen; este documento incorpora nuestra evolución y prioriza el nuevo laboratorio visual y Blue Team, sin alterar la ética.

## 5. Seguridad y datos

- Cumplir `origen-github/ETICA.md` en toda decisión.
- No enviar, recibir ni abrir emails reales. No seguir enlaces, aunque un contenido de prueba parezca válido; usar `.example` y mostrar enlaces como texto inerte.
- Sanitizar cualquier contenido editable; no usar `dangerouslySetInnerHTML` para simular mensajes.
- No telemetría, cookies de terceros, llaves, tokens, servicios externos, ni scraping.
- Un ejercicio puede mostrar el **texto** de un adjunto o enlace; no crear adjuntos ejecutables ni habilitar descargas peligrosas.
- Cada futuro laboratorio debe emitir una advertencia clara: `Simulación ficticia. No afecta tus archivos, redes ni cuentas.`

## 6. Pruebas y definición de terminado

Antes de pedir revisión, entregar:

- `npm install`, `npm run dev`, `npm run build`, `npm run test` (comandos configurados y probados).
- Tests focalizados de clasificación/feedback de casos, persistencia local, reset, límites de pistas, transición Aprender/Desafío, ausencia de enlaces reales y al menos una prueba de flujo de inicio a decisión de phishing.
- Layout fiel a referencias, usable en desktop y móvil, sin errores de consola significativos.
- Sin botones falsos, sin dependencias de pago y sin marcadores que aparenten funcionalidades inexistentes.
- Un resumen estructurado **TRABAJADO / RESULTADOS / EVALUACIÓN / PENDIENTES**, con comandos y resultado real de cada prueba. Informar explícitamente las pruebas que no pudo ejecutar; no afirmar que todo funciona sin verificación.
- **ZIP con código fuente completo** (sin `node_modules`, `.env`, secretos ni artefactos generados innecesarios), más README de ejecución. No reemplazar el ZIP por una transcripción masiva de código.
- No hacer commits, pushes, merges ni deploys al GitHub remoto hasta aprobación expresa del propietario.

## 7. Cómo encarar el trabajo

1. Analizar este documento, las capturas aprobadas y la documentación original de GitHub.
2. Si el propietario aporta un ZIP de código previo, inspeccionarlo y reutilizar lo rescatable; si no, arrancar una aplicación limpia con el stack indicado.
3. Presentar árbol de proyecto y plan muy corto de Fase 1, más conflictos concretos si los hubiera.
4. Implementar Fase 1 sin expandir el alcance, priorizando visual + jugabilidad real + tests.
5. Entregar ZIP final y reporte; el propietario revisa antes de continuar con Fase 2.

### Qué no hacer

No cambiar ARGOS por una plataforma de pentesting, no incorporar malware real, no inventar servicios pagos, no convertir la home en un dashboard de métricas, no fabricar screenshots como sustituto de UI real, no decorar con neón «hacker», no hacer deploy sin permiso y no introducir funcionalidades «por si acaso» antes del MVP.
