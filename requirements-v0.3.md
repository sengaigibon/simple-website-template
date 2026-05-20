# Multi-Client Theme-Switcher Website — Requirements

> Status: v0.3 — Updated to reflect implemented state as of May 2026

---

## 1. Overview

A single static website codebase that:
- Supports multiple visual **Layouts** (structural HTML templates) and **Styles** (CSS files)
- Can be deployed to multiple **Cloudflare Pages projects**, one per client
- Each deployment is independently configured with a chosen Layout+Style combination and client-specific content
- Includes a **Theme Switcher** UI for showroom / demo purposes
- No backend, no CMS, no framework — pure HTML/CSS/JS with a lightweight bash build script

### Key concept clarification (vs v0.2)
v0.2 used "theme" to mean a single CSS file. The implemented system has a richer two-level model:

| Term | Meaning | Examples |
|------|---------|---------|
| **Theme** | A named Layout + its curated set of compatible Styles | `modern`, `sober` |
| **Layout** | A set of HTML template files with a particular structural design | `modern/`, `sober/` |
| **Style** | A single CSS file (colour palette, fonts, decorative overrides) | `style-1-editorial.css` |

Switching **Style** = instant CSS swap, no reload.
Switching **Theme/Layout** = page reload into the new layout subfolder.

### Why not Next.js?
Next.js was considered and rejected. Since there is no dynamic content, it would add toolchain
complexity for zero functional benefit. **Astro** remains the preferred upgrade path if a blog,
product catalogue, or any data-driven section is added in the future.

---

## 2. Pages

The website has **4 pages** per layout:

| File | Page |
|------|------|
| `index.html` | Homepage |
| `about.html` | About Us |
| `services.html` | Products / Services |
| `contact.html` | Contact Us |

Blog / Resources is **out of scope**.

---

## 3. Repo Structure (Implemented)

```
poc2/
├── core/
│   ├── js/
│   │   ├── main.js
│   │   ├── render.js
│   │   └── theme-switcher.js
│   ├── layouts/
│   │   ├── modern/
│   │   │   ├── index.html
│   │   │   ├── about.html
│   │   │   ├── services.html
│   │   │   └── contact.html
│   │   └── sober/
│   │       ├── index.html
│   │       ├── about.html
│   │       ├── services.html
│   │       └── contact.html
│   └── styles/
│       ├── style-1-editorial.css
│       ├── style-2-terminal.css
│       ├── style-3-garden.css
│       ├── style-4-studio.css
│       ├── style-5-bold.css
│       ├── style-6-industrial.css
│       ├── style-7-industrial-blue.css
│       └── style-8-corporate-red.css
├── clients/
│   ├── client-1/         ← ShaJa Digital (modern · editorial, demo_mode: true)
│   │   ├── client.config.json
│   │   └── assets/
│   ├── client-2/         ← Verdant Studio (modern · garden, demo_mode: false)
│   │   ├── client.config.json
│   │   └── assets/
│   └── client-3/         ← Axflow Industries (sober · corporate-red, demo_mode: true)
│       ├── client.config.json
│       └── assets/
├── build.sh
└── dist/                 ← generated output (not committed)
    ├── modern/
    ├── sober/
    ├── styles/
    ├── js/
    ├── assets/
    ├── client.config.js
    └── index.html        ← root redirect to configured theme
```

A change to any `core/` file propagates to all client deployments on next build.

---

## 4. Theme & Style System

### 4.1 Layouts
Each layout is a folder under `core/layouts/` containing the 4 HTML pages. The structural design,
section order, and markup differ between layouts. Currently implemented:

| Layout ID | Description |
|-----------|-------------|
| `modern`  | Full-featured layout with hero, stats bar, services, process, testimonials, CTA sections |
| `sober`   | Alternative structural layout (same pages, different arrangement/markup) |

Adding a new layout = adding a new folder under `core/layouts/` and registering it in `theme-switcher.js`.

