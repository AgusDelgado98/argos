import { LAB_BRANDS, officialDomain } from "./brands.ts"
import type { LabBrandName } from "./brands.ts"
import { SIGNAL_IDS } from "./signals.ts"
import type { SignalId } from "./signals.ts"
import { hostFromAddress, hostFromUrl, isOfficialHost, isReservedHost } from "../lib/hosts.ts"

export type EmailBlock =
  | { kind: "text"; text: string }
  | { kind: "link"; label: string; destination: string }
  | { kind: "file"; name: string }

export type Difficulty = "fácil" | "media" | "difícil"

export type LabEmail = {
  id: string
  brand: LabBrandName
  fromName: string
  fromAddress: string
  subject: string
  dateLabel: string
  preview: string
  blocks: readonly EmailBlock[]
  isPhishing: boolean
  difficulty: Difficulty
  signals: readonly SignalId[]
  why: string
  safeCues: readonly string[]
  trap?: string
}

export const INBOX_OWNER = {
  name: "Ana",
  address: "ana@correo.example",
} as const

export const EMAILS: readonly LabEmail[] = [
  {
    id: "ml-envio",
    brand: "Mercado Libre",
    fromName: "Mercado Libre",
    fromAddress: "avisos@mercadolibre.com.example",
    subject: "Tu compra ya está en camino",
    dateLabel: "Hoy, 9:14",
    preview: "Hola, Ana. Tu pedido de auriculares salió del centro de envíos.",
    isPhishing: false,
    difficulty: "fácil",
    signals: [],
    why: "Es un aviso de envío. El dominio es el de práctica, el enlace no se va a otro lado y no te pide datos.",
    safeCues: [
      "La dirección es avisos@mercadolibre.com.example, el dominio de práctica de Mercado Libre.",
      "Te saluda por tu nombre y habla de un pedido concreto.",
      "El enlace se queda en www.mercadolibre.com.example.",
      "No te pide datos de acceso ni de pago.",
    ],
    blocks: [
      { kind: "text", text: "Hola, Ana." },
      {
        kind: "text",
        text: "Tu pedido de auriculares salió del centro de envíos. El número de seguimiento es ML482913.",
      },
      { kind: "text", text: "Podés ver el estado desde la app o desde este enlace:" },
      {
        kind: "link",
        label: "Ver el envío",
        destination: "https://www.mercadolibre.com.example/compras/ML482913",
      },
      {
        kind: "text",
        text: "Si no hiciste esta compra, entrá a tu cuenta desde la app oficial.",
      },
    ],
  },
  {
    id: "mp-suspension",
    brand: "Mercado Pago",
    fromName: "Mercado Pago Seguridad",
    fromAddress: "soporte@mercadopago-alerta.example",
    subject: "URGENTE: tu cuenta se suspende en 2 horas",
    dateLabel: "Hoy, 8:02",
    preview: "Hola usuario, detectamos un ingreso extraño.",
    isPhishing: true,
    difficulty: "fácil",
    signals: ["dominio-parecido", "apuro", "enlace-distinto", "pide-datos", "saludo-generico"],
    why: "Se hace pasar por Mercado Pago, pero la dirección es mercadopago-alerta.example. Te apura, te dice «usuario» y el botón lleva a mercad0pago-verificar.example: hay un cero en vez de la o, y pide la contraseña.",
    safeCues: [],
    blocks: [
      { kind: "text", text: "Hola usuario," },
      {
        kind: "text",
        text: "Detectamos un ingreso extraño. Si no confirmás tu contraseña y el código que te llega al celular, tu cuenta se suspende.",
      },
      {
        kind: "link",
        label: "Ingresar a Mercado Pago",
        destination: "https://mercad0pago-verificar.example/login",
      },
      { kind: "text", text: "Tenés 2 horas. Después no vas a poder usar la cuenta." },
    ],
  },
  {
    id: "netflix-precio",
    brand: "Netflix",
    fromName: "Netflix",
    fromAddress: "info@netflix.com.example",
    subject: "El mes que viene cambia el precio de tu plan",
    dateLabel: "Lun, 11:20",
    preview: "Hola, Ana. En diciembre el plan Estándar cambia de precio.",
    isPhishing: false,
    difficulty: "media",
    signals: [],
    why: "Avisa un cambio de precio y eso puede inquietar, pero no pide datos. El dominio y el enlace son los de práctica de Netflix.",
    trap: "Hablar de un precio nuevo no alcanza para que sea falso. Fijate si piden datos y a dónde va el enlace.",
    safeCues: [
      "La dirección es info@netflix.com.example.",
      "Avisa un cambio para el mes que viene, sin amenaza de corte inmediato.",
      "El enlace se queda en www.netflix.com.example.",
      "No pide datos de pago en el correo.",
    ],
    blocks: [
      { kind: "text", text: "Hola, Ana." },
      {
        kind: "text",
        text: "A partir del 15 de diciembre el plan Estándar pasa a $12.900 por mes. No tenés que hacer nada para seguir mirando.",
      },
      { kind: "text", text: "Si querés revisar el plan, abrí Netflix en la app o usá este enlace:" },
      {
        kind: "link",
        label: "Ver los detalles del plan",
        destination: "https://www.netflix.com.example/cuenta/plan",
      },
      { kind: "text", text: "Este correo es solo un aviso." },
    ],
  },
  {
    id: "netflix-pago",
    brand: "Netflix",
    fromName: "Netflix",
    fromAddress: "renovacion@netflix-cuenta.example",
    subject: "Tu pago falló: actualizá la tarjeta hoy o se corta",
    dateLabel: "Hoy, 6:12",
    preview: "Hola usuario, no pudimos cobrar tu servico.",
    isPhishing: true,
    difficulty: "media",
    signals: ["dominio-parecido", "apuro", "enlace-distinto", "pide-datos", "errores", "saludo-generico"],
    why: "El nombre dice Netflix, pero la dirección es netflix-cuenta.example. Amenaza con cortar la cuenta, escribe mal «servico» y «actulizás», y el enlace va a netflix-billing.invalid para pedir la tarjeta.",
    safeCues: [],
    blocks: [
      { kind: "text", text: "Hola usuario," },
      {
        kind: "text",
        text: "No pudimos cobrar tu servico. Si no actulizás la tarjeta en las próximas horas, vamos a cortar la cuenta.",
      },
      {
        kind: "link",
        label: "Actualizar tarjeta ahora",
        destination: "https://netflix-billing.invalid/pago",
      },
      {
        kind: "text",
        text: "Ingresá el número de la tarjeta, el vencimiento y el código de seguridad.",
      },
    ],
  },
  {
    id: "galicia-resumen",
    brand: "Banco Galicia",
    fromName: "Banco Galicia",
    fromAddress: "avisos@bancogalicia.com.example",
    subject: "Ya está el resumen de noviembre",
    dateLabel: "1 nov, 8:00",
    preview: "Hola, Ana. El resumen con vencimiento el 12 de noviembre ya está listo.",
    isPhishing: false,
    difficulty: "fácil",
    signals: [],
    why: "Es un aviso del resumen. Sale del dominio de práctica, te nombra, no trae enlace y no pide datos. Para verlo te manda a la app.",
    safeCues: [
      "La dirección es avisos@bancogalicia.com.example.",
      "Te saluda por tu nombre y da un vencimiento concreto.",
      "No trae enlace.",
      "No pide datos de acceso ni de pago.",
    ],
    blocks: [
      { kind: "text", text: "Hola, Ana." },
      {
        kind: "text",
        text: "El resumen de noviembre ya está listo. El vencimiento es el 12 de noviembre.",
      },
      { kind: "text", text: "Para verlo, abrí la app del banco. Este correo no trae un enlace." },
      {
        kind: "text",
        text: "Si no reconocés un consumo, escribinos desde el chat de la app.",
      },
    ],
  },
  {
    id: "correo-paquete",
    brand: "Correo Argentino",
    fromName: "Correo Argentino Envíos",
    fromAddress: "envios@correo-argentino-paquete.example",
    subject: "Último aviso: hay un paquete retenido",
    dateLabel: "Hoy, 7:48",
    preview: "Hola, hay un paquete a tu nombre. Si no lo pagás hoy, vuelve al remitente.",
    isPhishing: true,
    difficulty: "media",
    signals: ["dominio-parecido", "apuro", "enlace-distinto", "archivo-raro", "pide-datos", "saludo-generico"],
    why: "Un paquete retenido y un pago apurado es un cuento muy común. El dominio correo-argentino-paquete.example no es el de práctica, el botón va a otro sitio, pide la tarjeta y adjunta un .zip.",
    safeCues: [],
    blocks: [
      { kind: "text", text: "Hola," },
      {
        kind: "text",
        text: "Hay un paquete a tu nombre retenido en aduana. Si no lo pagás hoy, vuelve al remitente. La tasa es de $890.",
      },
      { kind: "text", text: "Adjuntamos el comprobante para que lo abras." },
      { kind: "file", name: "factura_paquete.zip" },
      {
        kind: "link",
        label: "Pagar y liberar el paquete",
        destination: "https://correoargentino-pago.example/liberar",
      },
      { kind: "text", text: "Ingresá el número de la tarjeta para pagar la tasa." },
    ],
  },
  {
    id: "mp-premio",
    brand: "Mercado Pago",
    fromName: "Mercado Pago Premios",
    fromAddress: "premios@mercadopago-sorteo.example",
    subject: "Ganó $200.000 en el sorteo de aniversario",
    dateLabel: "Hoy, 10:19",
    preview: "Estimado cliente, hay $200.000 para acreditar. La oferta vence hoy.",
    isPhishing: true,
    difficulty: "media",
    signals: ["dominio-parecido", "apuro", "enlace-distinto", "pide-datos", "premio", "saludo-generico"],
    why: "Nadie regala $200.000 por correo. El dominio es mercadopago-sorteo.example, no el de práctica, y para cobrar te pide la contraseña y la tarjeta. El botón va a mercadopago-premios.example.",
    trap: "Un texto sin faltas de ortografía también puede ser falso. Acá alcanzan el premio, el apuro y el dominio.",
    safeCues: [],
    blocks: [
      { kind: "text", text: "Estimado cliente," },
      {
        kind: "text",
        text: "Usted fue seleccionado en el sorteo de aniversario. Hay $200.000 para acreditar en su cuenta.",
      },
      {
        kind: "text",
        text: "Para recibir el premio confirme su identidad con la contraseña y los datos de la tarjeta.",
      },
      {
        kind: "link",
        label: "Cobrar el premio",
        destination: "https://mercadopago-premios.example/cobrar",
      },
      { kind: "text", text: "La oferta vence hoy." },
    ],
  },
  {
    id: "correo-seguimiento",
    brand: "Correo Argentino",
    fromName: "Correo Argentino",
    fromAddress: "notificaciones@correoargentino.com.example",
    subject: "Tu envío está en camino",
    dateLabel: "Ayer, 18:22",
    preview: "Hola, Ana. El envío AR-2049188 está en Buenos Aires. No hay pagos pendientes.",
    isPhishing: false,
    difficulty: "fácil",
    signals: [],
    why: "Informa un envío con número de seguimiento y aclara que no hay pagos. El dominio y el enlace son los de práctica.",
    safeCues: [
      "La dirección es notificaciones@correoargentino.com.example.",
      "Habla de un envío concreto y dice que no hay pagos pendientes.",
      "El enlace se queda en www.correoargentino.com.example.",
      "No trae archivos ni pide datos.",
    ],
    blocks: [
      { kind: "text", text: "Hola, Ana." },
      {
        kind: "text",
        text: "El envío AR-2049188 está en el centro de distribución de Buenos Aires. No hay pagos pendientes.",
      },
      {
        kind: "link",
        label: "Seguir el envío",
        destination: "https://www.correoargentino.com.example/seguimiento/AR-2049188",
      },
      { kind: "text", text: "Si preferís, consultá el mismo número en la app o en la sucursal." },
    ],
  },
  {
    id: "galicia-clave",
    brand: "Banco Galicia",
    fromName: "Banco Galicia",
    fromAddress: "notificaciones@banco-galicia-online.example",
    subject: "Su tarjeta fue bloqueada, ingrese la clave",
    dateLabel: "Ayer, 22:41",
    preview: "Estimado cliente, su tarjeta a sido bloqueada.",
    isPhishing: true,
    difficulty: "media",
    signals: ["dominio-parecido", "apuro", "enlace-distinto", "pide-datos", "errores", "saludo-generico"],
    why: "Un banco no pide por correo la clave del cajero ni el número completo de la tarjeta. La dirección es banco-galicia-online.example, el texto dice «a sido» y «actuliza», y el enlace termina en .invalid.",
    safeCues: [],
    blocks: [
      { kind: "text", text: "Estimado cliente," },
      {
        kind: "text",
        text: "Su tarjeta a sido bloqueada por seguridad. Para desbloquearla ingrese el número completo y la clave del cajero antes de las 23:59.",
      },
      {
        kind: "link",
        label: "Actualizar datos",
        destination: "https://galicia-cliente.invalid/datos",
      },
      { kind: "text", text: "El banco no se responsabiliza si no actuliza a tiempo." },
    ],
  },
  {
    id: "mp-transferencia",
    brand: "Mercado Pago",
    fromName: "Mercado Pago",
    fromAddress: "noreply@mercadopago.com.example",
    subject: "Ana Pérez te envió $15.000",
    dateLabel: "Hoy, 16:40",
    preview: "Hola, Ana. Recibiste $15.000 de Ana Pérez por la cena del sábado.",
    isPhishing: false,
    difficulty: "difícil",
    signals: [],
    why: "Parece raro porque habla de dinero, pero es un aviso de una transferencia. El dominio es el de práctica, el enlace se queda ahí y no te piden nada para recibirla.",
    trap: "Ver un monto de dinero hace dudar. Un premio falso pide que confirmes datos para cobrarlo. Acá el dinero ya figura acreditado y no te piden nada.",
    safeCues: [
      "La dirección es noreply@mercadopago.com.example.",
      "Nombra a una persona y un motivo, no un sorteo.",
      "El enlace va a www.mercadopago.com.example.",
      "Dice que no hace falta confirmar nada para recibir el dinero.",
    ],
    blocks: [
      { kind: "text", text: "Hola, Ana." },
      { kind: "text", text: "Recibiste $15.000 de Ana Pérez. Motivo: «Cena del sábado»." },
      {
        kind: "link",
        label: "Ver el movimiento",
        destination: "https://www.mercadopago.com.example/actividades/88921",
      },
      {
        kind: "text",
        text: "El dinero ya está en tu cuenta. No hace falta confirmar nada para recibirlo.",
      },
      {
        kind: "text",
        text: "Si no conocés a quien te lo envió, revisá el movimiento desde la app oficial.",
      },
    ],
  },
  {
    id: "ml-pregunta",
    brand: "Mercado Libre",
    fromName: "Mercado Libre",
    fromAddress: "noreply@mercadolibre.com.example",
    subject: "Te hicieron una pregunta en tu publicación",
    dateLabel: "Hoy, 13:05",
    preview: "Hola, Ana. Alguien preguntó si los auriculares llegan a Córdoba.",
    isPhishing: true,
    difficulty: "difícil",
    signals: ["enlace-distinto"],
    why: "El remitente sí es el de práctica: noreply@mercadolibre.com.example. El engaño está en el enlace. El texto dice «Responder la pregunta», pero el destino es mercado-libre-login.example, otro sitio.",
    trap: "Si el texto del enlace suena bien pero el destino es otro, es un engaño aunque el resto del correo se vea normal.",
    safeCues: [],
    blocks: [
      { kind: "text", text: "Hola, Ana." },
      {
        kind: "text",
        text: "Recibiste una pregunta en «Auriculares inalámbricos»: «¿Llegan a Córdoba esta semana?».",
      },
      {
        kind: "link",
        label: "Responder la pregunta",
        destination: "https://mercado-libre-login.example/cuenta",
      },
    ],
  },
]

