# Multi-Client Theme-Switcher Website

## 1. Overview

A single static website codebase that:
- Supports multiple visual **Layouts** (structural HTML templates) and **Styles** (CSS files)
- Can be deployed to multiple **Cloudflare Pages projects**, one per client
- Each deployment is independently configured with a chosen Layout+Style combination and client-specific content
- Includes a **Theme Switcher** UI for showroom / demo purposes
- No backend, no CMS, no framework — pure HTML/CSS/JS with a lightweight bash build script



## 2. Local Set Up

 ```` bash 
cd /home/MyCoolProjects
git clone git@github.com:sengaigibon/simple-website-template.git
    
cd simple-website-template
CLIENT_ID=client-1 bash build.sh
cd dist && python3 -m http.server 8080
 ````

Now you can access it through http://localhost:8080/

See the configuration for each client in, e.g. for client-1
````
simple-website-template/clients/client-1/client.config.json
````
where there is a flag:
````
"demo_mode": true,
````
which enables/disables the Showroom / Demo mode.


## 3. Clodflare Set Up

- On the Account Home:
    - Add -> Pages -> Import an existing Git repository
- Select repository
    - Choose your repository -> Begin setup
- Set up builds and deployments
    - Give a name to your project
    - Build command: **bash build.sh**
    - Build output: **dist**
- Under **Environment variables**, add:
    - `CLIENT_ID` = `client-1` (or whichever client this deployment is for)
- Deploy site

Current Showroom URL: https://showroom-ean.pages.dev/ 

---

# Keystatic — Local Setup

Keystatic is a Git-based content editor. It reads and writes the `client.config.json` files directly in this repo — no database, no CMS platform. You run a local admin UI to edit client content through a form instead of hand-editing JSON.

The site itself is unchanged — `bash build.sh` still builds it. Keystatic only adds a lightweight Node.js/Astro layer to serve the admin UI.

## First-time setup

```bash
npm install
```

This installs Astro and Keystatic. Only needed once after cloning.

## Running the admin UI

```bash
npm run dev
```

Open http://localhost:4321/keystatic — you'll see a **Clients** list with all existing clients. Click any client to edit its fields through a form. Save writes directly to the `client.config.json` file on disk. Commit and push to `master` as normal to trigger a Cloudflare redeploy.

## Adding a new client via Keystatic

Each client is a **singleton** in `keystatic.config.ts` (not a dynamic collection). This keeps the config clean — no extra fields written to `client.config.json`.

To add a new client:

1. Create the folder manually: `clients/vierszka/` with a `client.config.json` copied from an existing client
2. Open `keystatic.config.ts` and copy one of the existing singleton blocks:
   ```ts
   'vierszka': singleton({
     label: 'Vierszka (vierszka)',
     path: 'clients/vierszka/client.config',
     format: { data: 'json' },
     entryLayout: 'form',
     schema: clientSchema,
   }),
   ```
3. Restart `npm run dev` — the new client appears in the admin sidebar
4. Open it in Keystatic and fill in all fields
5. Add the logo manually: `clients/vierszka/assets/logo.png`
6. Commit and push

## Files added for Keystatic

| File | Purpose |
|------|---------|
| `package.json` | Node dependencies (Astro + React + Keystatic) |
| `astro.config.mjs` | Astro config with Keystatic integration |
| `tsconfig.json` | TypeScript config (required by Keystatic) |
| `keystatic.config.ts` | Schema: defines every editable field for client configs |

The `keystatic.config.ts` is where you add new fields if the `client.config.json` schema ever changes.

---

# Workflow: Onboarding a New Client

This is the end-to-end process after a client has seen the showroom and chosen a theme and style.

## Step 1 — Create the client folder and register it in Keystatic

1. Create `clients/<client-slug>/` (e.g. `clients/vierszka/`)
2. Copy `client.config.json` from the closest existing client as a starting point
3. Update at minimum:
   - `theme` and `style` to the client's chosen combination
   - `brand.name`, `brand.logo_text`, `brand.logo_accent`
   - `demo_mode: true` (keeps the theme switcher visible during review)
4. Create `clients/vierszka/assets/` and drop in the client's logo file (e.g. `logo.png`)
5. Open `keystatic.config.ts` and add a new singleton block inside `singletons: { ... }`:
   ```ts
   'vierszka': singleton({
     label: 'Vierszka (vierszka)',
     path: 'clients/vierszka/client.config',
     format: { data: 'json' },
     entryLayout: 'form',
     schema: clientSchema,
   }),
   ```
6. Restart `npm run dev` — the new client appears in the Keystatic sidebar
7. Commit and push to `master`

## Step 2 — Test locally

```bash
CLIENT_ID=vierszka bash build.sh
cd dist && python3 -m http.server 8080
```

Open http://localhost:8080/ and confirm the build works and the logo/theme look correct before touching Cloudflare.

## Step 3 — Set up Cloudflare Pages

1. Account Home → **Add → Pages → Import an existing Git repository**
2. Select this repository → **Begin setup**
3. Configure:
   - **Project name:** e.g. `vierszka`
   - **Build command:** `bash build.sh`
   - **Build output directory:** `dist`
4. Under **Environment variables**, add:
   - `CLIENT_ID` = `vierszka`
5. **Save and deploy**

Outcome: a Cloudflare-hosted URL (e.g. `vierszka.pages.dev`) for the client to review.

## Step 4 — Fill in the content

Work with the client (or gather content from them) to complete all sections of their `client.config.json`:
- Brand, tagline, meta description
- Hero copy
- Stats
- Services (titles, descriptions, features)
- Process steps
- About / mission / team / values
- Testimonials
- Contact details (email, phone, address, hours)
- Social links, footer tagline

Use **Keystatic** (`npm run dev` → http://localhost:4321/keystatic) to edit content through a form. Each save writes directly to the `client.config.json` file on disk. Once done, commit and push to `master` to trigger the Cloudflare redeploy.

## Step 5 — Client review

Share the `*.pages.dev` URL with the client. Iterate on content as needed. Each push to `main` triggers a redeploy automatically.

## Step 6 — Domain setup

Either:
- Buy a new domain through Cloudflare (Registrar), or
- Transfer the client's existing domain to Cloudflare DNS

In the Cloudflare Pages project, go to **Custom domains** and attach the domain. Cloudflare handles the SSL cert automatically.

## Step 7 — Go live

1. Set `"demo_mode": false` in the client's `client.config.json`
2. Commit and push → triggers final redeploy
3. Confirm the theme switcher is gone and the live domain resolves correctly

## Done when:
1. The website is live on the client's own domain
2. `demo_mode` is set to `false`
3. All content is final and deployed
4. The client knows how to edit their content via Keystatic