### 4.2 Styles
Each style is a CSS file under `core/styles/`. A style contains:
- CSS custom properties (`:root` variables): colours, fonts, spacing, radius, shadows
- Google Fonts `@import`
- Any style-specific structural or decorative overrides

Currently implemented styles and their curated assignment per layout:

| Style ID | Label | Swatch | Layouts |
|----------|-------|--------|---------|
| `style-1-editorial` | Editorial | `#C49A3C` | modern |
| `style-2-terminal` | Terminal | `#00FF88` | modern |
| `style-3-garden` | Garden | `#C4623A` | modern |
| `style-4-studio` | Studio | `#2B5BFF` | modern |
| `style-5-bold` | Bold | `#FFE135` | modern |
| `style-6-industrial` | Industrial | `#E8841A` | modern, sober |
| `style-7-industrial-blue` | Industrial Blue | `#0099CC` | sober |
| `style-8-corporate-red` | Corporate Red | `#C8102E` | sober |

Adding a new style = adding one CSS file. Adding it to the switcher requires a one-line entry in `theme-switcher.js`.

### 4.3 Style loading — no FOUC
Inside each layout's `<head>`, a synchronous inline script resolves the active style
(checking `localStorage` first, then `window.__CLIENT_CONFIG__.style`) and injects the
`<link id="theme-stylesheet">` element before the first paint:

```html
<script>
  (function(){
    var cfg = window.__CLIENT_CONFIG__;
    var theme = (cfg && cfg.style) ? cfg.style : 'style-1-editorial';
    try { var ls = localStorage.getItem('style_override'); if(ls) theme = ls; } catch(e){}
    var link = document.createElement('link');
    link.rel = 'stylesheet'; link.id = 'theme-stylesheet';
    link.href = '../styles/' + theme + '.css';
    document.currentScript.parentNode.insertBefore(link, document.currentScript.nextSibling);
  })();
</script>
```

---

## 5. Theme Switcher (Demo / Showroom Mode)

- **Visibility:** rendered only when `demo_mode: true` in client config
- **Position:** fixed, vertically centred on the right edge of the screen
- **Default state:** collapsed — shows a small 🎨 icon button
- **Expanded state:** a panel with two sections: **Theme** (layout selector) and **Style** (CSS selector)
- **Style interaction:** click a style → CSS swapped instantly, no reload; panel closes
- **Theme interaction:** click a different theme → `localStorage` updated, page reloads into the new layout subfolder carrying the style preference forward
- **Persistence:** `theme_override` and `style_override` stored in `localStorage`; survive page navigation
- **Label:** each style shown with its name and a small colour swatch
- **Loading state:** the clicked theme button shows `...` while the reload is in progress
- **Production:** when `demo_mode: false`, the switcher is not rendered at all

### localStorage keys
| Key | Value | Description |
|-----|-------|-------------|
| `theme_override` | e.g. `"modern"` | User-selected layout; overrides config default |
| `style_override` | e.g. `"style-3-garden"` | User-selected style; only honoured if it belongs to the active theme |

---

## 6. Per-Client Configuration — Monorepo Folders

One `main` branch, one repo, one folder per client under `clients/`.

### Cloudflare Pages setup per client
Each Cloudflare Pages project:
- Points to the **same GitHub repo**
- Sets the environment variable `CLIENT_ID=client-1` (or `client-2`, `client-3`, etc.)
- Runs `bash build.sh` as the build command
- Publishes from the `dist/` output directory

---

## 7. Client Config Schema

The `client.config.json` is the complete source of all client-specific content. The HTML templates
contain fallback/placeholder text and are otherwise content-free.

