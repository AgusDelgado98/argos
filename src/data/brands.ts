export const LAB_BRANDS = [
  { name: "Mercado Libre", domain: "mercadolibre.com.example" },
  { name: "Mercado Pago", domain: "mercadopago.com.example" },
  { name: "Banco Galicia", domain: "bancogalicia.com.example" },
  { name: "Netflix", domain: "netflix.com.example" },
  { name: "Correo Argentino", domain: "correoargentino.com.example" },
] as const

export type LabBrandName = (typeof LAB_BRANDS)[number]["name"]

export function officialDomain(brand: LabBrandName): string {
  const found = LAB_BRANDS.find((item) => item.name === brand)
  if (!found) {
    throw new Error(`Marca desconocida: ${brand}`)
  }
  return found.domain
}