const TEXT_SIGNALS: readonly (readonly [SignalId, RegExp])[] = [
  [
    "apuro",
    /urgente|se suspend|próximas horas|vence hoy|antes de las|se corta|bloquead|si no lo pagás hoy|último aviso/i,
  ],
  [
    "pide-datos",
    /contraseña|clave del cajero|número completo|tarjeta|código de seguridad|datos de la tarjeta/i,
  ],
  ["premio", /ganaste|ganó|sorteo|premio/i],
  ["errores", /a sido|actuliz|servico/i],
]

function fail(message: string): never {
  throw new Error(`Datos de práctica inválidos: ${message}`)
}

function visibleText(email: LabEmail): string {
  const parts = [email.subject, email.preview]
  for (const block of email.blocks) {
    if (block.kind === "text") parts.push(block.text)
    if (block.kind === "link") parts.push(block.label)
  }
  return parts.join("\n")
}

function hasGenericGreeting(email: LabEmail): boolean {
  return email.blocks.some((block) => {
    if (block.kind !== "text") return false
    const text = block.text.trim()
    return (
      /^estimado (cliente|usuario),?$/i.test(text) ||
      /^hola usuario,?$/i.test(text) ||
      /^hola,$/i.test(text)
    )
  })
}

function linkHosts(email: LabEmail): string[] {
  const hosts: string[] = []
  for (const block of email.blocks) {
    if (block.kind === "link") hosts.push(hostFromUrl(block.destination))
  }
  return hosts
}

