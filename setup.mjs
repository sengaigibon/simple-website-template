// Copies client assets into public/assets/ before the Astro build.
// Run via: node setup.mjs  (called from package.json "build" script)
import { cpSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const clientId = process.env.CLIENT_ID || 'client-1'
const src = join('clients', clientId, 'assets')
const dest = 'public/assets'

mkdirSync(dest, { recursive: true })
if (existsSync(src)) {
  cpSync(src, dest, { recursive: true })
  console.log(`✓ Copied ${src} → ${dest}`)
} else {
  console.log(`⚠ No assets folder found for client "${clientId}" — skipping`)
}
