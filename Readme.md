# Multi-Client Website Template

## 1. Overview

A single **Astro SSG** codebase that builds fully pre-rendered, multilingual (es / en / zh) websites for multiple clients. Each client is a separate Cloudflare Pages deployment, configured by its own `client.config.json`.

Key properties:
- **Pre-rendered HTML** — all content is baked in at build time; no client-side DOM injection, no JS required for content
- **Multilingual** — three URL routes per page (`/es/`, `/en/`, `/zh/`) generated from a single page file via `getStaticPaths()`
- **Multi-theme** — three layouts (Sober, Modern, Simplistic) × nine CSS styles; theme is selected per client in config
- **Multi-client** — one repo, many Cloudflare Pages projects; `CLIENT_ID` env var selects the client at build time
- **CMS** — Keystatic provides a local admin UI that reads/writes `client.config.json` directly; no database

---

## 2. Local Setup

```bash
git clone git@github.com:sengaigibon/simple-website-template.git
cd simple-website-template
npm install
```

### Run the dev server (with Keystatic admin)

```bash
CLIENT_ID=client-1 npm run dev
```

- Site: http://localhost:4321/es/
- Keystatic admin: http://localhost:4321/keystatic

### Build for production

```bash
CLIENT_ID=client-1 npm run build
```

Output goes to `dist/`. The build runs `node setup.mjs` first, which copies `clients/<CLIENT_ID>/assets/` → `public/assets/`.

### Preview the production build

```bash
npm run preview
```

---

## 3. Repository Structure

```
simple-website-template/
  src/
    components/
      Nav.astro               ← shared nav (CTA class adapts to theme)
      Footer.astro            ← shared footer
      sober/                  ← Sober theme sections
      modern/                 ← Modern theme sections
      simplistic/             ← Simplistic theme sections
    layouts/
      BasePage.astro          ← shared HTML shell (head, nav, footer, demo switcher)
    pages/
      index.astro             ← redirects / → /es/
      [lang]/
        index.astro           ← home page (es, en, zh)
        about.astro
        services.astro
        contact.astro
    i18n/
      es.json                 ← UI strings (nav, footer, form labels, buttons)
      en.json
      zh.json
      utils.ts                ← useTranslations(lang) helper
    lib/
      config.ts               ← loadClientConfig(lang) — merges structural + locale content
  clients/
    client-1/
      client.config.json      ← all content, nested by locale (es/en/zh)
      assets/logo.svg
    client-2/
      client.config.json
    vierszka/
      client.config.json
      assets/logo.svg
  public/
    styles/                   ← CSS files (style-1-editorial.css … style-9-simplistic.css)
    js/
      main.js                 ← scroll, fade-up, mobile nav behaviour
      theme-switcher.js       ← demo mode style switcher (injected only when demo_mode: true)
  keystatic.config.ts         ← Keystatic schema (locale-nested, mirrors client.config.json)
  astro.config.mjs            ← Astro config; Keystatic loaded only in dev
  setup.mjs                   ← pre-build: copies client assets to public/assets/
  package.json
```

---

## 4. Client Config Structure

Each `client.config.json` has two layers:

**Structural fields** (top level — same for all languages):
```json
{
  "theme": "sober",
  "style": "style-7-industrial-blue",
  "demo_mode": false,
  "brand": { "name": "…", "logo_text": "…", "logo_accent": "…", "logo_image": "../assets/logo.svg", "tagline": "…" },
  "social": { "linkedin": "…", "twitter": "…" }
}
```

**Content fields** (locale-nested — translated per language):
```json
{
  "es": { "meta": {}, "nav": {}, "hero": {}, "stats": [], "services": {}, "process": {}, "about": {}, "testimonials": [], "cta": {}, "contact": {}, "footer": {} },
  "en": { … },
  "zh": { … }
}
```

`loadClientConfig(lang)` merges both layers and returns a single flat object so components use `cfg.hero.headline` regardless of locale.

---

## 5. Themes and Styles