function assertAddress(address: string, where: string): string {
  if (!/^[a-z0-9._-]+@[a-z0-9.-]+$/i.test(address)) fail(`${where}: dirección mal formada`)
  const host = hostFromAddress(address)
  if (!isReservedHost(host)) fail(`${where}: el dominio ${host} no es .example ni .invalid`)
  return host
}

function assertUrl(url: string, where: string): string {
  if (!url.startsWith("https://")) fail(`${where}: la URL tiene que empezar con https://`)
  if (url.includes("@")) fail(`${where}: la URL no puede incluir un usuario`)
  const host = hostFromUrl(url)
  if (!isReservedHost(host)) fail(`${where}: el host ${host} no es .example ni .invalid`)
  return host
}

function assertLabEmails(emails: readonly LabEmail[]): void {
  if (emails.length < 10 || emails.length > 12) {
    fail(`se esperaban alrededor de 10 correos y hay ${emails.length}`)
  }
  assertAddress(INBOX_OWNER.address, "bandeja")
  const ids = new Set<string>()
  const brands = new Set<LabBrandName>()
  let phishing = 0
  let safe = 0
  const usedSignals = new Set<SignalId>()

  for (const email of emails) {
    if (ids.has(email.id)) fail(`id repetido ${email.id}`)
    ids.add(email.id)
    brands.add(email.brand)
    if (email.isPhishing) phishing += 1
    else safe += 1
    if (!email.subject.trim() || !email.preview.trim() || !email.why.trim()) {
      fail(`${email.id}: faltan textos`)
    }
    const fromHost = assertAddress(email.fromAddress, email.id)
    const official = officialDomain(email.brand)
    const fromOfficial = isOfficialHost(fromHost, official)
    const hosts = linkHosts(email)
    const mismatched = hosts.some((host) => !isOfficialHost(host, official))
    const hasFile = email.blocks.some((block) => block.kind === "file")

    for (const block of email.blocks) {
      if (block.kind === "link") assertUrl(block.destination, `${email.id} / ${block.label}`)
      if (block.kind === "file" && !block.name.toLowerCase().endsWith(".zip")) {
        fail(`${email.id}: el adjunto de práctica tiene que ser un .zip con nombre inventado`)
      }
    }

    if (email.isPhishing) {
      if (email.signals.length === 0 || email.safeCues.length > 0) {
        fail(`${email.id}: un phishing necesita señales y no pistas de correo seguro`)
      }
    } else if (email.signals.length > 0 || email.safeCues.length === 0) {
      fail(`${email.id}: un correo seguro no lleva señales de phishing y sí pistas`)
    }

    if (email.signals.includes("dominio-parecido")) {
      if (fromOfficial && !mismatched) {
        fail(`${email.id}: dominio-parecido, pero remitente y enlaces son oficiales`)
      }
    } else if (!fromOfficial) {
      fail(`${email.id}: el remitente no es oficial y falta la señal dominio-parecido`)
    }

    if (email.signals.includes("enlace-distinto") !== mismatched) {
      fail(`${email.id}: la señal enlace-distinto no coincide con los destinos`)
    }
    if (email.signals.includes("archivo-raro") !== hasFile) {
      fail(`${email.id}: la señal archivo-raro no coincide con el adjunto`)
    }
    if (email.signals.includes("saludo-generico") !== hasGenericGreeting(email)) {
      fail(`${email.id}: la señal saludo-generico no coincide con el texto`)
    }

    const corpus = visibleText(email)
    for (const [signal, pattern] of TEXT_SIGNALS) {
      const hit = pattern.test(corpus)
      const listed = email.signals.includes(signal)
      if (email.isPhishing && hit !== listed) {
        fail(`${email.id}: la señal ${signal} ${hit ? "está en el texto y no está declarada" : "está declarada y no aparece"}`)
      }
      if (!email.isPhishing && hit) fail(`${email.id}: un correo seguro coincide con ${signal}`)
    }

    for (const signal of email.signals) usedSignals.add(signal)
  }

  if (phishing < 4 || safe < 4) fail("tiene que haber una mezcla de correos seguros y de phishing")
  if (brands.size !== LAB_BRANDS.length) fail("tienen que usarse las 5 marcas de práctica, y ninguna más")
  for (const signal of SIGNAL_IDS) {
    if (!usedSignals.has(signal)) fail(`falta un correo con la señal ${signal}`)
  }
  if (!emails.some((email) => email.signals.length === 1)) {
    fail("falta un correo difícil con una sola señal")
  }
  if (!emails.some((email) => !email.isPhishing && !email.blocks.some((block) => block.kind === "link"))) {
    fail("falta un correo seguro sin enlace")
  }
  if (
    !emails.some((email) =>
      email.isPhishing && isOfficialHost(hostFromAddress(email.fromAddress), officialDomain(email.brand)),
    )
  ) {
    fail("falta un phishing cuyo remitente parezca el dominio de práctica")
  }
  const difficulties = new Set(emails.map((email) => email.difficulty))
  if (difficulties.size < 3) fail("faltan los tres niveles de dificultad")
}

assertLabEmails(EMAILS)