```json
{
  "theme": "modern",
  "style": "style-1-editorial",
  "demo_mode": true,

  "brand": {
    "name": "Acme Corp",
    "logo_text": "Acme",
    "logo_accent": "Corp",
    "tagline": "Building better things since 2010"
  },

  "meta": {
    "site_title": "Acme Corp",
    "description": "A short description for search engines.",
    "language": "en",
    "theme_label": "Modern · Editorial"
  },

  "nav": {
    "cta_label": "Get a Quote",
    "cta_href": "contact.html"
  },

  "hero": {
    "eyebrow": "Trusted since 2010",
    "headline": "We Build Things That Last",
    "subheadline": "A short description.",
    "cta_primary_label": "Our Services",
    "cta_secondary_label": "About Us"
  },

  "stats": [
    { "number": "12+", "label": "Years of Experience" },
    { "number": "200+", "label": "Clients Served" },
    { "number": "98%", "label": "Satisfaction Rate" },
    { "number": "15", "label": "Industry Sectors" }
  ],

  "services": {
    "eyebrow": "What We Do",
    "headline": "Our Core Services",
    "subheadline": "Tagline for the homepage services section.",
    "page_subheadline": "Tagline for the services page.",
    "items": [
      {
        "icon": "🔧",
        "title": "Service One",
        "body": "Description of this service.",
        "features": ["Feature A", "Feature B", "Feature C"]
      }
    ]
  },

  "process": {
    "eyebrow": "How We Work",
    "headline": "Our Engagement Model",
    "steps": [
      { "title": "Step One", "body": "What happens in this step." }
    ]
  },

  "about": {
    "eyebrow": "Who We Are",
    "headline": "About the Company",
    "page_subheadline": "A subheading for the about page.",
    "body": "Short company summary.",
    "mission_headline": "Our Mission",
    "mission_body_1": "First mission paragraph.",
    "mission_body_2": "Second mission paragraph.",
    "mission_emoji": "🧭",
    "values_headline": "What We Stand For",
    "team_headline": "The Team",
    "team_subheadline": "Short team intro.",
    "values": [
      { "icon": "🔍", "title": "Value One", "body": "Description." }
    ],
    "team": [
      { "name": "Jane Smith", "role": "CEO & Founder", "emoji": "👩‍💼" }
    ]
  },

  "testimonials": [
    {
      "text": "Great work.",
      "author": "Sarah O.",
      "role": "CEO, Partner Co.",
      "emoji": "👩‍💼"
    }
  ],

  "cta": {
    "eyebrow": "Start a Conversation",
    "headline": "Ready to Get Started?",
    "subheadline": "Supporting line for the CTA section."
  },

  "contact": {
    "page_subheadline": "Short intro for contact page.",
    "intro": "Longer paragraph shown beside the form.",
    "email": "hello@acme.com",
    "phone": "+1 555 000 1234",
    "address": "123 Main St, New York, NY 10001",
    "hours": "Mon–Fri, 9am–6pm ET",
    "form_service_options": ["Service One", "Service Two", "Other"]
  },

  "social": {
    "linkedin": "https://linkedin.com/company/acme",
    "twitter": "https://twitter.com/acme"
  },

  "footer": {
    "tagline": "Short footer tagline.",
    "copyright": "Acme Corp"
  }
}
```

---

## 8. Content Rendering (`render.js`)

`render.js` runs on every page load. It reads `window.__CLIENT_CONFIG__` (injected by `client.config.js`)
and populates the page via several mechanisms:

| Mechanism | Attribute | Effect |
|-----------|-----------|--------|
| Text content | `data-config="path.to.value"` | Sets `el.textContent` |
| Attribute | `data-config-attr="attr:path"` | Sets `el.setAttribute(attr, value)` |
| Href | `data-config-href="path"` | Sets `el.href` |
| Select options | `data-config-options="path.to.array"` | Appends `<option>` elements |

List-driven sections (stats, services, process steps, team, values, testimonials, footer services)
are rendered from `<template>` tags defined in each HTML file. The `renderList()` helper clones the
template, populates each clone, and appends to the container.

Additional operations:
- Sets `<html lang>` from `meta.language`
- Sets `<title>` from `meta.site_title`
- Handles contact form submit (client-side only — disables button on submit)