| Theme | Layout style | CSS files |
|---|---|---|
| `sober` | Sidebar sections, split hero with stat panel | style-6, 7, 8 |
| `modern` | Centred hero with `<em>`, 3-col icon cards, dark process band | style-1 – 6 |
| `simplistic` | Full-width hero, 4-col image cards, about-split, solution overlays | style-9 |

The `theme` field in `client.config.json` selects which components are rendered. All three themes share the same `Nav.astro`, `Footer.astro`, `Stats.astro`, and `Contact.astro`.

### Demo mode / style switcher

When `demo_mode: true`, a 🎨 panel is injected into every page. It lets you swap CSS styles live (instant, no reload) and switch the active theme's style palette. Turn it off before going live by setting `demo_mode: false`.

---

## 6. Multilingual Pages

UI strings (nav labels, button text, form labels) live in `src/i18n/es.json`, `en.json`, `zh.json`.

Client content (headlines, body copy, service names) lives under locale keys in `client.config.json`.

Each page file generates three routes from one file:

```astro
export function getStaticPaths() {
  return LOCALES.map(lang => ({ params: { lang } }))
}
const cfg = loadClientConfig(lang)   // returns content for this locale
const t = useTranslations(lang)      // returns UI strings for this locale
```

Output: `/es/`, `/en/`, `/zh/` — all pre-rendered with real content, no JS.

---

## 7. Cloudflare Pages Setup

1. **Account Home → Add → Pages → Import an existing Git repository**
2. Select this repository → Begin setup
3. Configure:
   - **Build command:** `CLIENT_ID=vierszka npm run build`
   - **Build output directory:** `dist`
4. Under **Environment variables**, add:
   - `CLIENT_ID` = `vierszka` (or whichever client slug)
5. Save and deploy

Each client is a separate Cloudflare Pages project pointing at the same repo, differing only in the `CLIENT_ID` env var.

---

## 8. Onboarding a New Client

### Step 1 — Create the client folder

```bash
cp -r clients/client-1 clients/<slug>
```

Edit `clients/<slug>/client.config.json`:
- Set `theme` and `style`
- Set `brand.name`, `brand.logo_text`, `brand.logo_accent`
- Set `demo_mode: true` (keeps the style switcher visible during review)
- Fill in content under `es` (en/zh are stubs to translate later)

Drop the logo file into `clients/<slug>/assets/`.

### Step 2 — Register in Keystatic

Open `keystatic.config.ts` and add a singleton inside `singletons: { … }`:

```ts
'<slug>': singleton({
  label: 'Client Name (<slug>)',
  path: 'clients/<slug>/client.config',
  format: { data: 'json' },
  entryLayout: 'form',
  schema: clientSchema,
}),
```

Restart `npm run dev` — the new client appears in the Keystatic sidebar.

### Step 3 — Test locally

```bash
CLIENT_ID=<slug> npm run dev
```

Open http://localhost:4321/es/ and confirm the logo, theme, and content look correct.

### Step 4 — Deploy to Cloudflare Pages

Follow Section 7. The deployment URL (e.g. `<slug>.pages.dev`) is what you share with the client for review.

### Step 5 — Fill in content

Use Keystatic (`npm run dev` → http://localhost:4321/keystatic) to edit content through a form. Each save writes directly to `client.config.json`. Commit and push to trigger a Cloudflare redeploy.

### Step 6 — Domain setup

In the Cloudflare Pages project → **Custom domains** → attach the client's domain. Cloudflare handles SSL automatically.

### Step 7 — Go live

1. Set `"demo_mode": false` in the client's config
2. Commit and push → Cloudflare rebuilds; style switcher is gone from the live site
3. Confirm the live domain resolves correctly

---

## 9. Adding or Editing i18n Strings

UI strings that appear in every client's site (nav labels, footer headers, form labels, button text) live in:

```
src/i18n/es.json
src/i18n/en.json
src/i18n/zh.json
```

These are **not** client-editable via Keystatic — they are code-level defaults. Edit them directly and rebuild.

Client-specific copy (headlines, service descriptions, team bios, etc.) lives under the locale keys in `client.config.json` and is editable via Keystatic.
