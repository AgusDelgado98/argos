export function hostFromUrl(url: string): string {
  const match = /^https?:\/\/([^/?#]+)/i.exec(url.trim())
  const host = match?.[1]
  if (!host) return ""
  return host.toLowerCase().replace(/\.$/, "")
}

export function hostFromAddress(address: string): string {
  const at = address.lastIndexOf("@")
  if (at < 0 || at === address.length - 1) return ""
  return address.slice(at + 1).trim().toLowerCase().replace(/\.$/, "")
}

export function isReservedHost(host: string): boolean {
  return host.endsWith(".example") || host.endsWith(".invalid")
}

export function isOfficialHost(host: string, official: string): boolean {
  return host === official || host === `www.${official}`
}