---

## 9. Navigation & UI (`main.js`)

Handles all interactive behaviour that is layout-agnostic:
- Scroll shadow on the `<nav>` element (adds `.scrolled` class after 20px)
- Mobile burger menu toggle (animates the three spans into an X)
- Active nav link highlighting based on current page filename
- Intersection Observer-based fade-up animations (`.fade-up-1` through `.fade-up-4`)

---

## 10. Build Script (`build.sh`)

The build script is dependency-free bash. It:

1. Validates the requested `CLIENT_ID` has a config file
2. Reads `theme` and `style` from the client config via `python3 -c`
3. Cleans and re-creates `dist/`
4. Copies `core/styles/` → `dist/styles/` and `core/js/` → `dist/js/`
5. Copies client assets → `dist/assets/` (if any)
6. Generates `dist/client.config.js` (`window.__CLIENT_CONFIG__ = {...};`)
7. Copies HTML from **both** `core/layouts/modern/` and `core/layouts/sober/` into `dist/modern/` and `dist/sober/`
8. Injects `<script src="../client.config.js">` into every HTML page (before `</head>`) if not already present
9. Writes `dist/index.html` as a JS redirect to the client's configured theme subfolder (with `localStorage` override support)

```bash
# Usage
CLIENT_ID=client-1 bash build.sh

# Local preview
cd dist && python3 -m http.server 8080
# http://localhost:8080/           → redirects to configured theme
# http://localhost:8080/modern/    → Modern layout
# http://localhost:8080/sober/     → Sober layout
```

---

## 11. Out of Scope

- Blog / Resources page
- CMS integration
- User authentication
- Server-side rendering
- Database or backend of any kind
- Internationalisation beyond the `lang` attribute
- Analytics (can be added via a script tag in config later)

---

## 12. Decisions Log

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Framework | None (plain HTML/CSS/JS) | No dynamic content; no build toolchain needed |
| 2 | Blog page | Removed | Requires backend or SSG pipeline; out of scope |
| 3 | Theme model | Two-level: Layout + Style | Allows structural variety (layout) and colour/font variety (style) independently |
| 4 | Style switching | Instant CSS swap via `<link>` href update | No reload needed for same-layout style changes |
| 5 | Layout switching | Page reload into new subfolder | HTML structure differs between layouts; reload is the cleanest solution |
| 6 | Theme switcher visibility | Collapsible icon → panel, right edge | Unobtrusive in demo mode; absent in production |
| 7 | Client config mechanism | Monorepo folders, one per client | Single branch, maps cleanly to CF Pages environment variables |
| 8 | Content in config vs HTML | Hybrid — all variable content in config; structural page skeleton in HTML | Brand, contact, lists, copy in config; section order and markup in HTML |
| 9 | Build step | `build.sh` (bash + python3) | Dependency-free; builds both layout subfolders so switcher never 404s |

---

## 13. Status & Next Steps

### Completed ✅
- Repo structure (`core/`, `clients/`, `layouts/`, `styles/`)
- 2 layouts: `modern`, `sober`
- 8 styles implemented
- `render.js` with all content injection mechanisms
- `theme-switcher.js` with two-level Theme/Style switcher
- `main.js` nav, burger, animations
- `build.sh` building both layouts + redirect
- 3 client configs: client-1 (ShaJa Digital), client-2 (Verdant Studio), client-3 (Axflow Industries)
- Local preview confirmed (`python3 -m http.server 8080`)

### Remaining / Potential Next Steps
- [ ] Deploy client-1 and client-2 to Cloudflare Pages
- [ ] Validate theme switching end-to-end in deployed environment
- [x] Add client logo assets (currently `assets/` folders are empty)
- [ ] Add `<meta og:*>` tags to HTML templates (Open Graph)
- [ ] Consider a third layout variant
- [ ] Consider adding a `README.md` with onboarding instructions for new clients
