import fs from 'node:fs'
import path from 'node:path'

export function loadClientConfig(lang: string = 'es') {
  const clientId = import.meta.env.CLIENT_ID || 'showroom'
  const configPath = path.join(process.cwd(), 'clients', clientId, 'client.config.json')
  const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

  const { es, en, zh, ...structural } = raw
  const locales: Record<string, any> = { es, en, zh }
  const localeContent = locales[lang] ?? locales.es

  const merged = { ...structural, ...localeContent }

  // Normalize logo_image: strip leading ../ so it works as an absolute URL
  if (merged.brand?.logo_image) {
    merged.brand.logo_image = merged.brand.logo_image.replace(/^\.\.\//, '/')
  }

  return merged
}
