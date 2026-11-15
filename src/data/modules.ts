export type ModuleStatus = "disponible" | "próximamente"

export type ModuleInfo = {
  id: string
  title: string
  summary: string
  status: ModuleStatus
  to?: string
}

export const MODULES: readonly ModuleInfo[] = [
  {
    id: "phishing",
    title: "Phishing",
    summary:
      "Mensajes falsos que se hacen pasar por una empresa para que hagas clic o entregues datos. Llegan por correo, SMS o WhatsApp.",
    status: "disponible",
    to: "/phishing",
  },
  {
    id: "sql",
    title: "Inyección SQL",
    summary:
      "Cuando alguien escribe comandos dentro de un formulario para leer datos que no debería ver.",
    status: "próximamente",
  },
  {
    id: "xss",
    title: "XSS",
    summary:
      "Cuando un texto se cuela en una página y el navegador lo ejecuta como si fuera parte del sitio.",
    status: "próximamente",
  },
  {
    id: "brute",
    title: "Fuerza bruta",
    summary: "Probar muchísimas contraseñas seguidas hasta encontrar la correcta.",
    status: "próximamente",
  },
  {
    id: "malware",
    title: "Malware",
    summary:
      "Programas hechos para dañar o espiar. En Argos no se ejecuta ninguno de verdad.",
    status: "próximamente",
  },
  {
    id: "ransomware",
    title: "Ransomware",
    summary: "Un programa que bloquea tus archivos y pide dinero para devolverlos.",
    status: "próximamente",
  },
]
