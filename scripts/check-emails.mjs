import { createServer } from "vite"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

// Node 20 no tiene --experimental-strip-types (llegó en 22.6).
// Vite ya transforma TypeScript, así que la validación corre en cualquier Node 20+.
const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const server = await createServer({
  root,
  configFile: join(root, "vite.config.ts"),
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
})

try {
  await server.ssrLoadModule("/src/data/emails.ts")
  console.log("OK: los correos de práctica cumplen las reglas.")
} finally {
  await server.close()
}
