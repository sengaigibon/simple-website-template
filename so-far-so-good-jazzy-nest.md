# Plan: Architecture Evolution — Pre-rendered, Multilingual, Multi-client

## Context

The current system has three compounding problems:

1. **Placeholders in production HTML** — render.js injects content client-side, so search engines see fallback text ("Site Title", "Brand", "Headline") until JS runs.
2. **Hardcoded English UI strings** — ~35-40 strings per template (nav labels, footer headers, form labels) are baked into HTML and can't be changed per language without duplicating all 12 files.
3. **No i18n architecture** — Spanish default + English + Chinese requires URL routing (`/`, `/en/`, `/zh/`), language-specific UI strings, and a structured content model.

---

## i18n Reference: your existing site (sengaigibon.github.io)

Your personal site uses **Next.js + next-intl**:
- URL pattern: `/{locale}/{path}` (e.g. `/en/`, `/es/mountaineering`)
- Translation files: `messages/en.json`, `es.json`, `de.json` — hierarchical JSON
- Middleware handles locale detection, redirects, cookie persistence
- `output: 'export'` — fully static, deployed to GitHub Pages

**Astro can replicate this pattern exactly**, with one advantage: no React needed for content pages. Pure `.astro` files produce leaner HTML output. The translation JSON file structure and URL routing work identically.

---

## Recommended Stack: Astro SSG

### Why Astro over Next.js here

| | Next.js | Astro |
|---|---|---|
| Output | Static export via `output: 'export'` | Native static via `output: 'static'` |
| i18n | next-intl plugin required | Built-in since v3.5 |
| Templates | React components (JSX) | `.astro` files (HTML-like, zero JS by default) |
| Keystatic | Works | Already integrated in this project |
| Cloudflare Pages | Works | Works, official adapter available |
| Bundle size | React runtime shipped | Zero JS unless you opt in |

Both work. Astro is the leaner choice for content sites with no app logic.

---

## Question 1 — Can Astro replicate your i18n pattern?

Yes. Astro's built-in i18n config mirrors next-intl:

```js
// astro.config.mjs
export default defineConfig({
  output: 'static',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'zh'],
    routing: { prefixDefaultLocale: false }  // / = es, /en/ = en, /zh/ = zh
  }
})
```

Translation files live in `src/i18n/es.json`, `en.json`, `zh.json` — same structure as your `messages/` folder. A `useTranslations(locale)` helper (a few lines of code, no library needed) loads the right file. The URL routing and static export are native.

---

## Question 2 — Clients folder vs separate repos vs Cloudflare options

### Option A — Monorepo with clients/ folder (current approach)

**How it works:** One repo, all client configs in `clients/<slug>/`. Each Cloudflare Pages project has `CLIENT_ID=<slug>` as an env var and builds from the same repo.

| Pros | Cons |
|---|---|
| One codebase to update — fix a bug once, all clients benefit | Changing one client triggers a redeploy of that client only (Cloudflare skips builds if nothing changed), but the repo history mixes all clients |
| Keystatic manages all clients from one UI | Can't give a client direct repo access to their own config only |
| Simple — current workflow continues | As clients grow to 50+, repo gets large; PR history is noisy |

**Verdict:** Works well up to ~20–30 clients. Clean for a freelancer/agency managing all content themselves.

---

### Option B — One repo per client

**How it works:** A template repo (GitHub Template or private package) is cloned for each new client. Each client repo is its own Cloudflare Pages project.

| Pros | Cons |
|---|---|
| Full isolation — client can access their own repo | Template updates must be propagated to every client repo manually (or via a shared npm package / git submodule) |
| Clean git history per client | High management overhead as clients grow |
| Client can self-manage content via Keystatic on their own repo | Keystatic must be set up per repo |

**Verdict:** Best if clients need self-service access to their own repo. Hard to scale template maintenance.

---

### Option C — Cloudflare native: one deployment, domain-based routing

**How it works:** One Astro site deployed once to Cloudflare Pages (with Cloudflare Workers). Each client has a custom domain pointing to the same deployment. The Worker reads the hostname and serves the right client's content from Cloudflare KV or a JSON config stored at the edge.

| Pros | Cons |
|---|---|
| One deployment to manage | Requires Cloudflare Workers (not pure static) |
| Instant content updates without rebuilds | More complex architecture |
| Infinitely scalable | Content editing workflow changes (no direct file editing) |

**Verdict:** Best for scale (100+ clients) or when instant content updates without deployment are needed. Overkill for now.

---

### Recommendation on repo structure

**Start with Option A (monorepo).** It's the natural evolution of the current system, requires no infrastructure changes, and handles 20–30 clients cleanly. If you hit 50+ clients or need per-client repo access, migrate to Option B using an npm package for the shared template code.

---

## Proposed Architecture (Astro + Monorepo)

