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

# Workflow: Onboarding a New Client

This is the end-to-end process after a client has seen the showroom and chosen a theme and style.

## Step 1 — Create the client folder

1. Create `clients/<client-slug>/` (e.g. `clients/vierszka/`)
2. Copy `client.config.json` from the closest existing client as a starting point
3. Update at minimum:
   - `theme` and `style` to the client's chosen combination
   - `brand.name`, `brand.logo_text`, `brand.logo_accent`
   - `demo_mode: true` (keeps the theme switcher visible during review)
4. Create `assets/` inside the client folder and drop in the client's logo file
5. Commit and push to `master`

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

Use **Keystatic** (see section below) to edit content — each save commits to the repo, which triggers an automatic Cloudflare redeploy.

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

---

# Keystatic — Content Editing

Keystatic is a Git-based content editor. It reads and writes directly to files in this repository — no separate database. For this project, it edits the `client.config.json` file for each client.

> **Note:** Keystatic is not yet configured in this project. The instructions below describe the intended workflow. A `keystatic.config.ts` file and a small Node.js setup will need to be added before the commands below work.

There are two modes:

| Mode | How to access | Best for |
|------|--------------|----------|
| **Local** | Run it on your machine | Your own editing sessions |
| **Cloud** | Hosted UI connected to GitHub | Handing off to the client |

## Local mode (for you)

```bash
# from the repo root
npx keystatic
```

This starts a local admin UI at `http://localhost:8787/keystatic`. You can browse and edit any client's config fields through a form — no need to hand-edit JSON.

## Cloud mode (for the client)

Once Keystatic is connected to GitHub (via its cloud service at keystatic.cloud), the client gets a hosted URL where they can log in and edit their content through the same form UI. Each save creates a commit on `main`, which triggers a Cloudflare redeploy automatically.

Setup steps (one-time per client):
1. Go to [keystatic.cloud](https://keystatic.cloud) and connect your GitHub repo
2. Configure which `client.config.json` fields are editable (done in `keystatic.config.ts`)
3. Share the Keystatic URL with the client along with login credentials

## What the client can edit

Everything in their `client.config.json` is editable through the UI — no JSON knowledge needed. Fields are presented as labelled text inputs, text areas, and lists.

## What Keystatic does NOT do

- It does not build or deploy the site (that's Cloudflare's job on each push)
- It does not manage files outside the repo (images must still be added via `assets/`)
- It does not support branching workflows — edits go straight to `main`
