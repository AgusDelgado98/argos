export const SIGNAL_IDS = [
  "dominio-parecido",
  "apuro",
  "enlace-distinto",
  "archivo-raro",
  "pide-datos",
  "premio",
  "saludo-generico",
  "errores",
] as const

export type SignalId = (typeof SIGNAL_IDS)[number]

export const SIGNALS: Record<SignalId, { title: string; plain: string }> = {
  "dominio-parecido": {
    title: "Dominio parecido al real",
    plain:
      "La dirección imita a la empresa, pero no es la oficial. Cambian una letra, agregan un guion o ponen palabras de más.",
  },
  apuro: {
    title: "Apuro o amenaza",
    plain:
      "Te apuran o te asustan para que actúes sin pensar: «se bloquea hoy», «últimas horas», «se corta el servicio».",
  },
  "enlace-distinto": {
    title: "El texto del enlace no coincide con el destino",
    plain:
      "El texto dice una cosa y la dirección real va a otro lado. El texto del botón se puede escribir libremente.",
  },
  "archivo-raro": {
    title: "Archivo adjunto extraño",
    plain:
      "Un archivo que no pediste, sobre todo si es .zip o un documento para «desbloquear» algo.",
  },
  "pide-datos": {
    title: "Pide contraseña, tarjeta o códigos",
    plain:
      "Una empresa seria no te pide la contraseña, el número de la tarjeta ni un código por correo.",
  },
  premio: {
    title: "Premio demasiado bueno",
    plain:
      "Un premio, un reembolso o plata que no esperabas, a cambio de «confirmar» datos.",
  },
  "saludo-generico": {
    title: "Saludo genérico",
    plain: "Dice «Estimado cliente» o «usuario» en vez de tu nombre.",
  },
  errores: {
    title: "Errores de escritura",
    plain:
      "Faltas raras o frases torpes. Un texto prolijo también puede ser falso: el error es una pista más, no la única.",
  },
}
