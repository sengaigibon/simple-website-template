import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

// Keystatic admin UI is dev-only — it requires a server runtime and is not
// deployed to the static Cloudflare Pages build.\
// todo: review the statement above, because I might want to deploy Keystatic to Cloudflare..
const isDev = process.argv.some(arg => arg === 'dev')
const integrations = [react()]
if (isDev) {
  const { default: keystatic } = await import('@keystatic/astro')
  integrations.push(keystatic())
}

export default defineConfig({
  output: 'static',
  integrations,
})