```
simple-website-template/
  src/
    components/
      layouts/
        ModernLayout.astro       ← replaces core/layouts/modern/*.html
        SoberLayout.astro
        SimplisticLayout.astro
      sections/
        HeroSection.astro        ← props-based, no data-config attrs
        ServicesSection.astro
        ProcessSection.astro
        AboutSection.astro
        ContactSection.astro
      shared/
        Nav.astro                ← label text from i18n strings
        Footer.astro
    pages/
      [lang]/
        index.astro              ← one file → generates /es/, /en/, /zh/
        about.astro              ← one file → generates /es/about, /en/about, /zh/about
        services.astro
        contact.astro
    i18n/
      es.json                    ← UI strings: nav, footer headers, form labels, buttons
      en.json
      zh.json
  clients/
    client-1/
      client.config.json         ← content nested by locale (see below)
      assets/logo.png
    vierszka/
      client.config.json
      assets/logo.svg
  keystatic.config.ts            ← schema updated for locale-nested content
  astro.config.mjs               ← i18n config + output: 'static'
  build.sh                       ← simplifies to: CLIENT_ID=X npx astro build
```

### Content model: locale-nested config

```json
{
  "theme": "sober",
  "style": "style-7-industrial-blue",
  "demo_mode": false,
  "brand": { "name": "Vierszka", "logo_image": "assets/logo.svg" },
  "es": {
    "hero": { "headline": "Soluciones industriales...", "subheadline": "..." },
    "services": { "headline": "Nuestros Servicios", "items": [...] }
  },
  "en": {
    "hero": { "headline": "Industrial solutions...", "subheadline": "..." },
    "services": { "headline": "Our Services", "items": [...] }
  },
  "zh": {
    "hero": { "headline": "工业解决方案...", "subheadline": "..." },
    "services": { "headline": "我们的服务", "items": [...] }
  }
}
```

Structural fields (`theme`, `style`, `demo_mode`, `brand`, `social`) stay at the top level — they don't change per language.

### How render.js disappears

One page file generates all language variants via `getStaticPaths()`:

```astro
---
// src/pages/[lang]/index.astro
import { loadConfig } from '../../lib/config'
import { useTranslations } from '../../i18n/utils'
import SoberLayout from '../../components/layouts/SoberLayout.astro'

export function getStaticPaths() {
  return ['es', 'en', 'zh'].map(lang => ({ params: { lang } }))
}

const { lang } = Astro.params
const cfg = loadConfig(import.meta.env.CLIENT_ID)
const content = cfg[lang]   // translated content for this locale
const t = useTranslations(lang)  // UI strings (nav, form labels, etc.)
---

<SoberLayout {cfg} {content} {t} />
```

Astro pre-renders `/es/index.html`, `/en/index.html`, `/zh/index.html` from this single file. 4 page files total, regardless of how many languages you add.

The output HTML has real content baked in. No JS needed for content. SEO sees the full page immediately.

### Cloudflare Pages build config (per client)

```
Build command:  CLIENT_ID=vierszka npx astro build
Output dir:     dist
Env var:        CLIENT_ID = vierszka
```

Astro generates `dist/`, `dist/en/`, `dist/zh/` automatically.

---

## Migration path (incremental)

1. `astro.config.mjs` — add i18n block, verify `output: 'static'`
2. Create `src/i18n/es.json`, `en.json`, `zh.json` from the ~35 hardcoded strings
3. Convert **one layout** (sober, since it's most tested) to Astro components — verify identical output
4. Add multilingual pages (`en/index.astro` etc.) using the same components with `t()` calls
5. Update `client.config.json` schema to locale-nested structure for one client
6. Update Keystatic schema to match (locale tabs in the form)
7. Convert remaining layouts
8. Remove `core/layouts/`, `core/js/render.js`
9. Simplify `build.sh`

---

## Files removed

| File/Dir | Reason |
|---|---|
| `core/layouts/` (12 HTML files) | Replaced by Astro components |
| `core/js/render.js` | Content injected at build time |

## Files kept

| File/Dir | Reason |
|---|---|
| `core/styles/*.css` | CSS unchanged |
| `core/js/main.js` | Scroll/animation/nav behaviour |
| `core/js/theme-switcher.js` | Showroom switcher |
| `clients/*/` | Content and assets |
| `keystatic.config.ts` | Updated schema, same CMS |

---

## Verification

- `CLIENT_ID=vierszka npx astro build` → `dist/` with pre-rendered HTML
- `grep "Guiamos exploradores" dist/index.html` → real content, no placeholders
- `grep "We guide" dist/en/index.html` → English version present
- `ls dist/zh/` → Chinese pages present
- No `data-config` attributes in any output HTML
- No `render.js` script tag in any output HTML
- Cloudflare Pages build succeeds with `CLIENT_ID` env var
