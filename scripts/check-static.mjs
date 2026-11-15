import { readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const targets = ["src", "public", "index.html"]
const banned = [
  "fetch(",
  "XMLHttpRequest",
  "sendBeacon",
  "WebSocket",
  "EventSource",
  "serviceWorker",
  "gtag(",
  "google-analytics",
  "googletagmanager",
  "fonts.googleapis",
  "fonts.gstatic",
  "cdn.jsdelivr",
  "unpkg.com",
]

const files = []

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const info = statSync(path)
    if (info.isDirectory()) {
      walk(path)
      continue
    }
    if (/\.(tsx?|css|html|svg|mjs|js)$/.test(entry)) files.push(path)
  }
}

for (const target of targets) {
  const path = join(root, target)
  const info = statSync(path)
  if (info.isDirectory()) walk(path)
  else files.push(path)
}

const urlPattern = /https?:\/\/[^\s"'`)<>]+/g
let failed = false

for (const file of files) {
  const text = readFileSync(file, "utf8").replaceAll(
    'xmlns="http://www.w3.org/2000/svg"',
    "",
  )
  const relative = file.slice(root.length + 1)
  for (const word of banned) {
    if (text.includes(word)) {
      console.error(`${relative} contiene «${word}», que esta app estática no usa.`)
      failed = true
    }
  }
  if (/href\s*=\s*["']\/\//.test(text) || /src\s*=\s*["']\/\//.test(text)) {
    console.error(`${relative} tiene una URL protocol-relative.`)
    failed = true
  }
  for (const url of text.match(urlPattern) ?? []) {
    const host = url.replace(/^https?:\/\//i, "").split("/")[0]?.toLowerCase() ?? ""
    if (!host.endsWith(".example") && !host.endsWith(".invalid")) {
      console.error(`${relative} tiene una URL que no usa .example ni .invalid: ${url}`)
      failed = true
    }
  }
}

if (failed) process.exit(1)
console.log(`OK: ${files.length} archivos sin red externa.`)
